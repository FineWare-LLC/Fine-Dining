// @ts-nocheck
/**
 * @fileoverview Dev-only API endpoint for quick login as admin or regular user.
 * This endpoint is ONLY available in development mode.
 * 
 * Usage:
 *   POST /api/dev-login  { "role": "admin" }   -> logs in as dev admin
 *   POST /api/dev-login  { "role": "user" }    -> logs in as dev regular user
 */

import jwt from 'jsonwebtoken';

const DEV_USERS = {
    admin: {
        id: 'dev-admin-001',
        name: 'Dev Admin',
        email: 'admin@dev.local',
        role: 'ADMIN',
        subscriptionPlan: 'COMMERCIAL',
        subscriptionStatus: 'active',
    },
    user: {
        id: 'dev-user-001',
        name: 'Dev User',
        email: 'user@dev.local',
        role: 'USER',
        subscriptionPlan: 'FREE',
        subscriptionStatus: 'inactive',
    },
};

export default function handler(req, res) {
    // Only allow in development.
    if (process.env.NODE_ENV !== 'development') {
        return res.status(404).json({ error: 'Not found' });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { role } = req.body || {};
    const key = (role || '').toLowerCase();

    if (!DEV_USERS[key]) {
        return res.status(400).json({ error: 'Invalid role. Use "admin" or "user".' });
    }

    const devUser = DEV_USERS[key];
    const secret = process.env.JWT_SECRET;
    const issuer = process.env.JWT_ISSUER;
    const audience = process.env.JWT_AUDIENCE;

    if (!secret) {
        return res.status(500).json({ error: 'JWT_SECRET not configured.' });
    }

    let token;

    try {
        token = jwt.sign(
            { userId: devUser.id, email: devUser.email, role: devUser.role, subscriptionPlan: devUser.subscriptionPlan },
            secret,
            {
                expiresIn: '7d',
                algorithm: 'HS256',
                ...(issuer && { issuer }),
                ...(audience && { audience }),
            },
        );
    } catch (error) {
        console.error('Dev login token issuance failed:', error);
        return res.status(500).json({ error: 'Dev login could not create a session token.' });
    }

    return res.status(200).json({
        token,
        user: devUser,
    });
}
