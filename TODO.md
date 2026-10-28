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
- [x] Create `src/shared/` — UI primitives, hooks, utils, types, constants used across features
- [x] Create `src/features/` — feature folders (pos, catalog, customers, team, settings, auth), each with its own components, hooks, api, types
- [x] Create `src/routes/` — route definitions and lazy-loaded page components
- [x] Move existing `src/components/` → `src/shared/components/`
- [x] Move `src/context/` → `src/shared/context/`
- [x] Move `src/hooks/` → `src/shared/hooks/` (create if needed)
- [x] Move `src/utils/` → `src/shared/utils/`
- [x] Move `src/api/` → `src/shared/api/`
- [x] Move `src/pages/PosPage.tsx` → `src/features/pos/PosPage.tsx`
- [x] Move `src/pages/TillView.tsx` → `src/features/pos/TillView.tsx`
- [x] Move `src/pages/CatalogView.tsx` → `src/features/catalog/CatalogView.tsx`
- [x] Move `src/pages/SettingsView.tsx` → `src/features/settings/SettingsView.tsx`
- [x] Move `src/pages/CustomersView.tsx` → `src/features/customers/CustomersView.tsx`
- [x] Move `src/pages/TeamView.tsx` → `src/features/team/TeamView.tsx`
- [x] Move `src/pages/LoginPage.tsx` → `src/features/auth/LoginPage.tsx`
- [x] Create `src/routes/appRoutes.tsx` with lazy imports for each feature
- [x] Update `src/App.tsx` to use new route config
- [x] Update all imports across the codebase
**Why:** Screaming architecture makes features self-contained, enables code-splitting, and scales cleanly.

### 6. Reorganize Backend Folder Structure (MVC)
- [x] **Phase 1: Scaffold new folder structure**
  - [x] Create `server/controllers/` — route handlers (inventoryController, transactionsController, usersController, categoriesController, customersController, settingsController, mediaController, demoController)
  - [x] Create `server/services/` — business logic (inventoryService, transactionService, userService, categoryService, customerService, settingsService, mediaService, authService)
  - [x] Create `server/models/` — data access layer (repositories: userRepo, productRepo, categoryRepo, customerRepo, transactionRepo, settingsRepo, mediaRepo)
  - [x] Create `server/middleware/` — auth, validation, error handling, request logging
  - [x] Create `server/config/` — constants, env validation, db connection
  - [x] Create `server/routes/` — thin route definitions that delegate to controllers
- [x] **Phase 2: Extract data access to models (repositories)**
  - [x] Create `server/models/userRepo.js` — user CRUD, auth queries
  - [x] Create `server/models/productRepo.js` — product CRUD, search, inventory ops
  - [x] Create `server/models/categoryRepo.js` — category CRUD
  - [x] Create `server/models/customerRepo.js` — customer CRUD
  - [x] Create `server/models/transactionRepo.js` — transaction CRUD, reports, inventory decrement
  - [x] Create `server/models/settingsRepo.js` — settings CRUD
  - [x] Create `server/models/mediaRepo.js` — media library CRUD
  - [x] Move all SQL from `db.js` (mappers, schema, seed) → models + new `server/config/db.js` for DB init
- [x] **Phase 3: Extract business logic to services**
  - [x] Create `server/services/authService.js` — login, token, password hash, permissions
  - [x] Create `server/services/inventoryService.js` — product ops, bulk delete, image handling
  - [x] Create `server/services/transactionService.js` — create/update transactions, stock decrement, reports
  - [x] Create `server/services/categoryService.js` — category ops
  - [x] Create `server/services/customerService.js` — customer ops
  - [x] Create `server/services/settingsService.js` — settings ops
  - [x] Create `server/services/mediaService.js` — upload, Pexels, library management
  - [x] Create `server/services/demoService.js` — demo data seeding
- [x] **Phase 4: Create thin controllers**
  - [x] Create `server/controllers/authController.js` — login endpoint
  - [x] Create `server/controllers/inventoryController.js` — product endpoints
  - [x] Create `server/controllers/transactionsController.js` — transaction endpoints
  - [x] Create `server/controllers/categoriesController.js` — category endpoints
  - [x] Create `server/controllers/customersController.js` — customer endpoints
  - [x] Create `server/controllers/settingsController.js` — settings endpoints
  - [x] Create `server/controllers/mediaController.js` — media endpoints
  - [x] Create `server/controllers/demoController.js` — demo endpoints
  - [x] Create `server/controllers/usersController.js` — user management endpoints
- [x] **Phase 5: Rewrite routes as thin delegators**
  - [x] Replace each `server/routes/*.js` with `import controller from '../controllers/...'` + `router.get('/path', controller.handler)`
- [x] **Phase 6: Centralize middleware & config**
  - [x] Move `authenticate`, `requirePerm`, `requireAnyPerm` from `auth.js` → `server/middleware/auth.js`
  - [x] Move error handler from `index.js` → `server/middleware/errorHandler.js`
  - [x] Add `server/middleware/requestLogger.js` (pino)
  - [x] Add `server/middleware/validation.js` (Zod, prep for step 8)
  - [x] Move `setJwtSecret`, `signToken`, `verifyToken` → `server/config/auth.js`
  - [x] Move constants (port, paths) → `server/config/constants.js`
  - [x] Move DB init/persist logic → `server/config/db.js`
- [x] **Phase 7: Wire everything in `server/index.js`**
  - [x] Import controllers, mount routes
  - [x] Apply middleware stack
  - [x] Initialize DB via config
- [x] **Phase 8: Update imports & verify**
  - [x] Fix all imports across server codebase
  - [x] Run dev server, test all endpoints
  - [x] Run smoke tests (`npm run smoke`)
  - [x] Update frontend API client (`src/shared/api/client.ts`) to new endpoints
  - [x] Remove legacy route files (`server/routes/*.js`, `server/auth.js`, `server/db.js`)
**Why:** Separation of concerns, testability, and clear ownership per layer. Prepares for TypeScript migration (step 7) and Drizzle ORM (step 8).

### 7. Migrate Server to TypeScript
- [x] Add `tsconfig.backend.json` (ESM, target ES2022, strict, outDir `server/dist`)
- [x] Rename `server/**/*.js` → `server/**/*.ts`; fix imports, add types
- [x] **Dev**: spawn `node --loader ts-node/esm server/index.ts` from Electron main (via dev.mjs wrapper)
- [x] **Prod**: add `prePackage` hook (electron-builder) running `tsc -p tsconfig.backend.json`; Electron spawns `server/dist/index.js`
- [x] Use `app.isPackaged` to switch between dev/prod entry point
- [x] Add `build:backend` and `dev:backend` npm scripts
- [x] Update smoke tests to use ts-node/esm
- [x] Create dev entry point (`server/dev.mjs` + `server/dev-server.ts`) for hot reload
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
