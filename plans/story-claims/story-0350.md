story id: story-0350
title: Collection import: persistence consistency
owner: fine-dining-monitor
claimedAt: 2026-06-13T06:00:39Z
branch: codex/story-0350-collection-import-persistence-consistency
model: GPT-5
reasoning effort: high
intended test plan: add a focused persistence-consistency regression test for cookbook import, then run `npm --prefix frontend run test:unit` and `npm --prefix frontend run typecheck`
files expected to change: frontend/src/pages/recipes.tsx, frontend/src/tests/unit/cookbook-library.collection-import.persistence-consistency.test.ts, plans/story-board.jsonl
outcome: done
completedAt: 2026-06-13T06:03:30Z
verification commands:
- npm --prefix frontend exec -- tsx --test /Users/tt/IdeaProjects/Fine-Dining/frontend/src/tests/unit/cookbook-library.collection-import.persistence-consistency.test.ts
- npm --prefix frontend run test:unit
- npm --prefix frontend run typecheck
changed files:
- frontend/src/pages/recipes.tsx
- frontend/src/utils/cookbookImport.ts
- frontend/src/tests/unit/cookbook-library.collection-import.persistence-consistency.test.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up stories added: none
