const mui = require('@mui/material');

const components = [
    'Table', 'TableBody', 'TableCell', 'TableContainer', 'TableHead', 'TableRow',
    'Dialog', 'DialogTitle', 'DialogContent', 'DialogActions',
    'Tabs', 'Tab', 'Paper', 'Grid', 'Card', 'CardContent', 'Chip'
];

console.log('--- Admin Page Imports Inspection ---');
components.forEach(comp => {
    const val = mui[comp];
    console.log(`${comp}:`, typeof val);
    if (typeof val === 'object' && val !== null) {
        console.log(`  Is React Component?`, val.$$typeof ? String(val.$$typeof) : 'No $$typeof');
    }
});
