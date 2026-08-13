# AGENTS.md

Notes for OpenCode sessions working in this repo. Compact, repo-specific, verified against the codebase.

## Stack & status

- Tauri v2 desktop app: Rust backend (`src-tauri/`) + React 18 + TypeScript frontend (`src/`), built with Vite.
- The app is early-stage. `src/App.tsx` is a placeholder ("Hello from Sundial"). `docs/architecture.md` describes the **intended** stack (Zustand, Dexie.js, Tailwind, date-fns, Chart.js/Recharts, lucide-react), but **only `react`, `react-dom`, and `@tauri-apps/api` are actually installed** (`package.json`). Do not assume a library is available just because the architecture doc names it — check `package.json` and `node_modules` first, and add deps explicitly when introducing them.
- Rust backend (`src-tauri/src/lib.rs`) currently only registers `tauri-plugin-opener`. Super Productivity token reading, loopback HTTP, and Tauri commands described in the README/architecture doc are **not yet implemented**.

## Commands

- Dev (use this, not `npm run dev` alone): `npm run tauri dev` — runs Vite on port 5173 (`strictPort`) and opens the native window with hot reload. `npm run dev` only starts the webview without the Tauri shell.
- Production build: `npm run tauri build` → output at `src-tauri/target/release/bundle/macos/Sundial.app`.
- Frontend-only build: `npm run build` (runs `tsc && vite build`). Type errors fail the build.
- **No lint, test, or formatter is configured.** There is no `npm run lint`/`test`/`typecheck` script; `tsc` only runs as part of `npm run build`. If asked to "typecheck", run `npx tsc --noEmit` or `npm run build`.
- Rust: `cargo` commands run from `src-tauri/` (e.g. `cargo check`, `cargo clippy`). No separate Rust test runner is set up.

## Architecture constraints (matter for correctness)

- **Frontend cannot reach the Super Productivity API directly.** The API at `127.0.0.1:3876` rejects requests with a browser `Origin` header (CORS). All API calls and the token file read must go through **Rust Tauri commands**, not `fetch` from the webview.
- API: Bearer auth on every route except `GET /health`. Endpoints used: `GET /tasks?source=all&includeDone=true`, `GET /projects`, `GET /tags`. Read-only — never POST/PUT back to Super Productivity. Full reference in `docs/api-reference.md`.
- Sync model: **full replace** into local persistence (IndexedDB/Dexie), not delta merge. Browsing is offline after a sync.
- Adding a new Tauri plugin or IPC command: update `src-tauri/capabilities/default.json` (currently `core:default`, `opener:default`) or the command will be denied at runtime.

## Toolchain quirks

- Vite `envPrefix` is `['VITE_', 'TAURI_ENV_*']` — use `TAURI_ENV_*` for Tauri-injected env vars in frontend code.
- `tsconfig.json` is strict with `noUnusedLocals` and `noUnusedParameters` — unused imports/vars fail `tsc`. Keep edits clean.
- `vite.config.ts` sets `clearScreen: false` so Tauri CLI output stays visible; don't change it.
- `tauri.conf.json`: `beforeDevCommand` is `npm run dev`, `devUrl` is `http://localhost:5173`, `frontendDist` is `../dist`. Window min 800×600, default 1200×800.

## Repo layout

- `src/` — React frontend (entry `main.tsx` → `App.tsx`).
- `src-tauri/` — Rust app shell. `src/lib.rs` holds `run()`, `src/main.rs` is the thin entrypoint (do not remove the `windows_subsystem` attribute). `Cargo.toml` crate name `sp-sundial`, lib name `sp_sundial_lib`.
- `src-tauri/gen/schemas/` — Tauri-generated, do not hand-edit.
- `dist/` and `src-tauri/target/` — build artifacts, gitignored.
- `docs/` — **gitignored** (see `.gitignore`). Treat as local reference only; do not rely on it being present in a fresh clone and do not commit changes to it unless asked.

## Prerequisites (macOS)

- Rust (rustup), Node 18+, Xcode CLI tools (`xcode-select --install`). Tauri v2 requires the Rust toolchain; a missing one causes `npm run tauri dev` to fail at the cargo step.
- Super Productivity desktop app must be running with the local REST API enabled (Settings → Miscellaneous → Enable local REST API) for sync to work.
