/**
 * @file /src/graphql/resolvers/queries/qaQueries.js
 * @description Q&A system query resolvers for fetching questions, categories, and user progress
 */

import fs from 'fs/promises';
import path from 'path';

// Mock database - in production, this would use a real database
const mockDatabase = {
  categories: [],
  subsets: [],
  questions: [],
  userProgress: [],
  userCategoryProgress: []
};

// Initialize categories data
const initializeCategories = () => {
  if (mockDatabase.categories.length === 0) {
    mockDatabase.categories = [
      {
        id: 'macronutrient-mastery',
        name: 'Macronutrient Mastery',
        description: 'Understanding proteins, carbohydrates, and fats in fine dining',
        totalSubsets: 200,
        completionReward: 5000,
        iconUrl: '/icons/macronutrients.svg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'micronutrient-mysteries',
        name: 'Micronutrient Mysteries',
        description: 'Vitamins and minerals in gourmet ingredients',
        totalSubsets: 200,
        completionReward: 5000,
        iconUrl: '/icons/vitamins.svg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'culinary-technique-nutrition',
        name: 'Culinary Technique & Nutrition Impact',
        description: 'How cooking methods affect nutritional value',
        totalSubsets: 200,
        completionReward: 5000,
        iconUrl: '/icons/cooking.svg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'wine-beverage-nutrition',
        name: 'Wine & Beverage Nutrition',
        description: 'Alcohol content and caloric impact in fine dining',
        totalSubsets: 200,
        completionReward: 5000,
        iconUrl: '/icons/wine.svg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'international-cuisine-nutrition',
        name: 'International Cuisine Nutrition',
        description: 'Nutritional profiles of different cuisines',
        totalSubsets: 200,
        completionReward: 5000,
        iconUrl: '/icons/globe.svg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'dietary-restrictions',
        name: 'Dietary Restrictions & Fine Dining',
        description: 'Navigating allergies and special diets in upscale settings',
        totalSubsets: 200,
        completionReward: 5000,
        iconUrl: '/icons/dietary.svg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'seasonal-sustainable',
        name: 'Seasonal & Sustainable Eating',
        description: 'Nutritional benefits of seasonal and sustainable ingredients',
        totalSubsets: 200,
        completionReward: 5000,
        iconUrl: '/icons/seasons.svg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'menu-psychology',
        name: 'Menu Psychology & Nutrition Traps',
        description: 'Understanding hidden calories and menu manipulation',
        totalSubsets: 200,
        completionReward: 5000,
        iconUrl: '/icons/menu.svg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
};

// Load questions from JSON files
async function loadQuestionsFromFile(categoryId, subsetNumber) {
  try {
    const filePath = path.join(
      process.cwd(),
      'src',
      'data',
      'qa-system',
      categoryId,
      `subset-${String(subsetNumber).padStart(3, '0')}`,
      'questions.json'
    );
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.warn(`Could not load questions for ${categoryId}/subset-${subsetNumber}:`, error.message);
    return null;
  }
}

// Generate subset data for a category
function generateSubsetsForCategory(categoryId, categoryName) {
  const subsets = [];
  for (let i = 1; i <= 200; i++) {
    subsets.push({
      id: `${categoryId}-subset-${String(i).padStart(3, '0')}`,
      categoryId,
      category: mockDatabase.categories.find(c => c.id === categoryId),
      subsetNumber: i,
      subsetName: `${categoryName} - Set ${i}`,
      description: `Advanced nutrition questions for ${categoryName.toLowerCase()} - set ${i}`,
      totalQuestions: 100,
      difficulty: i <= 50 ? 'BEGINNER' : i <= 150 ? 'INTERMEDIATE' : 'ADVANCED',
      isUnlocked: i === 1, // Only first subset is unlocked by default
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  return subsets;
}

export const qaQueries = {
  // Get all question categories
  getQuestionCategories: async () => {
    initializeCategories();
    return mockDatabase.categories;
  },

  // Get a specific question category
  getQuestionCategory: async (_, { id }) => {
    initializeCategories();
    return mockDatabase.categories.find(category => category.id === id) || null;
  },

  // Get all subsets for a category
  getQuestionSubsets: async (_, { categoryId }) => {
    initializeCategories();
    const category = mockDatabase.categories.find(c => c.id === categoryId);
    if (!category) return [];
    
    return generateSubsetsForCategory(categoryId, category.name);
  },

  // Get a specific subset
  getQuestionSubset: async (_, { id }) => {
    const [categoryId, , subsetId] = id.split('-');
    const category = mockDatabase.categories.find(c => c.id.startsWith(categoryId));
    if (!category) return null;
    
    const subsetNumber = parseInt(subsetId);
    return {
      id,
      categoryId,
      category,
      subsetNumber,
      subsetName: `${category.name} - Set ${subsetNumber}`,
      description: `Advanced nutrition questions for ${category.name.toLowerCase()} - set ${subsetNumber}`,
      totalQuestions: 100,
      difficulty: subsetNumber <= 50 ? 'BEGINNER' : subsetNumber <= 150 ? 'INTERMEDIATE' : 'ADVANCED',
      isUnlocked: subsetNumber === 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },

  // Get questions for a subset
  getQuestions: async (_, { subsetId }) => {
    const [categoryId, , subsetNumber] = subsetId.split('-');
    const subsetNum = parseInt(subsetNumber);
    
    const questionsData = await loadQuestionsFromFile(categoryId, subsetNum);
    if (!questionsData) return [];
    
    return questionsData.questions.map(q => ({
      ...q,
      subsetId,
      subset: {
        id: subsetId,
        categoryId,
        subsetNumber: subsetNum
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  },

  // Get a specific question
  getQuestion: async (_, { id }) => {
    // Parse question ID to extract category and subset info
    const [categoryPrefix, subsetNumber, questionNumber] = id.split('-');
    const categoryId = Object.keys({
      'mm': 'macronutrient-mastery',
      'mmn': 'micronutrient-mysteries', 
      'ctn': 'culinary-technique-nutrition',
      'wbn': 'wine-beverage-nutrition',
      'icn': 'international-cuisine-nutrition',
      'dr': 'dietary-restrictions',
      'ss': 'seasonal-sustainable',
      'mp': 'menu-psychology'
    }).find(key => categoryPrefix === key) || 'macronutrient-mastery';
    
    const questionsData = await loadQuestionsFromFile(categoryId, parseInt(subsetNumber));
    if (!questionsData) return null;
    
    const question = questionsData.questions.find(q => q.id === id);
    if (!question) return null;
    
    return {
      ...question,
      subsetId: `${categoryId}-subset-${subsetNumber}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },

  // Get a random question
  getRandomQuestion: async (_, { categoryId, difficulty }) => {
    if (!categoryId) {
      initializeCategories();
      categoryId = mockDatabase.categories[Math.floor(Math.random() * mockDatabase.categories.length)].id;
    }
    
    const randomSubsetNumber = Math.floor(Math.random() * 200) + 1;
    const questionsData = await loadQuestionsFromFile(categoryId, randomSubsetNumber);
    if (!questionsData || !questionsData.questions.length) return null;
    
    let filteredQuestions = questionsData.questions;
    if (difficulty) {
      filteredQuestions = questionsData.questions.filter(q => q.difficulty === difficulty);
    }
    
    if (filteredQuestions.length === 0) return null;
    
    const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    return {
      ...randomQuestion,
      subsetId: `${categoryId}-subset-${String(randomSubsetNumber).padStart(3, '0')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },

  // Get user's category progress
  getUserCategoryProgress: async (_, { userId, categoryId }) => {
    // Mock implementation - in production, this would query the database
    return {
      id: `progress-${userId}-${categoryId}`,
      userId,
      categoryId,
      category: mockDatabase.categories.find(c => c.id === categoryId),
      completedQuestions: 0,
      totalQuestions: 20000, // 200 subsets * 100 questions
      correctAnswers: 0,
      wrongAnswers: 0,
      currentStreak: 0,
      bestStreak: 0,
      pointsEarned: 0,
      badgesEarned: [],
      completionPercentage: 0.0,
      averageScore: 0.0,
      lastActivityAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },

  // Get user's question progress
  getUserQuestionProgress: async (_, { userId, questionId }) => {
    // Mock implementation - in production, this would query the database
    return {
      id: `progress-${userId}-${questionId}`,
      userId,
      questionId,
      isCompleted: false,
      isCorrect: null,
      selectedAnswer: null,
      selectedAnswerType: null,
      attemptsCount: 0,
      pointsEarned: 0,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },

  // Get Q&A leaderboard
  getQALeaderboard: async (_, { categoryId, limit = 10 }) => {
    // Mock leaderboard data - in production, this would query the database
    const leaderboard = [];
    for (let i = 0; i < limit; i++) {
      leaderboard.push({
        id: `leader-${i}`,
        userId: `user-${i}`,
        categoryId: categoryId || 'macronutrient-mastery',
        completedQuestions: Math.floor(Math.random() * 1000),
        totalQuestions: 20000,
        correctAnswers: Math.floor(Math.random() * 800),
        wrongAnswers: Math.floor(Math.random() * 200),
        currentStreak: Math.floor(Math.random() * 50),
        bestStreak: Math.floor(Math.random() * 100),
        pointsEarned: Math.floor(Math.random() * 50000),
        badgesEarned: [`Expert Level ${i + 1}`],
        completionPercentage: Math.random() * 100,
        averageScore: Math.random() * 100,
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    return leaderboard.sort((a, b) => b.pointsEarned - a.pointsEarned);
  },

  // Get user's overall Q&A stats
  getUserQAStats: async (_, { userId }) => {
    // Mock implementation - in production, this would aggregate from database
    return {
      totalPoints: 0,
      totalCorrectAnswers: 0,
      totalQuestionsAttempted: 0,
      averageAccuracy: 0.0,
      currentGlobalStreak: 0,
      bestGlobalStreak: 0,
      totalBadges: 0,
      categoriesCompleted: 0,
      totalTimeSpent: 0,
      lastActivityAt: null,
      categoryStats: []
    };
  }
};