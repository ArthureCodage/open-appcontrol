import React from 'react';
import { 
  Cpu, 
  MemoryStick, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Zap, 
  Activity, 
  ShieldCheck, 
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import ResourceCharts from './ResourceCharts.jsx';
import { formatBytes, formatSpeed } from '../utils/formatters.js';

export default function OverviewTab({ metrics, onSelectProcess }) {
  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center p-16 glass-card text-center">
        <Zap className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <p className="text-slate-300 font-semibold">Connexion au démon système OpenAppControl Pro...</p>
      </div>
    );
  }

  const cpuUsage = metrics.cpu?.usage || 0;
  const memUsage = metrics.memory?.percent || 0;
  const rxSpeed = metrics.network?.rx_sec || 0;
  const txSpeed = metrics.network?.tx_sec || 0;

  // Top 6 CPU processes
  const topCpuProcesses = (metrics.processes?.list || []).slice(0, 6);

  // Health status badge calculation
  const getHealthBadge = () => {
    if (cpuUsage > 85 || memUsage > 90) {
      return { text: 'Charge Élevée', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    }
    if (cpuUsage > 60 || memUsage > 75) {
      return { text: 'Charge Modérée', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    }
    return { text: 'Système Optimal', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  };

  const health = getHealthBadge();

  return (
    <div className="space-y-6">
      {/* Top Banner Status Bar */}
      <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-cyan-500/20">
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${health.color}`}>
            ● {health.text}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {metrics.processes?.count || 0} Processus au total • {metrics.network?.activeConnectionsCount || 0} Sockets actives
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/api/export/csv"
            download="open-appcontrol-metrics.csv"
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-cyan-400 transition-all flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exporter Rapport CSV</span>
          </a>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CPU Card */}
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 glow-cyan">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Processeur (CPU)</h3>
                <p className="text-xs text-slate-400">{metrics.cpu?.cores?.length || 0} Cœurs physiques/logiques</p>
              </div>
            </div>
            <span className="text-2xl font-black font-mono text-cyan-400">{cpuUsage}%</span>
          </div>

          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, cpuUsage)}%` }}
            />
          </div>

          {/* Multi-Core Micro Gauges */}
          <div className="grid grid-cols-4 gap-1.5 mt-4 pt-3 border-t border-slate-800/80">
            {(metrics.cpu?.cores || []).slice(0, 8).map((load, idx) => (
              <div key={idx} className="space-y-1 text-center">
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full" style={{ width: `${load}%` }} />
                </div>
                <span className="text-[9px] font-mono text-slate-500">C{idx+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RAM Card */}
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 glow-purple">
                <MemoryStick className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Mémoire (RAM)</h3>
                <p className="text-xs text-slate-400">{formatBytes(metrics.memory?.used)} / {formatBytes(metrics.memory?.total)}</p>
              </div>
            </div>
            <span className="text-2xl font-black font-mono text-purple-400">{memUsage}%</span>
          </div>

          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, memUsage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
            <span>RAM Libre:</span>
            <span className="font-mono text-purple-300 font-semibold">{formatBytes(metrics.memory?.free)}</span>
          </div>
        </div>

        {/* Network Download Card */}
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 glow-emerald">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Réseau Download</h3>
                <p className="text-xs text-slate-400">Réception Web</p>
              </div>
            </div>
            <span className="text-xl font-bold font-mono text-emerald-400">{formatSpeed(rxSpeed)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 mt-8">
            <span>Sockets ouvertes:</span>
            <span className="font-mono text-emerald-400 font-bold">{metrics.network?.activeConnectionsCount || 0}</span>
          </div>
        </div>

        {/* Network Upload Card */}
        <div className="glass-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 glow-rose">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Réseau Upload</h3>
                <p className="text-xs text-slate-400">Envoi Web</p>
              </div>
            </div>
            <span className="text-xl font-bold font-mono text-rose-400">{formatSpeed(txSpeed)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 mt-8">
            <span>Débit sortant:</span>
            <span className="font-mono text-rose-400 font-bold">{formatSpeed(txSpeed)}</span>
          </div>
        </div>
      </div>

      {/* Real-time Line Charts Section */}
      <ResourceCharts metrics={metrics} />

      {/* Top Consuming Processes */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-200 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span>Processus les plus actifs en arrière-plan</span>
          </h3>
          <span className="text-xs text-slate-400">Cliquez pour inspecter</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {topCpuProcesses.map((proc) => (
            <div 
              key={proc.pid} 
              onClick={() => onSelectProcess && onSelectProcess(proc)}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3 truncate pr-2">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono text-cyan-400 font-bold group-hover:bg-cyan-500/20">
                  {proc.pid}
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-cyan-300">{proc.name}</p>
                  <p className="text-xs text-slate-500 truncate">{proc.user}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-mono font-black text-cyan-400 block">{proc.cpu}%</span>
                <span className="text-xs font-mono text-purple-400">{proc.mem}% RAM</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
