import React, { useState } from 'react';
import { Wifi, ArrowDownLeft, ArrowUpRight, ShieldAlert, Globe, Search, Layers, FileSpreadsheet } from 'lucide-react';
import { formatSpeed } from '../utils/formatters.js';

export default function NetworkInspectorTab({ metrics }) {
  const [filterText, setFilterText] = useState('');

  const network = metrics?.network || {};
  const connections = network.connections || [];

  const filteredConnections = connections.filter(conn => 
    (conn.process && conn.process.toLowerCase().includes(filterText.toLowerCase())) ||
    (conn.peerAddress && conn.peerAddress.includes(filterText)) ||
    (conn.localPort && conn.localPort.toString().includes(filterText))
  );

  // Group connections by process name for bandwidth/socket ranking
  const processGroupMap = {};
  for (const conn of connections) {
    const pName = conn.process || 'Inconnu';
    if (!processGroupMap[pName]) {
      processGroupMap[pName] = { name: pName, count: 0, ips: new Set() };
    }
    processGroupMap[pName].count += 1;
    if (conn.peerAddress && conn.peerAddress !== '0.0.0.0' && conn.peerAddress !== '127.0.0.1') {
      processGroupMap[pName].ips.add(conn.peerAddress);
    }
  }

  const topNetworkApps = Object.values(processGroupMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Network Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Live Download */}
        <div className="glass-card p-6 border-emerald-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 glow-emerald">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Trafic Entrant (Download)</h3>
                <p className="text-xs text-slate-400">Réception Internet</p>
              </div>
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-emerald-400">{formatSpeed(network.rx_sec || 0)}</p>
        </div>

        {/* Live Upload */}
        <div className="glass-card p-6 border-rose-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 glow-rose">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Trafic Sortant (Upload)</h3>
                <p className="text-xs text-slate-400">Émission Internet</p>
              </div>
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-rose-400">{formatSpeed(network.tx_sec || 0)}</p>
        </div>

        {/* Active Sockets Count */}
        <div className="glass-card p-6 border-cyan-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 glow-cyan">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300">Connexions Actives</h3>
                <p className="text-xs text-slate-400">Sockets ouvertes</p>
              </div>
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-cyan-400">{connections.length}</p>
        </div>
      </div>

      {/* Top Apps by Active Sockets */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Applications les plus actives sur le réseau</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topNetworkApps.map((app, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-200 truncate">{app.name}</p>
                <p className="text-xs text-slate-400 font-mono">{app.ips.size} IP distantes uniques</p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold">
                {app.count} Sockets
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Network Connections Filter & Table */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-cyan-400" />
              <span>Matrice des Connexions Réseau Actives (Processus ⇄ IP Distantes)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Inspectez quelles applications communiquent sur Internet en temps réel.
            </p>
          </div>

          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filtrer par IP distante, port ou processus..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">PID</th>
                <th className="p-3">Processus</th>
                <th className="p-3">Protocole</th>
                <th className="p-3">Adresse Locale</th>
                <th className="p-3">Adresse Distante (IP:Port)</th>
                <th className="p-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredConnections.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-sans">
                    Aucune connexion correspondant au filtre ou aucune connexion établie pour le moment.
                  </td>
                </tr>
              ) : (
                filteredConnections.map((conn, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-all">
                    <td className="p-3 text-slate-400">{conn.pid || 'N/A'}</td>
                    
                    <td className="p-3 font-sans font-medium text-slate-200">
                      <span className="truncate block max-w-xs">{conn.process}</span>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                        {conn.protocol || 'TCP'}
                      </span>
                    </td>

                    <td className="p-3 text-slate-400">
                      {conn.localAddress}:{conn.localPort}
                    </td>

                    <td className="p-3 text-emerald-400 font-semibold">
                      {conn.peerAddress}:{conn.peerPort}
                    </td>

                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                        {conn.state || 'ESTABLISHED'}
                      </span>
                    </td>
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
