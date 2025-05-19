import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

async function gqlPost(request, query, variables = {}) {
  const response = await request.post('/api/graphql', {
    headers: { 'Content-Type': 'application/json' },
    data: { query, variables },
  });
  return response.json();
}

test('create and view meal plans', async ({ request }) => {
  const email = faker.internet.email();
  const password = faker.internet.password();

  const createUser = `
    mutation ($input: CreateUserInput!) {
      createUser(input: $input) { id }
    }
  `;
  const { data: userData } = await gqlPost(request, createUser, {
    input: {
      name: faker.person.fullName(),
      email,
      password,
      gender: 'OTHER',
      measurementSystem: 'METRIC',
    },
  });
  const userId = userData.createUser.id;
  expect(userId).toBeTruthy();

  const createPlan = `
    mutation ($userId: ID!, $startDate: Date!, $endDate: Date!) {
      createMealPlan(userId: $userId, startDate: $startDate, endDate: $endDate) { id }
    }
  `;
  const { data: planData } = await gqlPost(request, createPlan, {
    userId,
    startDate: '2030-01-01',
    endDate: '2030-01-07',
  });
  const planId = planData.createMealPlan.id;
  expect(planId).toBeTruthy();

  const listQuery = `query ($userId: ID!) { getMealPlans(userId: $userId) { id } }`;
  const { data: listData } = await gqlPost(request, listQuery, { userId });
  expect(listData.getMealPlans.some((p) => p.id === planId)).toBe(true);

  const detailQuery = `query ($id: ID!) { getMealPlan(id: $id) { id } }`;
  const { data: detailData } = await gqlPost(request, detailQuery, { id: planId });
  expect(detailData.getMealPlan.id).toBe(planId);

  await gqlPost(request, `mutation ($id: ID!) { deleteMealPlan(id: $id) }`, { id: planId });
  await gqlPost(request, `mutation ($id: ID!) { deleteUser(id: $id) }`, { id: userId });
});
