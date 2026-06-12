story id: story-0337
title: Tag management: scale boundary
owner: fine-dining-monitor
claimedAt: 2026-06-12T23:08:59Z
branch: codex/story-0337-tag-management-scale-boundary
intended test plan:
- First: `npm --prefix frontend exec -- tsx --test src/tests/unit/cookbook-library.tag-management.scale-boundary.test.ts`
- Verify: `npm --prefix frontend run test:unit`
- Verify: `npm --prefix frontend run typecheck`
files expected to change:
- `frontend/src/tests/unit/cookbook-library.tag-management.scale-boundary.test.ts`
- `frontend/src/models/Recipe/recipe.schema.ts` if the scale-boundary test exposes a real bug
- `plans/story-board.jsonl`
- `plans/story-board.md`

outcome: done
verification:
- `npm exec -- tsx --test src/tests/unit/cookbook-library.tag-management.scale-boundary.test.ts`
- `npm run test:unit`
- `npm run typecheck`
changed files:
- `frontend/src/tests/unit/cookbook-library.tag-management.scale-boundary.test.ts`
- `frontend/src/models/Recipe/recipe.schema.ts`
- `plans/story-board.jsonl`
- `plans/story-board.md`
follow-up stories added: none
