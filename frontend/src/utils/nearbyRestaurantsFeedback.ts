// @ts-nocheck

const MIN_HEIGHT = 56;

function buildState(state, message, isBusy = false) {
    return {
        state,
        message,
        role: state === 'error' ? 'alert' : 'status',
        ariaLive: state === 'error' ? 'assertive' : 'polite',
        ariaBusy: isBusy ? 'true' : 'false',
        minHeight: MIN_HEIGHT,
        showSpinner: state === 'loading',
    };
}

export function buildNearbyRestaurantsFeedbackState({
    state = 'empty',
    message = '',
    isLoading = false,
} = {}) {
    if (isLoading || state === 'loading') {
        return buildState('loading', message || 'Getting your location...', true);
    }

    if (state === 'error') {
        return buildState('error', message || 'Could not load nearby restaurants. Please try again.');
    }

    if (state === 'success') {
        return buildState('success', message);
    }

    return buildState(
        'empty',
        message || 'No restaurants found in this area. Try increasing the search radius or selecting a different location.',
    );
}
