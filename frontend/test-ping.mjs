import fetch from 'node-fetch';

async function testPing() {
    console.log('Testing GraphQL ping query...');
    
    const query = `
        query {
            ping
        }
    `;
    
    try {
        const response = await fetch('http://localhost:3000/api/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const text = await response.text();
            console.error('Response body:', text);
            return;
        }
        
        const result = await response.json();
        console.log('Ping result:', result);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testPing();