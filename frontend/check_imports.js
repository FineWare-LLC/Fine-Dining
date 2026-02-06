const apollo = require('@apollo/client');
console.log('--- @apollo/client Exports ---');
console.log(Object.keys(apollo));

try {
  const apolloReact = require('@apollo/client/react');
  console.log('\n--- @apollo/client/react Exports ---');
  console.log(Object.keys(apolloReact));
} catch (e) {
  console.log('\n--- @apollo/client/react NOT FOUND or Error ---');
  console.log(e.message);
}

try {
  const apolloReactComponents = require('@apollo/client/react/components');
  console.log('\n--- @apollo/client/react/components Exports ---');
  console.log(Object.keys(apolloReactComponents));
} catch (e) {
  console.log('\n--- @apollo/client/react/components NOT FOUND ---');
}
