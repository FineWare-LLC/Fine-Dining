/**
 * @file /src/graphql/resolvers/mutations/qaMutations.js
 * @description Q&A system mutation resolvers for answer submissions, progress tracking, and rewards
 */

import { qaQueries } from '../queries/qaQueries.js';

// Mock database - in production, this would use a real database
const mockDatabase = {
  userQuestionProgress: new Map(),
  userCategoryProgress: new Map(),
  users: new Map()
};

// Determine answer type based on the selected answer
function determineAnswerType(selectedAnswer, question) {
  if (question.correctAnswers.includes(selectedAnswer)) {
    return 'CORRECT';
  } else if (question.almostRightAnswers.includes(selectedAnswer)) {
    return 'ALMOST_RIGHT';
  } else if (question.mightBeAnswers.includes(selectedAnswer)) {
    return 'MIGHT_BE';
  } else {
    return 'WRONG';
  }
}

// Calculate points based on answer type and difficulty
function calculatePoints(answerType, difficulty, attemptsCount) {
  let basePoints = 0;
  
  switch (answerType) {
    case 'CORRECT':
      basePoints = 100;
      break;
    case 'ALMOST_RIGHT':
      basePoints = 25;
      break;
    case 'MIGHT_BE':
      basePoints = 10;
      break;
    case 'WRONG':
      basePoints = 0;
      break;
  }
  
  // Difficulty multiplier
  const difficultyMultiplier = {
    'BEGINNER': 1.0,
    'INTERMEDIATE': 1.5,
    'ADVANCED': 2.0,
    'EXPERT': 2.5
  }[difficulty] || 1.0;
  
  // Reduce points for multiple attempts
  const attemptPenalty = Math.max(0.5, 1 - (attemptsCount - 1) * 0.1);
  
  return Math.floor(basePoints * difficultyMultiplier * attemptPenalty);
}

// Determine new badges based on progress
function calculateNewBadges(userCategoryProgress, answerType) {
  const newBadges = [];
  const { correctAnswers, currentStreak, pointsEarned, completionPercentage } = userCategoryProgress;
  
  // Streak badges
  if (currentStreak === 10 && answerType === 'CORRECT') {
    newBadges.push('Hot Streak - 10 Correct!');
  } else if (currentStreak === 25 && answerType === 'CORRECT') {
    newBadges.push('On Fire - 25 Correct!');
  } else if (currentStreak === 50 && answerType === 'CORRECT') {
    newBadges.push('Unstoppable - 50 Correct!');
  }
  
  // Milestone badges
  if (correctAnswers === 100) {
    newBadges.push('Centurion - 100 Correct Answers');
  } else if (correctAnswers === 500) {
    newBadges.push('Expert - 500 Correct Answers');
  } else if (correctAnswers === 1000) {
    newBadges.push('Master - 1000 Correct Answers');
  }
  
  // Completion badges
  if (completionPercentage >= 25) {
    newBadges.push('Quarter Master');
  } else if (completionPercentage >= 50) {
    newBadges.push('Half Way Hero');
  } else if (completionPercentage >= 75) {
    newBadges.push('Three Quarter Champion');
  } else if (completionPercentage >= 100) {
    newBadges.push('Category Complete!');
  }
  
  return newBadges;
}

// Update user's category progress
function updateUserCategoryProgress(userId, categoryId, answerType, pointsEarned) {
  const progressKey = `${userId}-${categoryId}`;
  let progress = mockDatabase.userCategoryProgress.get(progressKey);
  
  if (!progress) {
    progress = {
      id: progressKey,
      userId,
      categoryId,
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
      lastActivityAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  
  // Update progress
  progress.completedQuestions += 1;
  progress.pointsEarned += pointsEarned;
  progress.lastActivityAt = new Date();
  progress.updatedAt = new Date();
  
  if (answerType === 'CORRECT') {
    progress.correctAnswers += 1;
    progress.currentStreak += 1;
    progress.bestStreak = Math.max(progress.bestStreak, progress.currentStreak);
  } else {
    progress.wrongAnswers += 1;
    progress.currentStreak = 0;
  }
  
  // Calculate completion percentage
  progress.completionPercentage = (progress.completedQuestions / progress.totalQuestions) * 100;
  
  // Calculate average score
  progress.averageScore = progress.completedQuestions > 0 
    ? (progress.correctAnswers / progress.completedQuestions) * 100 
    : 0;
  
  mockDatabase.userCategoryProgress.set(progressKey, progress);
  return progress;
}

export const qaMutations = {
  // Submit an answer to a question
  submitAnswer: async (_, { userId, input }) => {
    const { questionId, selectedAnswer, timeSpent = 0 } = input;
    
    // Get the question details
    const question = await qaQueries.getQuestion(_, { id: questionId });
    if (!question) {
      throw new Error('Question not found');
    }
    
    // Get or create user question progress
    const progressKey = `${userId}-${questionId}`;
    let userQuestionProgress = mockDatabase.userQuestionProgress.get(progressKey);
    
    if (!userQuestionProgress) {
      userQuestionProgress = {
        id: progressKey,
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
    }
    
    // Determine answer type and correctness
    const answerType = determineAnswerType(selectedAnswer, question);
    const isCorrect = answerType === 'CORRECT';
    
    // Update question progress
    userQuestionProgress.attemptsCount += 1;
    userQuestionProgress.selectedAnswer = selectedAnswer;
    userQuestionProgress.selectedAnswerType = answerType;
    userQuestionProgress.isCorrect = isCorrect;
    userQuestionProgress.updatedAt = new Date();
    
    // Calculate points for this answer
    const pointsEarned = calculatePoints(answerType, question.difficulty, userQuestionProgress.attemptsCount);
    userQuestionProgress.pointsEarned += pointsEarned;
    
    // Mark as completed if correct
    if (isCorrect && !userQuestionProgress.isCompleted) {
      userQuestionProgress.isCompleted = true;
      userQuestionProgress.completedAt = new Date();
    }
    
    mockDatabase.userQuestionProgress.set(progressKey, userQuestionProgress);
    
    // Extract category ID from question
    const [categoryPrefix] = questionId.split('-');
    const categoryMap = {
      'mm': 'macronutrient-mastery',
      'mmn': 'micronutrient-mysteries',
      'ctn': 'culinary-technique-nutrition',
      'wbn': 'wine-beverage-nutrition',
      'icn': 'international-cuisine-nutrition',
      'dr': 'dietary-restrictions',
      'ss': 'seasonal-sustainable',
      'mp': 'menu-psychology'
    };
    const categoryId = categoryMap[categoryPrefix] || 'macronutrient-mastery';
    
    // Update user's category progress
    const userCategoryProgress = updateUserCategoryProgress(userId, categoryId, answerType, pointsEarned);
    
    // Calculate new badges
    const newBadges = calculateNewBadges(userCategoryProgress, answerType);
    
    // Add new badges to user's collection
    if (newBadges.length > 0) {
      userCategoryProgress.badgesEarned = [...new Set([...userCategoryProgress.badgesEarned, ...newBadges])];
      mockDatabase.userCategoryProgress.set(`${userId}-${categoryId}`, userCategoryProgress);
    }
    
    // Return the submit answer payload
    return {
      isCorrect,
      answerType,
      pointsEarned,
      explanation: question.explanation,
      streakCount: userCategoryProgress.currentStreak,
      newBadges,
      userQuestionProgress,
      userCategoryProgress
    };
  },

  // Create a new question category (admin function)
  createQuestionCategory: async (_, { input }) => {
    const category = {
      id: input.name.toLowerCase().replace(/\s+/g, '-'),
      ...input,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // In a real implementation, this would save to database
    return category;
  },

  // Update an existing question category
  updateQuestionCategory: async (_, { id, input }) => {
    // In a real implementation, this would update in database
    return {
      id,
      ...input,
      updatedAt: new Date()
    };
  },

  // Delete a question category
  deleteQuestionCategory: async (_, { id }) => {
    // In a real implementation, this would delete from database
    return true;
  },

  // Create a new question subset
  createQuestionSubset: async (_, { input }) => {
    const subset = {
      id: `${input.categoryId}-subset-${String(input.subsetNumber).padStart(3, '0')}`,
      ...input,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // In a real implementation, this would save to database
    return subset;
  },

  // Update an existing question subset
  updateQuestionSubset: async (_, { id, input }) => {
    // In a real implementation, this would update in database
    return {
      id,
      ...input,
      updatedAt: new Date()
    };
  },

  // Delete a question subset
  deleteQuestionSubset: async (_, { id }) => {
    // In a real implementation, this would delete from database
    return true;
  },

  // Create a new question
  createQuestion: async (_, { input }) => {
    const question = {
      id: `${input.subsetId}-${String(input.questionNumber).padStart(3, '0')}`,
      ...input,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // In a real implementation, this would save to database
    return question;
  },

  // Update an existing question
  updateQuestion: async (_, { id, input }) => {
    // In a real implementation, this would update in database
    return {
      id,
      ...input,
      updatedAt: new Date()
    };
  },

  // Delete a question
  deleteQuestion: async (_, { id }) => {
    // In a real implementation, this would delete from database
    return true;
  },

  // Unlock next subset for user
  unlockNextSubset: async (_, { userId, categoryId }) => {
    // Get user's progress in this category
    const progressKey = `${userId}-${categoryId}`;
    const progress = mockDatabase.userCategoryProgress.get(progressKey);
    
    if (!progress) {
      throw new Error('User has no progress in this category');
    }
    
    // Calculate which subset should be unlocked next
    const completedSubsets = Math.floor(progress.completedQuestions / 100);
    const nextSubsetNumber = completedSubsets + 2; // Next after current
    
    if (nextSubsetNumber > 200) {
      throw new Error('All subsets are already unlocked');
    }
    
    // Return the unlocked subset
    return {
      id: `${categoryId}-subset-${String(nextSubsetNumber).padStart(3, '0')}`,
      categoryId,
      subsetNumber: nextSubsetNumber,
      subsetName: `Advanced Nutrition - Set ${nextSubsetNumber}`,
      description: `Unlocked subset ${nextSubsetNumber} for category ${categoryId}`,
      totalQuestions: 100,
      difficulty: nextSubsetNumber <= 50 ? 'BEGINNER' : nextSubsetNumber <= 150 ? 'INTERMEDIATE' : 'ADVANCED',
      isUnlocked: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  },

  // Reset user's progress in a category
  resetUserProgress: async (_, { userId, categoryId }) => {
    if (categoryId) {
      // Reset specific category
      const progressKey = `${userId}-${categoryId}`;
      mockDatabase.userCategoryProgress.delete(progressKey);
      
      // Remove all question progress for this category
      for (const [key] of mockDatabase.userQuestionProgress) {
        if (key.startsWith(`${userId}-`) && key.includes(categoryId)) {
          mockDatabase.userQuestionProgress.delete(key);
        }
      }
    } else {
      // Reset all progress for user
      for (const [key] of mockDatabase.userCategoryProgress) {
        if (key.startsWith(`${userId}-`)) {
          mockDatabase.userCategoryProgress.delete(key);
        }
      }
      
      for (const [key] of mockDatabase.userQuestionProgress) {
        if (key.startsWith(`${userId}-`)) {
          mockDatabase.userQuestionProgress.delete(key);
        }
      }
    }
    
    return true;
  },

  // Award a badge to user
  awardBadge: async (_, { userId, badgeName }) => {
    // In a real implementation, this would update the user's badge collection
    console.log(`Awarded badge "${badgeName}" to user ${userId}`);
    return true;
  },

  // Claim completion reward for category
  claimReward: async (_, { userId, categoryId }) => {
    const progressKey = `${userId}-${categoryId}`;
    const progress = mockDatabase.userCategoryProgress.get(progressKey);
    
    if (!progress) {
      throw new Error('User has no progress in this category');
    }
    
    if (progress.completionPercentage < 100) {
      throw new Error('Category is not yet completed');
    }
    
    // In a real implementation, this would:
    // 1. Add reward points to user's account
    // 2. Unlock premium features
    // 3. Send notification
    
    console.log(`User ${userId} claimed reward for category ${categoryId}: 5000 points`);
    return true;
  }
};