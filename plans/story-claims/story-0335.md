story id: story-0335
title: Tag management: persistence consistency
owner: fine-dining-monitor
claimedAt: 2026-06-12T22:28:41Z
branch: codex/story-0335-tag-management-persistence-consistency
model: GPT-5
reasoningEffort: medium
intended test plan: npm --prefix frontend run test:unit -- cookbook-library.tag-management.persistence-consistency.test.ts; npm --prefix frontend run typecheck
files expected to change:
- frontend/src/models/Recipe/recipe.schema.ts
- frontend/src/models/Recipe/index.ts
- frontend/src/tests/unit/cookbook-library.tag-management.persistence-consistency.test.ts
- plans/story-board.md
- plans/story-board.jsonl
outcome: done
completedAt: 2026-06-12T22:32:44Z
verification:
- NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/cookbook-library.tag-management.persistence-consistency.test.ts
- NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/cookbook-library.tag-management.contract-coverage.test.ts src/tests/unit/cookbook-library.tag-management.failure-path.test.ts src/tests/unit/cookbook-library.tag-management.persistence-consistency.test.ts
- npm --prefix frontend run test:unit
- npm --prefix frontend run typecheck
changed files:
- frontend/src/models/Recipe/recipe.schema.ts
- frontend/src/models/Recipe/index.ts
- frontend/src/tests/unit/cookbook-library.tag-management.persistence-consistency.test.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up stories: none
