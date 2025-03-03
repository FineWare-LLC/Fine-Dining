/**
 * @fileoverview Next.js API route for GraphQL endpoint with Apollo Server.
 */

import { ApolloServer } from 'apollo-server-micro';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { dbConnect } from '@/lib/dbConnect';

/**
 * @let apolloServer
 * Stores a single ApolloServer instance (singleton) to avoid reinitialization.
 */
let apolloServer;

/**
 * @constant config
 * Disables Next.js bodyParser for GraphQL requests.
 */
export const config = {
    api: {
        bodyParser: false,
    },
};

/**
 * handler
 * Ensures Apollo Server is started before handling requests,
 * connects to the DB, and sets CORS headers to avoid errors.
 * @async
 * @function
 * @param {import('next').NextApiRequest} req - Incoming request
 * @param {import('next').NextApiResponse} res - Outgoing response
 * @returns {Promise<void>} - Returns Apollo Server handler
 */
export default async function handler(req, res) {
    /* Handle preflight (OPTIONS) for CORS */
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.status(200).end();
    }

    /* Lazy-initialize ApolloServer only once */
    if (!apolloServer) {
        apolloServer = new ApolloServer({
            typeDefs,
            resolvers,
            introspection: true,
            playground: true,
        });
        await apolloServer.start();
    }

    /* Connect to DB */
    await dbConnect();

    /* Set CORS headers for POST requests */
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    /* Return Apollo server handler */
    return apolloServer.createHandler({ path: '/api/graphql' })(req, res);
}
