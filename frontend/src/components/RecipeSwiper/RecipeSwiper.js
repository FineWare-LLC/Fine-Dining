import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@apollo/client/react';
import { Loader2, Settings, RefreshCw } from 'lucide-react';
import SwipeCard from './SwipeCard';
import { GET_MEALS_WITH_FILTERS } from '@/graphql/queries';
import { SAVE_RECIPE_MUTATION, REJECT_RECIPE_MUTATION } from '@/graphql/mutations';

const RecipeSwiper = ({ 
  initialFilters = {}, 
  onRecipeSaved, 
  onRecipeRejected,
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedRecipes, setSwipedRecipes] = useState(new Set());
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    ...initialFilters
  });

  // GraphQL queries and mutations
  const { data, loading, error, fetchMore, refetch } = useQuery(GET_MEALS_WITH_FILTERS, {
    variables: filters,
    errorPolicy: 'partial',
    fetchPolicy: 'cache-and-network',
  });

  const [saveRecipe] = useMutation(SAVE_RECIPE_MUTATION, {
    onCompleted: (data) => {
      console.log('Recipe saved successfully:', data);
      onRecipeSaved?.(data.saveRecipe);
    },
    onError: (error) => {
      console.error('Error saving recipe:', error);
    }
  });

  const [rejectRecipe] = useMutation(REJECT_RECIPE_MUTATION, {
    onCompleted: (data) => {
      console.log('Recipe rejected successfully:', data);
      onRecipeRejected?.(data.rejectRecipe);
    },
    onError: (error) => {
      console.error('Error rejecting recipe:', error);
    }
  });

  // Get available recipes from meals
  const availableRecipes = useMemo(() => {
    if (!data?.getMealsWithFilters?.meals) return [];
    
    return data.getMealsWithFilters.meals
      .filter(meal => meal.recipe && !swipedRecipes.has(meal.recipe.id))
      .map(meal => meal.recipe);
  }, [data?.getMealsWithFilters?.meals, swipedRecipes]);

  // Get current stack of cards to display (current + next 2)
  const visibleCards = useMemo(() => {
    return availableRecipes.slice(currentIndex, currentIndex + 3);
  }, [availableRecipes, currentIndex]);

  // Handle swipe actions
  const handleSwipe = useCallback(async (recipeId, action) => {
    const recipe = availableRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    // Add to swiped set immediately for UI responsiveness
    setSwipedRecipes(prev => new Set(prev).add(recipeId));
    
    // Move to next card
    setCurrentIndex(prev => prev + 1);

    // Execute the appropriate mutation
    try {
      if (action === 'like') {
        await saveRecipe({
          variables: { recipeId: recipeId }
        });
      } else if (action === 'reject') {
        await rejectRecipe({
          variables: { recipeId: recipeId }
        });
      }
    } catch (error) {
      // Revert the swipe if the mutation fails
      setSwipedRecipes(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipeId);
        return newSet;
      });
      setCurrentIndex(prev => prev - 1);
    }
  }, [availableRecipes, saveRecipe, rejectRecipe]);

  // Load more recipes when running low
  useEffect(() => {
    const remainingCards = availableRecipes.length - currentIndex;
    const shouldLoadMore = remainingCards <= 3 && data?.getMealsWithFilters?.hasNextPage;

    if (shouldLoadMore && !loading) {
      fetchMore({
        variables: {
          ...filters,
          page: filters.page + 1
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          
          return {
            getMealsWithFilters: {
              ...fetchMoreResult.getMealsWithFilters,
              meals: [
                ...prev.getMealsWithFilters.meals,
                ...fetchMoreResult.getMealsWithFilters.meals
              ]
            }
          };
        }
      });

      setFilters(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [currentIndex, availableRecipes.length, data?.getMealsWithFilters?.hasNextPage, loading, fetchMore, filters]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setCurrentIndex(0);
    setSwipedRecipes(new Set());
    setFilters(prev => ({ ...prev, page: 1 }));
    refetch();
  }, [refetch]);

  // Handle filter updates
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }));
    setCurrentIndex(0);
    setSwipedRecipes(new Set());
  }, []);

  if (loading && !data) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Finding delicious recipes for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading recipes</p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (visibleCards.length === 0) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <p className="text-gray-600 mb-4 text-lg">
            No more recipes to explore!
          </p>
          <p className="text-gray-500 mb-6">
            You've seen all available recipes matching your preferences.
          </p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-96 ${className}`}>
      {/* Card Stack */}
      <AnimatePresence mode="popLayout">
        {visibleCards.map((recipe, index) => (
          <SwipeCard
            key={recipe.id}
            recipe={recipe}
            onSwipe={handleSwipe}
            isActive={index === 0}
          />
        ))}
      </AnimatePresence>

      {/* Loading indicator for next batch */}
      {loading && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Loading more...</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm text-gray-600">
          {currentIndex + 1} of {availableRecipes.length}
        </p>
      </div>

      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
        title="Refresh recipes"
      >
        <RefreshCw className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};

export default RecipeSwiper;