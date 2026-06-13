# Story Claim

- status: in-progress
- story id: story-0180
- timestamp: 2026-06-12T03:27:13.018Z
- owner: fine-dining-monitor
- branch: codex/story-0180-macro-balance-failure-path-20260611
- model: gpt-5
- reasoning effort: medium
- planned test command: npm --prefix frontend run test:unit -- src/tests/unit/optimizer-correctness.macro-balance.failure-path.test.ts
- files expected to change:
  - frontend/src/server/optimizer/modelBuilder.ts
  - frontend/src/server/optimizer/interpreter.ts
  - frontend/src/server/optimizer/index.ts
  - frontend/src/server/optimizer/normalizer.ts
  - frontend/src/tests/unit/optimizer-correctness.macro-balance.failure-path.test.ts
