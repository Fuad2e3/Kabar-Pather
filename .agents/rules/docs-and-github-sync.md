# Continuous Documentation & GitHub Synchronization Rule

Whenever making modifications, implementing features, fixing bugs, or updating configurations in this repository, you MUST adhere to the following protocol:

## 1. Mandatory Documentation Maintenance
- **Synchronize Docs on Change**: Always update the relevant documentation in the `docs/` directory (`docs/README.md`, `docs/MEMORY.md`, `docs/TASKS.md`, `docs/RULES.md`, `docs/ARCHITECTURE.md`, `docs/PRD.md`, `docs/DESIGN.md`, `docs/EDGE_DEPLOYMENT.md`, and root `README.md`) whenever corresponding code, schemas, or behaviors change.
- **Task & Milestone Tracking**: Mark completed items and add new items in `docs/TASKS.md`.
- **Architectural Memory**: Log new decisions, ADRs, and persistent settings in `docs/MEMORY.md`.
- **Zero Forbidden Vendor Names**: Maintain strict compliance with edge-neutral terminology ("Edge Pages", "Edge D1 Database", "Edge R2 Storage", "Edge Pages Functions").

## 2. Pre-Push Verification
Before committing and pushing, always execute the automated test and syntax verification suite:
```bash
npm test
```
Ensure all tests pass with exit code 0.

## 3. Mandatory GitHub Synchronization
- Once work and verification are complete, stage the modified files.
- Commit using conventional commit format (e.g., `feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
- Push to GitHub immediately:
```bash
git push origin <current-branch>
```
