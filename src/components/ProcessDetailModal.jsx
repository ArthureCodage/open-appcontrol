import React from 'react';
import { X, Cpu, MemoryStick, ShieldAlert, PauseCircle, XCircle, Terminal, Folder, User } from 'lucide-react';
import { formatBytes } from '../utils/formatters.js';

export default function ProcessDetailModal({ process, onClose, onKill, onSuspend, onResume, onToggleBlacklist, isBlacklisted }) {
  if (!process) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-2xl p-6 border-cyan-500/40 shadow-2xl relative space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold">
              {process.pid}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>{process.name}</span>
                {isBlacklisted && (
                  <span className="px-2 py-0.5 rounded text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    BLOQUÉ
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-mono">PID: {process.pid} • User: {process.user || 'System'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Charge CPU</span>
            <span className="text-lg font-bold font-mono text-cyan-400">{process.cpu}%</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Mémoire RAM</span>
            <span className="text-lg font-bold font-mono text-purple-400">{process.mem}%</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Taille Virtuelle</span>
            <span className="text-sm font-semibold font-mono text-slate-300">{formatBytes(process.memVsz)}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Statut</span>
            <span className="text-sm font-semibold font-mono text-emerald-400 uppercase">{process.state}</span>
          </div>
        </div>

        {/* Executable Path & Arguments */}
        <div className="space-y-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-slate-400 font-sans font-semibold flex items-center space-x-1">
              <span>Chemin d'accès de l'exécutable:</span>
            </span>
            <p className="text-slate-200 break-all">{process.path || 'Inconnu'}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-slate-400 font-sans font-semibold flex items-center space-x-1">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Commande / Arguments de lancement:</span>
            </span>
            <p className="text-slate-300 break-all">{process.command || process.name}</p>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => onToggleBlacklist(process.name)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-2 ${
              isBlacklisted
                ? 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isBlacklisted ? 'Débloquer l\'application' : 'Interdire / Bloquer cette application'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSuspend(process.pid, process.name)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 flex items-center space-x-1.5"
            >
              <PauseCircle className="w-4 h-4" />
              <span>Pause</span>
            </button>

            <button
              onClick={() => onKill(process.pid, process.name)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 flex items-center space-x-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Arrêter (Kill)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
