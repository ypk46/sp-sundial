# AGENTS.md

Notes for OpenCode sessions working in this repo. Compact, repo-specific, verified against the codebase.

## Stack & status

- Tauri v2 desktop app: Rust backend (`src-tauri/`) + React 18 + TypeScript frontend (`src/`), built with Vite. Tailwind v4 is set up (via `@tailwindcss/vite`, config-less — single `@import "tailwindcss";` in `src/index.css`).
- Installed frontend deps: `react`, `react-dom`, `@tauri-apps/api`, `@tauri-apps/plugin-store`, `lucide-react`, `tailwindcss`, `@tailwindcss/vite`. `docs/architecture.md` names more (Zustand, Dexie.js, date-fns, Chart.js/Recharts) that are **not yet installed** — check `package.json` and `node_modules` first, and add deps explicitly when introducing them.
- Rust backend: registers `tauri-plugin-opener`, `tauri-plugin-store`, and three IPC commands in `src-tauri/src/settings.rs` — `get_setting`, `set_setting`, `validate_token`. The token-entry flow (`src/pages/TokenEntryPage.tsx`) persists the SP REST API token to a `settings.json` store at `~/Library/Application Support/com.sundial.desktop/` (macOS; uses Tauri's `app_config_dir()` — note the bundle-id folder, not product name). `last_sync_at` is reserved in the schema but not written yet. Sync (`GET /tasks`, `/projects`, `/tags`) is **not yet implemented**.

## Commands

- Dev (use this, not `npm run dev` alone): `npm run tauri dev` — runs Vite on port 5173 (`strictPort`) and opens the native window with hot reload. `npm run dev` only starts the webview without the Tauri shell.
- Production build: `npm run tauri build` → output at `src-tauri/target/release/bundle/macos/Sundial.app`.
- Frontend-only build: `npm run build` (runs `tsc && vite build`). Type errors fail the build.
- **Typecheck:** `npx tsc --noEmit` (or `npm run build`). No dedicated `typecheck` script.
- **Formatting** (enforced via pre-commit hook + VSCode):
  - TS/CSS/JSON/MD: `npm run format` (write) / `npm run format:check` (verify). Prettier with default config (`.prettierrc.json` is `{}`).
  - Rust: `npm run fmt:rust` (write) / `npm run fmt:rust:check` (verify). Uses `rustfmt` defaults (no `rustfmt.toml`).
  - Pre-commit hook (`.husky/pre-commit`): runs `lint-staged` (Prettier `--check` on staged JS/TS/CSS/JSON/MD) + `cargo fmt --check`. A failed check blocks the commit; run the formatter and re-stage.
- **Linting:** Rust: `cargo clippy --all-targets` from `src-tauri/`. No ESLint configured for TS — `tsconfig.json` has `noUnusedLocals`/`noUnusedParameters` which catches the most common issues.

## Architecture constraints (matter for correctness)

- **Frontend cannot reach the Super Productivity API directly.** The API at `127.0.0.1:3876` rejects requests with a browser `Origin` header (CORS). All API calls and the token file read must go through **Rust Tauri commands**, not `fetch` from the webview.
- API: Bearer auth on every route except `GET /health`. Endpoints used: `GET /tasks?source=all&includeDone=true`, `GET /projects`, `GET /tags`. Read-only — never POST/PUT back to Super Productivity. Full reference in `docs/api-reference.md`.
- Sync model: **full replace** into local persistence (IndexedDB/Dexie), not delta merge. Browsing is offline after a sync.
- Adding a new Tauri plugin or IPC command: update `src-tauri/capabilities/default.json` (currently `core:default`, `opener:default`, `store:default`) or the command will be denied at runtime. Custom IPC commands (defined via `generate_handler!`) do **not** need capability entries — only plugin commands do.

## Toolchain quirks

- Vite `envPrefix` is `['VITE_', 'TAURI_ENV_*']` — use `TAURI_ENV_*` for Tauri-injected env vars in frontend code.
- `tsconfig.json` is strict with `noUnusedLocals` and `noUnusedParameters` — unused imports/vars fail `tsc`. Keep edits clean.
- `vite.config.ts` sets `clearScreen: false` so Tauri CLI output stays visible; don't change it.
- `tauri.conf.json`: `beforeDevCommand` is `npm run dev`, `devUrl` is `http://localhost:5173`, `frontendDist` is `../dist`. Window min 800×600, default 1200×800.

## Repo layout

- `src/` — React frontend (entry `main.tsx` → `App.tsx`). `src/pages/`, `src/components/`, `src/lib/` for modular files.
- `src-tauri/` — Rust app shell. `src/lib.rs` holds `run()` + registers plugins/commands, `src/settings.rs` has the settings/token Tauri commands, `src/main.rs` is the thin entrypoint (do not remove the `windows_subsystem` attribute). `Cargo.toml` crate name `sp-sundial`, lib name `sp_sundial_lib`.
- `src-tauri/gen/schemas/` — Tauri-generated, do not hand-edit.
- `dist/` and `src-tauri/target/` — build artifacts, gitignored.
- `.vscode/` — workspace settings + recommended extensions (format-on-save, rust-analyzer, Prettier, Tailwind).
- `.husky/` — git hooks (pre-commit runs formatters).
- `docs/` — **gitignored** (see `.gitignore`). Treat as local reference only; do not rely on it being present in a fresh clone and do not commit changes to it unless asked.

## Prerequisites (macOS)

- Rust (rustup), Node 18+, Xcode CLI tools (`xcode-select --install`). Tauri v2 requires the Rust toolchain; a missing one causes `npm run tauri dev` to fail at the cargo step.
- Super Productivity desktop app must be running with the local REST API enabled (Settings → Miscellaneous → Enable local REST API) for sync to work.
