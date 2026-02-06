const mui = require('@mui/material');

const components = [
    'Box', 'Button', 'Stepper', 'Step', 'StepLabel', 'StepButton',
    'RadioGroup', 'FormControlLabel', 'Radio', 'TextField', 'Typography'
];

console.log('--- QuestionnaireWizard Imports Inspection ---');
components.forEach(comp => {
    const val = mui[comp];
    console.log(`${comp}:`, typeof val);
    if (typeof val === 'object' && val !== null) {
        console.log(`  Is React Component?`, val.$$typeof ? String(val.$$typeof) : 'No $$typeof');
        console.log(`  Keys:`, Object.keys(val));
    }
});
