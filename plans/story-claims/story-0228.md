# story-0228
- claimedAt: 2026-06-12T05:44:27Z
- owner: fine-dining-monitor
- branch: codex/story-0228-instruction-structure-operator-feedback-20260612
- model: GPT-5
- reasoning: high
- plannedTest: npm --prefix frontend run test:unit -- frontend/src/tests/unit/recipe-ingestion.instruction-structure.operator-feedback.test.ts && python3 -m compileall backend && python3 backend/test_restaurant_crawler.py && npm --prefix frontend run recipes:validate
- expectedFiles: frontend/src/utils/crawlerQueueFeedback.ts, frontend/src/tests/unit/recipe-ingestion.instruction-structure.operator-feedback.test.ts, backend/recipe_crawler.py, backend/crawler_api.py, plans/story-board.jsonl
