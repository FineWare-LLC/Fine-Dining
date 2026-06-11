const icons = require('@mui/icons-material');

const components = [
    'Edit', 'Delete', 'Add', 'People', 'Restaurant', 'MenuBook', 'Analytics'
];

console.log('--- Admin Icons Inspection ---');
components.forEach(comp => {
    const val = icons[comp];
    console.log(`${comp}:`, typeof val);
    if (typeof val === 'object' && val !== null) {
        console.log(`  Is React Component?`, val.$$typeof ? String(val.$$typeof) : 'No $$typeof');
    }
});
