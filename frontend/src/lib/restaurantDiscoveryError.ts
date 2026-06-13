// @ts-nocheck

export const RestaurantDiscoveryErrorCodes = {
    UNAVAILABLE: 'E_RESTAURANTS_UNAVAILABLE',
    INVALID_QUERY: 'E_RESTAURANTS_INVALID_QUERY',
    PERSISTENCE_FAILED: 'E_RESTAURANTS_PERSISTENCE_FAILED',
    RATE_LIMITED: 'E_RESTAURANTS_RATE_LIMITED',
};

const RATE_LIMITED_MESSAGE = 'Nearby restaurants are rate limited right now. Please try again in a few minutes.';

export class RestaurantDiscoveryError extends Error {
    constructor(code, message, cause = null) {
        super(message);
        this.name = 'RestaurantDiscoveryError';
        this.code = code;
        this.isUserSafe = true;
        this.extensions = { code };
        if (cause) {
            this.cause = cause;
        }
    }
}

export function createRestaurantDiscoveryError(code, message, cause = null) {
    return new RestaurantDiscoveryError(code, message, cause);
}

export function createRestaurantDiscoveryRateLimitedError(cause = null) {
    return createRestaurantDiscoveryError(
        RestaurantDiscoveryErrorCodes.RATE_LIMITED,
        RATE_LIMITED_MESSAGE,
        cause,
    );
}
