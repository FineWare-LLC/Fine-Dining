import { useMutation } from '@apollo/client';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import styles from '../../../styles/MealEntryForm.module.css';
import { CreateMealDocument } from '@/gql/graphql';

// --- MUI Imports ---
// Import createFilterOptions for default filtering + freeSolo handling
import ALLERGENS_LIST from '@/lib/Words/Allergens.js';

// Debounce helper function (remains the same)
function debounce(func, wait) { /* ... */ let timeout; return function executedFunction(...args) { const later = () => { clearTimeout(timeout); func(...args); }; clearTimeout(timeout); timeout = setTimeout(later, wait); }; }


// Optional: Verify the beginning of the list
// console.log("Prioritized List Start:", PRIORITIZED_ALLERGENS_LIST.slice(0, 20));


// --- Validation Logic (remains the same) ---
const isNonNegativeNumber = (value) => { /* ... */ const num = Number(value); return value === '' || (!isNaN(num) && num >= 0); };
const isPositiveNumber = (value) => { /* ... */ const num = Number(value); return value === '' || (!isNaN(num) && num > 0); };
const validate = (data) => { /* ... keep existing validation ... */
    const formErrors = {};
    if (!data.restaurantName?.trim()) formErrors.restaurantName = 'Restaurant Name is required.'; else if (data.restaurantName.length > 100) formErrors.restaurantName = 'Max 100 characters.';
    if (!data.mealName?.trim()) formErrors.mealName = 'Meal Name is required.'; else if (data.mealName.length > 150) formErrors.mealName = 'Max 150 characters.';
    if (data.estPrice && !isPositiveNumber(data.estPrice)) formErrors.estPrice = 'Price must be a positive number.';
    const numericFields = ['calories', 'protein', 'carbohydrates', 'fat', 'sodium']; numericFields.forEach(field => { if (data[field] && !isNonNegativeNumber(data[field])) { const fieldName = field.charAt(0).toUpperCase() + field.slice(1); formErrors[field] = `${fieldName} must be a non-negative number.`; } });
    if (data.allergens && data.allergens.some(a => typeof a === 'string' && a.length > 50)) { formErrors.allergens = 'Individual allergens should not exceed 50 characters.'; }
    if (data.website) { formErrors.honeypot = 'Bot detected.'; console.warn('Honeypot field filled!'); }
    return formErrors;
};

// --- Filter Options - Default Filtering + freeSolo Add ---
// We use the default filter logic from MUI, which will respect the order
// of our PRIORITIZED_ALLERGENS_LIST. We only add the freeSolo logic.
const filter = createFilterOptions();

const filterOptionsWithFreeSolo = (options, params) => {
    // Apply default filtering logic (respects order in options)
    const filtered = filter(options, params);
    const { inputValue } = params;

    // Suggest the creation of a new value for freeSolo
    const isExisting = options.some((option) => inputValue === option); // Check against the full PRIORITIZED list
    if (inputValue !== '' && !isExisting) {
        // Avoid adding if the input *value* is already in the filtered list
        const alreadyInFiltered = filtered.some((option) => inputValue === option);
        if (!alreadyInFiltered) {
            // Add the raw input value as a suggestion
            // Make sure getOptionLabel handles raw strings correctly
            filtered.push(inputValue);
            // OR use object: filtered.push({ inputValue: inputValue, label: `Add "${inputValue}"` });
            // Remember to adjust getOptionLabel if using the object format:
            // getOptionLabel={(option) => typeof option === 'string' ? option : (option.label || '')}
        }
    }
    return filtered;
};


// --- React Component ---
function MealEntryForm() {
    const [formData, setFormData] = useState({
        restaurantName: '', mealName: '', estPrice: '', calories: '', protein: '',
        carbohydrates: '', fat: '', sodium: '', allergens: [], website: '',
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef(null);

    // GraphQL mutation hook
    const [createMeal, { loading, error }] = useMutation(CreateMealDocument, {
        onCompleted: (data) => {
            alert('Meal created successfully!');
            setFormData({
                restaurantName: '', mealName: '', estPrice: '', calories: '', protein: '',
                carbohydrates: '', fat: '', sodium: '', allergens: [], website: '',
            });
            setErrors({});
            setIsSubmitting(false);
        },
        onError: (error) => {
            console.error('Error creating meal:', error);
            setErrors(prevErrors => ({
                ...prevErrors,
                submit: error.message || 'An error occurred while creating the meal.',
            }));
            setIsSubmitting(false);
        },
    });

    // Debounced validation (remains the same)
    const debouncedValidate = useMemo(
        () => debounce((data) => {
            /* ... */ if (!isSubmitting) {
                setErrors(prevErrors => ({...prevErrors, ...validate(data)}));
            }
        }, 500),
        [isSubmitting],
    );

    // Effect for debounced validation (remains the same)
    useEffect(() => { /* ... */ const dataToCheck = { ...formData }; delete dataToCheck.allergens; if (Object.values(dataToCheck).some(val => typeof val === 'string' && val !== '') && !isSubmitting) { debouncedValidate(formData); } }, [ formData, debouncedValidate, isSubmitting ]);

    // Standard input handler (remains the same)
    const handleChange = (event) => { /* ... */ const {name, value} = event.target; setFormData(prevState => ({...prevState, [name]: value})); if (errors[name]) { setErrors(prevErrors => ({...prevErrors, [name]: undefined})); } if (name !== 'allergens') { debouncedValidate({...formData, [name]: value}); } };

    // Allergen Autocomplete handler (remains the same)
    const handleAllergenChange = (event, newValue) => { /* ... */ let processedValues = []; if (Array.isArray(newValue)) { processedValues = newValue.map(item => { if (typeof item === 'string') { return item.trim(); } if (item && item.inputValue) { return item.inputValue.trim(); } return null; }).filter(value => value && value.length > 0); } const uniqueValues = [...new Set(processedValues)]; setFormData(prevState => { const newState = { ...prevState, allergens: uniqueValues.sort() }; const allergenValidationError = validate(newState).allergens; setErrors(prevErrors => ({ ...prevErrors, allergens: allergenValidationError })); return newState; }); };

    // Submit handler
    const handleSubmit = (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        const formErrors = validate(formData);
        setErrors(formErrors);

        if (Object.keys(formErrors).length === 0) {
            console.log('Form is valid...');

            // Prepare data for submission
            const submissionData = Object.keys(formData).reduce((acc, key) => {
                if (key === 'website') return acc; // Skip honeypot field
                if (key === 'allergens') {
                    acc[key] = Array.isArray(formData[key]) ? formData[key].map(a => a.trim()).filter(a => a) : [];
                } else {
                    acc[key] = typeof formData[key] === 'string' ? formData[key].trim() : formData[key];
                }
                return acc;
            }, {});

            console.log('Submitting:', submissionData);

            // Prepare variables for GraphQL mutation
            const variables = {
                mealPlanId: 'YOUR_MEAL_PLAN_ID', // This should be dynamically set based on the current user's meal plan
                date: new Date().toISOString(), // This should be set based on user input or context
                mealType: 'DINNER', // This should be set based on user input or context
                mealName: submissionData.mealName,
                price: parseFloat(submissionData.estPrice) || 0,
                ingredients: submissionData.ingredients || [],
                nutrition: {
                    carbohydrates: parseFloat(submissionData.carbohydrates) || 0,
                    protein: parseFloat(submissionData.protein) || 0,
                    fat: parseFloat(submissionData.fat) || 0,
                    sodium: parseFloat(submissionData.sodium) || 0,
                },
                allergens: submissionData.allergens || [],
            };

            // Call the mutation
            createMeal({ variables });

        } else {
            console.log('Form errors:', formErrors);
            setIsSubmitting(false);
            const firstErrorField = Object.keys(formErrors)[0];
            if (firstErrorField && formRef.current) {
                const el = formRef.current.querySelector(`[name="${firstErrorField}"]`) ||
                          formRef.current.querySelector('#allergens-autocomplete-input');
                if (el) el.focus();
            }
        }
    };

    // --- Render Component ---
    return (
        <form ref={formRef} onSubmit={handleSubmit} noValidate className={styles['meal-form']}>
            <h2 className={styles['meal-form__title']}>Enter New Meal Information</h2>

            {/* Honeypot */}
            <div className={styles['meal-form__honeypot']} aria-hidden="true"> <label htmlFor="website">Website</label> <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" value={formData.website} onChange={handleChange}/> </div>


            {/* Standard Fields */}
            {Object.keys(formData).filter(key => key !== 'website' && key !== 'allergens').map((key) => { /* ... Renders standard inputs ... */ const labelText = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); let inputType='text'; let step, min, maxLength, placeholder=''; if (['estPrice','calories','protein','carbohydrates','fat','sodium'].includes(key)) { inputType='number'; min='0'; step=(key === 'estPrice')?'0.01':'any'; } if (key === 'restaurantName') maxLength=100; if (key === 'mealName') maxLength=150; const isRequired = ['restaurantName','mealName'].includes(key); const errorId=`${key}-error`; return (<div key={key} className={styles['meal-form__group']}> <label htmlFor={key} className={styles['meal-form__label']}>{labelText}{isRequired?'*':''}:</label> <input type={inputType} id={key} name={key} className={`${styles['meal-form__input']} ${errors[key]?styles['meal-form__input--error']:''}`} value={formData[key]} onChange={handleChange} required={isRequired} step={step} min={min} maxLength={maxLength} placeholder={placeholder} aria-describedby={errors[key]?errorId:undefined} aria-invalid={!!errors[key]} /> {errors[key] && <p id={errorId} className={styles['meal-form__error']} role="alert">{errors[key]}</p>} </div>); })}

            {/* --- Allergen Selector Section --- */}
            <div className={styles['meal-form__group']}>
                <Autocomplete
                    multiple
                    freeSolo
                    id="allergens-autocomplete"
                    // *** USE THE PRE-PRIORITIZED LIST ***
                    options={ALLERGENS_LIST}
                    value={formData.allergens}
                    onChange={handleAllergenChange}
                    isOptionEqualToValue={(option, value) => option === value}
                    // Using raw string for "Add" option, so simple label function works
                    getOptionLabel={(option) => option}
                    // *** USE Default Filtering + freeSolo Add Logic ***
                    filterOptions={filterOptionsWithFreeSolo}
                    renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                            <Chip key={option} label={option} variant="outlined" {...getTagProps({ index })} />
                        ))
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            id="allergens-autocomplete-input"
                            label="Select or Add Allergens (if any)"
                            placeholder="Type to filter or add new"
                            variant="outlined"
                            error={!!errors.allergens}
                            helperText={errors.allergens}
                        />
                    )}
                />
            </div>

            {/* Submit Button */}
            <button type="submit" className={styles['meal-form__button']} disabled={isSubmitting}> {isSubmitting ? 'Submitting...' : 'Add Meal'} </button>
        </form>
    );
}

export default MealEntryForm;
