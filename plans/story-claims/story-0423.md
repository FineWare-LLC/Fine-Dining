story id: story-0423
title: Crawler control panel: operator feedback
owner: fine-dining-monitor
claimedAt: 2026-06-13T22:49:11Z
branch: codex/story-0423-crawler-control-panel-operator-feedback
intended test plan: add an admin crawler operator-feedback unit test around the queue feedback helper, then run the focused unit test and frontend typecheck
files expected to change: frontend/src/utils/crawlerQueueFeedback.ts, frontend/src/tests/unit/admin-operations.crawler-control-panel.operator-feedback.test.ts, plans/story-board.jsonl
outcome: done
completedAt: 2026-06-13T22:52:27Z
verification:
- NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/admin-operations.crawler-control-panel.operator-feedback.test.ts
- npm run typecheck
- npx playwright test src/tests/e2e/admin-crawler.persistence.spec.ts --reporter=list --output=/tmp/playwright-output-codex
- npm run test:unit failed on the pre-existing household-planning.preference-conflicts.failure-path.test.ts
- npm run test:playwright failed because root-owned report dirs blocked the default reporter script
changed files:
- frontend/src/utils/crawlerQueueFeedback.ts
- frontend/src/tests/unit/admin-operations.crawler-control-panel.operator-feedback.test.ts
- plans/story-board.jsonl
- plans/story-board.md
follow-up stories added: none
