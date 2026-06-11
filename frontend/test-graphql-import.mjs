console.log('Testing GraphQL resolvers import...');

try {
    console.log('Importing generalQueries...');
    const generalQueries = await import('./src/graphql/resolvers/queries/generalQueries.js');
    console.log('✅ generalQueries imported successfully');
    console.log('Available functions:', Object.keys(generalQueries));
    
    console.log('Testing ping function...');
    const pingResult = generalQueries.ping();
    console.log('Ping result:', pingResult);
    
    console.log('Importing all resolvers...');
    const resolvers = await import('./src/graphql/resolvers/index.js');
    console.log('✅ All resolvers imported successfully');
    
    console.log('Testing restaurant queries...');
    const restaurantQueries = await import('./src/graphql/resolvers/queries/restaurantQueries.js');
    console.log('✅ Restaurant queries imported successfully');
    console.log('Available restaurant functions:', Object.keys(restaurantQueries));
    
} catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error('Stack trace:', error.stack);
}