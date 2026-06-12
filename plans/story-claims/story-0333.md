story id: story-0333
title: Tag management: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-12T21:29:15Z
completedAt: 2026-06-12T21:35:54Z
branch: codex/story-0333-tag-management-contract-coverage
model: GPT-5
reasoningEffort: medium
intended test plan: npm --prefix frontend run test:unit -- cookbook-library.tag-management.contract-coverage.test.ts; npm --prefix frontend run typecheck
files expected to change:
- frontend/src/graphql/resolvers/mutations/recipeMutations.ts
- frontend/src/models/Recipe/index.ts
- frontend/src/tests/unit/cookbook-library.tag-management.contract-coverage.test.ts
- plans/story-board.jsonl
outcome: done
verification:
- NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npx tsx --test src/tests/unit/cookbook-library.tag-management.contract-coverage.test.ts
- npm --prefix frontend run test:unit
- npm --prefix frontend run typecheck
- PYTHONPYCACHEPREFIX=/tmp/codex-pycache python3 -m compileall backend
changed files:
- frontend/src/models/Recipe/index.ts
- frontend/src/graphql/resolvers/mutations/recipeMutations.ts
- frontend/src/tests/unit/cookbook-library.tag-management.contract-coverage.test.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up stories: none
