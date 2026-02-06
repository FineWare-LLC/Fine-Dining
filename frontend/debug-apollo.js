/**
 * Debug script to test Apollo Client configurations and identify InvariantError
 */
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

console.log('=== Apollo Client Debug Test ===');

// Test 1: Current configuration (uri parameter)
try {
    console.log('\n1. Testing current configuration with uri parameter...');
    const client1 = new ApolloClient({
        uri: '/api/graphql',
        cache: new InMemoryCache(),
    });
    console.log('✓ Success: Apollo Client created with uri parameter');
} catch (error) {
    console.log('✗ Error with uri parameter:');
    console.log('Message:', error.message);
    console.log('Stack:', error.stack);
}

// Test 2: Using HttpLink explicitly
try {
    console.log('\n2. Testing with explicit HttpLink...');
    const httpLink = new HttpLink({
        uri: '/api/graphql',
    });
    const client2 = new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache(),
    });
    console.log('✓ Success: Apollo Client created with HttpLink');
} catch (error) {
    console.log('✗ Error with HttpLink:');
    console.log('Message:', error.message);
    console.log('Stack:', error.stack);
}

// Test 3: Without any link/uri (should fail)
try {
    console.log('\n3. Testing without link/uri (should fail)...');
    const client3 = new ApolloClient({
        cache: new InMemoryCache(),
    });
    console.log('✓ Success: Apollo Client created without link/uri');
} catch (error) {
    console.log('✗ Expected error without link/uri:');
    console.log('Message:', error.message);
}

// Test 4: SSR simulation
try {
    console.log('\n4. Testing SSR simulation (no window)...');
    // Temporarily delete window to simulate SSR
    const originalWindow = global.window;
    delete global.window;
    
    const client4 = new ApolloClient({
        uri: typeof window === 'undefined' 
            ? 'http://localhost:3000/api/graphql'  
            : '/api/graphql',
        cache: new InMemoryCache(),
    });
    
    // Restore window
    global.window = originalWindow;
    console.log('✓ Success: Apollo Client created in SSR simulation');
} catch (error) {
    console.log('✗ Error in SSR simulation:');
    console.log('Message:', error.message);
    console.log('Stack:', error.stack);
}

console.log('\n=== Debug Test Complete ===');