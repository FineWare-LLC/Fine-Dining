/**
 * Custom hook for managing meal optimization and meal plan generation
 * Handles meal selection, nutrition targets, and optimization state
 */

import { useState, useCallback } from 'react';
import { useMutation, gql } from '@apollo/client';
import { CreateMealDocument } from '@/gql/graphql';

const GENERATE_OPTIMIZED_MEAL_PLAN = gql`
  mutation GenerateOptimizedMealPlan($selectedMealIds: [ID], $customNutritionTargets: CustomNutritionTargetsInput) {
    generateOptimizedMealPlan(selectedMealIds: $selectedMealIds, customNutritionTargets: $customNutritionTargets) {
      meals {
        mealId
        mealName
        servings
        pricePerServing
        totalPrice
        nutrition {
          carbohydrates
          protein
          fat
          sodium
        }
      }
      totalCost
      totalNutrition {
        carbohydrates
        protein
        fat
        sodium
      }
    }
  }
`;

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
  const [customNutritionTargets, setCustomNutritionTargets] = useState(null);
  const [optimizedMealPlan, setOptimizedMealPlan] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // GraphQL mutations
  const [generateOptimizedMealPlan, { 
    loading: optimizationLoading, 
    error: optimizationError 
  }] = useMutation(GENERATE_OPTIMIZED_MEAL_PLAN, {
    onCompleted: (data) => {
      setOptimizedMealPlan(data.generateOptimizedMealPlan);
      // Switch to the results tab
      setTabValue(2);
    },
    onError: (error) => {
      console.error('Error generating optimized meal plan:', error);
    }
  });

  const [createMeal] = useMutation(CreateMealDocument);

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

  // Generate optimized meal plan
  const handleGenerateOptimizedPlan = useCallback(() => {
    setOptimizedMealPlan(null); // Clear any previous results
    generateOptimizedMealPlan({
      variables: {
        selectedMealIds: selectedMeals.length > 0 ? selectedMeals : undefined,
        customNutritionTargets: customNutritionTargets
      }
    });
  }, [generateOptimizedMealPlan, selectedMeals, customNutritionTargets]);

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
          }
        })
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
    hasSelectedMeals: selectedMeals.length > 0,
    selectedMealsCount: selectedMeals.length,
    hasNutritionTargets: !!customNutritionTargets,
    hasOptimizationResults: !!optimizedMealPlan,
    canGenerate: selectedMeals.length > 0 || customNutritionTargets,
    isGenerating: optimizationLoading,
    hasOptimizationError: !!optimizationError,
  };
};

export default useMealOptimization;