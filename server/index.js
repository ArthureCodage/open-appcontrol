import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { collectMetrics } from './collector.js';
import { insertSnapshot, getHistory, getLogs, logEvent } from './db.js';
import { killProcess, suspendProcess, resumeProcess } from './processManager.js';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let latestSnapshot = null;
const blacklistedApps = new Set(); // Store blocked process names

// Periodically collect metrics & broadcast via WebSocket
setInterval(async () => {
  try {
    const snapshot = await collectMetrics();
    latestSnapshot = snapshot;
    
    // Check for blacklisted processes
    if (snapshot.processes?.list) {
      for (const proc of snapshot.processes.list) {
        if (blacklistedApps.has(proc.name.toLowerCase())) {
          logEvent('security', 'Application bloquée détectée', `Arrêt automatique du processus interdit ${proc.name} (PID: ${proc.pid})`, 'warning');
          killProcess(proc.pid).catch(() => {});
        }
      }
    }

    // Save snapshot in database
    insertSnapshot(snapshot);

    // Broadcast to connected WebSocket clients
    const payload = JSON.stringify({ type: 'metrics', data: snapshot });
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(payload);
      }
    });
  } catch (err) {
    console.error('Collector loop error:', err);
  }
}, 1000);

// Log server start event
logEvent('system', 'Démon OpenAppControl Pro démarré', 'Moteur de surveillance haute précision actif.', 'info');

// REST API Endpoints

// 1. Get current real-time snapshot
app.get('/api/metrics/current', (req, res) => {
  if (!latestSnapshot) {
    return res.status(503).json({ error: 'Collection en cours...' });
  }
  res.json(latestSnapshot);
});

// 2. Get history between timestamps for Rewind timeline
app.get('/api/metrics/history', async (req, res) => {
  try {
    const endTime = parseInt(req.query.end) || Date.now();
    const startTime = parseInt(req.query.start) || (endTime - 3600 * 1000);
    const limit = parseInt(req.query.limit) || 1000;

    const history = await getHistory(startTime, endTime, limit);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Export CSV History
app.get('/api/export/csv', async (req, res) => {
  try {
    const now = Date.now();
    const start = now - (24 * 3600 * 1000); // 24 hours
    const history = await getHistory(start, now, 2000);

    let csv = 'Timestamp,Date,CPU_Usage_Percent,RAM_Used_MB,RAM_Total_MB,Network_Rx_KBps,Network_Tx_KBps,Disk_Read_KBps,Disk_Write_KBps\n';
    
    for (const h of history) {
      const dateStr = new Date(h.timestamp).toISOString();
      const ramUsedMb = Math.round(h.mem_used_bytes / (1024 * 1024));
      const ramTotalMb = Math.round(h.mem_total_bytes / (1024 * 1024));
      const rxKb = (h.net_rx_sec / 1024).toFixed(1);
      const txKb = (h.net_tx_sec / 1024).toFixed(1);
      const diskR = (h.disk_read_sec / 1024).toFixed(1);
      const diskW = (h.disk_write_sec / 1024).toFixed(1);

      csv += `${h.timestamp},${dateStr},${h.cpu_usage},${ramUsedMb},${ramTotalMb},${rxKb},${txKb},${diskR},${diskW}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="open-appcontrol-report.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Event logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await getLogs(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Kill process
app.post('/api/process/kill', async (req, res) => {
  try {
    const { pid, name } = req.body;
    const result = await killProcess(pid);
    logEvent('process', 'Processus arrêté', `Arrêt forcé du processus ${name || pid} (PID: ${pid})`, 'warning');
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Suspend process
app.post('/api/process/suspend', async (req, res) => {
  try {
    const { pid, name } = req.body;
    const result = await suspendProcess(pid);
    logEvent('process', 'Processus suspendu', `Suspension du processus ${name || pid} (PID: ${pid})`, 'warning');
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Resume process
app.post('/api/process/resume', async (req, res) => {
  try {
    const { pid, name } = req.body;
    const result = await resumeProcess(pid);
    logEvent('process', 'Processus repris', `Reprise du processus ${name || pid} (PID: ${pid})`, 'info');
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 8. Toggle Blacklist Application
app.get('/api/blacklist', (req, res) => {
  res.json(Array.from(blacklistedApps));
});

app.post('/api/blacklist/toggle', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nom invalide' });

  const appName = name.toLowerCase();
  if (blacklistedApps.has(appName)) {
    blacklistedApps.delete(appName);
    logEvent('security', 'Blocage retiré', `L'application ${name} a été retirée de la liste de blocage.`, 'info');
    res.json({ blocked: false, message: `${name} débloqué` });
  } else {
    blacklistedApps.add(appName);
    logEvent('security', 'Application bloquée', `L'application ${name} a été ajoutée à la liste de blocage automatique.`, 'warning');
    res.json({ blocked: true, message: `${name} désormais bloqué` });
  }
});

// WebSocket Connection Handler
wss.on('connection', (ws) => {
  console.log('Client WebSocket connecté');
  if (latestSnapshot) {
    ws.send(JSON.stringify({ type: 'metrics', data: latestSnapshot }));
  }

  ws.onclose = () => {
    console.log('Client WebSocket déconnecté');
  };
});

server.listen(PORT, () => {
  console.log(`🚀 Serveur OpenAppControl Pro démarré sur http://localhost:${PORT}`);
});
