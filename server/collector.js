import si from 'systeminformation';

/**
 * Collect a complete, detailed snapshot of system & network metrics
 */
export async function collectMetrics() {
  try {
    const [
      cpuLoad,
      cpuTemp,
      mem,
      netStatsArr,
      netConnections,
      processes,
      fsStats
    ] = await Promise.all([
      si.currentLoad(),
      si.cpuTemperature().catch(() => ({ main: null })),
      si.mem(),
      si.networkStats().catch(() => []),
      si.networkConnections().catch(() => []),
      si.processes().catch(() => ({ list: [] })),
      si.fsStats().catch(() => ({ rx_sec: 0, wx_sec: 0 }))
    ]);

    // Calculate aggregated network Rx/Tx
    let rx_sec = 0;
    let tx_sec = 0;

    if (Array.isArray(netStatsArr)) {
      for (const iface of netStatsArr) {
        if (iface.operstate === 'up' || iface.rx_sec > 0 || iface.tx_sec > 0) {
          rx_sec += Math.max(0, iface.rx_sec || 0);
          tx_sec += Math.max(0, iface.tx_sec || 0);
        }
      }
    }

    // Process network connection list
    const activeConnections = (netConnections || [])
      .filter(conn => conn.state === 'ESTABLISHED' || conn.state === 'LISTEN')
      .slice(0, 150)
      .map(conn => ({
        protocol: conn.protocol || 'TCP',
        localAddress: conn.localAddress || '127.0.0.1',
        localPort: conn.localPort || 0,
        peerAddress: conn.peerAddress || '0.0.0.0',
        peerPort: conn.peerPort || 0,
        state: conn.state || 'UNKNOWN',
        pid: conn.pid || 0,
        process: conn.process || 'Système / Inconnu'
      }));

    // Rich process list format
    const procList = (processes.list || [])
      .slice(0, 200)
      .map(p => ({
        pid: p.pid,
        name: p.name,
        cpu: Math.round((p.cpu || 0) * 10) / 10,
        mem: Math.round((p.mem || 0) * 10) / 10,
        memVsz: p.memVsz || 0,
        memRss: p.memRss || 0,
        user: p.user || 'System',
        state: p.state || 'running',
        path: p.path || 'Inconnu',
        command: p.command || p.params || p.name,
        priority: p.priority || 0,
        started: p.started || null
      }))
      .sort((a, b) => b.cpu - a.cpu);

    const safeFsStats = fsStats || { rx_sec: 0, wx_sec: 0 };
    const safeMem = mem || { total: 1, used: 0, free: 1, active: 0 };
    const safeCpuLoad = cpuLoad || { currentLoad: 0, cpus: [] };

    const snapshot = {
      timestamp: Date.now(),
      cpu: {
        usage: Math.round((safeCpuLoad.currentLoad || 0) * 10) / 10,
        cores: (safeCpuLoad.cpus || []).map(c => Math.round(c.load || 0)),
        temp: (cpuTemp && cpuTemp.main) ? cpuTemp.main : null
      },
      memory: {
        total: safeMem.total || 1,
        used: safeMem.active || safeMem.used || 0,
        free: safeMem.free || 0,
        percent: Math.round(((safeMem.active || safeMem.used || 0) / (safeMem.total || 1)) * 100)
      },
      network: {
        rx_sec: Math.round(rx_sec),
        tx_sec: Math.round(tx_sec),
        rx_kbps: Math.round((rx_sec * 8) / 1024),
        tx_kbps: Math.round((tx_sec * 8) / 1024),
        activeConnectionsCount: activeConnections.length,
        connections: activeConnections
      },
      disk: {
        read_sec: safeFsStats.rx_sec || 0,
        write_sec: safeFsStats.wx_sec || 0
      },
      processes: {
        count: (processes && processes.all) || procList.length,
        running: (processes && processes.running) || 0,
        blocked: (processes && processes.blocked) || 0,
        list: procList
      }
    };

    return snapshot;
  } catch (err) {
    console.error('Error collecting system metrics:', err);
    throw err;
  }
}
