import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'metrics.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Initialize tables
db.serialize(() => {
  // Historical Metrics Table
  db.run(`
    CREATE TABLE IF NOT EXISTS system_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT_NULL,
      cpu_usage REAL,
      cpu_temp REAL,
      mem_used_bytes INTEGER,
      mem_total_bytes INTEGER,
      net_rx_sec INTEGER,
      net_tx_sec INTEGER,
      disk_read_sec INTEGER,
      disk_write_sec INTEGER,
      raw_json TEXT
    )
  `);

  // Index timestamp for fast rewind queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_timestamp ON system_metrics(timestamp)`);

  // Event Log Table
  db.run(`
    CREATE TABLE IF NOT EXISTS event_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT_NULL,
      type TEXT,
      title TEXT,
      message TEXT,
      level TEXT
    )
  `);
});

/**
 * Insert a metrics snapshot into database
 */
export function insertSnapshot(metrics) {
  const ts = metrics.timestamp || Date.now();
  const rawJson = JSON.stringify(metrics);

  const stmt = db.prepare(`
    INSERT INTO system_metrics (
      timestamp, cpu_usage, cpu_temp, mem_used_bytes, mem_total_bytes,
      net_rx_sec, net_tx_sec, disk_read_sec, disk_write_sec, raw_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([
    ts,
    metrics.cpu.usage,
    metrics.cpu.temp || 0,
    metrics.memory.used,
    metrics.memory.total,
    metrics.network.rx_sec || 0,
    metrics.network.tx_sec || 0,
    metrics.disk.read_sec || 0,
    metrics.disk.write_sec || 0,
    rawJson
  ], (err) => {
    if (err) console.error('Error inserting snapshot:', err);
  });
  stmt.finalize();

  // Auto clean older than 72 hours (72 * 3600 * 1000 ms)
  const cutoff = ts - (72 * 3600 * 1000);
  db.run(`DELETE FROM system_metrics WHERE timestamp < ?`, [cutoff]);
}

/**
 * Log an event (Process created, high network spike, privacy alert)
 */
export function logEvent(type, title, message, level = 'info') {
  const ts = Date.now();
  db.run(
    `INSERT INTO event_logs (timestamp, type, title, message, level) VALUES (?, ?, ?, ?, ?)`,
    [ts, type, title, message, level]
  );
}

/**
 * Get historical metrics between start and end timestamps or sampling
 */
export function getHistory(startTime, endTime, limit = 500) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT timestamp, cpu_usage, cpu_temp, mem_used_bytes, mem_total_bytes, net_rx_sec, net_tx_sec, disk_read_sec, disk_write_sec, raw_json
       FROM system_metrics
       WHERE timestamp >= ? AND timestamp <= ?
       ORDER BY timestamp ASC
       LIMIT ?`,
      [startTime, endTime, limit],
      (err, rows) => {
        if (err) return reject(err);
        const parsed = rows.map(r => ({
          ...r,
          details: r.raw_json ? JSON.parse(r.raw_json) : null
        }));
        resolve(parsed);
      }
    );
  });
}

/**
 * Get recent event logs
 */
export function getLogs(limit = 100) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM event_logs ORDER BY timestamp DESC LIMIT ?`,
      [limit],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
}

export default db;
