/**
 * MealBookFlow - Build your meal book, set macro goals, and generate a plan.
 */
import DeleteModule from '@mui/icons-material/Delete';
import AddModule from '@mui/icons-material/Add';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    MenuItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import ExpandMoreModule from '@mui/icons-material/ExpandMore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { resolveMuiIcon } from '@/utils/muiIcon';
import {
    ALLERGEN_OPTIONS,
    formatAllergenLabel,
    normalizeAllergenList,
} from '@/constants/allergens';
import Autocomplete from '@mui/material/Autocomplete';

const DeleteIcon = resolveMuiIcon(DeleteModule);
const AddIcon = resolveMuiIcon(AddModule);
const ExpandMoreIcon = resolveMuiIcon(ExpandMoreModule);

const MEAL_BOOK_KEY = 'meal-book';
const LIKED_KEY = 'meal-feed-liked';

const defaultMealForm = {
    name: '',
    price: '',
    calories: '',
    protein: '',
    carbohydrates: '',
    fat: '',
    sodium: '',
    sugar: '',
    allergens: [],
    proteinType: '',
};

const defaultGoals = {
    caloriesMin: 1800,
    caloriesMax: 2200,
    proteinMin: 120,
    proteinMax: 180,
    carbohydratesMin: 180,
    carbohydratesMax: 260,
    fatMin: 50,
    fatMax: 90,
    sodiumMax: 2300,
    sugarMax: 80,
    allergensForbidden: [],
    horizonDays: 7,
    mealsPerDayMin: 3,
    mealsPerDayMax: 4,
};

const createMealId = () => `meal-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export default function MealBookFlow() {
    const [mealForm, setMealForm] = useState(defaultMealForm);
    const [bookMeals, setBookMeals] = useState([]);
    const [goals, setGoals] = useState(defaultGoals);
    const [tagLimits, setTagLimits] = useState([]);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationError, setOptimizationError] = useState(null);
    const [optimizationResults, setOptimizationResults] = useState(null);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const raw = window.localStorage.getItem(MEAL_BOOK_KEY);
            if (raw) {
                setBookMeals(JSON.parse(raw));
            }
        } catch (err) {
            console.warn('Failed to load meal book', err);
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(MEAL_BOOK_KEY, JSON.stringify(bookMeals));
        } catch (err) {
            console.warn('Failed to save meal book', err);
        }
    }, [bookMeals]);

    const handleMealFormChange = (field) => (event) => {
        setMealForm(prev => ({ ...prev, [field]: event.target.value }));
    };

    const handleGoalChange = (field) => (event) => {
        const value = event.target.value;
        setGoals(prev => ({
            ...prev,
            [field]: typeof value === 'string' ? value : Number(value),
        }));
    };

    const addMealToBook = () => {
        if (!mealForm.name.trim()) return;
        const meal = {
            id: createMealId(),
            name: mealForm.name.trim(),
            price: Number(mealForm.price) || 0,
            nutrition: {
                calories: Number(mealForm.calories) || 0,
                protein: Number(mealForm.protein) || 0,
                carbohydrates: Number(mealForm.carbohydrates) || 0,
                fat: Number(mealForm.fat) || 0,
                sodium: Number(mealForm.sodium) || 0,
                sugar: Number(mealForm.sugar) || 0,
            },
            allergens: normalizeAllergenList(mealForm.allergens),
            tags: {
                protein_type: mealForm.proteinType?.trim() || undefined,
            },
            maxServings: '',
        };

        setBookMeals(prev => [meal, ...prev]);
        setMealForm(defaultMealForm);
    };

    const removeMeal = (id) => {
        setBookMeals(prev => prev.filter(meal => meal.id !== id));
    };

    const updateMealLimit = (id, value) => {
        setBookMeals(prev => prev.map(meal => {
            if (meal.id !== id) return meal;
            return { ...meal, maxServings: value };
        }));
    };

    const importLikedMeals = () => {
        if (typeof window === 'undefined') return;
        try {
            const raw = window.localStorage.getItem(LIKED_KEY);
            if (!raw) return;
            const liked = Object.values(JSON.parse(raw));
            setBookMeals(prev => {
                const existing = new Set(prev.map(meal => meal.id));
                const additions = liked
                    .filter(meal => !existing.has(meal.id))
                    .map(meal => ({
                        id: meal.id,
                        name: meal.title,
                        price: Number(meal.price ?? 0),
                        nutrition: {
                            calories: Number(meal.calories ?? 0),
                            protein: Number(meal.nutrition?.protein ?? 0),
                            carbohydrates: Number(meal.nutrition?.carbohydrates ?? 0),
                            fat: Number(meal.nutrition?.fat ?? 0),
                            sodium: Number(meal.nutrition?.sodium ?? 0),
                            sugar: Number(meal.nutrition?.sugar ?? 0),
                        },
                        allergens: normalizeAllergenList(meal.allergens || []),
                        tags: {},
                        maxServings: '',
                    }));
                return [...additions, ...prev];
            });
        } catch (err) {
            console.warn('Failed to import liked meals', err);
        }
    };

    const addTagLimit = () => {
        setTagLimits(prev => ([
            ...prev,
            { id: createMealId(), key: 'protein_type', value: '', max: '' },
        ]));
    };

    const updateTagLimit = (id, field, value) => {
        setTagLimits(prev => prev.map(limit => {
            if (limit.id !== id) return limit;
            return { ...limit, [field]: value };
        }));
    };

    const removeTagLimit = (id) => {
        setTagLimits(prev => prev.filter(limit => limit.id !== id));
    };

    const bookTotals = useMemo(() => {
        return bookMeals.reduce((acc, meal) => {
            acc.calories += meal.nutrition.calories || 0;
            acc.protein += meal.nutrition.protein || 0;
            acc.carbohydrates += meal.nutrition.carbohydrates || 0;
            acc.fat += meal.nutrition.fat || 0;
            acc.sodium += meal.nutrition.sodium || 0;
            return acc;
        }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0, sodium: 0 });
    }, [bookMeals]);

    const buildConstraintsPayload = useCallback(() => {
        const forbiddenAllergens = normalizeAllergenList(goals.allergensForbidden);

        const perEntry = {};
        for (const meal of bookMeals) {
            const maxServings = Number(meal.maxServings);
            if (Number.isFinite(maxServings) && maxServings > 0) {
                perEntry[meal.id] = maxServings;
            }
        }

        const perTag = {};
        tagLimits.forEach(limit => {
            if (!limit.key || !limit.value || !limit.max) return;
            const maxVal = Number(limit.max);
            if (!Number.isFinite(maxVal)) return;
            if (!perTag[limit.key]) perTag[limit.key] = {};
            perTag[limit.key][limit.value] = maxVal;
        });

        return {
            horizon_days: Number(goals.horizonDays) || 7,
            serving_step: 1,
            servings_integer: true,
            meals_per_day: {
                min: Number(goals.mealsPerDayMin) || 3,
                max: Number(goals.mealsPerDayMax) || 4,
            },
            nutrition: {
                calories: { min: Number(goals.caloriesMin), max: Number(goals.caloriesMax), period: 'day' },
                protein: { min: Number(goals.proteinMin), max: Number(goals.proteinMax), period: 'day' },
                carbohydrates: { min: Number(goals.carbohydratesMin), max: Number(goals.carbohydratesMax), period: 'day' },
                fat: { min: Number(goals.fatMin), max: Number(goals.fatMax), period: 'day' },
                sodium: { max: Number(goals.sodiumMax), period: 'day' },
            },
            allergens: { forbidden: forbiddenAllergens },
            frequency: { per_entry: perEntry, per_tag: perTag },
            safety: {
                sodium: { max: Number(goals.sodiumMax) },
                sugar: { max: Number(goals.sugarMax) },
            },
        };
    }, [bookMeals, goals, tagLimits]);

    const buildMealsPayload = () => {
        return bookMeals.map(meal => ({
            id: meal.id,
            meal_name: meal.name,
            price: meal.price,
            nutrition: meal.nutrition,
            allergens: meal.allergens,
            tags: meal.tags,
        }));
    };

    const handleOptimize = async () => {
        if (bookMeals.length === 0) {
            setOptimizationError('Add at least one meal to your book first.');
            return;
        }
        setOptimizationError(null);
        setOptimizationResults(null);
        setIsOptimizing(true);

        try {
            const response = await fetch('/api/optimize-meals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meals: buildMealsPayload(),
                    constraints: buildConstraintsPayload(),
                }),
            });

            if (!response.ok) {
                throw new Error(`Optimization failed (${response.status})`);
            }

            const result = await response.json();
            if (result.status !== 'optimal') {
                throw new Error(result.message || 'No optimal meal plan found');
            }

            setOptimizationResults(result);
        } catch (error) {
            setOptimizationError(error.message || 'Optimization failed.');
        } finally {
            setIsOptimizing(false);
        }
    };

    const applyPreset = (preset) => {
        setGoals(prev => ({ ...prev, ...preset }));
    };

    return (
        <Box sx={{ display: 'grid', gap: 3 }}>
            <Card elevation={0} sx={{ borderRadius: 4, bgcolor: 'background.paper' }}>
                <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        1. Build your meal book
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Save meals you love, or add your own with nutrition facts.
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                        <Button variant="outlined" onClick={importLikedMeals}>
                            Import liked meals
                        </Button>
                        <Button variant="text" color="error" onClick={() => setBookMeals([])}>
                            Clear book
                        </Button>
                        <Chip label={`${bookMeals.length} meals in book`} />
                    </Stack>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Meal name"
                                value={mealForm.name}
                                onChange={handleMealFormChange('name')}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                label="Price"
                                value={mealForm.price}
                                onChange={handleMealFormChange('price')}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                label="Calories"
                                value={mealForm.calories}
                                onChange={handleMealFormChange('calories')}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                label="Protein (g)"
                                value={mealForm.protein}
                                onChange={handleMealFormChange('protein')}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                label="Carbs (g)"
                                value={mealForm.carbohydrates}
                                onChange={handleMealFormChange('carbohydrates')}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                label="Fat (g)"
                                value={mealForm.fat}
                                onChange={handleMealFormChange('fat')}
                            />
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <TextField
                                fullWidth
                                label="Sodium (mg)"
                                value={mealForm.sodium}
                                onChange={handleMealFormChange('sodium')}
                            />
                        </Grid>
                    </Grid>

                    <Accordion sx={{ mt: 2 }} elevation={0}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle2">Advanced nutrition & tags</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Sugar (g)"
                                        value={mealForm.sugar}
                                        onChange={handleMealFormChange('sugar')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Protein type tag"
                                        value={mealForm.proteinType}
                                        onChange={handleMealFormChange('proteinType')}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Autocomplete
                                        multiple
                                        freeSolo
                                        options={ALLERGEN_OPTIONS.map(option => option.value)}
                                        value={mealForm.allergens}
                                        onChange={(_, newValue) => {
                                            setMealForm(prev => ({
                                                ...prev,
                                                allergens: normalizeAllergenList(newValue),
                                            }));
                                        }}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    key={option}
                                                    label={formatAllergenLabel(option)}
                                                    {...getTagProps({ index })}
                                                />
                                            ))
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Meal allergens"
                                                placeholder="Select or type allergens"
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={addMealToBook}>
                            Add to book
                        </Button>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {bookMeals.length === 0 ? (
                        <Typography color="text.secondary">No meals yet. Add or import some.</Typography>
                    ) : (
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Meal</TableCell>
                                    <TableCell align="right">Calories</TableCell>
                                    <TableCell align="right">Protein</TableCell>
                                    <TableCell align="right">Carbs</TableCell>
                                    <TableCell align="right">Fat</TableCell>
                                    <TableCell align="right">Max servings</TableCell>
                                    <TableCell align="right">Remove</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {bookMeals.map((meal) => (
                                    <TableRow key={meal.id}>
                                        <TableCell>{meal.name}</TableCell>
                                        <TableCell align="right">{meal.nutrition.calories}</TableCell>
                                        <TableCell align="right">{meal.nutrition.protein}</TableCell>
                                        <TableCell align="right">{meal.nutrition.carbohydrates}</TableCell>
                                        <TableCell align="right">{meal.nutrition.fat}</TableCell>
                                        <TableCell align="right">
                                            <TextField
                                                value={meal.maxServings}
                                                onChange={(event) => updateMealLimit(meal.id, event.target.value)}
                                                size="small"
                                                placeholder="e.g. 2"
                                                inputProps={{ style: { textAlign: 'right' } }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton color="error" onClick={() => removeMeal(meal.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 4, bgcolor: 'background.paper' }}>
                <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        2. Set your macro goals
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Targets are per day. The solver scales to your selected horizon.
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => applyPreset({
                                caloriesMin: 1600,
                                caloriesMax: 1900,
                                proteinMin: 130,
                                proteinMax: 180,
                                carbohydratesMin: 120,
                                carbohydratesMax: 180,
                                fatMin: 45,
                                fatMax: 70,
                                sodiumMax: 2000,
                                sugarMax: 60,
                            })}
                        >
                            Cutting preset
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => applyPreset({
                                caloriesMin: 2000,
                                caloriesMax: 2400,
                                proteinMin: 120,
                                proteinMax: 170,
                                carbohydratesMin: 200,
                                carbohydratesMax: 280,
                                fatMin: 55,
                                fatMax: 85,
                                sodiumMax: 2300,
                                sugarMax: 80,
                            })}
                        >
                            Maintenance preset
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => applyPreset({
                                caloriesMin: 2600,
                                caloriesMax: 3200,
                                proteinMin: 160,
                                proteinMax: 220,
                                carbohydratesMin: 280,
                                carbohydratesMax: 380,
                                fatMin: 70,
                                fatMax: 110,
                                sodiumMax: 2500,
                                sugarMax: 100,
                            })}
                        >
                            Bulking preset
                        </Button>
                    </Stack>

                    <Grid container spacing={2}>
                        {[
                            { label: 'Calories Min', field: 'caloriesMin' },
                            { label: 'Calories Max', field: 'caloriesMax' },
                            { label: 'Protein Min (g)', field: 'proteinMin' },
                            { label: 'Protein Max (g)', field: 'proteinMax' },
                            { label: 'Carbs Min (g)', field: 'carbohydratesMin' },
                            { label: 'Carbs Max (g)', field: 'carbohydratesMax' },
                            { label: 'Fat Min (g)', field: 'fatMin' },
                            { label: 'Fat Max (g)', field: 'fatMax' },
                            { label: 'Sodium Max (mg)', field: 'sodiumMax' },
                            { label: 'Sugar Max (g)', field: 'sugarMax' },
                        ].map((input) => (
                            <Grid item xs={6} md={3} key={input.field}>
                                <TextField
                                    fullWidth
                                    label={input.label}
                                    type="number"
                                    value={goals[input.field]}
                                    onChange={handleGoalChange(input.field)}
                                />
                            </Grid>
                        ))}
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                multiple
                                freeSolo
                                options={ALLERGEN_OPTIONS.map(option => option.value)}
                                value={goals.allergensForbidden}
                                onChange={(_, newValue) => {
                                    setGoals(prev => ({
                                        ...prev,
                                        allergensForbidden: normalizeAllergenList(newValue),
                                    }));
                                }}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            key={option}
                                            label={formatAllergenLabel(option)}
                                            {...getTagProps({ index })}
                                        />
                                    ))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Avoid allergens"
                                        placeholder="Select allergens to avoid"
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                fullWidth
                                select
                                label="Horizon"
                                value={goals.horizonDays}
                                onChange={handleGoalChange('horizonDays')}
                            >
                                {[7, 14, 30].map((value) => (
                                    <MenuItem key={value} value={value}>{value} days</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                fullWidth
                                label="Meals/day min"
                                type="number"
                                value={goals.mealsPerDayMin}
                                onChange={handleGoalChange('mealsPerDayMin')}
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                fullWidth
                                label="Meals/day max"
                                type="number"
                                value={goals.mealsPerDayMax}
                                onChange={handleGoalChange('mealsPerDayMax')}
                            />
                        </Grid>
                        <Grid item xs={6} md={2}>
                            <TextField
                                fullWidth
                                label="Serving size"
                                value="Full servings only"
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        Food frequency limits
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Example: protein_type = chicken, max = 4 servings per plan.
                    </Typography>
                    {tagLimits.length === 0 && (
                        <Typography color="text.secondary" sx={{ mb: 2 }}>No tag limits yet.</Typography>
                    )}
                    <Stack spacing={2}>
                        {tagLimits.map(limit => (
                            <Stack key={limit.id} direction={{ xs: 'column', md: 'row' }} spacing={2}>
                                <TextField
                                    label="Tag key"
                                    value={limit.key}
                                    onChange={(event) => updateTagLimit(limit.id, 'key', event.target.value)}
                                />
                                <TextField
                                    label="Tag value"
                                    value={limit.value}
                                    onChange={(event) => updateTagLimit(limit.id, 'value', event.target.value)}
                                />
                                <TextField
                                    label="Max servings"
                                    type="number"
                                    value={limit.max}
                                    onChange={(event) => updateTagLimit(limit.id, 'max', event.target.value)}
                                />
                                <IconButton color="error" onClick={() => removeTagLimit(limit.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Stack>
                        ))}
                    </Stack>
                    <Box sx={{ mt: 2 }}>
                        <Button variant="outlined" onClick={addTagLimit} startIcon={<AddIcon />}>
                            Add tag limit
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 4, bgcolor: 'background.paper' }}>
                <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        3. Generate your meal plan
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        We will solve for cost minimum while meeting every constraint.
                    </Typography>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
                        <Chip label={`Book calories: ${Math.round(bookTotals.calories)}`} />
                        <Chip label={`Book protein: ${Math.round(bookTotals.protein)}g`} />
                        <Chip label={`Book carbs: ${Math.round(bookTotals.carbohydrates)}g`} />
                        <Chip label={`Book fat: ${Math.round(bookTotals.fat)}g`} />
                    </Stack>

                    {optimizationError && (
                        <Typography color="error" sx={{ mb: 2 }}>{optimizationError}</Typography>
                    )}

                    <Button
                        variant="contained"
                        onClick={handleOptimize}
                        disabled={isOptimizing}
                    >
                        {isOptimizing ? 'Optimizing...' : 'Get meal plan'}
                    </Button>

                    {optimizationResults && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                Optimized plan (total servings)
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Meal</TableCell>
                                        <TableCell align="right">Servings</TableCell>
                                        <TableCell align="right">Calories</TableCell>
                                        <TableCell align="right">Protein</TableCell>
                                        <TableCell align="right">Carbs</TableCell>
                                        <TableCell align="right">Fat</TableCell>
                                        <TableCell align="right">Sodium</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {optimizationResults.mealPlan?.map((item) => (
                                        <TableRow key={item.mealId || item.mealName}>
                                            <TableCell>{item.mealName}</TableCell>
                                            <TableCell align="right">{item.servings}</TableCell>
                                            <TableCell align="right">{Math.round(item.totalCalories)}</TableCell>
                                            <TableCell align="right">{Math.round(item.totalProtein)}</TableCell>
                                            <TableCell align="right">{Math.round(item.totalCarbs)}</TableCell>
                                            <TableCell align="right">{Math.round(item.totalFat)}</TableCell>
                                            <TableCell align="right">{Math.round(item.totalSodium)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
