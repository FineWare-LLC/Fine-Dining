story_id: story-0361
title: Personal notes: operator feedback
owner: fine-dining-monitor
claimedAt: 2026-06-13T11:59:21Z
branch: codex/story-0361-personal-notes-feedback
intended_test_plan:
  - Add a focused unit test for the cookbook personal-notes editor feedback path.
  - Run the targeted unit test, then `npm --prefix frontend run test:unit`.
  - Finish with `npm --prefix frontend run typecheck`.
files_expected_to_change:
  - frontend/src/pages/cookbook.tsx
  - frontend/src/tests/unit/cookbook-library.personal-notes.operator-feedback.test.ts
outcome: done
verification:
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/cookbook-library.personal-notes.operator-feedback.test.ts
  - NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs ./node_modules/.bin/tsx --test src/tests/unit/cookbook-library.personal-notes.contract-coverage.test.ts src/tests/unit/cookbook-library.personal-notes.failure-path.test.ts src/tests/unit/cookbook-library.personal-notes.persistence-consistency.test.ts src/tests/unit/cookbook-library.personal-notes.operator-feedback.test.ts
  - npm --prefix frontend run test:unit
  - npm --prefix frontend run typecheck
changed_files:
  - frontend/src/pages/cookbook.tsx
  - frontend/src/tests/unit/cookbook-library.personal-notes.operator-feedback.test.ts
follow_up_stories_added: []
