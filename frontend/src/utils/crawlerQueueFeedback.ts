// @ts-nocheck

const CRAWLER_QUEUE_FEEDBACK_MIN_HEIGHT = 56;

const CRAWLER_QUEUE_FEEDBACK_SURFACE_STYLES = {
    error: {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        border: '1px solid rgba(244, 67, 54, 0.2)',
    },
    success: {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        border: '1px solid rgba(76, 175, 80, 0.2)',
    },
    neutral: {
        backgroundColor: 'transparent',
        border: '1px solid transparent',
    },
};

function normalizeCount(value) {
    return Number.isFinite(value) ? value : 0;
}

function formatQueueSummary(recipeStatus = {}) {
    const pending = normalizeCount(recipeStatus.queue_pending);
    const processing = normalizeCount(recipeStatus.queue_processing);
    const done = normalizeCount(recipeStatus.queue_done);
    const failed = normalizeCount(recipeStatus.queue_failed);
    const running = Boolean(recipeStatus.running);

    return {
        pending,
        processing,
        done,
        failed,
        running,
        total: pending + processing + done + failed,
    };
}

function pluralize(count, singular, plural) {
    return count === 1 ? singular : plural;
}

export function buildCrawlerQueueFeedbackState({
    isLoading = false,
    recipeStatus = null,
    errorMessage = '',
} = {}) {
    if (isLoading) {
        return {
            state: 'loading',
            message: 'Loading recipe queue status...',
            role: 'status',
            ariaLive: 'polite',
            minHeight: CRAWLER_QUEUE_FEEDBACK_MIN_HEIGHT,
            showSpinner: true,
        };
    }

    if (errorMessage) {
        return {
            state: 'error',
            message: errorMessage,
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: CRAWLER_QUEUE_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    if (!recipeStatus) {
        return {
            state: 'error',
            message: 'Could not load recipe queue status. Please try again.',
            role: 'alert',
            ariaLive: 'assertive',
            minHeight: CRAWLER_QUEUE_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    const summary = formatQueueSummary(recipeStatus);

    if (summary.total === 0 && !summary.running) {
        return {
            state: 'empty',
            message: 'No recipe crawl jobs are queued yet.',
            role: 'status',
            ariaLive: 'polite',
            minHeight: CRAWLER_QUEUE_FEEDBACK_MIN_HEIGHT,
            showSpinner: false,
        };
    }

    const mode = summary.running ? 'running' : 'idle';

    return {
        state: 'success',
        message: `Recipe crawler is ${mode} with ${summary.pending} ${pluralize(summary.pending, 'queued', 'queued')}, ${summary.processing} ${pluralize(summary.processing, 'processing', 'processing')}, ${summary.done} ${pluralize(summary.done, 'complete', 'complete')}, and ${summary.failed} ${pluralize(summary.failed, 'failed', 'failed')}.`,
        role: 'status',
        ariaLive: 'polite',
        minHeight: CRAWLER_QUEUE_FEEDBACK_MIN_HEIGHT,
        showSpinner: false,
    };
}

export function buildCrawlerQueueFeedbackContainerStyles(state = 'empty') {
    if (state === 'success') {
        return CRAWLER_QUEUE_FEEDBACK_SURFACE_STYLES.success;
    }

    if (state === 'error') {
        return CRAWLER_QUEUE_FEEDBACK_SURFACE_STYLES.error;
    }

    return CRAWLER_QUEUE_FEEDBACK_SURFACE_STYLES.neutral;
}
