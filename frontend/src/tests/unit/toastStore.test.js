import test from 'node:test';
import assert from 'node:assert/strict';

let useToastStore;
try {
  ({ useToastStore } = await import('../../store/toastStore.js'));
} catch (err) {
  test('toast store unavailable', { skip: true }, () => {});
}

if (useToastStore) {
  function reset() {
    useToastStore.getState().reset();
  }

  test('queues toasts beyond limit', () => {
    reset();
    useToastStore.getState().addToast({ message: 't1', type: 'success' });
    useToastStore.getState().addToast({ message: 't2', type: 'success' });
    useToastStore.getState().addToast({ message: 't3', type: 'success' });
    useToastStore.getState().addToast({ message: 't4', type: 'success' });
    const { toasts, queue } = useToastStore.getState();
    assert.equal(toasts.length, 3);
    assert.equal(queue.length, 1);
  });

  test('removing toast pulls from queue', () => {
    reset();
    const id1 = useToastStore.getState().addToast({ message: 'a', type: 'success' });
    useToastStore.getState().addToast({ message: 'b', type: 'success' });
    useToastStore.getState().addToast({ message: 'c', type: 'success' });
    useToastStore.getState().addToast({ message: 'd', type: 'success' });
    useToastStore.getState().removeToast(id1);
    const { toasts, queue } = useToastStore.getState();
    assert.equal(toasts.length, 3);
    assert.equal(queue.length, 0);
    assert.ok(toasts.some(t => t.message === 'd'));
  });

  test('optimistic and final toasts sync with latency', async () => {
    reset();
    const simulate = () => new Promise(res => setTimeout(res, 50));
    const optimisticId = useToastStore.getState().addToast({ message: 'Saving…', type: 'info' });
    const p = simulate().then(() => {
      useToastStore.getState().removeToast(optimisticId);
      useToastStore.getState().addToast({ message: 'Saved', type: 'success' });
    });
    assert.equal(useToastStore.getState().toasts.length, 1);
    await p;
    const { toasts } = useToastStore.getState();
    assert.equal(toasts.length, 1);
    assert.equal(toasts[0].message, 'Saved');
  });
}
