# Story Claim

- storyId: story-0365
- title: Private collections: persistence consistency
- owner: fine-dining-monitor
- claimedAt: 2026-06-13T13:24:12Z
- branch: codex/story-0365-private-collections-persistence-consistency
- intendedTestPlan: add a focused persistence-consistency regression test for legacy private cookbooks, then run `npm --prefix frontend run test:unit` and `npm --prefix frontend run typecheck`
- filesExpectedToChange:
  - frontend/src/utils/cookbookFeedback.ts
  - frontend/src/tests/unit/cookbook-library.private-collections.persistence-consistency.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md

## Outcome

- status: done
- completedAt: 2026-06-13T13:26:24Z
- summary: Legacy private cookbook snapshots now resolve as private instead of failing cookbook hydration when `isPublic` is absent.

## Verification

- npx tsx --test src/tests/unit/cookbook-library.private-collections.persistence-consistency.test.ts
- npx tsx --test src/tests/unit/cookbook-library.private-collections.persistence-consistency.test.ts src/tests/unit/cookbook-library.private-collections.contract-coverage.test.ts src/tests/unit/cookbook-library.private-collections.failure-path.test.ts src/tests/unit/cookbook-library.cookbook-sharing.persistence-consistency.test.ts src/tests/unit/cookbook-library.cookbook-sharing.contract-coverage.test.ts src/tests/unit/cookbook-library.saved-recipe-state.persistence-consistency.test.ts
- npm --prefix frontend run test:unit
- npm --prefix frontend run typecheck

## Changed Files

- frontend/src/utils/cookbookFeedback.ts
- frontend/src/tests/unit/cookbook-library.private-collections.persistence-consistency.test.ts
- plans/story-board.jsonl
- plans/story-board.md

## Follow-Up

- none
