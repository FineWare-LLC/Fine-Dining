# Story Claim

- story id: story-0322
- title: Unavailable item handling: contract coverage
- owner: fine-dining-monitor
- model: GPT-5
- reasoning effort: medium
- claimedAt: 2026-06-12T16:02:02Z
- branch: codex/story-0322-unavailable-item-handling-contract-coverage
- intended test plan: add a focused contract test for valid and invalid unavailable-item payloads, then run `npm --prefix frontend run test:unit` and `npm --prefix frontend run typecheck`
- files expected to change: `frontend/src/tests/unit/grocery-shopping.unavailable-item-handling.contract-coverage.test.ts`, `frontend/src/utils/substitutionSuggestions.ts`

## Outcome

- outcome: done
- completedAt: 2026-06-12T16:07:51Z
- verification:
  - `./node_modules/.bin/tsx --test src/tests/unit/grocery-shopping.unavailable-item-handling.contract-coverage.test.ts`
  - `./node_modules/.bin/tsx --test src/tests/unit/grocery-shopping.substitution-suggestions.contract-coverage.test.ts src/tests/unit/grocery-shopping.substitution-suggestions.failure-path.test.ts src/tests/unit/grocery-shopping.substitution-suggestions.operator-feedback.test.ts src/tests/unit/grocery-shopping.substitution-suggestions.persistence-consistency.test.ts src/tests/unit/grocery-shopping.substitution-suggestions.scale-boundary.test.ts src/tests/unit/grocery-shopping.unavailable-item-handling.contract-coverage.test.ts`
  - `npm --prefix frontend run typecheck`
  - `npm --prefix frontend run test:unit` (unrelated leftover-planning import failure in `frontend/src/tests/unit/grocery-shopping.leftover-planning.operator-feedback.test.ts`)
- changed files:
  - `frontend/src/tests/unit/grocery-shopping.unavailable-item-handling.contract-coverage.test.ts`
  - `frontend/src/utils/substitutionSuggestions.ts`
  - `plans/story-board.jsonl`
  - `plans/story-board.md`
- follow-up stories added: none
