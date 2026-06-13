# story-0229
- claimedAt: 2026-06-12T05:48:38Z
- owner: fine-dining-monitor
- branch: codex/story-0229-instruction-structure-scale-boundary-20260612
- model: GPT-5
- reasoning: high
- plannedTest: npm --prefix frontend run test:unit -- frontend/src/tests/unit/recipe-ingestion.instruction-structure.scale-boundary.test.ts && python3 -m compileall backend && python3 backend/test_recipe_crawler.py && npm --prefix frontend run recipes:validate
- expectedFiles: frontend/src/tests/unit/recipe-ingestion.instruction-structure.scale-boundary.test.ts, frontend/scripts/validate-recipe-seed.mjs, plans/story-board.jsonl
