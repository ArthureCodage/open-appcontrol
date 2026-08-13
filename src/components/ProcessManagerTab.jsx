import React, { useState } from 'react';
import { Search, Cpu, MemoryStick, XCircle, PauseCircle, ShieldAlert, ArrowUpDown, Filter, Info } from 'lucide-react';
import { formatBytes } from '../utils/formatters.js';

export default function ProcessManagerTab({ metrics, onSelectProcess, blacklistedApps = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('cpu');
  const [sortOrder, setSortOrder] = useState('desc');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'highCpu', 'highMem'
  const [actionStatus, setActionStatus] = useState(null);

  const processes = metrics?.processes?.list || [];

  // Filter & sort processes
  const filteredProcesses = processes
    .filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.pid.toString().includes(searchTerm) ||
        (p.user && p.user.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (categoryFilter === 'highCpu') return p.cpu > 1;
      if (categoryFilter === 'highMem') return p.mem > 1;
      return true;
    })
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleKill = async (pid, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Voulez-vous vraiment forcer l'arrêt du processus ${name} (PID: ${pid}) ?`)) return;
    try {
      const res = await fetch('/api/process/kill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid, name })
      });
      const data = await res.json();
      if (res.ok) {
        setActionStatus({ type: 'success', message: data.message });
      } else {
        setActionStatus({ type: 'error', message: data.error });
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message });
    }
  };

  const handleSuspend = async (pid, name, e) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/process/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid, name })
      });
      const data = await res.json();
      if (res.ok) {
        setActionStatus({ type: 'success', message: data.message });
      } else {
        setActionStatus({ type: 'error', message: data.error });
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Rechercher par nom de processus ou PID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              categoryFilter === 'all' ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tous ({processes.length})
          </button>
          <button
            onClick={() => setCategoryFilter('highCpu')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              categoryFilter === 'highCpu' ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Actifs CPU (&gt;1%)
          </button>
          <button
            onClick={() => setCategoryFilter('highMem')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              categoryFilter === 'highMem' ? 'bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Actifs RAM (&gt;1%)
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {actionStatus && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
          actionStatus.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <span>{actionStatus.message}</span>
          <button onClick={() => setActionStatus(null)} className="font-bold ml-4">✕</button>
        </div>
      )}

      {/* Process Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/90 text-xs font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th onClick={() => handleSort('pid')} className="p-4 cursor-pointer hover:text-slate-200">
                  <div className="flex items-center space-x-1">
                    <span>PID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('name')} className="p-4 cursor-pointer hover:text-slate-200">
                  <div className="flex items-center space-x-1">
                    <span>Nom du processus</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('cpu')} className="p-4 cursor-pointer hover:text-slate-200 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <span>CPU %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('mem')} className="p-4 cursor-pointer hover:text-slate-200 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <span>RAM %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="p-4">Utilisateur</th>
                <th className="p-4 text-center">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredProcesses.map((proc) => {
                const isBlocked = (blacklistedApps || []).includes(proc.name.toLowerCase());
                return (
                  <tr 
                    key={proc.pid} 
                    onClick={() => onSelectProcess && onSelectProcess(proc)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-all text-xs group"
                  >
                    <td className="p-4 font-semibold text-slate-400">{proc.pid}</td>
                    
                    <td className="p-4 font-sans font-semibold text-slate-200 group-hover:text-cyan-300">
                      <div className="flex items-center space-x-2">
                        <span className="truncate max-w-xs">{proc.name}</span>
                        {isBlocked && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Bloqué
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-right font-bold text-cyan-400">
                      {proc.cpu > 0 ? `${proc.cpu}%` : '0%'}
                    </td>

                    <td className="p-4 text-right font-bold text-purple-400">
                      {proc.mem > 0 ? `${proc.mem}%` : '0%'}
                    </td>

                    <td className="p-4 text-slate-400 font-sans">{proc.user || 'System'}</td>

                    <td className="p-4 text-center font-sans">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {proc.state || 'En cours'}
                      </span>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={(e) => handleSuspend(proc.pid, proc.name, e)}
                        title="Suspendre le processus"
                        className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-all font-sans text-xs inline-flex items-center space-x-1"
                      >
                        <PauseCircle className="w-3.5 h-3.5" />
                        <span>Pause</span>
                      </button>

                      <button
                        onClick={(e) => handleKill(proc.pid, proc.name, e)}
                        title="Forcer l'arrêt du processus"
                        className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all font-sans text-xs inline-flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Kill</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
