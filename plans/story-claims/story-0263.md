story id: story-0263
timestamp: 2026-06-12T07:08:08Z
owner: fine-dining-monitor
model: Codex GPT-5
reasoning effort: high
planned test command: cd frontend && NODE_OPTIONS=--import=./src/utils/serverOptimizerAliasRegister.mjs npm exec -- tsx --test src/tests/unit/restaurant-discovery.provider-rate-limits.persistence-consistency.test.ts
files expected to change:
- frontend/src/utils/geolocation.ts
- frontend/src/services/localRestaurantFilter.service.ts
- frontend/src/services/localRestaurants.service.ts
- frontend/src/services/places.service.ts
- frontend/src/tests/unit/restaurant-discovery.provider-rate-limits.persistence-consistency.test.ts
