story id: story-0347
title: Swipe decisions: scale boundary
owner: fine-dining-monitor
claimedAt: 2026-06-13T04:28:35Z
branch: codex/story-0347-swipe-decisions-scale-boundary
intended test plan: npm --prefix frontend run test:unit; npm --prefix frontend run typecheck
files expected to change: frontend/src/tests/unit/cookbook-library.swipe-decisions.scale-boundary.test.ts; frontend/src/utils/recipeSwiperState.ts
model: GPT-5
reasoning effort: high
outcome: done
completedAt: 2026-06-13T04:31:29Z
verification: pass: targeted scale-boundary test; npm --prefix frontend run test:unit; npm --prefix frontend run typecheck
changed files: frontend/src/tests/unit/cookbook-library.swipe-decisions.scale-boundary.test.ts; frontend/src/utils/recipeSwiperState.ts; plans/story-board.jsonl; plans/story-board.md; plans/story-claims/story-0347.md
follow-up stories added: none
notes: duplicate swipe applies now no-op after the first optimistic update and rollback stays idempotent
