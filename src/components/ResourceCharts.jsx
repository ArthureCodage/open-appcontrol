import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ResourceCharts({ metrics }) {
  const [chartDataHistory, setChartDataHistory] = useState({
    labels: [],
    cpu: [],
    ram: [],
    netRx: [],
    netTx: []
  });

  // Accumulate rolling 30 seconds of live data for smooth real-time graphs
  useEffect(() => {
    if (!metrics) return;

    const timeLabel = new Date(metrics.timestamp).toLocaleTimeString('fr-FR', {
      hour12: false,
      minute: '2-digit',
      second: '2-digit'
    });

    setChartDataHistory(prev => {
      const newLabels = [...prev.labels, timeLabel].slice(-30);
      const newCpu = [...prev.cpu, metrics.cpu?.usage || 0].slice(-30);
      const newRam = [...prev.ram, metrics.memory?.percent || 0].slice(-30);
      const newRx = [...prev.netRx, Math.round((metrics.network?.rx_sec || 0) / 1024)].slice(-30); // in KB/s
      const newTx = [...prev.netTx, Math.round((metrics.network?.tx_sec || 0) / 1024)].slice(-30); // in KB/s

      return {
        labels: newLabels,
        cpu: newCpu,
        ram: newRam,
        netRx: newRx,
        netTx: newTx
      };
    });
  }, [metrics]);

  const cpuRamOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 }, callback: value => `${value}%` }
      }
    }
  };

  const netOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 } }
      },
      y: {
        min: 0,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#64748b', font: { size: 10 }, callback: value => `${value} KB/s` }
      }
    }
  };

  const cpuRamDataset = {
    labels: chartDataHistory.labels,
    datasets: [
      {
        label: 'CPU Usage %',
        data: chartDataHistory.cpu,
        borderColor: '#00c6ff',
        backgroundColor: 'rgba(0, 198, 255, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'RAM Usage %',
        data: chartDataHistory.ram,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const netDataset = {
    labels: chartDataHistory.labels,
    datasets: [
      {
        label: 'Download (KB/s)',
        data: chartDataHistory.netRx,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Upload (KB/s)',
        data: chartDataHistory.netTx,
        borderColor: '#f43f5e',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CPU & RAM Graph */}
      <div className="glass-card p-5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Évolution Charge CPU & RAM (Temps Réel)
        </h4>
        <div className="h-[220px]">
          <Line options={cpuRamOptions} data={cpuRamDataset} />
        </div>
      </div>

      {/* Network Traffic Graph */}
      <div className="glass-card p-5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Trafic Réseau Internet Upload / Download (KB/s)
        </h4>
        <div className="h-[220px]">
          <Line options={netOptions} data={netDataset} />
        </div>
      </div>
    </div>
  );
}
