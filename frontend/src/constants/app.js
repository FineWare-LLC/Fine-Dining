/**
 * Application-wide constants
 * Centralizes hardcoded values for better maintainability
 */

// API Endpoints
export const API_ENDPOINTS = {
    OPTIMIZATION_BACKEND: 'http://localhost:8000',
    OPTIMIZE_BASIC: '/optimize/basic',
    OPTIMIZE_TEMPORAL: '/optimize/temporal',
    HEALTH_CHECK: '/health',
    MEALS_DATABASE: '/meals/database',
    VALIDATE_REQUIREMENTS: '/meals/validate',
};

// HiGHS Optimization Constants
export const HIGHS_STATUS = {
    OPTIMAL: 7,
    INFEASIBLE: 8,
    UNBOUNDED: 9,
};

// Optimization Objectives
export const OPTIMIZATION_OBJECTIVES = {
    MINIMIZE_COST: 'minimize_cost',
    MAXIMIZE_PREFERENCE: 'maximize_preference',
    MULTI_OBJECTIVE: 'multi_objective',
    HIGH_PROTEIN: 'high_protein',
    BALANCED: 'balanced',
};

// Default Nutritional Constraints
export const DEFAULT_NUTRITION_CONSTRAINTS = {
    calories: { min: 2200, max: 2600 },
    protein: { min: 100, max: 160 },
    carbohydrates: { min: 250, max: 350 },
    fat: { min: 50, max: 90 },
    sodium: { min: 1500, max: 2300 },
};

// Color system for hourly meal planner
export const HOUR_COLORS = [
    { hour: 0, color: '#2C1810' },   // Midnight - Dark brown
    { hour: 1, color: '#1A1A2E' },   // 1 AM - Dark blue
    { hour: 2, color: '#16213E' },   // 2 AM - Navy
    { hour: 3, color: '#0F3460' },   // 3 AM - Deep blue
    { hour: 4, color: '#533A71' },   // 4 AM - Purple
    { hour: 5, color: '#6A4C93' },   // 5 AM - Light purple
    { hour: 6, color: '#FF6B35' },   // 6 AM - Orange (sunrise)
    { hour: 7, color: '#F7931E' },   // 7 AM - Golden orange
    { hour: 8, color: '#FFD23F' },   // 8 AM - Yellow
    { hour: 9, color: '#06FFA5' },   // 9 AM - Mint green
    { hour: 10, color: '#4ECDC4' },  // 10 AM - Teal
    { hour: 11, color: '#45B7D1' },  // 11 AM - Sky blue
    { hour: 12, color: '#96CEB4' },  // 12 PM - Light green
    { hour: 13, color: '#FFEAA7' },  // 1 PM - Light yellow
    { hour: 14, color: '#DDA0DD' },  // 2 PM - Plum
    { hour: 15, color: '#98D8C8' },  // 3 PM - Mint
    { hour: 16, color: '#F7DC6F' },  // 4 PM - Light gold
    { hour: 17, color: '#BB8FCE' },  // 5 PM - Lavender
    { hour: 18, color: '#F8C471' },  // 6 PM - Peach
    { hour: 19, color: '#F1948A' },  // 7 PM - Salmon
    { hour: 20, color: '#85C1E9' },  // 8 PM - Light blue
    { hour: 21, color: '#82E0AA' },  // 9 PM - Light green
    { hour: 22, color: '#D7BDE2' },  // 10 PM - Light purple
    { hour: 23, color: '#A9CCE3' },  // 11 PM - Pale blue
];

// Optimization button colors
export const OPTIMIZATION_COLORS = {
    COST: '#4CAF50',
    PROTEIN: '#FF9800',
    BALANCED: '#2196F3',
};

// Pagination defaults
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
};

// Search configuration
export const SEARCH_CONFIG = {
    MIN_QUERY_LENGTH: 2,
    MAX_SUGGESTIONS: 10,
};

// UI Constants
export const UI_CONSTANTS = {
    CARD_ELEVATION: {
        DEFAULT: 0,
        HOVER: 4,
        ACTIVE: 6,
    },
    ANIMATION_DURATION: {
        FAST: '0.2s',
        NORMAL: '0.3s',
        SLOW: '0.5s',
    },
    BORDER_RADIUS: {
        SMALL: 1,
        MEDIUM: 2,
        LARGE: 3,
    },
};

// Time formatting
export const TIME_FORMAT = {
    HOUR_24: 'HH:mm',
    HOUR_12: 'h:mm A',
};
