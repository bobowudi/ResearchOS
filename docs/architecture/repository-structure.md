# Repository Architecture

ResearchOS uses a product-oriented monorepo structure so the web app, API, domain model, mock data, and specifications can evolve independently without blurring module boundaries.

## Top-level layout

```text
apps/
  web/        Vue SPA
  api/        Next.js BFF / API layer
packages/
  domain/     shared domain types and contracts
  mock-data/  mock fixtures and mock repositories
  config/     shared toolchain config (reserved)
specs/
  features/   feature-level OpenSpec documents
  platform/   cross-cutting platform specs
docs/
  architecture/
  product/
  adr/
```

## Boundary rules

- `apps/web` contains UI composition only. Feature code belongs in `src/features`, app shell in `src/app`, and cross-feature utilities in `src/shared`.
- `apps/api/app/api/**/route.ts` is the HTTP entry layer only. Business logic must move into `apps/api/src/modules`.
- `packages/domain` contains stable types/contracts only.
- `packages/mock-data` contains fixtures and mock repository implementations only.
- New product work starts with a spec under `specs/features/*` or `specs/platform/*` before implementation.

## Migration status

This repository is currently migrating from the initial MVP layout:

- Existing runtime imports still point at `@research-os/shared`
- `packages/domain` and `packages/mock-data` are introduced as the target structure
- Web/API source skeletons are created first so later refactors can move code without redefining boundaries again

## Delivery workflow

1. Create or update the relevant spec.
2. Implement inside the correct app/package boundary.
3. Verify with workspace tests and build.
4. Keep source directories free of generated artifacts.
