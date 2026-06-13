# Story Claim

- storyId: story-0420
- title: Crawler control panel: contract coverage
- owner: fine-dining-monitor
- claimedAt: 2026-06-13T23:14:33Z
- branch: codex/story-0420-crawler-control-panel-contract-coverage
- intendedTestPlan:
  - Add a focused crawler-control-panel contract test that covers the valid request payload, invalid payload rejection, and live panel wiring to typed response parsing.
  - Run the focused crawler-control-panel test first.
  - Run `npm --prefix frontend run typecheck`.
  - Run `npm --prefix frontend run test:unit`.
- filesExpectedToChange:
  - frontend/src/components/legacy/Dashboard/CrawlerControlPanel.tsx
  - frontend/src/tests/unit/admin-operations.crawler-control-panel.contract-coverage.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md

## Completion

- outcome: done
- completedAt: 2026-06-13T23:17:12Z
- verification:
  - `NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/admin-operations.crawler-control-panel.contract-coverage.test.ts`
  - `npm --prefix frontend run typecheck`
  - `npm --prefix frontend run test:unit` failed on pre-existing `household-planning.preference-conflicts.failure-path.test.ts`
  - `npx playwright test src/tests/e2e/admin-crawler.persistence.spec.ts --reporter=list --output=/tmp/playwright-output-codex`
- changedFiles:
  - frontend/src/components/legacy/Dashboard/CrawlerControlPanel.tsx
  - frontend/src/tests/unit/admin-operations.crawler-control-panel.contract-coverage.test.ts
  - plans/story-board.jsonl
  - plans/story-board.md
- followUpStoriesAdded: none
