// @ts-nocheck
import { useQuery, useMutation } from '@apollo/client/react';
import { AnimatePresence } from 'framer-motion';
import { Loader2, Settings, RefreshCw } from 'lucide-react';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SwipeCard from './SwipeCard';
import { SAVE_RECIPE_MUTATION, REJECT_RECIPE_MUTATION } from '@/graphql/mutations';
import { GET_MEALS_WITH_FILTERS } from '@/graphql/queries';
import {
    applyRecipeSwiperDecision,
    buildRecipeSwiperFailureMessage,
    rollbackRecipeSwiperDecision,
    resolveRecipeSwiperWindow,
} from '@/utils/recipeSwiperState';
import {
  buildRecipeSwiperFeedbackState,
  RECIPE_SWIPER_RESOLVED_MESSAGE,
} from '@/utils/recipeSwiperFeedback';

const srOnly = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const RecipeSwiper = ({ 
  initialFilters = {}, 
  onRecipeSaved, 
  onRecipeRejected,
  className = ""
}) => {
  const [swipeState, setSwipeState] = useState({
    currentIndex: 0,
    swipedRecipeIds: new Set(),
  });
  const [swipeError, setSwipeError] = useState(null);
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
      .map((meal) => meal.recipe)
      .filter(Boolean);
  }, [data?.getMealsWithFilters?.meals]);

  // Get current stack of cards to display (current + next 2)
  const visibleCards = useMemo(() => {
    return resolveRecipeSwiperWindow({
      recipes: availableRecipes,
      currentIndex: swipeState.currentIndex,
      swipedRecipeIds: swipeState.swipedRecipeIds,
      windowSize: 3,
    });
  }, [availableRecipes, swipeState.currentIndex, swipeState.swipedRecipeIds]);

  const recipeSwiperFeedback = buildRecipeSwiperFeedbackState({
    isLoading: loading && !data,
    availableRecipeCount: availableRecipes.length,
    visibleRecipeCount: visibleCards.length,
    error,
  });

  const resolvedAnnouncement = recipeSwiperFeedback.state === 'resolved' ? (
    <div
      role={recipeSwiperFeedback.role}
      aria-live={recipeSwiperFeedback.ariaLive}
      aria-atomic="true"
      style={srOnly}
    >
      {RECIPE_SWIPER_RESOLVED_MESSAGE}
    </div>
  ) : null;

  // Handle swipe actions
  const handleSwipe = useCallback(async (recipeId, action) => {
    const recipe = availableRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    // Add to swiped set immediately for UI responsiveness
    setSwipeError(null);
    setSwipeState(prev => applyRecipeSwiperDecision(prev, recipeId));
    
    // Execute the appropriate mutation
    try {
      if (action === 'like') {
        await saveRecipe({
          variables: { recipeId }
        });
      } else if (action === 'reject') {
        await rejectRecipe({
          variables: { recipeId }
        });
      }
    } catch (error) {
      // Revert the swipe if the mutation fails
      setSwipeState(prev => rollbackRecipeSwiperDecision(prev, recipeId));
      setSwipeError(buildRecipeSwiperFailureMessage(error));
    }
  }, [availableRecipes, saveRecipe, rejectRecipe]);

  // Load more recipes when running low
  useEffect(() => {
    const remainingCards = availableRecipes.length - swipeState.currentIndex;
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
  }, [swipeState.currentIndex, availableRecipes.length, data?.getMealsWithFilters?.hasNextPage, loading, fetchMore, filters]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setSwipeError(null);
    setSwipeState({
      currentIndex: 0,
      swipedRecipeIds: new Set(),
    });
    setFilters(prev => ({ ...prev, page: 1 }));
    refetch();
  }, [refetch]);

  // Handle filter updates
  const updateFilters = useCallback((newFilters) => {
    setSwipeError(null);
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }));
    setSwipeState({
      currentIndex: 0,
      swipedRecipeIds: new Set(),
    });
  }, []);

  if (recipeSwiperFeedback.state === 'loading') {
    return (
      <div
        className={`flex items-center justify-center h-96 ${className}`}
        role={recipeSwiperFeedback.role}
        aria-live={recipeSwiperFeedback.ariaLive}
        aria-atomic="true"
        aria-busy={recipeSwiperFeedback.ariaBusy}
      >
        <div className="text-center">
          {recipeSwiperFeedback.showSpinner && (
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          )}
          <p className="text-gray-600">{recipeSwiperFeedback.message}</p>
        </div>
      </div>
    );
  }

  if (recipeSwiperFeedback.state === 'error') {
    return (
      <div
        className={`flex items-center justify-center h-96 ${className}`}
        role={recipeSwiperFeedback.role}
        aria-live={recipeSwiperFeedback.ariaLive}
        aria-atomic="true"
      >
        <div className="text-center">
          <p className="text-red-600 mb-2 text-lg font-semibold">{recipeSwiperFeedback.title}</p>
          <p className="text-red-500 mb-4">{recipeSwiperFeedback.message}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {recipeSwiperFeedback.actionLabel}
          </button>
        </div>
      </div>
    );
  }

  if (recipeSwiperFeedback.state === 'empty') {
    return (
      <div
        className={`flex items-center justify-center h-96 ${className}`}
        role={recipeSwiperFeedback.role}
        aria-live={recipeSwiperFeedback.ariaLive}
        aria-atomic="true"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-4 text-lg font-semibold">
            {recipeSwiperFeedback.title}
          </p>
          <p className="text-gray-500 mb-6">
            {recipeSwiperFeedback.message}
          </p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            {recipeSwiperFeedback.actionLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-96 ${className}`}>
      {resolvedAnnouncement}

      {swipeError && (
        <div
          role="alert"
          aria-live="assertive"
          className="absolute left-4 right-4 top-16 z-20 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-lg"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-red-800">{swipeError}</p>
            <button
              type="button"
              onClick={() => setSwipeError(null)}
              className="text-sm font-medium text-red-700 hover:text-red-900"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

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
        <div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span className="text-sm text-gray-600">Loading more...</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm text-gray-600">
          {swipeState.currentIndex + 1} of {availableRecipes.length}
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
