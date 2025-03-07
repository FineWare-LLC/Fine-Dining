/**
 * @fileoverview Next.js API route for GraphQL endpoint using Apollo Server.
 *               Handles CORS, connects to MongoDB, and provides a GraphQL interface.
 */

import { ApolloServer } from 'apollo-server-micro';
import { typeDefs } from '@/graphql/typeDefs';
import { resolvers } from '@/graphql/resolvers';
import { dbConnect } from '@/lib/dbConnect';

/**
 * A singleton variable to ensure Apollo Server is started only once.
 * @type {ApolloServer | undefined}
 */
let apolloServer;

/**
 * Disables Next.js built-in body parsing for this route since Apollo Server
 * needs raw request bodies for GraphQL operations.
 * @constant
 */
export const config = {
    api: {
        bodyParser: false,
    },
};

/**
 * An async handler function that:
 * 1. Handles preflight OPTIONS requests for CORS.
 * 2. Lazily initializes Apollo Server (singleton).
 * 3. Connects to the MongoDB database.
 * 4. Applies CORS headers for GraphQL POST requests.
 * 5. Delegates request handling to Apollo Server's createHandler.
 *
 * @async
 * @function handler
 * @param {import('next').NextApiRequest} req - The incoming Next.js API request.
 * @param {import('next').NextApiResponse} res - The outgoing Next.js API response.
 * @returns {Promise<void>} A promise that resolves once the response is handled by Apollo.
 */
export default async function handler(req, res) {
    /* (1) Handle preflight (OPTIONS) for CORS */
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.status(200).end();
    }

    /* (2) Lazy-init ApolloServer only once */
    if (!apolloServer) {
        apolloServer = new ApolloServer({
            typeDefs,
            resolvers,
            /**
             * In production, you might disable introspection or Apollo Playground for security.
             * e.g., introspection: process.env.NODE_ENV !== 'production',
             */
            introspection: true,
            /**
             * Apollo Server 3 or higher no longer includes a built-in playground by default.
             * You can enable it via a plugin or set playground options here (if using Apollo Server 2).
             */
            playground: true,
        });
        await apolloServer.start();
    }

    /* (3) Connect to DB inside a try/catch to handle potential errors */
    try {
        await dbConnect();
    } catch (error) {
        console.error('Database connection error:', error);
        return res.status(500).json({ error: 'Failed to connect to the database' });
    }

    /* (4) Set CORS headers for GraphQL requests */
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    /* (5) Hand over to Apollo Server’s request handler */
    return apolloServer.createHandler({ path: '/api/graphql' })(req, res);
}
