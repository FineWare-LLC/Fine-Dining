# story-0320 claim

- story-id: story-0320
- title: Export formats: operator feedback
- owner: fine-dining-monitor
- claimedAt: 2026-06-12T14:57:35Z
- branch: codex/story-0320-export-formats-operator-feedback-20260612-r1
- intendedTestPlan: `cd frontend && npx tsx --test src/tests/unit/grocery-shopping.export-formats.operator-feedback.test.ts && npm --prefix frontend run test:unit && npm --prefix frontend run typecheck`
- expectedFiles:
  - frontend/src/utils/shoppingListFeedback.ts
  - frontend/src/components/legacy/PlannerCanvas/ResultsPanelModule.tsx
  - frontend/src/tests/unit/grocery-shopping.export-formats.operator-feedback.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md

## Outcome

Done. The export dialog now exposes loading, empty, success, and error feedback states with stable layout spacing and accessible surface semantics.

## Verification

- `cd frontend && npx tsx --test src/tests/unit/grocery-shopping.export-formats.operator-feedback.test.ts`
- `cd frontend && npx tsx --test src/tests/unit/grocery-shopping.shopping-list-aggregation.failure-path.test.ts src/tests/unit/grocery-shopping.export-formats.failure-path.test.ts src/tests/unit/grocery-shopping.export-formats.persistence-consistency.test.ts`
- `npm --prefix frontend run test:unit`
- `npm --prefix frontend run typecheck`

## Changed Files

- `frontend/src/utils/shoppingListFeedback.ts`
- `frontend/src/components/legacy/PlannerCanvas/ResultsPanelModule.tsx`
- `frontend/src/tests/unit/grocery-shopping.export-formats.operator-feedback.test.ts`
- `frontend/src/tests/unit/grocery-shopping.shopping-list-aggregation.failure-path.test.ts`
- `plans/story-board.jsonl`
- `plans/story-board.md`

## Follow-ups

- None added.

## Completion

- completedAt: 2026-06-12T15:04:43Z
