const cache = new Map();

export function getCachedResult(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
        cache.delete(key);
        return null;
    }
    return entry.value;
}

export function setCachedResult(key, value, ttlMs = 5 * 60 * 1000) {
    cache.set(key, {
        value,
        expiresAt: ttlMs ? Date.now() + ttlMs : null,
    });
}

export function clearCache() {
    cache.clear();
}

