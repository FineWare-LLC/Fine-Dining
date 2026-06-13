// @ts-nocheck
/**
 * plannerStore.js
 * 
 * Global state management for the meal planner using Zustand.
 * Manages day selection, dietary profiles, nutrition targets, selected meals,
 * compliance scoring, and undo/redo functionality.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Default nutrition targets
const DEFAULT_NUTRITION_TARGETS = {
    calories: { min: 1800, max: 2200, target: 2000 },
    protein: { min: 120, max: 180, target: 150 },
    carbohydrates: { min: 200, max: 300, target: 250 },
    fat: { min: 60, max: 100, target: 80 },
    sodium: { min: 1000, max: 2300, target: 1800 },
    fiber: { min: 25, max: 40, target: 30 },
    sugar: { min: 0, max: 50, target: 25 },
};

// Default dietary presets
const DEFAULT_PRESETS = [
    {
        name: 'Maintenance',
        calories: { min: 1800, max: 2200, target: 2000 },
        protein: { min: 120, max: 180, target: 150 },
        carbohydrates: { min: 200, max: 300, target: 250 },
        fat: { min: 60, max: 100, target: 80 },
    },
    {
        name: 'Cut',
        calories: { min: 1400, max: 1800, target: 1600 },
        protein: { min: 140, max: 200, target: 170 },
        carbohydrates: { min: 120, max: 200, target: 160 },
        fat: { min: 50, max: 80, target: 65 },
    },
    {
        name: 'Bulk',
        calories: { min: 2400, max: 3000, target: 2700 },
        protein: { min: 160, max: 220, target: 190 },
        carbohydrates: { min: 300, max: 400, target: 350 },
        fat: { min: 80, max: 120, target: 100 },
    },
    {
        name: 'Endurance',
        calories: { min: 2200, max: 2800, target: 2500 },
        protein: { min: 130, max: 170, target: 150 },
        carbohydrates: { min: 350, max: 450, target: 400 },
        fat: { min: 70, max: 100, target: 85 },
    },
    {
        name: 'Low Sodium',
        calories: { min: 1800, max: 2200, target: 2000 },
        protein: { min: 120, max: 180, target: 150 },
        carbohydrates: { min: 200, max: 300, target: 250 },
        fat: { min: 60, max: 100, target: 80 },
        sodium: { min: 500, max: 1500, target: 1000 },
    },
];

const NUTRIENT_KEYS = ['calories', 'protein', 'carbohydrates', 'fat', 'sodium', 'fiber', 'sugar'];
const VALID_MEAL_PLAN_TYPES = new Set(['breakfast', 'lunch', 'dinner', 'snacks']);

const MEAL_REPLACEMENT_ERROR_MESSAGES = {
    invalidPayload: 'Provide a meal to replace, a replacement meal, and a valid meal type.',
    invalidMealType: 'Select a meal type that exists in the current plan.',
    missingMeal: 'Choose a meal that already exists in the plan before swapping it.',
};

const normalizeNutritionNumber = (value) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
};

export const calculateMealNutritionTotals = (selectedMeals = []) => {
    const totals = NUTRIENT_KEYS.reduce((acc, nutrient) => {
        acc[nutrient] = 0;
        return acc;
    }, {});

    selectedMeals.forEach((meal) => {
        const nutrition = meal?.nutrition || {};
        const servings = normalizeNutritionNumber(meal?.servings || 1);
        const protein = normalizeNutritionNumber(nutrition.protein);
        const carbohydrates = normalizeNutritionNumber(nutrition.carbohydrates);
        const fat = normalizeNutritionNumber(nutrition.fat);
        const calories = Number.isFinite(Number(nutrition.calories))
            ? normalizeNutritionNumber(nutrition.calories)
            : carbohydrates * 4 + protein * 4 + fat * 9;

        totals.calories += calories * servings;
        totals.protein += protein * servings;
        totals.carbohydrates += carbohydrates * servings;
        totals.fat += fat * servings;
        totals.sodium += normalizeNutritionNumber(nutrition.sodium) * servings;
        totals.fiber += normalizeNutritionNumber(nutrition.fiber) * servings;
        totals.sugar += normalizeNutritionNumber(nutrition.sugar) * servings;
    });

    return totals;
};

export class MealReplacementValidationError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'MealReplacementValidationError';
        this.code = code;
        this.isUserSafe = true;
    }
}

const createMealReplacementValidationError = (code) => (
    new MealReplacementValidationError(
        code,
        MEAL_REPLACEMENT_ERROR_MESSAGES[code] || MEAL_REPLACEMENT_ERROR_MESSAGES.invalidPayload,
    )
);

const normalizeMealPlanType = (mealType) => (
    typeof mealType === 'string' ? mealType.trim().toLowerCase() : ''
);

const resolveMealSwapRequest = (state, oldMealId, newMeal, mealType) => {
    if (typeof oldMealId !== 'string' || !oldMealId.trim()) {
        throw createMealReplacementValidationError('invalidPayload');
    }

    if (!newMeal || typeof newMeal !== 'object' || Array.isArray(newMeal)) {
        throw createMealReplacementValidationError('invalidPayload');
    }

    if (typeof newMeal.id !== 'string' || !newMeal.id.trim()) {
        throw createMealReplacementValidationError('invalidPayload');
    }

    const normalizedMealType = normalizeMealPlanType(mealType);
    if (!VALID_MEAL_PLAN_TYPES.has(normalizedMealType)) {
        throw createMealReplacementValidationError('invalidMealType');
    }

    const mealPlanForType = state?.mealPlan?.[normalizedMealType];
    if (!Array.isArray(mealPlanForType)) {
        throw createMealReplacementValidationError('invalidMealType');
    }

    const mealIndex = mealPlanForType.findIndex((meal) => meal?.id === oldMealId);
    if (mealIndex === -1) {
        throw createMealReplacementValidationError('missingMeal');
    }

    const selectedMeals = Array.isArray(state?.selectedMeals) ? state.selectedMeals : [];
    const selectedMealIndex = selectedMeals.findIndex(
        (meal) => meal?.id === oldMealId && meal?.mealType === normalizedMealType,
    );
    if (selectedMealIndex === -1) {
        throw createMealReplacementValidationError('missingMeal');
    }

    return {
        mealIndex,
        selectedMealIndex,
        normalizedMealType,
        oldMeal: mealPlanForType[mealIndex],
    };
};

// Calculate compliance score based on current meal plan vs targets
const calculateComplianceScore = (selectedMeals, nutritionTargets) => {
    if (!selectedMeals.length) return 0;

    const totals = calculateMealNutritionTotals(selectedMeals);

    // Calculate deviation scores for each nutrient
    const deviations = Object.keys(totals).map(nutrient => {
        const target = nutritionTargets[nutrient];
        if (!target) return 1; // Perfect score if no target set

        const actual = totals[nutrient];
        const { min, max, target: targetValue } = target;

        // If within range, perfect score
        if (actual >= min && actual <= max) return 1;

        // Calculate deviation from closest boundary
        let deviation;
        if (actual < min) {
            deviation = Math.abs(actual - min) / min;
        } else {
            deviation = Math.abs(actual - max) / max;
        }

        // Cap deviation penalty at 50% to prevent single nutrients from dominating
        return Math.max(0.5, 1 - Math.min(deviation, 0.5));
    });

    // Weighted average (calories and protein have higher weight)
    const weights = {
        calories: 0.25,
        protein: 0.25,
        carbohydrates: 0.15,
        fat: 0.15,
        sodium: 0.1,
        fiber: 0.05,
        sugar: 0.05,
    };

    const weightedScore = Object.keys(totals).reduce((acc, nutrient, index) => {
        const weight = weights[nutrient] || 0.1;
        return acc + (deviations[index] * weight);
    }, 0);

    return Math.round(weightedScore * 100);
};

// Calculate strictness gauge based on nutrition targets
const calculateStrictnessGauge = (nutritionTargets) => {
    // Simple heuristic: tighter ranges = higher strictness
    const ranges = Object.values(nutritionTargets).map(target => {
        if (!target.min || !target.max) return 1;
        const range = target.max - target.min;
        const midpoint = (target.max + target.min) / 2;
        return range / midpoint; // Relative range size
    });

    const avgRange = ranges.reduce((sum, range) => sum + range, 0) / ranges.length;
    
    if (avgRange > 0.8) return 'Easy';
    if (avgRange > 0.5) return 'Moderate';
    if (avgRange > 0.3) return 'Tight';
    return 'Very Tight';
};


export const usePlannerStore = create(
    subscribeWithSelector(
        immer((set, get) => ({
            selectedDay: new Date(),
            setSelectedDay: (date) => set((state) => {
                state.selectedDay = date;
            }),

            dietaryProfile: {
                presets: DEFAULT_PRESETS,
                restrictions: [],
                preferences: [],
                dislikedIngredients: [],
            },
            nutritionTargets: DEFAULT_NUTRITION_TARGETS,
            strictnessGauge: 'Moderate',
            interestQuery: '',
            isGenerating: false,

            selectedMeals: [],
            mealPlan: {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: [],
            },

            complianceScore: 0,
            planExplanation: '',

            history: [],
            historyIndex: -1,
            canUndo: false,
            canRedo: false,

            setInterestQuery: (query) => set((state) => {
                state.interestQuery = query;
            }),

            setIsGenerating: (isGenerating) => set((state) => {
                state.isGenerating = isGenerating;
            }),

            setGeneratedPlan: (planDetails) => set((state) => {
                // Clear existing plan
                state.mealPlan = { breakfast: [], lunch: [], dinner: [], snacks: [] };
                state.selectedMeals = [];
                
                // Populate new plan
                if (planDetails && planDetails.mealPlan) {
                    planDetails.mealPlan.forEach(item => {
                        const mealType = item.mealType ? item.mealType.toLowerCase() : 'lunch';
                        // Ensure mealType is valid
                        const validTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
                        const targetType = validTypes.includes(mealType) ? mealType : 'lunch';
                        
                        const mealWithServings = { 
                            ...item.meal, 
                            servings: item.servings, 
                            mealType: targetType,
                            // Ensure ID is unique if same meal used multiple times (though solver usually aggregates)
                            uniqueId: `${item.meal.id}-${Date.now()}-${Math.random()}`
                        };
                        
                        state.mealPlan[targetType].push(mealWithServings);
                        state.selectedMeals.push(mealWithServings);
                    });
                }
                
                state.complianceScore = calculateComplianceScore(state.selectedMeals, state.nutritionTargets);
            }),

            setNutritionTargets: (targets) => set((state) => {
                state.nutritionTargets = { ...state.nutritionTargets, ...targets };
                state.strictnessGauge = calculateStrictnessGauge(state.nutritionTargets);
                state.complianceScore = calculateComplianceScore(state.selectedMeals, state.nutritionTargets);
            }),

            applyPreset: (presetName) => set((state) => {
                const preset = state.dietaryProfile.presets.find(p => p.name === presetName);
                if (preset) {
                    state.nutritionTargets = { ...state.nutritionTargets, ...preset };
                    state.strictnessGauge = calculateStrictnessGauge(state.nutritionTargets);
                    state.complianceScore = calculateComplianceScore(state.selectedMeals, state.nutritionTargets);
                }
            }),

            addMealToPlan: (meal, mealType = 'snacks', servings = 1) => set((state) => {
                const mealWithServings = { ...meal, servings, mealType };
                state.selectedMeals.push(mealWithServings);
                state.mealPlan[mealType].push(mealWithServings);
                state.complianceScore = calculateComplianceScore(state.selectedMeals, state.nutritionTargets);
                
                state.history = state.history.slice(0, state.historyIndex + 1);
                state.history.push({
                    action: 'addMeal',
                    meal: mealWithServings,
                    mealType,
                    timestamp: Date.now(),
                });
                state.historyIndex = state.history.length - 1;
                state.canUndo = true;
                state.canRedo = false;
            }),

            removeMealFromPlan: (mealId, mealType) => set((state) => {
                const mealIndex = state.mealPlan[mealType].findIndex(m => m.id === mealId);
                if (mealIndex !== -1) {
                    const removedMeal = state.mealPlan[mealType][mealIndex];
                    state.mealPlan[mealType].splice(mealIndex, 1);
                    
                    const selectedIndex = state.selectedMeals.findIndex(m => m.id === mealId);
                    if (selectedIndex !== -1) {
                        state.selectedMeals.splice(selectedIndex, 1);
                    }
                    
                    state.complianceScore = calculateComplianceScore(state.selectedMeals, state.nutritionTargets);
                    
                    state.history = state.history.slice(0, state.historyIndex + 1);
                    state.history.push({
                        action: 'removeMeal',
                        meal: removedMeal,
                        mealType,
                        timestamp: Date.now(),
                    });
                    state.historyIndex = state.history.length - 1;
                    state.canUndo = true;
                    state.canRedo = false;
                }
            }),

            updateMealServings: (mealId, servings) => set((state) => {
                const meal = state.selectedMeals.find(m => m.id === mealId);
                if (meal) {
                    const oldServings = meal.servings;
                    meal.servings = servings;
                    
                    const planMeal = state.mealPlan[meal.mealType]?.find(m => m.id === mealId);
                    if (planMeal) {
                        planMeal.servings = servings;
                    }
                    
                    state.complianceScore = calculateComplianceScore(state.selectedMeals, state.nutritionTargets);
                    
                    state.history = state.history.slice(0, state.historyIndex + 1);
                    state.history.push({
                        action: 'updateServings',
                        mealId,
                        oldServings,
                        newServings: servings,
                        timestamp: Date.now(),
                    });
                    state.historyIndex = state.history.length - 1;
                    state.canUndo = true;
                    state.canRedo = false;
                }
            }),

            swapMeal: (oldMealId, newMeal, mealType) => set((state) => {
                const {
                    mealIndex,
                    selectedMealIndex,
                    normalizedMealType,
                    oldMeal,
                } = resolveMealSwapRequest(
                    state,
                    oldMealId,
                    newMeal,
                    mealType,
                );
                const newMealWithServings = {
                    ...newMeal,
                    servings: oldMeal.servings,
                    mealType: normalizedMealType,
                };

                state.mealPlan[normalizedMealType][mealIndex] = newMealWithServings;
                state.selectedMeals[selectedMealIndex] = newMealWithServings;

                state.complianceScore = calculateComplianceScore(state.selectedMeals, state.nutritionTargets);

                state.history = state.history.slice(0, state.historyIndex + 1);
                state.history.push({
                    action: 'swapMeal',
                    oldMeal,
                    newMeal: newMealWithServings,
                    mealType: normalizedMealType,
                    timestamp: Date.now(),
                });
                state.historyIndex = state.history.length - 1;
                state.canUndo = true;
                state.canRedo = false;
            }),

            regenerateMealPlan: (mealTypes = ['breakfast', 'lunch', 'dinner']) => set((state) => {
                const oldPlan = { ...state.mealPlan };
                
                mealTypes.forEach(mealType => {
                    state.mealPlan[mealType] = [];
                });
                
                state.selectedMeals = state.selectedMeals.filter(meal => 
                    !mealTypes.includes(meal.mealType)
                );
                
                state.complianceScore = calculateComplianceScore(state.selectedMeals, state.nutritionTargets);
                
                state.history = state.history.slice(0, state.historyIndex + 1);
                state.history.push({
                    action: 'regeneratePlan',
                    oldPlan,
                    mealTypes,
                    timestamp: Date.now(),
                });
                state.historyIndex = state.history.length - 1;
                state.canUndo = true;
                state.canRedo = false;
            }),

            undo: () => set((state) => {
                if (state.historyIndex >= 0) {
                    const action = state.history[state.historyIndex];
                    
                    switch (action.action) {
                        case 'addMeal':
                            state.selectedMeals = state.selectedMeals.filter(m => m.id !== action.meal.id);
                            state.mealPlan[action.mealType] = state.mealPlan[action.mealType].filter(m => m.id !== action.meal.id);
                            break;
                        case 'removeMeal':
                            state.selectedMeals.push(action.meal);
                            state.mealPlan[action.mealType].push(action.meal);
                            break;
                        case 'updateServings':
                            const meal = state.selectedMeals.find(m => m.id === action.mealId);
                            if (meal) {
                                meal.servings = action.oldServings;
                                const planMeal = state.mealPlan[meal.mealType]?.find(m => m.id === action.mealId);
                                if (planMeal) planMeal.servings = action.oldServings;
                            }
                            break;
                        case 'swapMeal':
                            const mealIndex = state.mealPlan[action.mealType].findIndex(m => m.id === action.newMeal.id);
                            if (mealIndex !== -1) {
                                state.mealPlan[action.mealType][mealIndex] = action.oldMeal;
                                const selectedIndex = state.selectedMeals.findIndex(m => m.id === action.newMeal.id);
                                if (selectedIndex !== -1) {
                                    state.selectedMeals[selectedIndex] = action.oldMeal;
                                }
                            }
                            break;
                    }
                    
                    state.historyIndex--;
                    state.canUndo = state.historyIndex >= 0;
                    state.canRedo = true;
                    state.complianceScore = calculateComplianceScore(state.selectedMeals, state.nutritionTargets);
                }
            }),

            redo: () => set((state) => {
                if (state.historyIndex < state.history.length - 1) {
                    state.historyIndex++;
                    const action = state.history[state.historyIndex];
                    
                    switch (action.action) {
                        case 'addMeal':
                            state.selectedMeals.push(action.meal);
                            state.mealPlan[action.mealType].push(action.meal);
                            break;
                        case 'removeMeal':
                            state.selectedMeals = state.selectedMeals.filter(m => m.id !== action.meal.id);
                            state.mealPlan[action.mealType] = state.mealPlan[action.mealType].filter(m => m.id !== action.meal.id);
                            break;
                        case 'updateServings':
                            const meal = state.selectedMeals.find(m => m.id === action.mealId);
                            if (meal) {
                                meal.servings = action.newServings;
                                const planMeal = state.mealPlan[meal.mealType]?.find(m => m.id === action.mealId);
                                if (planMeal) planMeal.servings = action.newServings;
                            }
                            break;
                        case 'swapMeal':
                            const mealIndex = state.mealPlan[action.mealType].findIndex(m => m.id === action.oldMeal.id);
                            if (mealIndex !== -1) {
                                state.mealPlan[action.mealType][mealIndex] = action.newMeal;
                                const selectedIndex = state.selectedMeals.findIndex(m => m.id === action.oldMeal.id);
                                if (selectedIndex !== -1) {
                                    state.selectedMeals[selectedIndex] = action.newMeal;
                                }
                            }
                            break;
                    }
                    
                    state.canUndo = true;
                    state.canRedo = state.historyIndex < state.history.length - 1;
                    state.complianceScore = calculateComplianceScore(state.selectedMeals, state.nutritionTargets);
                }
            }),

            getDailyTotals: () => {
                const state = get();
                return calculateMealNutritionTotals(state.selectedMeals);
            },

            exportGroceryList: () => {
                const state = get();
                const ingredients = {};
                
                state.selectedMeals.forEach(meal => {
                    if (meal.ingredients) {
                        meal.ingredients.forEach(ingredient => {
                            const key = ingredient.name.toLowerCase();
                            if (ingredients[key]) {
                                ingredients[key].quantity += ingredient.quantity * (meal.servings || 1);
                            } else {
                                ingredients[key] = {
                                    name: ingredient.name,
                                    quantity: ingredient.quantity * (meal.servings || 1),
                                    unit: ingredient.unit,
                                };
                            }
                        });
                    }
                });
                
                return Object.values(ingredients);
            },
        }))
    )
);
