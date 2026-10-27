# AGENTS.md - Store POS Project Reference

## Project Overview
**Store POS** — Modern desktop Point of Sale with LAN multi-terminal support  
Version: 2.0.0 | Stack: Electron 33 + React 18 + TypeScript + Vite 6 + Express + sql.js (WASM SQLite)

---

## Architecture

### Processes
| Process | Entry Point | Responsibilities |
|---------|-------------|------------------|
| **Main** | `electron/main.js` | Window lifecycle, Express API server (port 8001), SQLite DB, IPC handlers, auto-updater |
| **Renderer** | `src/main.tsx` → `src/App.tsx` | React UI (Till, Catalog, Settings, Sales, Customers, Team) |
| **Preload** | `electron/preload.cjs` | Secure `contextBridge` exposing `window.pos` API to renderer |

### Data Flow
```
Renderer (React) → window.pos.getApiInfo() → baseUrl (http://127.0.0.1:8001/api)
     ↓
API Client (src/api/client.ts) → fetch() with Bearer JWT
     ↓
Express (server/routes/*) → sql.js (WASM SQLite) → pos.sqlite
```

---

## Key Directories

```
electron/          # Main process + preload bridge
  main.js          # App entry, Express server, IPC, window management
  preload.cjs      # contextBridge → window.pos API
server/            # Express API + SQLite
  index.js         # createServer(), route mounting
  auth.js          # JWT, bcrypt, permissions middleware
  db.js            # sql.js wrapper, schema, migrations, seed
  routes/          # inventory, users, categories, customers, transactions, settings, media, demo
src/               # React UI
  api/client.ts    # Typed fetch wrapper, auth token management
  bridge.ts        # window.pos fallback (web mode)
  context/AuthContext.tsx  # Auth state, login, permissions
  pages/           # PosPage, TillView, CatalogView, SettingsView, LoginPage
  components/      # Modal, PaymentPad, PhotoPicker, CustomerSelect, TransactionsModal
  layout/AppShell.tsx      # Sidebar nav + header
scripts/           # Smoke tests (API + LAN)
build/             # Icons for installer
release/           # Build output (gitignored)
```

---

## Operating Modes (Settings → Register)
| Mode | API Bind | Database | Use Case |
|------|----------|----------|----------|
| Standalone | `127.0.0.1:8001` | Local | Single register |
| Network Server | `0.0.0.0:8001` | Local (shared) | Back-office, serves terminals |
| Network Terminal | Connects to Server IP | Remote (none) | Additional tills |

---

## Scripts (package.json)
| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + Electron (dev) |
| `npm run dev:web` | Vite (5173) + standalone API (8001) — no Electron |
| `npm run build` | Production UI build → `dist/` |
| `npm run dist` | Build + Windows NSIS installer |
| `npm run dist:linux` | Build + Linux `.deb` (run on Linux) |
| `npm run smoke` | API + LAN integration tests |
| `npm run preview` | Vite preview of built UI |

---

## Configuration
- **Port**: 8001 (hardcoded in 5+ locations — see TODO #3)
- **DB Path**: `app.getPath('userData')/POS/server/databases/pos.sqlite`
- **Uploads**: `app.getPath('userData')/POS/uploads/`
- **JWT Secret**: Derived from userData path (Electron) / fixed (standalone)

---

## Security
- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: false`
- Preload exposes only: `getPaths`, `getLocalConfig`, `setLocalConfig`, `getLanIp`, `getApiInfo`, `quit`, `reload`
- All `/api/*` routes require `Authorization: Bearer <jwt>` (except `/login`, `/health`)
- Permissions: `perm_products`, `perm_categories`, `perm_transactions`, `perm_users`, `perm_settings`
- Admin user (id=1) bypasses all permission checks

---

## Default Credentials
| Username | Password |
|----------|----------|
| `admin`  | `admin`  |

---

## Build Targets
| Platform | Target | Output |
|----------|--------|--------|
| Windows | NSIS (x64) | `release/Store POS Setup 2.0.0.exe` |
| Linux | deb (x64) | `release/store-pos_2.0.0_amd64.deb` |

**Linux build deps:** `dpkg`, `fakeroot`

---

## CI/CD
- **Release workflow**: `.github/workflows/release.yml` — triggers on `git push` tag `v*`
- Builds Windows + Linux in parallel, creates GitHub Release with both artifacts
- **No PR workflow yet** — see TODO #1

---

## Known Gaps (see TODO.md)
1. No lint/typecheck CI
2. Silent `catch {}` blocks throughout
3. Hardcoded port 8001 in multiple files
4. Inline components in `PosPage.tsx`
5. No request validation (Zod)
6. No structured logging (pino)
7. No `.env` support
8. sql.js → Drizzle ORM migration planned
9. No Docker support
10. No automated DB backup

---

## Agent Quick-Start
```bash
# Full dev (Electron)
npm run dev

# Web-only (UI + API)
npm run dev:web

# Build installers
npm run dist        # Windows
npm run dist:linux  # Linux (on Linux runner)
```