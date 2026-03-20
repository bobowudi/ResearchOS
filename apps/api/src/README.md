# API Structure

Target structure for the API app:

- `app/api/**/route.ts`: HTTP entry only
- `src/modules`: domain modules and use cases
- `src/shared`: shared server concerns
- `src/infrastructure`: repositories and adapters

Current MVP route handlers are still being migrated into this structure.
