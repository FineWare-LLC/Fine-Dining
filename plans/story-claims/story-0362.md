story_id: story-0362
title: Personal notes: scale boundary
owner: fine-dining-monitor
claimedAt: 2026-06-13T12:28:35Z
branch: codex/story-0362-personal-notes-scale-boundary
model: GPT-5
reasoningEffort: medium
intended_test_plan:
  - Add a large-fixture regression test for the cookbook personal-notes scale path.
  - Run the targeted unit test, then `npm --prefix frontend run test:unit`.
  - Finish with `npm --prefix frontend run typecheck`.
files_expected_to_change:
  - frontend/src/tests/unit/cookbook-library.personal-notes.scale-boundary.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
outcome: done
verification:
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/cookbook-library.personal-notes.scale-boundary.test.ts
  - npm --prefix frontend run test:unit
  - npm --prefix frontend run typecheck
changed_files:
  - frontend/src/tests/unit/cookbook-library.personal-notes.scale-boundary.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
follow_up_stories_added: []
