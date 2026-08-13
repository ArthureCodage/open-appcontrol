import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Info, BellRing, RefreshCw } from 'lucide-react';
import { formatDate } from '../utils/formatters.js';

export default function PrivacyLogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 glow-emerald">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Journal de Sécurité & Confidentialité</h2>
            <p className="text-xs text-slate-400">
              Historique des événements système, démarrages de processus et alertes réseau.
            </p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Horodatage</th>
                <th className="p-4">Niveau</th>
                <th className="p-4">Type</th>
                <th className="p-4">Événement</th>
                <th className="p-4">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-sans">Chargement des logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 font-sans">Aucun événement enregistré.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="p-4 text-slate-400">{formatDate(log.timestamp)}</td>

                    <td className="p-4 font-sans">
                      {log.level === 'warning' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Attention</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 inline-flex items-center space-x-1">
                          <Info className="w-3 h-3" />
                          <span>Info</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-sans font-semibold text-slate-300 capitalize">{log.type}</td>

                    <td className="p-4 font-sans font-bold text-slate-100">{log.title}</td>

                    <td className="p-4 font-sans text-slate-300">{log.message}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
