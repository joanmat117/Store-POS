# Store POS - TODO

## Critical (Do First)

### 1. Add Lint/Typecheck Scripts + PR CI Workflow
- [x] Add `eslint`, `prettier`, `typescript` config files
- [x] Add npm scripts: `lint`, `lint:fix`, `typecheck`, `format`
- [x] Create `.github/workflows/ci.yml` running on PRs:
  - `npm ci`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
**Why:** Guarantees code quality and catches regressions before merge.

### 2. Fix Silent Error Swallowing
- [x] Replace `catch { /* ignore */ }` with proper logging in:
  - `server/routes/inventory.js` (lines 53-55, 107-109, 135-137)
  - `server/routes/transactions.js` (line 161)
  - `server/routes/media.js` (lines 80-82, 182-184)
  - `electron/main.js` (lines 44-45, 189-191, 203-205, 212-215)
  - `src/context/AuthContext.tsx` (lines 63-67, 86-89)
  - `src/pages/PosPage.tsx` (lines 54-56, 62-64)
  - `src/bridge.ts` (lines 12-14)
- [x] Add structured logger (pino/winston) or at minimum `console.error`
**Why:** Hidden failures make debugging impossible; logging surfaces issues early.

## Important

### 3. Centralize Port Configuration
- [x] Create `config/constants.ts` with `API_PORT = 8001`
- [x] Replace hardcoded `8001` in:
  - `electron/main.js` (line 11)
  - `src/bridge.ts` (line 3)
  - `server/standalone.js` (line 4)
  - `src/api/client.ts` (line 109)
  - `scripts/smoke-api.mjs` (implied)
  - `scripts/smoke-lan.mjs` (implied)
**Why:** Single source of truth prevents mismatched ports across processes.

### 4. Extract Inline Components
- [x] Move `CustomersView` / `CustomersPanel` from `PosPage.tsx` → `src/pages/CustomersView.tsx`
- [x] Move `TeamView` / `UsersPanel` from `PosPage.tsx` → `src/pages/TeamView.tsx`
- [x] Update imports in `PosPage.tsx`
**Why:** Improves readability, enables reuse, and simplifies testing.

### 5. Reorganize Frontend Folder Structure (Screaming Architecture)
- [ ] Create `src/shared/` — UI primitives, hooks, utils, types, constants used across features
- [ ] Create `src/features/` — feature folders (pos, catalog, customers, team, settings, auth), each with its own components, hooks, api, types
- [ ] Create `src/routes/` — route definitions and lazy-loaded page components
- [ ] Move existing `src/components/` → `src/shared/components/`
- [ ] Move `src/context/` → `src/shared/context/`
- [ ] Move `src/hooks/` → `src/shared/hooks/` (create if needed)
- [ ] Move `src/utils/` → `src/shared/utils/`
- [ ] Move `src/api/` → `src/shared/api/`
- [ ] Move `src/pages/PosPage.tsx` → `src/features/pos/PosPage.tsx`
- [ ] Move `src/pages/TillView.tsx` → `src/features/pos/TillView.tsx`
- [ ] Move `src/pages/CatalogView.tsx` → `src/features/catalog/CatalogView.tsx`
- [ ] Move `src/pages/SettingsView.tsx` → `src/features/settings/SettingsView.tsx`
- [ ] Move `src/pages/CustomersView.tsx` → `src/features/customers/CustomersView.tsx`
- [ ] Move `src/pages/TeamView.tsx` → `src/features/team/TeamView.tsx`
- [ ] Move `src/pages/LoginPage.tsx` → `src/features/auth/LoginPage.tsx`
- [ ] Create `src/routes/appRoutes.tsx` with lazy imports for each feature
- [ ] Update `src/App.tsx` to use new route config
- [ ] Update all imports across the codebase
**Why:** Screaming architecture makes features self-contained, enables code-splitting, and scales cleanly.

### 6. Reorganize Backend Folder Structure (MVC)
- [ ] Create `server/controllers/` — route handlers (inventoryController, transactionsController, usersController, categoriesController, customersController, settingsController, mediaController, demoController)
- [ ] Create `server/services/` — business logic (inventoryService, transactionService, userService, categoryService, customerService, settingsService, mediaService, authService)
- [ ] Create `server/models/` — data access layer (Drizzle repositories: userRepo, productRepo, categoryRepo, customerRepo, transactionRepo, settingsRepo, mediaRepo)
- [ ] Create `server/middleware/` — auth, validation, error handling, request logging
- [ ] Create `server/config/` — constants, env validation, db connection
- [ ] Move route logic from `server/routes/*.js` → `server/controllers/*.js`
- [ ] Extract business logic from controllers → `server/services/*.js`
- [ ] Extract SQL/Drizzle queries from routes/controllers → `server/models/*.js`
- [ ] Update `server/index.js` to wire controllers → routes
- [ ] Update imports across server codebase
**Why:** Separation of concerns, testability, and clear ownership per layer.

### 7. Migrate Server to TypeScript
- [ ] Add `tsconfig.backend.json` (ESM, target ES2022, strict, outDir `server/dist`)
- [ ] Rename `server/**/*.js` → `server/**/*.ts`; fix imports, add types
- [ ] **Dev**: spawn `node --loader ts-node/esm server/index.ts` from Electron main
- [ ] **Prod**: add `prePackage` hook (Electron Forge) or `build:backend` script (electron-builder) running `tsc -p tsconfig.backend.json`; Electron spawns `server/dist/index.js`
- [ ] Use `app.isPackaged` to switch between dev/prod entry point
**Why:** Type safety across backend; zero-runtime-overhead in production.

### 8. Add Request Validation (Zod)
- [ ] Install `zod`
- [ ] Create validation schemas in `server/validation/`:
  - `loginSchema`
  - `productSchema` (create/update)
  - `categorySchema`
  - `customerSchema`
  - `userSchema`
  - `transactionSchema`
  - `settingsSchema`
- [ ] Apply middleware to all POST/PUT routes
**Why:** Guarantees payload shape, reduces runtime errors and security surface.

### 6. Add Structured Logging
- [x] Install `pino` + `pino-pretty`
- [x] Create `server/logger.ts` singleton
- [x] Replace all `console.log/error` with logger
- [x] Add request logging middleware (method, path, status, duration)
**Why:** Structured logs enable monitoring, alerting, and faster incident response.

### 7. Add Environment Config (.env Support)
- [ ] Install `dotenv`
- [ ] Create `.env.example` with:
  - `API_PORT=8001`
  - `JWT_SECRET=`
  - `NODE_ENV=development`
  - `CORS_ORIGIN=http://127.0.0.1:5173`
- [ ] Load in `server/index.ts` and `server/standalone.ts`
- [ ] Update `electron/main.ts` to pass env to server
**Why:** Keeps secrets out of source control and allows per‑environment tuning.

### 8. Introduce Drizzle ORM & Migrate from sql.js
- [ ] Add `drizzle-orm`, `drizzle-kit`, `better-sqlite3` (or `libsql`) dependencies
- [ ] Define schema files under `server/db/schema/` (users, products, categories, customers, settings, media_library, transactions)
- [ ] Create `server/db/index.ts` exporting `db` instance (Drizzle + SQLite driver)
- [ ] Write migration files with `drizzle-kit generate` and apply with `drizzle-kit migrate`
- [ ] Replace all raw SQL in `server/routes/*` and `server/db.js` with Drizzle queries
- [ ] Remove `sql.js` and related WASM handling
**Why:** Type‑safe, maintainable database layer; eliminates manual schema sync and WASM overhead.

### 9. Database Migrations System (Drizzle‑kit)
- [ ] Configure `drizzle.config.ts` pointing to schema and migration folder
- [ ] Add npm scripts `db:generate`, `db:migrate`, `db:push`
- [ ] Run migrations on app startup (via `db:migrate` in `initDatabase`)
**Why:** Versioned, repeatable schema changes; works in CI/CD and Docker.

### 10. Docker Support
- [ ] Create `Dockerfile` (multi-stage: builder → runtime)
- [ ] Create `docker-compose.yml` with:
  - `app` service (build from Dockerfile)
  - Volume for `data/` (SQLite + uploads)
  - Port mapping `8001:8001`
- [ ] Add `.dockerignore`
**Why:** Consistent reproducible builds; simplifies deployment on servers or CI.

### 11. Update Documentation
- [ ] Update `README.md` with new scripts (lint, typecheck, dev:web, db:*)
- [ ] Document `.env` configuration
- [ ] Document Docker usage
- [ ] Document LAN deployment with Docker
**Why:** Keeps onboarding and ops docs in sync with actual workflow.

## Nice to Have

### 12. API Versioning
- [ ] Prefix all routes with `/api/v1/`
- [ ] Update client.ts base URL
**Why:** Allows future breaking changes without breaking existing clients.

### 13. Automated DB Backup
- [ ] Add scheduled backup in Electron main process (daily)
- [ ] Keep last 7 days in `userData/backups/`
**Why:** Protects against data loss without manual intervention.

### 14. Health Check Endpoint Enhancement
- [ ] Add DB connectivity check to `/api/health`
- [ ] Return version, uptime, db status
**Why:** Enables load balancers / orchestrators to detect unhealthy instances.

---

**Legend:** 🔴 Critical | 🟡 Important | 🟢 Nice-to-Have  
*Excluded per request: Tests, TLS/SSL support, JS→TS migration, Storybook, Pre-commit hooks*
