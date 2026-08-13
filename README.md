# Sundial

A native desktop dashboard for visualizing time-tracking data from [Super Productivity](https://github.com/johannesjo/super-productivity).

Sundial syncs time-tracking data from Super Productivity's local REST API on demand, then serves analytics views from local persistence — no live API dependency for browsing.

## Features

- **Time spent per day** — charts across a custom date range
- **Distribution by project** — stacked bars showing project breakdown
- **Date range filtering** — custom date picker + presets ("This Week", "This Month", etc.)
- **Project filtering** — multi-select to include/exclude projects
- **Expandable per-day task lists** — drill into which tasks contributed time on any given day
- **Offline browsing** — after a sync, all views work from local storage without the API

## Tech Stack

- **Tauri v2** — native macOS app, Rust backend, system webview (~5 MB bundle)
- **React 18 + TypeScript** — frontend
- **Vite** — build tooling
- **Dexie.js (IndexedDB)** — local persistence for synced data

## Prerequisites

- [Rust](https://rustup.rs/) (installed via rustup)
- Node.js 18+
- Xcode CLI tools: `xcode-select --install`

## Getting Started

```bash
# Install dependencies
npm install

# Run in development (opens a native window with hot reload)
npm run tauri dev

# Build a production .app bundle
npm run tauri build
```

The built app appears at `src-tauri/target/release/bundle/macos/Sundial.app`.

## How It Works

1. Sundial ask for REST API token on first startup.
2. On sync, the Rust backend fetches tasks, projects, and tags from `127.0.0.1:3876` (the Super Productivity local REST API).
3. The frontend normalizes the data and writes it to IndexedDB (full replace, not delta merge).
4. All charts and views render from IndexedDB. The API is only contacted on sync.

**Requirements for syncing:**

- Super Productivity (Electron desktop app) must be running
- The local REST API must be enabled: Super Productivity → Settings → Miscellaneous → Enable local REST API
