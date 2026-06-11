import assert from 'node:assert/strict';
import test from 'node:test';

// Helper to load a fresh copy of the registry module for each test
function loadRegistry() {
    const suffix = `?test=${Date.now()}_${Math.random()}`;
    return import(`../../../../plugins/registry.mjs${suffix}`);
}

test('registerPlugin stores setup and listPlugins returns names', async () => {
    const { registerPlugin, listPlugins, getPlugin } = await loadRegistry();
    function plugin() {}
    registerPlugin('alpha', plugin);
    assert.strictEqual(getPlugin('alpha'), plugin);
    assert.deepEqual(listPlugins(), ['alpha']);
});

test('registerPlugin throws on duplicate names', async () => {
    const { registerPlugin } = await loadRegistry();
    registerPlugin('dup', () => {});
    assert.throws(() => registerPlugin('dup', () => {}), /already registered/);
});

test('getPlugin returns undefined for unknown plugin', async () => {
    const { getPlugin } = await loadRegistry();
    assert.equal(getPlugin('missing'), undefined);
});

test('applyPlugins invokes plugin callbacks and mutates solver', async () => {
    const { registerPlugin, applyPlugins } = await loadRegistry();
    const solver = { count: 0 };
    registerPlugin('inc1', s => { s.count += 1; });
    registerPlugin('inc2', s => { s.count += 2; });
    applyPlugins(solver);
    assert.equal(solver.count, 3);
});
