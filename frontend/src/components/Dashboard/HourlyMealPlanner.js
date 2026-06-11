/**
 * HourlyMealPlanner - A component that allows users to plan meals for every hour of the day
 * Features:
 * - 24-hour meal planning with slider interface
 * - Time-based current/next meal display
 * - Dynamic meal addition and removal
 * - Cool slider animation with hour markers
 */
import {
    Box,
    Card,
    CardContent,
    Typography,
    Slider,
    IconButton,
    Button,
    Chip,
    useTheme,
    Avatar,
    Fade,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Restaurant as RestaurantIcon,
    AccessTime as TimeIcon,
    Delete as DeleteIcon,
    Psychology as OptimizeIcon,
    TrendingUp as SmartIcon,
    MonetizationOn as CostIcon,
    FitnessCenter as ProteinIcon,
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HOUR_COLORS, OPTIMIZATION_COLORS, API_ENDPOINTS } from '@/constants/app.js';

const getColorForHour = (hour) => {
    const colorData = HOUR_COLORS.find(c => c.hour === hour);
    return colorData ? colorData.color : '#FF6B35';
};

const createGradient = () => {
    const stops = HOUR_COLORS.map((c, i) => 
        `${c.color} ${(i / (HOUR_COLORS.length - 1)) * 100}%`
    ).join(', ');
    return `linear-gradient(90deg, ${stops})`;
};

/* ─── Hour Marker Component ────────────────────────────────────── */
const HourMarker = ({ hour, isActive, onClick }) => {
    const theme = useTheme();
    const color = getColorForHour(hour);
    
    return (
        <Tooltip title={`${hour}:00`} arrow>
            <Box
                onClick={() => onClick(hour)}
                sx={{
                    position: 'absolute',
                    left: `${(hour / 23) * 100}%`,
                    top: -8,
                    transform: 'translateX(-50%)',
                    cursor: 'pointer',
                    zIndex: 2,
                }}
            >
                <Box
                    sx={{
                        width: isActive ? 16 : 8,
                        height: isActive ? 16 : 8,
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: isActive ? `3px solid ${theme.palette.background.paper}` : 'none',
                        boxShadow: isActive ? theme.shadows[4] : theme.shadows[1],
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.2)',
                            boxShadow: theme.shadows[6],
                        },
                    }}
                />
                {isActive && (
                    <Typography
                        variant="caption"
                        sx={{
                            position: 'absolute',
                            top: 20,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                        }}
                    >
                        {hour}:00
                    </Typography>
                )}
            </Box>
        </Tooltip>
    );
};

/* ─── Meal Slot Component ────────────────────────────────────── */
const MealSlot = ({ hour, meal, onAddMeal, onRemoveMeal }) => {
    const theme = useTheme();
    const color = getColorForHour(hour);
    
    const formatHour = (hour) => {
        if (hour === 0) return '12:00 AM';
        if (hour === 12) return '12:00 PM';
        if (hour < 12) return `${hour}:00 AM`;
        return `${hour - 12}:00 PM`;
    };

    return (
        <Card
            elevation={0}
            sx={{
                border: `2px solid ${color}`,
                borderRadius: 2,
                mb: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-2px)',
                },
            }}
        >
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Chip
                        icon={<TimeIcon />}
                        label={formatHour(hour)}
                        size="small"
                        sx={{
                            backgroundColor: color,
                            color: theme.palette.getContrastText(color),
                            fontWeight: 600,
                        }}
                    />
                    {meal && (
                        <IconButton
                            size="small"
                            onClick={() => onRemoveMeal(hour)}
                            sx={{ color: theme.palette.error.main }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    )}
                </Box>

                {meal ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={meal.imageUrl}
                            alt={meal.title}
                            sx={{ width: 48, height: 48 }}
                        >
                            <RestaurantIcon />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                {meal.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {meal.calories} cal • {meal.protein}g protein
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            py: 2,
                            border: `2px dashed ${color}`,
                            borderRadius: 1,
                            backgroundColor: `${color}10`,
                        }}
                    >
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            No meal planned
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => onAddMeal(hour)}
                            sx={{
                                borderColor: color,
                                color: color,
                                '&:hover': {
                                    backgroundColor: `${color}20`,
                                    borderColor: color,
                                },
                            }}
                        >
                            Add Meal
                        </Button>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

/* ─── Optimization Functions ──────────────────────────────────── */
const callOptimizationAPI = async (requirements, restrictions = [], objective = 'minimize_cost') => {
    try {
        const response = await fetch(`${API_ENDPOINTS.OPTIMIZATION_BACKEND}${API_ENDPOINTS.OPTIMIZE_BASIC}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                requirements,
                restrictions,
                objective,
            }),
        });
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Optimization API call failed:', error);
        return null;
    }
};

const OptimizationControls = ({ onOptimize, isOptimizing }) => {
    const theme = useTheme();
    
    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: theme.palette.text.secondary }}>
                🤖 Smart Meal Planning
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CostIcon />}
                    onClick={() => onOptimize('minimize_cost')}
                    disabled={isOptimizing}
                    sx={{
                        borderColor: OPTIMIZATION_COLORS.COST,
                        color: OPTIMIZATION_COLORS.COST,
                        '&:hover': { backgroundColor: `${OPTIMIZATION_COLORS.COST}10`, borderColor: OPTIMIZATION_COLORS.COST },
                    }}
                >
                    Minimize Cost
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ProteinIcon />}
                    onClick={() => onOptimize('high_protein')}
                    disabled={isOptimizing}
                    sx={{
                        borderColor: OPTIMIZATION_COLORS.PROTEIN,
                        color: OPTIMIZATION_COLORS.PROTEIN,
                        '&:hover': { backgroundColor: `${OPTIMIZATION_COLORS.PROTEIN}10`, borderColor: OPTIMIZATION_COLORS.PROTEIN },
                    }}
                >
                    High Protein
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<SmartIcon />}
                    onClick={() => onOptimize('balanced')}
                    disabled={isOptimizing}
                    sx={{
                        borderColor: OPTIMIZATION_COLORS.BALANCED,
                        color: OPTIMIZATION_COLORS.BALANCED,
                        '&:hover': { backgroundColor: `${OPTIMIZATION_COLORS.BALANCED}10`, borderColor: OPTIMIZATION_COLORS.BALANCED },
                    }}
                >
                    Balanced
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<OptimizeIcon />}
                    onClick={() => onOptimize('custom')}
                    disabled={isOptimizing}
                    sx={{
                        borderColor: '#9C27B0',
                        color: '#9C27B0',
                        '&:hover': { backgroundColor: '#9C27B010', borderColor: '#9C27B0' },
                    }}
                >
                    Custom
                </Button>
            </Box>
            {isOptimizing && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            border: '2px solid #f3f3f3',
                            borderTop: '2px solid #3498db',
                            animation: 'spin 2s linear infinite',
                            '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' },
                            },
                        }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        Optimizing your meal plan...
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

/* ─── Main Component ────────────────────────────────────────── */
export default function HourlyMealPlanner({ meals = {}, onAddMeal, onRemoveMeal, onUpdateMeals }) {
    const theme = useTheme();
    const [currentHour, setCurrentHour] = useState(new Date().getHours());
    const [selectedHour, setSelectedHour] = useState(new Date().getHours());
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState(null);

    // Update current hour every minute
    useEffect(() => {
        const updateCurrentHour = () => {
            setCurrentHour(new Date().getHours());
        };
        
        updateCurrentHour();
        const interval = setInterval(updateCurrentHour, 60000);
        return () => clearInterval(interval);
    }, []);

    // Get current and next meal
    const { currentMeal, nextMeal } = useMemo(() => {
        const now = new Date().getHours();
        let current = null;
        let next = null;

        // Find current meal (meal at current hour or most recent meal)
        for (let i = now; i >= 0; i--) {
            if (meals[i]) {
                current = { hour: i, meal: meals[i] };
                break;
            }
        }

        // Find next meal
        for (let i = now + 1; i < 24; i++) {
            if (meals[i]) {
                next = { hour: i, meal: meals[i] };
                break;
            }
        }

        return { currentMeal: current, nextMeal: next };
    }, [meals, currentHour]);

    // Get planned meal hours
    const plannedHours = Object.keys(meals).map(Number).sort((a, b) => a - b);

    const handleSliderChange = (_, value) => {
        setSelectedHour(Math.round(value));
    };

    const handleHourClick = (hour) => {
        setSelectedHour(hour);
    };

    // Handle optimization requests
    const handleOptimization = async (optimizationType) => {
        setIsOptimizing(true);
        
        // Define optimization parameters based on type
        let requirements = {
            min_calories: 1800,
            max_calories: 2200,
            min_protein: 50,
            min_fiber: 25,
            max_fat: 78
        };
        
        let objective = 'minimize_cost';
        let restrictions = [];
        
        switch (optimizationType) {
            case 'minimize_cost':
                // Default settings for cost minimization
                break;
            case 'high_protein':
                requirements.min_protein = 100;
                requirements.min_calories = 2200;
                requirements.max_calories = 2800;
                objective = 'minimize_cost';
                break;
            case 'balanced':
                requirements.min_fiber = 30;
                objective = 'multi_objective';
                break;
            case 'custom':
                // Could open a dialog for custom parameters
                requirements.min_calories = 2000;
                requirements.min_protein = 80;
                break;
        }
        
        try {
            const result = await callOptimizationAPI(requirements, restrictions, objective);
            
            if (result && result.feasible && onUpdateMeals) {
                // Convert optimization result to meal plan format
                const optimizedMeals = {};
                
                if (result.meals && Array.isArray(result.meals)) {
                    const mealTimeSlots = [8, 12, 18]; // Breakfast, Lunch, Dinner
                    let snackHour = 15; // Start snacks at 3 PM
                    
                    result.meals.forEach((mealSolution, index) => {
                        if (!mealSolution || typeof mealSolution.servings !== 'number') {
                            return; // Skip invalid meal solutions
                        }
                        
                        const servings = Math.ceil(mealSolution.servings);
                        
                        // Distribute servings across appropriate hours
                        for (let i = 0; i < servings && i < 3; i++) {
                            let assignedHour;
                            
                            // Assign main meals to fixed time slots
                            if (index < mealTimeSlots.length) {
                                assignedHour = mealTimeSlots[index] + (i * 2); // Space multiple servings 2 hours apart
                            } else {
                                // Assign snacks to later hours
                                assignedHour = snackHour + (i * 2);
                            }
                            
                            // Ensure hour is within valid range
                            if (assignedHour < 24 && !optimizedMeals[assignedHour]) {
                                optimizedMeals[assignedHour] = {
                                    title: mealSolution.meal || 'Unknown Meal',
                                    calories: Math.round((mealSolution.calories || 0) / mealSolution.servings),
                                    protein: Math.round((mealSolution.protein || 0) / mealSolution.servings),
                                    cost: (mealSolution.cost || 0) / mealSolution.servings,
                                    imageUrl: '', // Would be populated from meal database
                                    optimized: true
                                };
                            }
                        }
                    });
                }
                
                // Update the meal plan with optimized results
                onUpdateMeals(optimizedMeals);
                setOptimizationResult(result);
                
                // Show success notification (would integrate with snackbar)
                console.log('✅ Meal plan optimized successfully!', {
                    totalCost: result.objective_value,
                    nutrition: result.total_nutrition
                });
            } else {
                console.warn('⚠️ Optimization failed or not feasible');
            }
            
        } catch (error) {
            console.error('❌ Optimization error:', error);
        }
        
        setIsOptimizing(false);
    };

    return (
        <Box sx={{ mt: 2 }}>
            {/* Header */}
            <Box
                sx={{
                    background: createGradient(),
                    borderRadius: '22px',
                    px: 3,
                    py: 1.5,
                    mb: 2,
                }}
            >
                <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ color: 'white', textAlign: 'center' }}
                >
                    YOUR DAILY MEAL PLAN
                </Typography>
            </Box>

            {/* Optimization Controls */}
            <OptimizationControls 
                onOptimize={handleOptimization}
                isOptimizing={isOptimizing}
            />

            {/* Optimization Results Summary */}
            {optimizationResult && (
                <Fade in timeout={500}>
                    <Card
                        elevation={2}
                        sx={{
                            mb: 2,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white'
                        }}
                    >
                        <CardContent sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <OptimizeIcon sx={{ fontSize: 32 }} />
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            Optimized Meal Plan
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                            Total Cost: ${optimizationResult?.objective_value?.toFixed(2) || 'N/A'} • 
                                            {optimizationResult?.total_nutrition?.calories?.toFixed(0) || 0} cal • 
                                            {optimizationResult?.total_nutrition?.protein?.toFixed(1) || 0}g protein
                                        </Typography>
                                    </Box>
                                </Box>
                                <Chip 
                                    label="AI Optimized" 
                                    size="small"
                                    sx={{ 
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontWeight: 600
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Fade>
            )}

            {/* Current/Next Meal Display */}
            {(currentMeal || nextMeal) && (
                <Box sx={{ mb: 3 }}>
                    {currentMeal && (
                        <Fade in timeout={500}>
                            <Card
                                elevation={2}
                                sx={{
                                    mb: 1,
                                    border: `2px solid ${getColorForHour(currentMeal?.hour || 0)}`,
                                    backgroundColor: `${getColorForHour(currentMeal?.hour || 0)}10`,
                                }}
                            >
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="primary" gutterBottom>
                                        🍽️ Current Meal ({currentMeal?.hour || 0}:00)
                                    </Typography>
                                    <Typography variant="h6" fontWeight={600}>
                                        {currentMeal?.meal?.title || 'Unknown Meal'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Fade>
                    )}
                    
                    {nextMeal && (
                        <Fade in timeout={700}>
                            <Card
                                elevation={1}
                                sx={{
                                    border: `1px solid ${getColorForHour(nextMeal?.hour || 0)}`,
                                    backgroundColor: `${getColorForHour(nextMeal?.hour || 0)}05`,
                                }}
                            >
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        ⏰ Next Meal ({nextMeal?.hour || 0}:00)
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {nextMeal?.meal?.title || 'Unknown Meal'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Fade>
                    )}
                </Box>
            )}

            {/* Hour Slider */}
            <Box sx={{ position: 'relative', px: 2, py: 3, mb: 3 }}>
                <Slider
                    value={selectedHour}
                    onChange={handleSliderChange}
                    min={0}
                    max={23}
                    step={1}
                    sx={{
                        height: 12,
                        '& .MuiSlider-rail': {
                            height: 12,
                            borderRadius: 6,
                            background: createGradient(),
                            opacity: 1,
                        },
                        '& .MuiSlider-track': {
                            background: 'transparent',
                        },
                        '& .MuiSlider-thumb': {
                            width: 24,
                            height: 24,
                            backgroundColor: getColorForHour(selectedHour),
                            border: `3px solid ${theme.palette.background.paper}`,
                            boxShadow: theme.shadows[4],
                            '&:hover': {
                                boxShadow: theme.shadows[6],
                            },
                        },
                    }}
                />
                
                {/* Hour Markers */}
                {Array.from({ length: 24 }, (_, i) => (
                    <HourMarker
                        key={i}
                        hour={i}
                        isActive={i === selectedHour}
                        onClick={handleHourClick}
                    />
                ))}
            </Box>

            {/* Selected Hour Meal Slot */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Selected Hour: {selectedHour}:00
                </Typography>
                <MealSlot
                    hour={selectedHour}
                    meal={meals[selectedHour]}
                    onAddMeal={onAddMeal}
                    onRemoveMeal={onRemoveMeal}
                />
            </Box>

            {/* Planned Meals Summary */}
            {plannedHours.length > 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        All Planned Meals ({plannedHours.length})
                    </Typography>
                    {plannedHours.map(hour => (
                        <MealSlot
                            key={hour}
                            hour={hour}
                            meal={meals[hour]}
                            onAddMeal={onAddMeal}
                            onRemoveMeal={onRemoveMeal}
                        />
                    ))}
                </Box>
            )}

            {plannedHours.length === 0 && (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 4,
                        color: 'text.secondary',
                    }}
                >
                    <RestaurantIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" gutterBottom>
                        No meals planned yet
                    </Typography>
                    <Typography variant="body2">
                        Use the slider above to select an hour and add your first meal!
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

HourlyMealPlanner.propTypes = {
    meals: PropTypes.objectOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            calories: PropTypes.number,
            protein: PropTypes.number,
            imageUrl: PropTypes.string,
        })
    ),
    onAddMeal: PropTypes.func.isRequired,
    onRemoveMeal: PropTypes.func.isRequired,
};

HourlyMealPlanner.defaultProps = {
    meals: {},
};