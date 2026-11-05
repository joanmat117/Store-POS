# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Breaking**: `GET /api/media/:id` ahora sirve el archivo físico en lugar de retornar metadatos JSON
  - Antes: retornaba `{ id, filename, path, source, pexels_id, photographer, alt, created_at }`
  - Ahora: sirve el archivo binario directamente (`res.sendFile`)
  - Impacto: El frontend no usa este endpoint directamente (usa `GET /api/media` para lista, `POST /api/media` para upload, `DELETE /api/media/:id` para borrar)
  - Si se necesitan metadatos de un archivo específico, usar `GET /api/media` y filtrar por ID, o crear endpoint dedicado `GET /api/media/:id/info` en futuro

### Fixed
- **CatalogView**: Agregado manejo de errores en `saveCategory` para mostrar mensajes específicos del backend (ej. "Category name already exists") en lugar de fallar silenciosamente

## [2.0.0] - 2026-11-04

### Added
- E2E test suite completa (auth, inventory, categories, customers, transactions, users, settings, media, health)
- Validación de duplicados en categorías (400 "Category name already exists")
- Validación de stock insuficiente en transacciones (400 "Insufficient stock for X")
- Retorno de entidad actualizada en `PUT /api/inventory/product` y `PUT /api/new` (transactions)
- Autenticación y permisos obligatorios en rutas: inventory, transactions, categories, users, settings, media, demo

### Changed
- `GET /api/media/:id` sirve archivo físico (ver breaking change arriba)
- `POST /api/categories` retorna 400 si nombre duplicado
- `POST /api/new` (transactions) retorna 400 si stock insuficiente
- `PUT /api/inventory/product` retorna producto actualizado (antes 204)
- `PUT /api/new` (transactions) retorna transacción actualizada (antes 204)
- Rutas protegidas ahora requieren autenticación y permisos correspondientes

### Security
- Todas las rutas `/api/*` (excepto `/auth/login`, `/auth/check`, `/health`) requieren JWT Bearer token
- Permisos granulares: `perm_products`, `perm_categories`, `perm_transactions`, `perm_users`, `perm_settings`
- Usuario admin (id=1) bypass de permisos