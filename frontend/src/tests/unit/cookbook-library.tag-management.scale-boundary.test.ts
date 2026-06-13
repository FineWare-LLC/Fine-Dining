// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { validateRecipeTagsInput } from '../../models/Recipe';

const LARGE_TAG_COUNT = 2048;
const UNIQUE_TAG_COUNT = 64;

const buildCanonicalTags = () => (
    Array.from({ length: UNIQUE_TAG_COUNT }, (_, index) => `Tag ${index}`)
);

const buildLargeTagFixture = () => {
    const canonicalTags = buildCanonicalTags();
    const rawTags = [
        ...canonicalTags,
        ...Array.from({ length: LARGE_TAG_COUNT - canonicalTags.length }, (_, index) => {
            const canonicalTag = canonicalTags[index % canonicalTags.length];

            if (index % 2 === 0) {
                return `  ${canonicalTag}  `;
            }

            return canonicalTag.toLowerCase();
        }),
    ];
    const snapshot = rawTags.slice();

    let lengthReads = 0;
    let indexReads = 0;
    const proxy = new Proxy(rawTags, {
        get(target, prop, receiver) {
            if (prop === 'length') {
                lengthReads += 1;
            }

            if (typeof prop === 'string' && /^\d+$/.test(prop)) {
                indexReads += 1;
            }

            return Reflect.get(target, prop, receiver);
        },
    });

    return {
        canonicalTags,
        counts: {
            get indexReads() {
                return indexReads;
            },
            get lengthReads() {
                return lengthReads;
            },
        },
        proxy,
        snapshot,
    };
};

test('validateRecipeTagsInput keeps a large tag fixture deterministic without rereading array length at the scale boundary', () => {
    const firstFixture = buildLargeTagFixture();
    const secondFixture = buildLargeTagFixture();

    const firstPass = validateRecipeTagsInput(firstFixture.proxy);
    const secondPass = validateRecipeTagsInput(secondFixture.proxy);

    assert.equal(firstPass.valid, true);
    assert.equal(firstPass.error, null);
    assert.deepEqual(firstPass.input, firstFixture.canonicalTags);
    assert.deepEqual(firstPass, secondPass);
    assert.deepEqual(firstFixture.snapshot, secondFixture.snapshot);
    assert.equal(firstFixture.counts.lengthReads, 1);
    assert.equal(firstFixture.counts.indexReads, LARGE_TAG_COUNT);
    assert.equal(secondFixture.counts.lengthReads, 1);
    assert.equal(secondFixture.counts.indexReads, LARGE_TAG_COUNT);
});
