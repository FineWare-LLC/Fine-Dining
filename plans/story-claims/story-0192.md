story: story-0192
timestamp: 2026-06-12T04:08:00Z
owner: fine-dining-monitor
model: gpt-5
reasoning_effort: medium
planned_test_command: python3 -m compileall backend && python3 backend/test_recipe_crawler.py && npm --prefix frontend run recipes:validate
expected_files:
  - backend/recipe_crawler.py
  - backend/test_recipe_crawler.py
  - plans/story-board.jsonl
