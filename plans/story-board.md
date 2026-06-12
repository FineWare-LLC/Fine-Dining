# Fine Dining Story Board

Generated: 2026-06-11T15:27:59.373Z

This board coordinates recurring Codex runs for Fine Dining. The source of truth is `plans/story-board.jsonl`, with one detailed story per line.

## Recent Completion

- story-0325 completed: create cookbook now returns the canonical populated snapshot that matches a refresh query.
- story-0324 completed: cookbook failure path now surfaces recoverable loading, empty, and error states and keeps add-to-cookbook retries open.
- story-0323 completed: saved recipe state now canonicalizes cookbook entry payloads, rejects malformed saved-recipe inputs, and populates entry recipes in cookbook queries.
- story-0322 completed: unavailable item handling now normalizes hydrated substitution candidates into plain alternatives and rejects malformed payloads with typed user-safe errors.
- story-0321 completed: export formats scale boundary now reads meal notes once per meal and stays deterministic on large reversible fixtures.
- story-0671 completed: CSV/JSON parity contract coverage now uses a shared processed-meals loader for both JSON and CSV snapshots.

## Claim Protocol

1. Read `plans/story-board.jsonl` and `plans/story-claims/`.
2. Pick exactly one story with `"status":"ready"` and no active claim file.
3. Before editing application code, create `plans/story-claims/<story-id>.md` with the run timestamp, model, and planned test command.
4. Update that story line to `"status":"in-progress"`, set `owner`, and set `claimedAt`.
5. Re-read the story line and claim file. If another run has already claimed it, stop and choose another ready story.
6. Work test-first. Add or update the smallest useful failing test, implement the smallest production change, then run the relevant verification.
7. Finish by updating the story line to `done` or `blocked`, clearing `owner` when done, and adding a short verification note.

## Board Files

- `plans/story-board.md`: human-facing board, claim rules, and epic index.
- `plans/story-board.jsonl`: 1000 detailed ready stories.
- `plans/story-claims/`: active claim files used to avoid duplicate work.

## Recent Completions

- story-0325: Saved recipe state persistence consistency is done.
- `story-0322`: Unavailable item handling: contract coverage is done.
- `story-0320`: Export formats: operator feedback is done.

## Selection Rules

- Never take a story marked `in-progress`, `blocked`, or `done`.
- Never take a story with an active claim file unless that claim is clearly stale and the final report explains why.
- Prefer lower story IDs when multiple stories have the same status.
- Keep each run to one story. If more work is discovered, add a new ready story.
- Do not modify unrelated dirty work in the repo.

## Epic Index

| Epic | Story Range | Area |
| --- | --- | --- |
| Authentication and account security | story-0001 to story-0046 (46) | Login, signup, JWT context, protected API routes, and Python sidecar auth |
| Onboarding and dietary profile | story-0047 to story-0092 (46) | Questionnaire, measurement system, allergens, household preferences, and profile persistence |
| Meal planning user experience | story-0093 to story-0138 (46) | Dashboard, planner, active meal plan, catalog selection, and day/week planning interactions |
| Optimization solver correctness | story-0139 to story-0184 (46) | REST optimizer, GraphQL optimizer mutations, HiGHS model building, solver output interpretation |
| Recipe ingestion and provenance | story-0185 to story-0230 (46) | Crawler, recipe seed pack, paraphrasing guidance, source attribution, nutrition completeness |
| Restaurant discovery and local providers | story-0231 to story-0276 (46) | Local restaurant services, provider adapters, geolocation, reviews, and place filtering |
| Grocery shopping and monetization | story-0277 to story-0322 (46) | Ingredient aggregation, shopping list generation, affiliate-safe links, prices, pantry, and substitutions |
| Cookbook and saved recipe library | story-0323 to story-0368 (46) | Cookbooks, saved recipes, tags, recipe cards, search, and collection management |
| Household and collaborative planning | story-0369 to story-0414 (46) | Household model, member preferences, shared meal plans, invites, and conflict resolution |
| Admin operations and moderation | story-0415 to story-0460 (46) | Admin pages, catalog management, crawler controls, user support, moderation, and operational dashboards |
| Billing, subscriptions, and usage limits | story-0461 to story-0505 (45) | Stripe setup, usage counters, plan gates, subscriptions, and feature limits |
| GraphQL API contracts | story-0506 to story-0550 (45) | TypeDefs, resolvers, generated GraphQL client artifacts, error handling, and request validation |
| REST optimizer API | story-0551 to story-0595 (45) | Versioned optimizer endpoint, schema validation, response shape, audit trail, and fail-shut behavior |
| Python sidecars | story-0596 to story-0640 (45) | FastAPI optimizer, crawler API, shared config, CORS, JWT auth, and Python HiGHS binding |
| HiGHS pipeline and catalog data | story-0641 to story-0685 (45) | Fetcher, normalizer, enricher, sampler, solver, writer, seed scripts, and catalog repair |
| Observability, logging, and health | story-0686 to story-0730 (45) | Request IDs, metrics, health endpoints, error boundaries, audit records, and production smoke tests |
| Accessibility and responsive UX | story-0731 to story-0775 (45) | Keyboard navigation, screen-reader semantics, mobile layouts, focus management, and Playwright accessibility tests |
| Performance and caching | story-0776 to story-0820 (45) | Next.js build, Apollo cache, server optimizer cache, large list rendering, provider requests, and Lighthouse |
| Data models and migrations | story-0821 to story-0865 (45) | Mongoose schemas, model methods, indexes, validation, migrations, and data ownership |
| Testing infrastructure and developer workflow | story-0866 to story-0910 (45) | Node tests, Playwright, component tests, Python checks, CI gates, fixture helpers, and agent-friendly scripts |
| Deployment and Docker readiness | story-0911 to story-0955 (45) | Dockerfiles, compose, environment generation, production build, smoke tests, and startup checks |
| Domain quality and meal intelligence | story-0956 to story-1000 (45) | Meal quality scoring, recommendations, ASVAB leftover code cleanup, QA dashboard, and domain validation |

## Suggested Verification Ladder

- Narrow TypeScript logic: `npm --prefix frontend run test:unit`
- Solver behavior: `npm --prefix frontend run test:solver`
- Browser workflow: `npm --prefix frontend run test:playwright`
- Python sidecars: `python3 -m compileall backend`
- Production readiness: `npm run check:all`
