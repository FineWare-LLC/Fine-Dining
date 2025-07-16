import { test, expect } from '@playwright/test';

// TODO: this test relies on local GraphQL mocking; adjust if API shape changes

test('analytics page shows improvement from new questions only', async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem('userToken', 'mock-token');
    localStorage.setItem('userProfile', JSON.stringify({ id: '1', name: 'Tester' }));
  });

  await page.route('**/api/graphql', async route => {
    const body = JSON.parse(route.request().postData() || '{}');
    if (body.query && body.query.includes('GetUserResults')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            getUserQuestionResults: [
              { questionId: 1, correct: false },
              { questionId: 2, correct: false },
              { questionId: 1, correct: true },
              { questionId: 3, correct: true },
              { questionId: 4, correct: true }
            ]
          }
        })
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/analytics');
  await expect(page.getByTestId('improvement')).toHaveText('100% improvement');
});
