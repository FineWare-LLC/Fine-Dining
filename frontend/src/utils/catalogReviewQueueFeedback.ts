// @ts-nocheck

const CATALOG_REVIEW_QUEUE_FEEDBACK_MIN_HEIGHT = 56;

const CATALOG_REVIEW_QUEUE_FEEDBACK_SURFACE_STYLES = {
    error: {
        bgcolor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    },
    success: {
        bgcolor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    },
    neutral: {
        bgcolor: 'transparent',
        border: '1px solid transparent',
    },
};

function pluralize(count, singular, plural) {
    return count === 1 ? singular : plural;
}

function countReviewQueueSources(sources = []) {
    if (!Array.isArray(sources)) {
        return 0;
    }

    let count = 0;
    for (let index = 0, length = sources.length; index < length; index += 1) {
        const source = sources[index];
        if (source && typeof source === 'object') {
            count += 1;
        }
    }

    return count;
}

export function buildCatalogReviewQueueFeedbackState({
    isLoading = false,
    sources = [],
    errorMessage = '',
} = {}) {
    const sourceCount = countReviewQueueSources(sources);

    if (isLoading) {
        return {
            state: 'loading',
            message: 'Loading catalog review queue status...',
            role: 'status',
            ariaLive: 'polite',
            ariaBusy: 'true',
            minHeight: CATALOG_REVIEW_QUEUE_FEEDBACK_MIN_HEIGHT,
            showSpinner: true,
        };
    }

    if (errorMessage) {
        return {
            state: 'error',
            message: errorMessage,
            role: 'alert',
            ariaLive: 'assertive',
            ariaBusy: 'false',
            minHeight: CATALOG_REVIEW_QUEUE_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    if (sourceCount === 0) {
        return {
            state: 'empty',
            message: 'No restaurant catalog review queue items are waiting yet.',
            role: 'status',
            ariaLive: 'polite',
            ariaBusy: 'false',
            minHeight: CATALOG_REVIEW_QUEUE_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    return {
        state: 'success',
        message: `Catalog review queue is ready with ${sourceCount} ${pluralize(sourceCount, 'source', 'sources')}.`,
        role: 'status',
        ariaLive: 'polite',
        ariaBusy: 'false',
        minHeight: CATALOG_REVIEW_QUEUE_FEEDBACK_MIN_HEIGHT,
        showSpinner: false,
    };
}

export function buildCatalogReviewQueueFeedbackContainerStyles(state) {
    return CATALOG_REVIEW_QUEUE_FEEDBACK_SURFACE_STYLES[state] || CATALOG_REVIEW_QUEUE_FEEDBACK_SURFACE_STYLES.neutral;
}
