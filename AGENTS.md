# 🤖 Agent Operational Guidelines — কবর পথের সামগ্রী (Kabar Pather)

This document establishes operational directives for AI agents working in this repository.

## Operational Mandates

### 1. Maintain Documentation Always
Whenever any code, styling, schema, or configuration is added or modified:
- Update corresponding documentation files in `docs/`:
  - `docs/README.md`: Architecture overview and API reference.
  - `docs/MEMORY.md`: Record new Architectural Decision Records (ADRs) and gotchas.
  - `docs/TASKS.md`: Update milestone checkboxes and upcoming tasks.
  - `docs/RULES.md`: Maintain engineering rules and conventions.
  - `docs/ARCHITECTURE.md` / `docs/PRD.md` / `docs/DESIGN.md`: Update when system design or requirements evolve.
  - `README.md`: Keep root documentation accurate and updated.
- Maintain edge-neutral terminology without proprietary vendor mentions (use: "Edge Pages", "Edge D1 Database", "Edge R2 Storage", "Edge Pages Functions").

### 2. Verify with Pre-Commit Tests
Before committing changes, run:
```bash
npm test
```
Confirm 100% of tests pass and syntax validation exits cleanly.

### 3. Always Commit and Push to GitHub
- Keep working trees clean.
- Formulate descriptive semantic commit messages adhering to Conventional Commits.
- Push changes to GitHub:
```bash
git push origin <branch>
```
