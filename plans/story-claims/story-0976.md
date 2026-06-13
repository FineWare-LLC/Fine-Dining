# story-0976
title: Leftover reuse: contract coverage
owner: fine-dining-monitor
claimedAt: 2026-06-13T17:17:21Z
branch: codex/story-0976-asvab-seed-contract
model: GPT-5
reasoningEffort: medium
intendedTestPlan:
- `npm --prefix frontend exec -- tsx --test src/tests/unit/asvabSeedFromJson.test.mjs`
- `npm --prefix frontend run test:unit`
- `npm --prefix frontend run typecheck`
filesExpectedToChange:
- `frontend/scripts/seed-asvab.mjs`
- `frontend/src/tests/unit/asvabSeedFromJson.test.mjs`
- `plans/story-board.jsonl`
outcome: done
verification:
- `npm --prefix frontend exec -- tsx --test src/tests/unit/asvabSeedFromJson.test.mjs`
- `npm --prefix frontend run typecheck`
- `npm exec -- eslint src/tests/unit/asvabSeedFromJson.test.mjs scripts/seed-asvab.mjs`
- `npm test` failed on pre-existing `household-planning.preference-conflicts.failure-path.test.ts`
- `npm run lint` failed on pre-existing cookbook-library duplicate-import lint errors
changedFiles:
- `frontend/scripts/seed-asvab.mjs`
- `frontend/src/tests/unit/asvabSeedFromJson.test.mjs`
- `plans/story-board.jsonl`
- `plans/story-board.md`
followUpStories: none
