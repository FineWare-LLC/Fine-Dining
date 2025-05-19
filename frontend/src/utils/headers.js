// src/utils/headers.js

const isProduction = process.env.NODE_ENV === 'production';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['https://yourdomain.com'];

/**
 * Sets security headers on the response.
 * In production, a strict CSP is applied. In development, the CSP is relaxed
 * to allow inline scripts/eval for tools like Apollo Sandbox.
 * @param {import('http').ServerResponse | import('next/server').NextResponse} res
 */
export function setSecurityHeaders(res) {
    const csp = isProduction
        ? "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; object-src 'none'; frame-ancestors 'none';"
        : "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;";

    if (res.headers && res.headers.set) {
        res.headers.set('Content-Security-Policy', csp);
        res.headers.set('X-Frame-Options', 'DENY');
        res.headers.set('X-Content-Type-Options', 'nosniff');
        res.headers.set('X-XSS-Protection', '1; mode=block');
        res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        if (isProduction) {
            res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
        }
    } else if (res.setHeader) {
        res.setHeader('Content-Security-Policy', csp);
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        if (isProduction) {
            res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
        }
    }
}

/**
 * Sets CORS headers on the response.
 * @param {import('http').ServerResponse | import('next/server').NextResponse} res
 * @param {string} origin
 */
export function setCORSHeaders(res, origin) {
    const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    if (res.headers && res.headers.set) {
        res.headers.set('Access-Control-Allow-Origin', allowed);
        res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.headers.set('Access-Control-Allow-Credentials', 'true');
    } else if (res.setHeader) {
        res.setHeader('Access-Control-Allow-Origin', allowed);
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
}

/**
 * Attaches a unique Request ID to the response.
 * Uses a combination of timestamp and random values to generate a unique ID.
 * This is compatible with Edge Runtime, unlike the Node.js crypto module.
 * @param {import('http').ServerResponse | import('next/server').NextResponse} res
 * @returns {string}
 */
export function assignRequestId(res) {
    // Generate a unique ID using timestamp and random values
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    const requestId = `${timestamp}-${randomPart}`;

    if (res.headers && res.headers.set) {
        res.headers.set('X-Request-ID', requestId);
    } else if (res.setHeader) {
        res.setHeader('X-Request-ID', requestId);
    }
    return requestId;
}
