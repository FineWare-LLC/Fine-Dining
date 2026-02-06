import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from 'graphql-tag';

const GET_QUESTION_CATEGORIES = gql`
  query GetQuestionCategories {
    getQuestionCategories {
      id
      name
      description
      totalSubsets
      completionReward
      iconUrl
      isActive
    }
  }
`;

const GET_USER_QA_STATS = gql`
  query GetUserQAStats($userId: ID!) {
    getUserQAStats(userId: $userId) {
      totalPoints
      totalCorrectAnswers
      totalQuestionsAttempted
      averageAccuracy
      currentGlobalStreak
      bestGlobalStreak
      totalBadges
      categoriesCompleted
      totalTimeSpent
      lastActivityAt
    }
  }
`;

const QADashboard = ({ userId }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_QUESTION_CATEGORIES);
  const { data: statsData, loading: statsLoading } = useQuery(GET_USER_QA_STATS, {
    variables: { userId },
    skip: !userId
  });

  const categories = categoriesData?.getQuestionCategories || [];
  const userStats = statsData?.getUserQAStats || {};

  return (
    <div className="qa-dashboard bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Fine Dining Nutrition Mastery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Challenge yourself with nutrition-focused questions designed for Americans exploring fine dining culture. 
            Learn about hidden calories, macro balance, and make informed dining choices.
          </p>
        </div>

        {/* User Stats Section */}
        {!statsLoading && userId && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Progress</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{userStats.totalPoints || 0}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{userStats.currentGlobalStreak || 0}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{Math.round(userStats.averageAccuracy || 0)}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">{userStats.totalBadges || 0}</div>
                <div className="text-sm text-gray-600">Badges Earned</div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {categoriesLoading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : (
            categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer p-6 group"
                onClick={() => setSelectedCategory(category)}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-white">🧠</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {category.description}
                  </p>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      {category.totalSubsets} Question Sets
                    </div>
                    <div className="text-xs text-green-600 font-semibold">
                      {category.completionReward} points reward
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all">
                    Start Learning
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Feature Highlights */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Why This Q&A System is Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-400 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-3xl text-white">🎯</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Challenging & Revealing</h3>
              <p className="text-gray-600 text-sm">
                Questions designed to reveal knowledge gaps about fine dining nutrition, making you more aware of hidden calories and nutritional impacts.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-3xl text-white">🏆</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Reward-Based Learning</h3>
              <p className="text-gray-600 text-sm">
                Earn points, badges, and unlock premium features as you master fine dining nutrition concepts.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center">
                <span className="text-3xl text-white">🍽️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Fine Dining Focused</h3>
              <p className="text-gray-600 text-sm">
                Specifically tailored for Americans exploring fine dining culture, with real-world restaurant scenarios and menu psychology insights.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {!userId && (
          <div className="mt-8 text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="mb-6 text-indigo-100">
              Join thousands of diners who are mastering fine dining nutrition through our challenging Q&A system.
            </p>
            <button className="bg-white text-indigo-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
              Sign Up to Begin
            </button>
          </div>
        )}
      </div>

      {/* Category Selection Modal/Overlay */}
      {selectedCategory && (
        <CategoryDetailModal 
          category={selectedCategory}
          userId={userId}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
};

// Category Detail Modal Component
const CategoryDetailModal = ({ category, userId, onClose }) => {
  const { data: subsetsData, loading } = useQuery(gql`
    query GetQuestionSubsets($categoryId: ID!) {
      getQuestionSubsets(categoryId: $categoryId) {
        id
        subsetNumber
        subsetName
        description
        totalQuestions
        difficulty
        isUnlocked
      }
    }
  `, {
    variables: { categoryId: category.id }
  });

  const subsets = subsetsData?.getQuestionSubsets?.slice(0, 10) || []; // Show first 10 for demo

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
              <p className="text-gray-600 mt-2">{category.description}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : (
              subsets.map((subset) => (
                <div 
                  key={subset.id}
                  className={`border rounded-lg p-4 ${
                    subset.isUnlocked 
                      ? 'border-green-200 bg-green-50 cursor-pointer hover:bg-green-100' 
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{subset.subsetName}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      subset.difficulty === 'BEGINNER' ? 'bg-green-100 text-green-800' :
                      subset.difficulty === 'INTERMEDIATE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {subset.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{subset.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{subset.totalQuestions} questions</span>
                    {subset.isUnlocked ? (
                      <span className="text-xs text-green-600 font-semibold">🔓 Available</span>
                    ) : (
                      <span className="text-xs text-gray-400">🔒 Locked</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-6 text-center">
            <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-8 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all">
              Start with First Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QADashboard;