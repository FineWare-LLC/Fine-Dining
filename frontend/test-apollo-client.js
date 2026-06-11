/**
 * Test script to reproduce Apollo Client error
 */
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

console.log('Testing Apollo Client configuration...');

try {
    // Test the current configuration from _app.js
    const client = new ApolloClient({
        uri: '/api/graphql',
        cache: new InMemoryCache(),
    });
    
    console.log('Apollo Client created successfully');
    console.log('Client:', client);
    
} catch (error) {
    console.error('Error creating Apollo Client:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
}

// Test with absolute URI
try {
    console.log('\nTesting with absolute URI...');
    const clientWithAbsoluteUri = new ApolloClient({
        uri: 'http://localhost:3000/api/graphql',
        cache: new InMemoryCache(),
    });
    
    console.log('Apollo Client with absolute URI created successfully');
    
} catch (error) {
    console.error('Error creating Apollo Client with absolute URI:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
}

// Test with HttpLink
try {
    console.log('\nTesting with HttpLink...');
    const httpLink = new HttpLink({
        uri: '/api/graphql',
    });
    
    const clientWithHttpLink = new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache(),
    });
    
    console.log('Apollo Client with HttpLink created successfully');
    
} catch (error) {
    console.error('Error creating Apollo Client with HttpLink:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
}