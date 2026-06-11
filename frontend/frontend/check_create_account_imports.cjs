const mui = require('@mui/material');

const components = [
    'StepContent', 'OutlinedInput', 'Checkbox', 'FormControl', 'InputLabel', 'MenuItem', 'Select'
];

console.log('--- CreateAccount Imports Inspection ---');
components.forEach(comp => {
    const val = mui[comp];
    console.log(`${comp}:`, typeof val);
    if (typeof val === 'object' && val !== null) {
        console.log(`  Is React Component?`, val.$$typeof ? String(val.$$typeof) : 'No $$typeof');
    }
});
