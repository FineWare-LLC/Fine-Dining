// @ts-nocheck
import assert from 'node:assert/strict';
import test from 'node:test';

import { buildCatalogReviewQueueFeedbackState } from '../../utils/catalogReviewQueueFeedback.ts';

const LARGE_SOURCE_COUNT = 2048;
const INVALID_SOURCE_EVERY = 128;
const CATALOG_REVIEW_QUEUE_FEEDBACK_MIN_HEIGHT = 56;

function buildLargeSourceFixture() {
    const rawSources = Array.from({ length: LARGE_SOURCE_COUNT }, (_, index) => (
        index % INVALID_SOURCE_EVERY === 0
            ? null
            : {
                id: `source-${index}`,
                restaurant: `Restaurant ${index}`,
                source_type: 'official',
            }
    ));
    let filterAccesses = 0;

    const proxySources = new Proxy(rawSources, {
        get(target, prop, receiver) {
            if (prop === 'filter') {
                filterAccesses += 1;
            }

            return Reflect.get(target, prop, receiver);
        },
    });

    let validSourceCount = 0;
    for (const source of rawSources) {
        if (source && typeof source === 'object') {
            validSourceCount += 1;
        }
    }

    return {
        counts: {
            get filterAccesses() {
                return filterAccesses;
            },
        },
        proxySources,
        validSourceCount,
    };
}

test('buildCatalogReviewQueueFeedbackState keeps a large catalog review queue deterministic without filtering the source array copy', () => {
    const firstFixture = buildLargeSourceFixture();
    const secondFixture = buildLargeSourceFixture();

    const firstPass = buildCatalogReviewQueueFeedbackState({
        sources: firstFixture.proxySources,
    });
    const secondPass = buildCatalogReviewQueueFeedbackState({
        sources: secondFixture.proxySources,
    });

    assert.deepEqual(firstPass, secondPass);
    assert.deepEqual(firstPass, {
        state: 'success',
        message: `Catalog review queue is ready with ${firstFixture.validSourceCount} sources.`,
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: CATALOG_REVIEW_QUEUE_FEEDBACK_MIN_HEIGHT,
        showSpinner: false,
    });
    assert.equal(firstFixture.counts.filterAccesses, 0);
    assert.equal(secondFixture.counts.filterAccesses, 0);
});
