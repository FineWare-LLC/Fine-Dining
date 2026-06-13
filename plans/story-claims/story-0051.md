story: story-0051
timestamp: 2026-06-11T19:40:32Z
owner: fine-dining-monitor
model: gpt-5
reasoning: moderate
planned-test-command: npm --prefix frontend run test:unit -- onboarding-profile.measurement-system-setup.scale-boundary.test.ts
expected-files:
  - frontend/src/pages/onboarding.tsx
  - frontend/src/graphql/resolvers/mutations/userMutations.ts
  - frontend/src/pages/account.tsx
  - frontend/src/components/Profile/User/Setup/index.tsx
