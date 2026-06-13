story id: story-0671
title: CSV/JSON parity: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-12T15:02:42Z
branch: codex/story-0671-csv-json-parity-contract-20260612
model: GPT-5
reasoning effort: medium
planned test command: npm --prefix highs-pipeline test
files expected to change:
- highs-pipeline/src/processedMealsLoader.mjs
- highs-pipeline/seed_database.mjs
- frontend/src/tests/unit/highs-pipeline.csv-json-parity.contract-coverage.test.ts
- plans/story-board.jsonl
- plans/story-board.md

## Completion

- outcome: done
- verification:
  - `npx tsx --test src/tests/unit/highs-pipeline.csv-json-parity.contract-coverage.test.ts`
  - `npm --prefix frontend run test:unit`
  - `npm --prefix frontend run typecheck`
  - `node --input-type=module` direct loader smoke against CSV and JSON fixtures
  - `node highs-pipeline/test_meal_catalog.js` blocked by missing `mongoose` export in the highs-pipeline package tree
- changedFiles:
  - `frontend/src/tests/unit/highs-pipeline.csv-json-parity.contract-coverage.test.ts`
  - `highs-pipeline/src/processedMealsLoader.mjs`
  - `highs-pipeline/seed_database.mjs`
  - `plans/story-board.jsonl`
  - `plans/story-board.md`
- followUps: none
