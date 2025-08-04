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
} from '@mui/icons-material';
import PropTypes from 'prop-types';
import React, { useState, useEffect, useMemo } from 'react';

/* ─── Color System ────────────────────────────────────────────── */
const HOUR_COLORS = [
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

/* ─── Main Component ────────────────────────────────────────── */
export default function HourlyMealPlanner({ meals = {}, onAddMeal, onRemoveMeal }) {
    const theme = useTheme();
    const [currentHour, setCurrentHour] = useState(new Date().getHours());
    const [selectedHour, setSelectedHour] = useState(new Date().getHours());

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

            {/* Current/Next Meal Display */}
            {(currentMeal || nextMeal) && (
                <Box sx={{ mb: 3 }}>
                    {currentMeal && (
                        <Fade in timeout={500}>
                            <Card
                                elevation={2}
                                sx={{
                                    mb: 1,
                                    border: `2px solid ${getColorForHour(currentMeal.hour)}`,
                                    backgroundColor: `${getColorForHour(currentMeal.hour)}10`,
                                }}
                            >
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="primary" gutterBottom>
                                        🍽️ Current Meal ({currentMeal.hour}:00)
                                    </Typography>
                                    <Typography variant="h6" fontWeight={600}>
                                        {currentMeal.meal.title}
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
                                    border: `1px solid ${getColorForHour(nextMeal.hour)}`,
                                    backgroundColor: `${getColorForHour(nextMeal.hour)}05`,
                                }}
                            >
                                <CardContent sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        ⏰ Next Meal ({nextMeal.hour}:00)
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {nextMeal.meal.title}
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