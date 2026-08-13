import React, { useState, useEffect } from 'react';
import { History, Play, Rewind, Calendar, Clock, Cpu, MemoryStick, Wifi } from 'lucide-react';
import { formatBytes, formatSpeed, formatDate, formatTime } from '../utils/formatters.js';

export default function HistoryRewindTab() {
  const [timeRange, setTimeRange] = useState(3600); // Default 1 hour in seconds
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fetch history when timeRange changes
  useEffect(() => {
    fetchHistory();
  }, [timeRange]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const now = Date.now();
      const start = now - (timeRange * 1000);
      const res = await fetch(`/api/metrics/history?start=${start}&end=${now}&limit=500`);
      const data = await res.json();
      setHistoryData(data);
      if (data && data.length > 0) {
        setSelectedIndex(data.length - 1); // Select most recent by default
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentPoint = historyData[selectedIndex] || null;
  const currentDetails = currentPoint?.details || null;

  return (
    <div className="space-y-6">
      {/* Rewind Header Controls */}
      <div className="glass-card p-6 border-purple-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 glow-purple">
              <Rewind className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>Rembobinage Historique (Rewind 72h)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Explorez l'état exact des ressources et processus à n'importe quel moment passé.
              </p>
            </div>
          </div>

          {/* Timeframe preset selector */}
          <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setTimeRange(3600)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 3600 ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1 Heure
            </button>
            <button
              onClick={() => setTimeRange(21600)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 21600 ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              6 Heures
            </button>
            <button
              onClick={() => setTimeRange(86400)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 86400 ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              24 Heures
            </button>
            <button
              onClick={() => setTimeRange(259200)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === 259200 ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              72 Heures
            </button>
          </div>
        </div>

        {/* Timeline Slider */}
        {loading ? (
          <div className="py-8 text-center text-slate-400">Chargement de l'historique...</div>
        ) : historyData.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            Aucune donnée historique trouvée pour cette période. Laissez l'application tourner quelques secondes pour accumuler des métriques.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>Début: {formatDate(historyData[0]?.timestamp)}</span>
              </span>

              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 text-sm">
                Point sélectionné: {formatDate(currentPoint?.timestamp)}
              </span>

              <span>Fin: {formatDate(historyData[historyData.length - 1]?.timestamp)}</span>
            </div>

            <input
              type="range"
              min="0"
              max={historyData.length - 1}
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-900 rounded-lg appearance-none cursor-pointer border border-slate-800"
            />
          </div>
        )}
      </div>

      {/* Selected Snapshot Inspector */}
      {currentPoint && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Resource Breakdown Card */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>Métriques à cet instant ({formatTime(currentPoint.timestamp)})</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-300 font-medium">Utilisation CPU</span>
                </div>
                <span className="text-sm font-mono font-bold text-cyan-400">{currentPoint.cpu_usage}%</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MemoryStick className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-slate-300 font-medium">Utilisation RAM</span>
                </div>
                <span className="text-sm font-mono font-bold text-purple-400">
                  {formatBytes(currentPoint.mem_used_bytes)} / {formatBytes(currentPoint.mem_total_bytes)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-slate-300 font-medium">Débit Réseau Rx (Down)</span>
                </div>
                <span className="text-sm font-mono font-bold text-emerald-400">{formatSpeed(currentPoint.net_rx_sec)}</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wifi className="w-4 h-4 text-rose-400" />
                  <span className="text-xs text-slate-300 font-medium">Débit Réseau Tx (Up)</span>
                </div>
                <span className="text-sm font-mono font-bold text-rose-400">{formatSpeed(currentPoint.net_tx_sec)}</span>
              </div>
            </div>
          </div>

          {/* Historical Process Snapshot */}
          <div className="glass-card p-6 lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-slate-200 flex items-center justify-between">
              <span>Processus en cours à cet instant ({formatTime(currentPoint.timestamp)})</span>
              <span className="text-xs text-slate-400">
                {currentDetails?.processes?.list?.length || 0} processus capturés
              </span>
            </h3>

            <div className="overflow-y-auto max-h-[350px] pr-1 space-y-2">
              {(!currentDetails?.processes?.list || currentDetails.processes.list.length === 0) ? (
                <p className="text-xs text-slate-400 text-center py-8">Détails des processus indisponibles pour ce snapshot</p>
              ) : (
                currentDetails.processes.list.slice(0, 15).map((proc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono">
                    <div className="flex items-center space-x-3 truncate">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">{proc.pid}</span>
                      <span className="text-slate-200 font-medium truncate">{proc.name}</span>
                    </div>

                    <div className="flex items-center space-x-6">
                      <span className="text-cyan-400 font-semibold">{proc.cpu}% CPU</span>
                      <span className="text-purple-400 font-semibold">{proc.mem}% RAM</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
