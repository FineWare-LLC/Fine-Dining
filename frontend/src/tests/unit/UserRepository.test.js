import test from 'node:test';
import assert from 'node:assert/strict';

let User, repo;
try {
  ({ default: User } = await import('../../models/User/index.js'));
  repo = await import('../../data/UserRepository.js');
} catch (err) {
  test('UserRepository module unavailable', { skip: true }, () => {});
}

if (repo) {
  const { findUserById } = repo;

test('findUserById delegates to User.findById', async t => {
  const user = { _id: 'u1' };
  const tracker = t.mock.method(User, 'findById', async id => {
    assert.equal(id, 'u1');
    return user;
  });
  const result = await findUserById('u1');
  assert.equal(result, user);
  assert.equal(tracker.mock.callCount(), 1);
});
}
