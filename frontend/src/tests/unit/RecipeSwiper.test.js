import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { motion } from 'framer-motion';
import RecipeSwiper from '@/components/RecipeSwiper/RecipeSwiper';
import SwipeCard from '@/components/RecipeSwiper/SwipeCard';
import { GET_MEALS_WITH_FILTERS } from '@/graphql/queries';
import { SAVE_RECIPE_MUTATION, REJECT_RECIPE_MUTATION } from '@/graphql/mutations';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => children,
  useMotionValue: () => ({ get: () => 0 }),
  useTransform: () => 'rgba(0,0,0,0)',
}));

// Mock useAuth hook
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', username: 'testuser' }
  })
}));

const mockRecipe = {
  id: 'recipe-1',
  recipeName: 'Test Recipe',
  ingredients: ['flour', 'eggs', 'milk'],
  instructions: 'Mix ingredients and cook',
  prepTime: 30,
  difficulty: 'EASY',
  nutritionFacts: 'Test nutrition',
  tags: ['breakfast', 'easy'],
  images: ['https://example.com/image.jpg'],
  estimatedCost: 5.99,
  author: {
    id: 'author-1',
    username: 'chef',
    firstName: 'Chef',
    lastName: 'Test'
  },
  averageRating: 4.5,
  ratingCount: 10,
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01'
};

const mockMeal = {
  id: 'meal-1',
  mealName: 'Test Meal',
  recipe: mockRecipe,
  mealType: 'BREAKFAST',
  prepTime: 30,
  difficulty: 'EASY',
  nutrition: {
    calories: 300,
    protein: 15,
    carbohydrates: 45,
    fat: 10
  },
  allergens: [],
  dietaryTags: ['vegetarian']
};

const mocks = [
  {
    request: {
      query: GET_MEALS_WITH_FILTERS,
      variables: {
        page: 1,
        limit: 20
      }
    },
    result: {
      data: {
        getMealsWithFilters: {
          meals: [mockMeal],
          totalCount: 1,
          hasNextPage: false
        }
      }
    }
  },
  {
    request: {
      query: SAVE_RECIPE_MUTATION,
      variables: {
        recipeId: 'recipe-1'
      }
    },
    result: {
      data: {
        saveRecipe: {
          id: 'saved-1',
          recipe: mockRecipe,
          savedAt: '2023-01-01',
          user: { id: 'test-user-id', username: 'testuser' }
        }
      }
    }
  },
  {
    request: {
      query: REJECT_RECIPE_MUTATION,
      variables: {
        recipeId: 'recipe-1'
      }
    },
    result: {
      data: {
        rejectRecipe: {
          id: 'rejected-1',
          recipeId: 'recipe-1',
          rejectedAt: '2023-01-01',
          user: { id: 'test-user-id', username: 'testuser' }
        }
      }
    }
  }
];

describe('RecipeSwiper', () => {
  test('renders loading state initially', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <RecipeSwiper />
      </MockedProvider>
    );

    expect(screen.getByText('Finding delicious recipes for you...')).toBeInTheDocument();
  });

  test('renders recipe cards when data is loaded', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <RecipeSwiper />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });

    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('EASY')).toBeInTheDocument();
    expect(screen.getByText('$5.99')).toBeInTheDocument();
  });

  test('handles save action correctly', async () => {
    const onRecipeSaved = jest.fn();
    
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <RecipeSwiper onRecipeSaved={onRecipeSaved} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onRecipeSaved).toHaveBeenCalled();
    });
  });

  test('handles reject action correctly', async () => {
    const onRecipeRejected = jest.fn();
    
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <RecipeSwiper onRecipeRejected={onRecipeRejected} />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });

    const rejectButton = screen.getByText('Pass');
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(onRecipeRejected).toHaveBeenCalled();
    });
  });

  test('displays stats correctly', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <RecipeSwiper />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('1 of 1')).toBeInTheDocument();
    });
  });
});

describe('SwipeCard', () => {
  const mockOnSwipe = jest.fn();

  beforeEach(() => {
    mockOnSwipe.mockClear();
  });

  test('renders recipe information correctly', () => {
    render(
      <SwipeCard 
        recipe={mockRecipe} 
        onSwipe={mockOnSwipe} 
        isActive={true} 
      />
    );

    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('EASY')).toBeInTheDocument();
    expect(screen.getByText('$5.99')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('breakfast')).toBeInTheDocument();
  });

  test('handles button clicks correctly', () => {
    render(
      <SwipeCard 
        recipe={mockRecipe} 
        onSwipe={mockOnSwipe} 
        isActive={true} 
      />
    );

    const saveButton = screen.getByText('Save');
    const passButton = screen.getByText('Pass');

    fireEvent.click(saveButton);
    expect(mockOnSwipe).toHaveBeenCalledWith('recipe-1', 'like');

    fireEvent.click(passButton);
    expect(mockOnSwipe).toHaveBeenCalledWith('recipe-1', 'reject');
  });

  test('displays fallback when no image is provided', () => {
    const recipeWithoutImage = { ...mockRecipe, images: [] };
    
    render(
      <SwipeCard 
        recipe={recipeWithoutImage} 
        onSwipe={mockOnSwipe} 
        isActive={true} 
      />
    );

    // Should display first letter of recipe name as fallback
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  test('disables buttons when not active', () => {
    render(
      <SwipeCard 
        recipe={mockRecipe} 
        onSwipe={mockOnSwipe} 
        isActive={false} 
      />
    );

    const saveButton = screen.getByText('Save');
    const passButton = screen.getByText('Pass');

    expect(saveButton).toBeDisabled();
    expect(passButton).toBeDisabled();
  });
});

// Integration test
describe('Recipe Swiping Integration', () => {
  test('complete swiping workflow', async () => {
    const onRecipeSaved = jest.fn();
    const onRecipeRejected = jest.fn();

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <RecipeSwiper 
          onRecipeSaved={onRecipeSaved}
          onRecipeRejected={onRecipeRejected}
        />
      </MockedProvider>
    );

    // Wait for recipe to load
    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });

    // Test save action
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onRecipeSaved).toHaveBeenCalledWith(
        expect.objectContaining({
          recipe: expect.objectContaining({
            id: 'recipe-1',
            recipeName: 'Test Recipe'
          })
        })
      );
    });
  });
});