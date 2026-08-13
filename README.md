<div align="center">

# ⚡ OpenAppControl

### *The Open-Source Task Manager & Internet Traffic Inspector with 72-Hour Historical Rewind*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v18-61dafb.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-v5-646cff.svg)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06b6d4.svg)](https://tailwindcss.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/ArthureCodage/open-appcontrol/pulls)

<p align="center">
  <b>A lightweight, ultra-fast, privacy-first alternative to AppControl, GlassWire, and Windows Task Manager.</b><br>
  Track CPU, Memory, Disk, and Network Internet usage per process over time. Rewind up to 72 hours to diagnose spikes and block troublesome applications locally.
</p>

[Key Features](#-key-features) •
[Quick Start](#-quick-start) •
[Architecture](#-architecture) •
[API Documentation](#-api-documentation) •
[License](#-license)

---

</div>

## 🌟 Why OpenAppControl?

Default operating system Task Managers only give you a brief, real-time snapshot. When a mystery background process spikes your CPU, overheats your system, or consumes your internet bandwidth while you're away, traditional tools won't tell you what happened.

**OpenAppControl** runs locally as a lightweight daemon, archiving high-precision time-series system & network metrics into a local SQLite database. It provides an intuitive, futuristic web interface to **inspect real-time resource usage, scrub back in time up to 72 hours, monitor active network sockets, and block unwanted apps.**

---

## 🔥 Key Features

- ⏪ **72-Hour Historical Rewind**: Scrub through an interactive timeline slider to inspect exact CPU, RAM, Disk, and Network usage at any timestamp in the past.
- 🌐 **Real-Time Network Internet Inspector**: Monitor Upload/Download bandwidth in KB/s and MB/s, inspect active sockets matrix (Local IP, Remote IP, Port, Protocol, State), and group bandwidth by application.
- 📈 **Live Chart.js Visualizations**: Smooth 30-second rolling trendlines for CPU usage, multi-core loads, RAM pressure, and network throughput.
- ⚡ **Advanced Process Management**: Search, sort by CPU/RAM/PID, inspect executable file paths & launch CLI parameters, and **Kill, Pause, or Resume** any process.
- 🛡️ **Automated Process Blacklisting (App Blocking)**: Add applications to a local blocklist to automatically prevent them from running or terminate them upon launch.
- 🔒 **100% Local & Privacy-First**: Zero external telemetry, zero tracking, self-hosted Node.js + SQLite architecture.
- 📊 **One-Click CSV Reports**: Export diagnostic time-series metrics into CSV spreadsheets for troubleshooting.

---

## 🛠️ Tech Stack & Architecture

OpenAppControl is built with performance and developer experience in mind:

```
                  ┌─────────────────────────────────────────┐
                  │          React + Vite Frontend          │
                  │   (Chart.js, TailwindCSS, Lucide Icons) │
                  └────────────────────┬────────────────────┘
                                       │ Real-Time WebSockets & REST API
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │            Node.js Express Server       │
                  │       (collector.js & processManager)   │
                  └──────────┬────────────────────┬─────────┘
                             │                    │
                             ▼                    ▼
               ┌───────────────────────┐ ┌───────────────────┐
               │ `systeminformation`   │ │ SQLite Database   │
               │  (OS & Network Probe) │ │ (72h Time-Series) │
               └───────────────────────┘ └───────────────────┘
```

- **Frontend**: React 18, Vite 5, Chart.js, TailwindCSS v4, Lucide Icons
- **Backend**: Node.js, Express, WebSockets (`ws`), `systeminformation`
- **Database**: SQLite3 (Embedded Time-Series Store with automatic 72h pruning)

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- `npm` or `pnpm`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ArthureCodage/open-appcontrol.git
   cd open-appcontrol
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application (Backend Daemon + Frontend Dashboard)**
   ```bash
   npm run start
   ```

4. **Open your browser**
   - 🌐 Dashboard UI: `http://localhost:3000`
   - ⚙️ Backend API: `http://localhost:3001`

---

## 📖 API Documentation

The backend daemon exposes a clean REST & WebSocket API:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `ws://localhost:3001` | WS | Real-time 1-second interval metrics stream |
| `/api/metrics/current` | GET | Latest real-time system & network snapshot |
| `/api/metrics/history` | GET | Query historical time-series (`?start=timestamp&end=timestamp`) |
| `/api/export/csv` | GET | Download 24h metrics history as a CSV file |
| `/api/logs` | GET | Retrieve recent security & privacy event logs |
| `/api/process/kill` | POST | Terminate a process (`{ "pid": 1234, "name": "app.exe" }`) |
| `/api/process/suspend` | POST | Pause/Suspend a process (`{ "pid": 1234 }`) |
| `/api/process/resume` | POST | Resume a suspended process (`{ "pid": 1234 }`) |
| `/api/blacklist` | GET/POST | Manage blocked applications list |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/ArthureCodage/open-appcontrol/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

<div align="center">

Made with ❤️ by [ArthureCodage](https://github.com/ArthureCodage)

</div>
