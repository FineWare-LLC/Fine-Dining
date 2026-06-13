story id: story-0400
title: Shopping ownership: failure path
owner: fine-dining-monitor
claimedAt: 2026-06-13T19:35:53Z
branch: codex/story-0400-shopping-ownership-failure-path
model: GPT-5
reasoningEffort: medium
intendedTestPlan:
- Add a focused failure-path regression test for shopping ownership rollback and error shape.
- Run the targeted shopping ownership failure-path test first.
- Run `npm --prefix frontend run typecheck`.
- Run `npm --prefix frontend run test:unit`.
filesExpectedToChange:
- frontend/src/tests/unit/household-planning.shopping-ownership.failure-path.test.ts
- plans/story-board.jsonl
- plans/story-board.md
outcome: done
verification:
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs node --test src/tests/unit/household-planning.shopping-ownership.failure-path.test.ts` (confirmed the gap before adding the file)
- `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/household-planning.shopping-ownership.failure-path.test.ts`
- `npm --prefix frontend run test:unit`
- `npm --prefix frontend run typecheck`
changedFiles:
- frontend/src/tests/unit/household-planning.shopping-ownership.failure-path.test.ts
- plans/story-board.jsonl
- plans/story-board.md
followUpStoriesAdded: none
