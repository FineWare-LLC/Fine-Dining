// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const componentPath = fileURLToPath(
    new URL('../../components/legacy/Dashboard/NearbyRestaurants.tsx', import.meta.url),
);
const source = fs.readFileSync(componentPath, 'utf8');

test('NearbyRestaurants keeps geolocation privacy feedback accessible across loading and fallback states', () => {
    assert.match(source, /Location access denied\. Please enter a city manually\./);
    assert.match(source, /Use My Location/);
    assert.match(source, /Enter city/);
    assert.match(source, /aria-busy=\{loadingFeedback\.ariaBusy\}/);
    assert.match(source, /aria-busy=\{errorFeedback\.ariaBusy\}/);
    assert.match(source, /aria-busy=\{emptyFeedback\.ariaBusy\}/);
    assert.match(source, /aria-busy=\{successFeedback\.ariaBusy\}/);
});
