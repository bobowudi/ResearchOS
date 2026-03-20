# OpenSpec Template

Each feature or platform area should keep the following files:

- `overview.md`: scope, goals, non-goals, glossary
- `requirements.md`: functional and non-functional requirements
- `flows.md`: user flow, system flow, edge cases
- `api.md`: request/response contracts and error model
- `data-model.md`: entities, invariants, state transitions
- `rollout.md`: implementation phases, risks, verification
- `changelog.md`: dated spec updates

## Authoring rules

1. Write `overview.md`, `requirements.md`, and `flows.md` before coding.
2. Add `api.md` and `data-model.md` before changing contracts.
3. Update `changelog.md` whenever requirements or scope changes.
4. Reference the relevant spec path in implementation work and reviews.
