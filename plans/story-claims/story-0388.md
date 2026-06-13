story-id: story-0388
title: Per-member servings: scale boundary
owner: fine-dining-monitor
claimedAt: 2026-06-13T17:22:26Z
branch: codex/story-0388-per-member-servings-scale-boundary
intended-test-plan: npm --prefix frontend exec tsx --test src/tests/unit/household-planning.per-member-servings.scale-boundary.test.ts && npm --prefix frontend run test:unit && npm --prefix frontend run typecheck
expected-files:
- frontend/src/models/Household/householdSchema.ts
- frontend/src/tests/unit/household-planning.per-member-servings.scale-boundary.test.ts
- plans/story-board.jsonl
- plans/story-board.md
outcome: done
verification:
- npm exec -- tsx --test src/tests/unit/household-planning.per-member-servings.scale-boundary.test.ts
- npm exec -- tsx --test src/tests/unit/household-planning.per-member-servings.contract-coverage.test.ts src/tests/unit/household-planning.per-member-servings.failure-path.test.ts src/tests/unit/household-planning.per-member-servings.persistence-consistency.test.ts src/tests/unit/household-planning.per-member-servings.operator-feedback.test.ts src/tests/unit/household-planning.per-member-servings.scale-boundary.test.ts
- npm exec -- tsx --test src/tests/unit/household-planning.shared-plan-editing.contract-coverage.test.ts src/tests/unit/household-planning.shared-plan-editing.failure-path.test.ts src/tests/unit/household-planning.shared-plan-editing.persistence-consistency.test.ts src/tests/unit/household-planning.shared-plan-editing.operator-feedback.test.ts src/tests/unit/household-planning.shared-plan-editing.scale-boundary.test.ts
- npm run typecheck
- npm run test:unit (failed on pre-existing household-planning.preference-conflicts.failure-path.test.ts)
changed-files:
- frontend/src/graphql/resolvers/mutations/householdMutations.ts
- frontend/src/tests/unit/household-planning.per-member-servings.scale-boundary.test.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up-stories-added: none
