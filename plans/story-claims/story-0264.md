story id: story-0264
timestamp: 2026-06-12T07:11:12Z
owner: fine-dining-monitor
model: Codex GPT-5
reasoning effort: high
planned test command: cd frontend && NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/restaurant-discovery.provider-rate-limits.operator-feedback.test.ts
files expected to change:
- frontend/src/utils/geolocation.ts
- frontend/src/services/places.service.ts
- frontend/src/services/localRestaurants.service.ts
- frontend/src/services/localRestaurantFilter.service.ts
- frontend/src/tests/unit/restaurant-discovery.provider-rate-limits.operator-feedback.test.ts
