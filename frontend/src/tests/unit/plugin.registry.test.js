import assert from 'node:assert/strict';
import test from 'node:test';
import {
    registerPlugin,
    listPlugins,
    getPlugin,
    applyPlugins,
    clearPlugins,
} from '../../../../plugins/registry.mjs';

test('registerPlugin stores setup and listPlugins returns names', async () => {
    clearPlugins();
    function plugin() {}
    registerPlugin('alpha', plugin);
    assert.strictEqual(getPlugin('alpha'), plugin);
    assert.deepEqual(listPlugins(), ['alpha']);
});

test('registerPlugin throws on duplicate names', async () => {
    clearPlugins();
    registerPlugin('dup', () => {});
    assert.throws(() => registerPlugin('dup', () => {}), /already registered/);
});

test('getPlugin returns undefined for unknown plugin', async () => {
    clearPlugins();
    assert.equal(getPlugin('missing'), undefined);
});

test('applyPlugins invokes plugin callbacks and mutates solver', async () => {
    clearPlugins();
    const solver = { count: 0 };
    registerPlugin('inc1', s => { s.count += 1; });
    registerPlugin('inc2', s => { s.count += 2; });
    applyPlugins(solver);
    assert.equal(solver.count, 3);
});

test('clearPlugins empties the registry', async () => {
    clearPlugins();
    registerPlugin('temp', () => {});
    assert.deepEqual(listPlugins(), ['temp']);
    clearPlugins();
    assert.deepEqual(listPlugins(), []);
});
