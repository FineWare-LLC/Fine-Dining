# Fine Dining Story Board

Generated: 2026-06-13T13:45:56Z

This board coordinates recurring Codex runs for Fine Dining. The source of truth is `plans/story-board.jsonl`, with one detailed story per line.

## Recent Completion

- story-0367 completed: a large private cookbook fixture now stays private by default and remains deterministic at the scale boundary.
- story-0366 completed: private collections operator feedback now names private cookbooks in the loading state while keeping the shared resolved announcement and stable feedback shells.
- story-0364 completed: private cookbook creation now fails shut with a user-safe recovery error when the save step fails after defaulting visibility to private.
- story-0365 completed: legacy private cookbook snapshots now stay private across refreshes instead of erroring when the visibility flag is absent.
- story-0362 completed: personal notes now stay canonical across a large cookbook snapshot without rereading untouched entries.
- story-0361 completed: personal notes now expose editor save-state feedback and note editing in the cookbook dialog.
- story-0360 completed: personal notes now stay attached across refresh and render on cookbook cards.
- story-0359 completed: personal notes now roll back failed post-save hydration and keep cookbook import errors recoverable.
- story-0358 completed: personal notes now reject oversized cookbook notes before persistence and keep trimmed notes canonical.
- story-0363 completed: private cookbook collections now default to private and reject malformed visibility payloads before persistence.
- story-0357 completed: recipe versioning now keeps a large revised cookbook snapshot deterministic and aligned with the refreshed query at the scale boundary.
- story-0355 completed: recipe versioning now keeps the revised cookbook snapshot aligned with the refreshed query and waits for the post-save refresh before confirming success.
- story-0356 completed: recipe versioning feedback now keeps the cookbook revision snackbar dismissible while preserving accessible loading, empty, success, and error shells.
- story-0352 completed: collection import now fails fast at the cookbook size boundary without mutating or saving a full collection.
- story-0354 completed: recipe versioning now rolls back a failed revision save and keeps the prior entry state recoverable.
- story-0351 completed: collection import now keeps cookbook feedback loading, empty, success, and error shells accessible across the recipes and cookbook flows.
- story-0350 completed: cookbook imports now refresh the cookbook list after a successful add and keep the canonical payload stable across refresh.
- story-0349 completed: collection import now rolls back failed cookbook imports and surfaces a user-safe persistence error.
- story-0348 completed: collection import now validates imported recipe ids at the mutation boundary and fails shut on malformed cookbook entry payloads.
- story-0347 completed: swipe decisions now ignore duplicate optimistic applies, roll back idempotently, and stay deterministic on a large scale-boundary fixture.
- story-0346 completed: swipe decisions now expose accessible loading, empty, error, and resolved shells with a fixed-height swiper surface.
- story-0345 completed: swipe decisions now canonicalize persisted swipe arrays after refresh and keep the swiper window stable.
- story-0344 completed: swipe decisions now rollback optimistic state and surface a recoverable failure banner when save or reject mutations fail.
- story-0343 completed: swipe decisions now validate canonical payloads, reject malformed state with a typed user-safe error, and fail shut on malformed swipe windows.
- story-0342 completed: recipe search now keeps expanded indexed fields and a deterministic sort on large result sets.
- story-0340 completed: recipe search now persists canonical filters across refresh and keeps zero prep time visible.
- story-0341 completed: recipe search operator feedback now keeps loading, empty, success, and error shells accessible without layout shift.
- story-0339 completed: recipe search now fails shut with a user-safe recovery error when catalog lookup fails.
- story-0338 completed: recipe search now broadens library search across ingredient, diet, and time fields with typed validation.
- story-0337 completed: tag management now caches tag array length during validation, keeping large recipe tag payloads deterministic at the scale boundary.
- story-0336 completed: tag management operator feedback now gives recipe search loading, empty, success, and error states accessible announcements without layout shift.
- story-0335 completed: tag management now normalizes recipe tags during validation so saved and refreshed cookbook snapshots stay canonical.
- story-0334 completed: tag management now rolls back recipe writes when post-save refreshes fail, so failed tag edits do not leave partial data behind.
- story-0333 completed: tag management now canonicalizes recipe tags and fails shut on malformed payloads before persistence.
- story-0332 completed: cookbook sharing scale boundary now fail-shuts on oversized legacy restaurant refs at the cookbook size limit.
- story-0331 completed: cookbook sharing operator feedback now announces the resolved cookbook state with an SR-only status on cookbook surfaces.
- story-0329 completed: cookbook sharing failure path now rolls back orphaned cookbooks when user linkage fails, so sharing failures fail shut instead of leaving partial data.
- story-0330 completed: cookbook sharing persistence consistency now renders canonical shared/private status on cookbook surfaces with a stable refresh-safe helper.
- story-0328 completed: cookbook sharing contract coverage now requires explicit `isPublic` flags for cookbook payloads and keeps the recipes query aligned.
- story-0327 completed: saved recipe state now keeps the next swiper card canonical at the scale boundary without skipping the following recipe.
- story-0326 completed: saved recipe state operator feedback now fails shut on malformed cookbook payloads and keeps empty cookbook screens accessible.
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

- story-0367: Private collections scale boundary is done.
- story-0366: Private collections operator feedback is done.
- story-0364: Private collections failure path is done.
- story-0365: Private collections persistence consistency is done.
- story-0362: Personal notes scale boundary is done.
- story-0361: Personal notes operator feedback is done.
- story-0360: Personal notes persistence consistency is done.
- story-0359: Personal notes failure path is done.
- story-0358: Personal notes contract coverage is done.
- story-0363: Private cookbook collections are done.
- story-0357: Recipe versioning scale boundary is done.
- story-0355: Recipe versioning persistence consistency is done.
- story-0352: Collection import scale boundary is done.
- story-0354: Recipe versioning failure path is done.
- story-0351: Collection import operator feedback is done.
- story-0350: Collection import persistence consistency is done.
- story-0349: Collection import failure path is done.
- story-0348: Collection import contract coverage is done.
- story-0347: Swipe decisions scale boundary is done.
- story-0346: Swipe decisions operator feedback is done.
- story-0345: Swipe decisions persistence consistency is done.
- story-0344: Swipe decisions failure path is done.
- story-0343: Swipe decisions contract coverage is done.
- story-0342: Recipe search scale boundary is done.
- story-0340: Recipe search persistence consistency is done.
- story-0341: Recipe search operator feedback is done.
- story-0339: Recipe search failure path is done.
- story-0337: Tag management scale boundary is done.
- story-0336: Tag management operator feedback is done.
- story-0335: Tag management persistence consistency is done.
- story-0334: Tag management failure path is done.
- story-0333: Tag management contract coverage is done.
- story-0332: Cookbook sharing scale boundary is done.
- story-0331: Cookbook sharing operator feedback is done.
- story-0329: Cookbook sharing failure path is done.
- story-0330: Cookbook sharing persistence consistency is done.
- story-0328: Cookbook sharing contract coverage is done.
- story-0327: Saved recipe state scale boundary is done.
- story-0326: Saved recipe state operator feedback is done.
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
