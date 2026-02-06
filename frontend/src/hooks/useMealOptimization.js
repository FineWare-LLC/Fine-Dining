/**
 * Custom hook for managing meal optimization and meal plan generation
 * Handles meal selection, nutrition targets, and optimization state
 */

import { useMutation } from '@apollo/client/react';
import { useState, useCallback, useMemo } from 'react';
import { CreateMealDocument } from '@/gql/graphql';

/**
 * Custom hook for meal optimization management
 * @param {Object} options - Configuration options
 * @param {string} options.defaultMealPlanId - Default meal plan ID for adding meals
 * @returns {Object} Meal optimization data and control functions
 */
export const useMealOptimization = (options = {}) => {
    const { defaultMealPlanId = 'default-meal-plan' } = options;

    // State management
    const [selectedMeals, setSelectedMeals] = useState([]);
    const [selectedMealData, setSelectedMealData] = useState({});
    const [customNutritionTargets, setCustomNutritionTargets] = useState(null);
    const [optimizedMealPlan, setOptimizedMealPlan] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [optimizationLoading, setOptimizationLoading] = useState(false);
    const [optimizationError, setOptimizationError] = useState(null);

    const [createMeal] = useMutation(CreateMealDocument);

    const selectedMealsCount = selectedMeals.length;
    const selectedMealsList = useMemo(
        () => selectedMeals.map(id => selectedMealData[id]).filter(Boolean),
        [selectedMeals, selectedMealData],
    );

    // Meal selection management
    const handleMealSelection = useCallback((mealId) => {
        setSelectedMeals(prev => {
            if (prev.includes(mealId)) {
                return prev.filter(id => id !== mealId);
            } else {
                return [...prev, mealId];
            }
        });
    }, []);

    const handleMealSelectionData = useCallback((meal, isSelected) => {
        if (!meal?.id) return;
        setSelectedMealData(prev => {
            if (!isSelected) {
                const next = { ...prev };
                delete next[meal.id];
                return next;
            }
            return {
                ...prev,
                [meal.id]: meal,
            };
        });
    }, []);

    // Select multiple meals at once
    const selectMeals = useCallback((mealIds) => {
        setSelectedMeals(prev => {
            const newIds = Array.isArray(mealIds) ? mealIds : [mealIds];
            const uniqueIds = [...new Set([...prev, ...newIds])];
            return uniqueIds;
        });
    }, []);

    // Clear all selected meals
    const clearSelectedMeals = useCallback(() => {
        setSelectedMeals([]);
        setSelectedMealData({});
    }, []);

    // Check if a meal is selected
    const isMealSelected = useCallback((mealId) => {
        return selectedMeals.includes(mealId);
    }, [selectedMeals]);

    // Nutrition targets management
    const handleNutritionTargetsChange = useCallback((values) => {
        setCustomNutritionTargets(values);
    }, []);

    // Clear nutrition targets
    const clearNutritionTargets = useCallback(() => {
        setCustomNutritionTargets(null);
    }, []);

    // Tab management
    const handleTabChange = useCallback((event, newValue) => {
        setTabValue(newValue);
    }, []);

    const buildConstraints = useCallback(() => {
        const defaults = {
            caloriesMin: 2200,
            caloriesMax: 2600,
            proteinMin: 100,
            proteinMax: 160,
            carbohydratesMin: 250,
            carbohydratesMax: 350,
            fatMin: 50,
            fatMax: 90,
            sodiumMin: 1500,
            sodiumMax: 2300,
        };
        const targets = { ...defaults, ...(customNutritionTargets || {}) };
        return {
            calories: { min: targets.caloriesMin, max: targets.caloriesMax },
            protein: { min: targets.proteinMin, max: targets.proteinMax },
            carbohydrates: { min: targets.carbohydratesMin, max: targets.carbohydratesMax },
            fat: { min: targets.fatMin, max: targets.fatMax },
            sodium: { min: targets.sodiumMin, max: targets.sodiumMax },
        };
    }, [customNutritionTargets]);

    const buildOptimizationMeals = useCallback(() => {
        return selectedMealsList.map(meal => {
            const carbs = Number(meal.nutrition?.carbohydrates ?? 0);
            const protein = Number(meal.nutrition?.protein ?? 0);
            const fat = Number(meal.nutrition?.fat ?? 0);
            const calories = Number(meal.nutrition?.calories ?? (carbs * 4 + protein * 4 + fat * 9));

            return {
                id: meal.id,
                meal_name: meal.mealName,
                price: Number(meal.price ?? 0),
                calories,
                protein,
                carbohydrates: carbs,
                fat,
                sodium: Number(meal.nutrition?.sodium ?? 0),
            };
        });
    }, [selectedMealsList]);

    // Generate optimized meal plan
    const handleGenerateOptimizedPlan = useCallback(async () => {
        setOptimizedMealPlan(null); // Clear any previous results
        setOptimizationError(null);

        const mealsPayload = buildOptimizationMeals();
        if (mealsPayload.length === 0) {
            setOptimizationError(new Error('Select at least one meal with nutrition data.'));
            return;
        }

        setOptimizationLoading(true);
        try {
            const response = await fetch('/api/optimize-meals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meals: mealsPayload,
                    constraints: buildConstraints(),
                }),
            });

            if (!response.ok) {
                throw new Error(`Optimization failed (${response.status})`);
            }

            const result = await response.json();
            if (result.status !== 'optimal') {
                throw new Error(result.message || 'No optimal meal plan found');
            }

            const meals = (result.mealPlan || []).map(item => {
                const mealId = item.mealId || item.mealName;
                const pricePerServing = item.servings > 0 ? item.totalCost / item.servings : 0;
                return {
                    mealId,
                    mealName: item.mealName,
                    servings: item.servings,
                    pricePerServing,
                    totalPrice: item.totalCost,
                    nutrition: {
                        carbohydrates: item.totalCarbs / Math.max(item.servings, 1) || 0,
                        protein: item.totalProtein / Math.max(item.servings, 1) || 0,
                        fat: item.totalFat / Math.max(item.servings, 1) || 0,
                        sodium: item.totalSodium / Math.max(item.servings, 1) || 0,
                    },
                };
            });

            const totals = result.totalNutrition || {};
            const mapped = {
                meals,
                totalCost: totals.cost ?? 0,
                totalNutrition: {
                    carbohydrates: totals.carbohydrates ?? 0,
                    protein: totals.protein ?? 0,
                    fat: totals.fat ?? 0,
                    sodium: totals.sodium ?? 0,
                },
            };

            setOptimizedMealPlan(mapped);
            setTabValue(2);
        } catch (error) {
            console.error('Error generating optimized meal plan:', error);
            setOptimizationError(error);
        } finally {
            setOptimizationLoading(false);
        }
    }, [buildConstraints, buildOptimizationMeals]);

    // Add selected meals to meal plan
    const handleAddMeals = useCallback(async (meals, mealPlanId = defaultMealPlanId) => {
        try {
            const addPromises = meals.map(meal =>
                createMeal({
                    variables: {
                        mealPlanId,
                        date: new Date().toISOString(),
                        mealType: 'DINNER', // TODO: Make this configurable
                        mealName: meal.mealName,
                        price: meal.price,
                        nutrition: meal.nutrition,
                        allergens: meal.allergens,
                    },
                }),
            );

            await Promise.all(addPromises);
            setSelectedMeals([]);
            return { success: true };
        } catch (err) {
            console.error('Error adding meals:', err);
            return { success: false, error: err };
        }
    }, [createMeal, defaultMealPlanId]);

    // Reset all optimization state
    const resetOptimization = useCallback(() => {
        setSelectedMeals([]);
        setCustomNutritionTargets(null);
        setOptimizedMealPlan(null);
        setTabValue(0);
    }, []);

    // Clear optimization results
    const clearOptimizationResults = useCallback(() => {
        setOptimizedMealPlan(null);
    }, []);

    return {
    // State
        selectedMeals,
        customNutritionTargets,
        optimizedMealPlan,
        tabValue,

        // Loading and error states
        optimizationLoading,
        optimizationError,

        // Meal selection actions
        handleMealSelection,
        handleMealSelectionData,
        selectMeals,
        clearSelectedMeals,
        isMealSelected,

        // Nutrition targets actions
        handleNutritionTargetsChange,
        clearNutritionTargets,

        // Tab management
        handleTabChange,

        // Optimization actions
        handleGenerateOptimizedPlan,
        handleAddMeals,
        resetOptimization,
        clearOptimizationResults,

        // Computed values
        hasSelectedMeals: selectedMealsCount > 0,
        selectedMealsCount,
        hasNutritionTargets: !!customNutritionTargets,
        hasOptimizationResults: !!optimizedMealPlan,
        canGenerate: selectedMealsCount > 0 || customNutritionTargets,
        isGenerating: optimizationLoading,
        hasOptimizationError: !!optimizationError,
    };
};

export default useMealOptimization;
