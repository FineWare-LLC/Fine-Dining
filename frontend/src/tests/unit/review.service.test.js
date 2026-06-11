import assert from 'node:assert/strict';
import test, { mock } from 'node:test';
import { Review } from '../../models/review/index.js';
import { createReview, getReviewsByTarget } from '../../services/review.service.js';

test('createReview succeeds', async () => {
    const created = { _id: '1', rating: 5 };
    const tracker = mock.method(Review, 'create', async () => created);
    const result = await createReview({ rating: 5 });
    assert.equal(result, created);
    assert.equal(tracker.mock.calls.length, 1);
    mock.restoreAll();
});

test('createReview handles failure', async () => {
    const tracker = mock.method(Review, 'create', async () => { throw new Error('db error'); });
    await assert.rejects(() => createReview({ rating: 5 }), /Failed to create review: db error/);
    assert.equal(tracker.mock.calls.length, 1);
    mock.restoreAll();
});

test('getReviewsByTarget succeeds', async () => {
    const reviews = [{ _id: '1' }, { _id: '2' }];
    const execObj = { exec: async () => reviews };
    const findTracker = mock.method(Review, 'find', () => execObj);
    const execTracker = mock.method(execObj, 'exec', async () => reviews);
    const result = await getReviewsByTarget('RECIPE', '1');
    assert.deepEqual(result, reviews);
    assert.equal(findTracker.mock.calls.length, 1);
    assert.equal(execTracker.mock.calls.length, 1);
    mock.restoreAll();
});

test('getReviewsByTarget handles failure', async () => {
    const execObj = { exec: async () => { throw new Error('find error'); } };
    const findTracker = mock.method(Review, 'find', () => execObj);
    const execTracker = mock.method(execObj, 'exec', async () => { throw new Error('find error'); });
    await assert.rejects(() => getReviewsByTarget('RECIPE', '1'), /Failed to retrieve reviews: find error/);
    assert.equal(findTracker.mock.calls.length, 1);
    assert.equal(execTracker.mock.calls.length, 1);
    mock.restoreAll();
});
