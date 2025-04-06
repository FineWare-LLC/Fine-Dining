/**
 * @fileoverview Next.js API route for GraphQL endpoint using Apollo Server v4+.
 * Uses @apollo/server and @as-integrations/next.
 * CORS needs to be handled externally (e.g., vercel.json, platform config, or dedicated middleware).
 */

import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/graphql/typeDefs'; // Ensure path is correct
import { resolvers } from '@/graphql/resolvers'; // Ensure path is correct
import { dbConnect } from '@/lib/dbConnect'; // Ensure path is correct

// Create the Apollo Server instance (outside the handler for efficiency)
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    // Explicitly enable introspection for development environments
    introspection: true,
    // Playground is replaced by Apollo Sandbox (enabled by default in dev)
});

// Create the Next.js handler using the integration package
// The context function handles the database connection per request
const serverHandler = startServerAndCreateNextHandler(apolloServer, {
    context: async (req, res) => {
        try {
            // Establish DB connection for this request
            await dbConnect();
            // Return an empty context (extend here for authentication if needed)
            return {};
        } catch (error) {
            console.error('Error setting up Apollo context:', error);
            throw new Error(`Context setup failed: ${error.message}`);
        }
    },
});

/**
 * Custom API handler to ensure the raw request body is parsed when needed.
 * This is necessary because Next.js body parsing is disabled for this route.
 *
 * @async
 * @function handler
 * @param {import('next').NextApiRequest} req - The incoming Next.js API request.
 * @param {import('next').NextApiResponse} res - The outgoing Next.js API response.
 * @returns {Promise<void>} Resolves when the response is handled.
 */
export default async function handler(req, res) {
    // Only attempt manual parsing for POST requests.
    if (req.method === 'POST') {
        let rawBody = '';
        // Accumulate raw data from the request stream.
        req.on('data', (chunk) => {
            rawBody += chunk;
        });
        await new Promise((resolve) => req.on('end', resolve));

        // If the body is not already set and raw data exists, attempt to parse it.
        if (!req.body && rawBody) {
            try {
                req.body = JSON.parse(rawBody);
            } catch (err) {
                console.error('Error parsing request body:', err);
                return res.status(400).json({ error: 'Invalid JSON in request body' });
            }
        }
    }

    // Delegate the request to the Apollo Server handler.
    return serverHandler(req, res);
}

/**
 * Next.js API route configuration to disable the default body parser.
 * This is required for Apollo Server's raw body handling.
 */
export const config = {
    api: {
        bodyParser: false,
    },
};
