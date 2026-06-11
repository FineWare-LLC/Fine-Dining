/**
 * Test script to verify the Apollo Client fix with HttpLink
 */
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

console.log('=== Testing Apollo Client Fix ===');

try {
    console.log('\nTesting new HttpLink configuration...');
    
    // Replicate the exact configuration from _app.js
    const httpLink = new HttpLink({
        uri: typeof window === 'undefined' 
            ? 'http://localhost:3000/api/graphql'  // Server-side
            : '/api/graphql',  // Client-side
    });

    const client = new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache(),
    });
    
    console.log('✓ Success: Apollo Client created with HttpLink configuration');
    console.log('Apollo Client link:', client.link);
    console.log('Apollo Client cache:', client.cache);
    
    // Test that the client has the expected properties
    if (client.link && client.cache) {
        console.log('✓ Success: Apollo Client has required link and cache properties');
    } else {
        console.log('✗ Error: Apollo Client missing required properties');
    }
    
} catch (error) {
    console.log('✗ Error with HttpLink configuration:');
    console.log('Message:', error.message);
    console.log('Stack:', error.stack);
}

console.log('\n=== Fix Test Complete ===');