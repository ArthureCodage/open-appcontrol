import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import OverviewTab from './components/OverviewTab.jsx';
import ProcessManagerTab from './components/ProcessManagerTab.jsx';
import NetworkInspectorTab from './components/NetworkInspectorTab.jsx';
import HistoryRewindTab from './components/HistoryRewindTab.jsx';
import PrivacyLogsTab from './components/PrivacyLogsTab.jsx';
import ProcessDetailModal from './components/ProcessDetailModal.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isConnected, setIsConnected] = useState(false);
  const [latestMetrics, setLatestMetrics] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [blacklistedApps, setBlacklistedApps] = useState([]);

  // Fetch initial blacklisted applications
  useEffect(() => {
    fetch('/api/blacklist')
      .then(res => res.json())
      .then(data => setBlacklistedApps(data))
      .catch(() => {});
  }, []);

  // Establish WebSocket connection to backend
  useEffect(() => {
    let ws = null;
    let reconnectTimer = null;

    const connectWS = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = process.env.NODE_ENV === 'production'
        ? `${protocol}//${window.location.host}/ws`
        : `ws://localhost:3001`;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'metrics') {
            setLatestMetrics(payload.data);

            // Update selected process live metrics if modal open
            if (selectedProcess) {
              const updated = payload.data.processes?.list?.find(p => p.pid === selectedProcess.pid);
              if (updated) {
                setSelectedProcess(prev => ({ ...prev, ...updated }));
              }
            }
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimer = setTimeout(connectWS, 2000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        ws.close();
      };
    };

    connectWS();

    // Initial REST fetch
    fetch('/api/metrics/current')
      .then(res => res.json())
      .then(data => setLatestMetrics(data))
      .catch(() => {});

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [selectedProcess?.pid]);

  const handleToggleBlacklist = async (appName) => {
    try {
      const res = await fetch('/api/blacklist/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: appName })
      });
      const data = await res.json();
      if (data.blocked) {
        setBlacklistedApps(prev => [...prev, appName.toLowerCase()]);
      } else {
        setBlacklistedApps(prev => prev.filter(a => a !== appName.toLowerCase()));
      }
    } catch (err) {
      console.error('Error toggling blacklist:', err);
    }
  };

  const handleKill = async (pid, name) => {
    if (!window.confirm(`Arrêter le processus ${name} (PID: ${pid}) ?`)) return;
    try {
      await fetch('/api/process/kill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid, name })
      });
      setSelectedProcess(null);
    } catch (err) {
      console.error('Error killing process:', err);
    }
  };

  const handleSuspend = async (pid, name) => {
    try {
      await fetch('/api/process/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid, name })
      });
    } catch (err) {
      console.error('Error suspending process:', err);
    }
  };

  const handleResume = async (pid, name) => {
    try {
      await fetch('/api/process/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid, name })
      });
    } catch (err) {
      console.error('Error resuming process:', err);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isConnected={isConnected} 
        latestMetrics={latestMetrics}
      />

      <main className="max-w-7xl mx-auto px-6">
        {activeTab === 'overview' && (
          <OverviewTab 
            metrics={latestMetrics} 
            onSelectProcess={(proc) => setSelectedProcess(proc)} 
          />
        )}

        {activeTab === 'processes' && (
          <ProcessManagerTab 
            metrics={latestMetrics} 
            onSelectProcess={(proc) => setSelectedProcess(proc)}
            blacklistedApps={blacklistedApps}
          />
        )}

        {activeTab === 'network' && (
          <NetworkInspectorTab metrics={latestMetrics} />
        )}

        {activeTab === 'rewind' && (
          <HistoryRewindTab />
        )}

        {activeTab === 'logs' && (
          <PrivacyLogsTab />
        )}
      </main>

      {/* Process Inspector Modal */}
      {selectedProcess && (
        <ProcessDetailModal
          process={selectedProcess}
          onClose={() => setSelectedProcess(null)}
          onKill={handleKill}
          onSuspend={handleSuspend}
          onResume={handleResume}
          onToggleBlacklist={handleToggleBlacklist}
          isBlacklisted={blacklistedApps.includes((selectedProcess.name || '').toLowerCase())}
        />
      )}
    </div>
  );
}
