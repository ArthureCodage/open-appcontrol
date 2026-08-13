import React from 'react';
import { 
  Activity, 
  History, 
  Cpu, 
  Wifi, 
  ShieldCheck, 
  Server, 
  Radio 
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, isConnected, latestMetrics }) {
  return (
    <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                OpenAppControl
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                v1.0 Open-Source
              </span>
            </div>
            <p className="text-xs text-slate-400">Task Manager & Network Traffic History</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 space-x-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Vue globale</span>
          </button>

          <button
            onClick={() => setActiveTab('processes')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'processes'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Processus ({latestMetrics?.processes?.count || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('network')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'network'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>Réseau Internet</span>
          </button>

          <button
            onClick={() => setActiveTab('rewind')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'rewind'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40 glow-purple'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Rewind 72h</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'logs'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 glow-emerald'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sécurité & Logs</span>
          </button>
        </nav>

        {/* Live Indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
            <span className="text-xs font-mono text-slate-300">
              {isConnected ? 'LIVE 1s' : 'Déconnecté'}
            </span>
          </div>

          <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mode 100% Local</span>
          </div>
        </div>
      </div>
    </header>
  );
}
