import assert from 'node:assert/strict';
import test from 'node:test';
import { createMockRepository } from '../utils/testHelpers.js';

test('createMockRepository provides default CRUD methods', async () => {
    const repo = createMockRepository({
        find: [{ id: 1 }],
        findById: { _id: 'a' },
        count: 1,
    });

    assert.deepEqual(await repo.find(), [{ id: 1 }]);
    assert.deepEqual(await repo.findById('a'), { _id: 'a' });
    assert.deepEqual(await repo.create({ x: 1 }), { _id: 'new-id', x: 1 });
    assert.deepEqual(await repo.update('a', { y: 2 }), { _id: 'a', y: 2 });
    assert.deepEqual(await repo.delete('a'), { _id: 'a', deleted: true });
    assert.equal(await repo.count(), 1);
});
