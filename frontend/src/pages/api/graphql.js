/**
 * @fileoverview Next.js API route for GraphQL endpoint using Apollo Server v4+.
 * This endpoint is hardened for production while providing a relaxed security policy in development for Apollo Sandbox.
 *
 * Security Enhancements:
 * - Rate Limiting: In-memory rate limiter (use a distributed solution for production).
 * - Secure HTTP Headers: Strict CSP in production; a relaxed CSP in development to allow inline scripts/eval for Apollo Sandbox.
 * - CORS: Validates and restricts allowed origins.
 * - Content-Type Enforcement: Only accepts 'application/json' for POST requests.
 * - Request Size Limit: Aborts requests exceeding a defined maximum payload size.
 * - HTTP Method Enforcement: In production only POST is allowed; in development GET is also permitted.
 * - Request ID: Generates and attaches a unique ID for each request.
 * - JWT Verification: Uses HS256 with optional issuer and audience validation.
 * - Error Handling: Prevents leaking sensitive error details.
 * - Apollo Server Config: Uses a landing page plugin in development.
 */

import { ApolloServer, ApolloServerErrorCode } from '@apollo/server';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { typeDefs } from '@/graphql/typeDefs'; // [cite: frontend/src/graphql/typeDefs.js]
import { resolvers } from '@/graphql/resolvers'; // [cite: frontend/src/graphql/resolvers/index.js]
import { dbConnect } from '@/lib/dbConnect'; // [cite: frontend/src/lib/dbConnect.js]
import logger from '@/lib/logger.js';
import { requestCounter, errorCounter } from '@/lib/metrics.js';

// --- Configuration ---
const isProduction = process.env.NODE_ENV === 'production';
const JWT_ALGORITHM = 'HS256';
const MAX_REQUEST_BODY_SIZE = 1 * 1024 * 1024; // 1 MB
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = process.env.JWT_ISSUER || undefined;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || undefined;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['https://yourdomain.com'];

// --- Early Failure Check ---
if (!JWT_SECRET && isProduction) {
    logger.error('FATAL ERROR: JWT_SECRET is not defined in production.');
    errorCounter.inc({ route: 'graphql' });
    process.exit(1);
}

// --- Rate Limiting (In-Memory) ---
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS_PER_IP = 100; // Max requests per IP per window
const rateLimitStore = new Map();

class Mutex {
    constructor() {
        this.locked = false;
        this.queue = [];
    }

    async lock() {
        if (!this.locked) {
            this.locked = true;
            return;
        }
        await new Promise(resolve => this.queue.push(resolve));
        this.locked = true;
    }

    unlock() {
        const next = this.queue.shift();
        if (next) {
            next();
        } else {
            this.locked = false;
        }
    }
}

const rateLimitMutex = new Mutex();

/**
 * Checks and updates the request count for the given IP.
 *
 * @param {string} ip - Client IP address.
 * @returns {boolean} - True if request is allowed; false if limit exceeded.
 */
async function checkRateLimit(ip) {
    if (!ip) return true;
    await rateLimitMutex.lock();
    try {
        const now = Date.now();
        const record = rateLimitStore.get(ip) || { count: 0, startTime: now };

        if (now - record.startTime > RATE_LIMIT_WINDOW_MS) {
            record.count = 1;
            record.startTime = now;
        } else {
            record.count += 1;
        }
        rateLimitStore.set(ip, record);

        // Basic cleanup of stale records (1% chance per request)
        if (Math.random() < 0.01) {
            rateLimitStore.forEach((rec, key) => {
                if (now - rec.startTime > RATE_LIMIT_WINDOW_MS * 5) {
                    rateLimitStore.delete(key);
                }
            });
        }
        return record.count <= RATE_LIMIT_MAX_REQUESTS_PER_IP;
    } finally {
        rateLimitMutex.unlock();
    }
}

/**
 * Sets security headers on the response.
 * In production, a strict CSP is applied.
 * In development, the CSP is relaxed to allow inline scripts and eval for Apollo Sandbox.
 *
 * @param {import('http').ServerResponse} res - HTTP response object.
 */
function setSecurityHeaders(res) {
    const csp = isProduction
        ? "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; object-src 'none'; frame-ancestors 'none';"
        : "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"; // relaxed in dev
    res.setHeader('Content-Security-Policy', csp);
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (isProduction) {
        res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }
}

/**
 * Sets CORS headers on the response.
 *
 * @param {import('http').ServerResponse} res - HTTP response object.
 * @param {string} origin - Request origin.
 */
function setCORSHeaders(res, origin) {
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
}

/**
 * Attaches a unique Request ID to the response for traceability.
 *
 * @param {import('http').ServerResponse} res - HTTP response object.
 * @returns {string} - The generated Request ID.
 */
function assignRequestId(res) {
    const requestId = randomUUID();
    res.setHeader('X-Request-ID', requestId);
    return requestId;
}

/**
 * Validates that the Content-Type header is 'application/json'.
 *
 * @param {import('http').IncomingMessage} req - HTTP request object.
 * @returns {boolean} - True if valid; false otherwise.
 */
function validateContentType(req) {
    const contentType = req.headers['content-type'] || '';
    return contentType.includes('application/json');
}

// --- Apollo Server Setup ---
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: !isProduction,
    plugins: isProduction ? [] : [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
    formatError: (formattedError, error) => {
        const originalError = error?.originalError || error;
        logger.error('GraphQL Processing Error:', {
            message: originalError?.message,
            code: formattedError.extensions?.code,
            path: formattedError.path,
        });
        errorCounter.inc({ route: 'graphql' });

        if (isProduction) {
            const safeExtensions = { ...formattedError.extensions };
            delete safeExtensions.stacktrace;
            let clientMessage = 'Internal server error';

            const code = formattedError.extensions?.code;
            if (code === ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED) {
                clientMessage = 'Input validation failed.';
            } else if (
                code === ApolloServerErrorCode.PERSISTED_QUERY_NOT_FOUND ||
                code === ApolloServerErrorCode.PERSISTED_QUERY_NOT_SUPPORTED
            ) {
                clientMessage = 'Query format error.';
            } else if (
                code === ApolloServerErrorCode.BAD_USER_INPUT ||
                code === ApolloServerErrorCode.BAD_REQUEST
            ) {
                clientMessage = 'Invalid request.';
            } else if (
                formattedError.message.includes('Authentication required') ||
                formattedError.message.includes('Authorization required')
            ) {
                clientMessage = formattedError.message;
            }

            return {
                message: clientMessage,
                locations: formattedError.locations,
                path: formattedError.path,
                extensions: safeExtensions,
            };
        }
        return formattedError;
    },
});

// --- Next.js Handler Setup ---
const serverHandler = startServerAndCreateNextHandler(apolloServer, {
    context: async (req, res) => {
        let contextUser = null;
        if (JWT_SECRET) {
            try {
                await dbConnect();
                const authHeader = req.headers.authorization || '';
                const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
                if (token) {
                    try {
                        const verifyOptions = {
                            algorithms: [JWT_ALGORITHM],
                            issuer: JWT_ISSUER,
                            audience: JWT_AUDIENCE,
                        };
                        const decoded = jwt.verify(token, JWT_SECRET, verifyOptions);
                        if (typeof decoded === 'object' && decoded.userId) {
                            contextUser = { userId: decoded.userId, email: decoded.email, role: decoded.role };
                        } else {
                            logger.warn('Invalid JWT payload structure.');
                        }
                    } catch (err) {
                        if (err instanceof jwt.TokenExpiredError) {
                            logger.warn(`JWT expired at ${err.expiredAt}: ${err.message}`);
                        } else if (err instanceof jwt.JsonWebTokenError) {
                            logger.warn(`Invalid JWT: ${err.message}`);
                        } else {
                            logger.error('Unhandled JWT verification error:', err);
                            errorCounter.inc({ route: 'graphql' });
                        }
                        contextUser = null;
                    }
                }
            } catch (error) {
                logger.error('Error during context setup (e.g., DB connection):', error);
                errorCounter.inc({ route: 'graphql' });
            }
        } else {
            logger.error('JWT_SECRET missing during context creation.');
            errorCounter.inc({ route: 'graphql' });
        }
        return { req, res, user: contextUser };
    },
});

/**
 * Main API Route Handler.
 *
 * @param {import('http').IncomingMessage} req - HTTP request object.
 * @param {import('http').ServerResponse} res - HTTP response object.
 * @returns {Promise<void>}
 */
export default async function handler(req, res) {
    // Assign a unique request ID and set common security headers
    assignRequestId(res);
    setSecurityHeaders(res);
    setCORSHeaders(res, req.headers.origin || '');
    res.on('finish', () => {
        requestCounter.inc({ route: 'graphql', method: req.method || '', status: res.statusCode });
    });

    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    if (!(await checkRateLimit(ip))) {
        res.statusCode = 429;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ errors: [{ message: 'Too many requests' }] }));
    }

    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
    }

    // In development allow both GET and POST, in production allow only POST.
    const allowedMethods = isProduction ? ['POST'] : ['GET', 'POST'];
    if (!allowedMethods.includes(req.method || '')) {
        res.statusCode = 405;
        res.setHeader('Allow', allowedMethods.join(', '));
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ errors: [{ message: `Method ${req.method} Not Allowed` }] }));
    }

    // Validate Content-Type header for POST requests
    if (req.method === 'POST' && !validateContentType(req)) {
        res.statusCode = 415;
        res.setHeader('Content-Type', 'application/json');
        return res.end(
            JSON.stringify({ errors: [{ message: 'Unsupported Media Type. Expected application/json.' }] })
        );
    }

    // Request body parsing with size limitation for POST requests
    if (req.method === 'POST') {
        let rawBody = '';
        let bodySize = 0;
        let requestAborted = false;
        try {
            await new Promise((resolve, reject) => {
                req.on('data', (chunk) => {
                    if (requestAborted) return;
                    bodySize += chunk.length;
                    if (bodySize > MAX_REQUEST_BODY_SIZE) {
                        requestAborted = true;
                        res.statusCode = 413;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ errors: [{ message: 'Request payload too large.' }] }));
                        req.destroy(new Error('Payload Too Large'));
                        return reject(new Error('Payload Too Large'));
                    }
                    rawBody += chunk.toString('utf8');
                });
                req.on('end', () => {
                    if (!requestAborted) resolve();
                });
                req.on('error', (err) => {
                    if (!requestAborted) {
                        logger.error('Request stream error:', err);
                        errorCounter.inc({ route: 'graphql' });
                        reject(err);
                    }
                });
            });
            if (!req.body && rawBody) {
                try {
                    req.body = JSON.parse(rawBody);
                } catch (parseError) {
                    logger.error('Invalid JSON body:', parseError);
                    errorCounter.inc({ route: 'graphql' });
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(
                        JSON.stringify({ errors: [{ message: 'Invalid JSON format in request body.' }] })
                    );
                }
            }
        } catch (err) {
            if (!res.writableEnded && res.statusCode !== 413) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ errors: [{ message: 'Error processing request body.' }] }));
            }
            return;
        }
    }

    // Delegate request handling to Apollo Server
    return serverHandler(req, res);
}

/**
 * Next.js API Route Configuration.
 */
export const config = {
    api: {
        bodyParser: false,
    },
};
