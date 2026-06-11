import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, Clock, Users, Star } from 'lucide-react';

const SwipeCard = ({ recipe, onSwipe, isActive }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
  
  // Color transforms for visual feedback
  const likeColor = useTransform(x, [0, 150], ['rgba(34, 197, 94, 0)', 'rgba(34, 197, 94, 0.8)']);
  const rejectColor = useTransform(x, [-150, 0], ['rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0)']);
  const likeOpacity = useTransform(x, [100, 150], [0, 1]);
  const rejectOpacity = useTransform(x, [-150, -100], [1, 0]);

  const handleDragEnd = (event, info) => {
    const threshold = 150;
    
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 'like' : 'reject';
      onSwipe(recipe.id, direction);
    }
  };

  const handleButtonAction = (action) => {
    onSwipe(recipe.id, action);
  };

  if (!recipe) return null;

  return (
    <motion.div
      className="absolute inset-4 bg-white rounded-xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        x,
        rotate,
        opacity,
        zIndex: isActive ? 10 : 1,
      }}
      drag={isActive ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ 
        x: x.get() > 0 ? 300 : -300,
        opacity: 0,
        transition: { duration: 0.3 }
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Swipe Action Overlays */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-10"
        style={{ backgroundColor: likeColor }}
      >
        <motion.div
          className="bg-white rounded-full p-4"
          style={{ opacity: likeOpacity }}
        >
          <Heart className="w-12 h-12 text-green-500" />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center z-10"
        style={{ backgroundColor: rejectColor }}
      >
        <motion.div
          className="bg-white rounded-full p-4"
          style={{ opacity: rejectOpacity }}
        >
          <X className="w-12 h-12 text-red-500" />
        </motion.div>
      </motion.div>

      {/* Recipe Content */}
      <div className="h-full flex flex-col">
        {/* Recipe Media */}
        <div className="h-1/2 relative overflow-hidden">
          {recipe.videoUrl ? (
            <video
              src={recipe.videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : recipe.images && recipe.images.length > 0 ? (
            <img
              src={recipe.images[0]}
              alt={recipe.recipeName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              <span className="text-white text-6xl font-bold">
                {recipe.recipeName.charAt(0)}
              </span>
            </div>
          )}
          
          {/* Difficulty Badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              recipe.difficulty === 'EASY' ? 'bg-green-500 text-white' :
              recipe.difficulty === 'INTERMEDIATE' ? 'bg-yellow-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {recipe.difficulty}
            </span>
          </div>

          {/* Rating */}
          {recipe.averageRating && (
            <div className="absolute bottom-4 left-4 flex items-center bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="text-sm font-medium">
                {recipe.averageRating.toFixed(1)}
              </span>
              {recipe.ratingCount && (
                <span className="text-xs ml-1 opacity-75">
                  ({recipe.ratingCount})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Recipe Details */}
        <div className="flex-1 p-6 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
            {recipe.recipeName}
          </h2>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 mb-4 text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{recipe.prepTime} min</span>
            </div>
            {recipe.estimatedCost && (
              <div className="text-sm">
                ${recipe.estimatedCost.toFixed(2)}
              </div>
            )}
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                  +{recipe.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-auto">
            <button
              onClick={() => handleButtonAction('reject')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg transition-colors"
              disabled={!isActive}
            >
              <X className="w-5 h-5" />
              <span className="font-medium">Pass</span>
            </button>
            
            <button
              onClick={() => handleButtonAction('like')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              disabled={!isActive}
            >
              <Heart className="w-5 h-5" />
              <span className="font-medium">Save</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;