import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';

async function gqlPost(request, query, variables = {}) {
  const response = await request.post('/api/graphql', {
    headers: { 'Content-Type': 'application/json' },
    data: { query, variables },
  });
  return response.json();
}

test.describe('Feedback submission', () => {
  let db;

  test.beforeAll(async () => {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set');
    db = await mongoose.connect(process.env.MONGODB_URI);
  });

  test.afterAll(async () => {
    if (db) await mongoose.disconnect();
  });

  test('submitFeedback logs analytics event', async ({ request }) => {
    const eventCountBefore = await mongoose.connection
      .collection('analyticsevents')
      .countDocuments();

    const mutation = `
      mutation($message: String!) {
        submitFeedback(message: $message)
      }
    `;
    const { data, errors } = await gqlPost(request, mutation, {
      message: 'Great app!',
    });
    expect(errors).toBeUndefined();
    expect(data.submitFeedback).toBe(true);

    const eventCountAfter = await mongoose.connection
      .collection('analyticsevents')
      .countDocuments();

    expect(eventCountAfter).toBe(eventCountBefore + 1);
  });
});
