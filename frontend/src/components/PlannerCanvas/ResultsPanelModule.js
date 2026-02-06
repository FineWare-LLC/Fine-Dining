import React, { useState, useCallback, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    IconButton,
    Button,
    Chip,
    Stack,
    Grid,
    Divider,
    LinearProgress,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Tooltip,
    Badge,
    Fab,
    useTheme,
    alpha,
    Stepper,
    Step,
    StepLabel,
    TextField,
    InputAdornment,
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    SwapHoriz as SwapIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Info as InfoIcon,
    GetApp as ExportIcon,
    Print as PrintIcon,
    ShoppingCart as ShoppingCartIcon,
    Schedule as ScheduleIcon,
    Restaurant as RestaurantIcon,
    LocalDining as DiningIcon,
    Fastfood as FastfoodIcon,
    Coffee as CoffeeIcon,
    Close as CloseIcon,
    CheckCircle as CheckIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';

import { useApolloClient } from '@apollo/client/react';
import { useAuth } from '../../context/AuthContext';
import { generatePersonalizedMealPlan } from '../../services/mealPlanGenerator';
import { usePlannerStore } from './store/plannerStore';

const getMealTypeIcon = (mealType) => {
    switch (mealType) {
        case 'breakfast': return <CoffeeIcon />;
        case 'lunch': return <DiningIcon />;
        case 'dinner': return <RestaurantIcon />;
        case 'snacks': return <FastfoodIcon />;
        default: return <RestaurantIcon />;
    }
};

const getMealTypeColor = (mealType, theme) => {
    switch (mealType) {
        case 'breakfast': return theme.palette.warning.main;
        case 'lunch': return theme.palette.info.main;
        case 'dinner': return theme.palette.primary.main;
        case 'snacks': return theme.palette.success.main;
        default: return theme.palette.grey[500];
    }
};

const ServingControl = ({ value, onChange, min = 0.5, max = 5, step = 0.5 }) => {
    const theme = useTheme();
    
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
                size="small"
                onClick={() => onChange(Math.max(min, value - step))}
                disabled={value <= min}
                sx={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
                }}
            >
                <RemoveIcon fontSize="small" />
            </IconButton>
            
            <TextField
                value={value}
                onChange={(e) => {
                    const newValue = parseFloat(e.target.value) || min;
                    if (newValue >= min && newValue <= max) {
                        onChange(newValue);
                    }
                }}
                size="small"
                sx={{ 
                    width: 80,
                    '& .MuiOutlinedInput-root': {
                        textAlign: 'center',
                    }
                }}
                InputProps={{
                    endAdornment: <InputAdornment position="end">x</InputAdornment>,
                }}
            />
            
            <IconButton
                size="small"
                onClick={() => onChange(Math.min(max, value + step))}
                disabled={value >= max}
                sx={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) }
                }}
            >
                <AddIcon fontSize="small" />
            </IconButton>
        </Box>
    );
};

const PlanMealCard = ({ meal, onUpdateServings, onSwap, onRemove }) => {
    const theme = useTheme();
    const [swapDialogOpen, setSwapDialogOpen] = useState(false);
    
    const imageUrl = meal.recipe?.images?.[0] || `https://source.unsplash.com/300x200/?food,${meal.cuisine}&sig=${meal.id}`;
    
    const totalCalories = (meal.nutrition?.calories || 0) * (meal.servings || 1);
    const totalProtein = (meal.nutrition?.protein || 0) * (meal.servings || 1);
    
    return (
        <Card
            sx={{
                display: 'flex',
                mb: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: theme.shadows[4],
                },
            }}
        >
            <CardMedia
                component="img"
                sx={{ width: 120, height: 120, objectFit: 'cover' }}
                image={imageUrl}
                alt={meal.mealName}
            />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <CardContent sx={{ flex: 1, pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h3" noWrap sx={{ flex: 1, mr: 1 }}>
                            {meal.mealName}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => onRemove(meal.id, meal.mealType)}
                            sx={{ color: theme.palette.error.main }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip
                            label={`${Math.round(totalCalories)} cal`}
                            size="small"
                            variant="outlined"
                        />
                        <Chip
                            label={`${Math.round(totalProtein)}g protein`}
                            size="small"
                            variant="outlined"
                        />
                        {meal.prepTime && (
                            <Chip
                                label={`${meal.prepTime}min`}
                                size="small"
                                variant="outlined"
                            />
                        )}
                    </Stack>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                Servings:
                            </Typography>
                            <ServingControl
                                value={meal.servings || 1}
                                onChange={(newServings) => onUpdateServings(meal.id, newServings)}
                            />
                        </Box>
                        
                        <Button
                            size="small"
                            startIcon={<SwapIcon />}
                            onClick={() => setSwapDialogOpen(true)}
                            variant="outlined"
                        >
                            Swap
                        </Button>
                    </Box>
                </CardContent>
            </Box>
            
            <Dialog
                open={swapDialogOpen}
                onClose={() => setSwapDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Swap {meal.mealName}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Meal swap functionality would show similar meals here.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSwapDialogOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

const MealSection = ({ 
    mealType, 
    meals, 
    onUpdateServings, 
    onSwap, 
    onRemove, 
    onRegenerate,
    onAddMeal 
}) => {
    const theme = useTheme();
    const mealTypeColor = getMealTypeColor(mealType, theme);
    const mealTypeIcon = getMealTypeIcon(mealType);
    
    const sectionCalories = meals.reduce((sum, meal) => 
        sum + ((meal.nutrition?.calories || 0) * (meal.servings || 1)), 0
    );
    
    return (
        <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: alpha(mealTypeColor, 0.1),
                            color: mealTypeColor,
                        }}
                    >
                        {mealTypeIcon}
                    </Box>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                        {mealType}
                    </Typography>
                    <Chip
                        label={`${Math.round(sectionCalories)} cal`}
                        size="small"
                        sx={{
                            backgroundColor: alpha(mealTypeColor, 0.1),
                            color: mealTypeColor,
                        }}
                    />
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => onAddMeal(mealType)}
                        variant="outlined"
                    >
                        Add
                    </Button>
                    <Button
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={() => onRegenerate([mealType])}
                        variant="outlined"
                    >
                        Regenerate
                    </Button>
                </Box>
            </Box>
            
            {meals.length > 0 ? (
                meals.map((meal) => (
                    <PlanMealCard
                        key={meal.id}
                        meal={meal}
                        onUpdateServings={onUpdateServings}
                        onSwap={onSwap}
                        onRemove={onRemove}
                    />
                ))
            ) : (
                <Card
                    sx={{
                        p: 3,
                        textAlign: 'center',
                        backgroundColor: alpha(theme.palette.grey[100], 0.5),
                        border: `2px dashed ${theme.palette.grey[300]}`,
                    }}
                >
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        No meals planned for {mealType}
                    </Typography>
                    <Button
                        startIcon={<AddIcon />}
                        onClick={() => onAddMeal(mealType)}
                        variant="outlined"
                        size="small"
                    >
                        Add Meal
                    </Button>
                </Card>
            )}
        </Box>
    );
};

const TotalsPanel = ({ totals, targets, complianceScore, onExplainPlan }) => {
    const theme = useTheme();
    
    const getComplianceColor = (score) => {
        if (score >= 85) return theme.palette.success.main;
        if (score >= 70) return theme.palette.warning.main;
        return theme.palette.error.main;
    };
    
    const getNutrientStatus = (current, target) => {
        if (!target) return 'unknown';
        
        if (target.min && target.max) {
            if (current >= target.min && current <= target.max) return 'good';
            if (current >= target.min * 0.8 && current <= target.max * 1.2) return 'close';
            return 'off';
        }
        
        if (current >= target * 0.9 && current <= target * 1.1) return 'good';
        if (current >= target * 0.8 && current <= target * 1.2) return 'close';
        return 'off';
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'good': return theme.palette.success.main;
            case 'close': return theme.palette.warning.main;
            case 'off': return theme.palette.error.main;
            default: return theme.palette.grey[500];
        }
    };
    
    const getStatusIcon = (status) => {
        switch (status) {
            case 'good': return <CheckIcon fontSize="small" />;
            case 'close': return <WarningIcon fontSize="small" />;
            case 'off': return <ErrorIcon fontSize="small" />;
            default: return null;
        }
    };
    
    return (
        <Card sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <CardContent>
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ color: getComplianceColor(complianceScore), mb: 1 }}>
                        {complianceScore}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Compliance Score
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={complianceScore}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: getComplianceColor(complianceScore),
                                borderRadius: 4,
                            },
                        }}
                    />
                </Box>
                
                <Typography variant="h6" gutterBottom>
                    Daily Totals
                </Typography>
                
                <Stack spacing={2}>
                    {Object.entries(targets).map(([nutrient, target]) => {
                        const current = totals[nutrient] || 0;
                        const status = getNutrientStatus(current, target);
                        const unit = nutrient === 'calories' ? 'cal' : 'g';
                        
                        return (
                            <Box key={nutrient}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {getStatusIcon(status)}
                                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                            {nutrient}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight={600}>
                                        {Math.round(current)}{unit}
                                    </Typography>
                                </Box>
                                
                                <LinearProgress
                                    variant="determinate"
                                    value={target.max ? Math.min(100, (current / target.max) * 100) : Math.min(100, (current / target) * 100)}
                                    sx={{
                                        height: 4,
                                        borderRadius: 2,
                                        backgroundColor: theme.palette.grey[200],
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: getStatusColor(status),
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                                
                                {target.min && target.max && (
                                    <Typography variant="caption" color="text.secondary">
                                        Target: {target.min}-{target.max}{unit}
                                    </Typography>
                                )}
                            </Box>
                        );
                    })}
                </Stack>
                
                <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                        size="small"
                        startIcon={<InfoIcon />}
                        onClick={onExplainPlan}
                        variant="outlined"
                        fullWidth
                    >
                        Why This Plan?
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

const ExportOptions = ({ open, onClose, onExport }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Export Options</DialogTitle>
            <DialogContent>
                <Stack spacing={2}>
                    <Button
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => onExport('grocery')}
                        variant="outlined"
                        fullWidth
                    >
                        Grocery List
                    </Button>
                    <Button
                        startIcon={<ScheduleIcon />}
                        onClick={() => onExport('schedule')}
                        variant="outlined"
                        fullWidth
                    >
                        Prep Schedule
                    </Button>
                    <Button
                        startIcon={<PrintIcon />}
                        onClick={() => onExport('print')}
                        variant="outlined"
                        fullWidth
                    >
                        Print View
                    </Button>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

const PlanExplanationDrawer = ({ open, onClose, explanation }) => {
    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    maxHeight: '50vh',
                }
            }}
        >
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Why This Plan?</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                    This meal plan was generated based on your nutrition targets and dietary preferences. 
                    Here's how it meets your goals:
                </Typography>
                
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Calorie Target Met"
                            secondary="Your daily calorie intake is within the target range"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Protein Goals Achieved"
                            secondary="Adequate protein distribution across meals"
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <WarningIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Sodium Slightly High"
                            secondary="Consider reducing portion sizes or swapping high-sodium items"
                        />
                    </ListItem>
                </List>
            </Box>
        </Drawer>
    );
};

const ResultsPanelModule = () => {
    const theme = useTheme();
    const apolloClient = useApolloClient();
    const { user } = useAuth();

    const {
        mealPlan,
        nutritionTargets,
        complianceScore,
        updateMealServings,
        removeMealFromPlan,
        swapMeal,
        regenerateMealPlan,
        getDailyTotals,
        exportGroceryList,
        interestQuery,
        isGenerating,
        setIsGenerating,
        setGeneratedPlan,
    } = usePlannerStore();
    
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [explanationDrawerOpen, setExplanationDrawerOpen] = useState(false);
    
    const dailyTotals = getDailyTotals();
    
    const handleUpdateServings = useCallback((mealId, servings) => {
        updateMealServings(mealId, servings);
    }, [updateMealServings]);
    
    const handleRemoveMeal = useCallback((mealId, mealType) => {
        removeMealFromPlan(mealId, mealType);
    }, [removeMealFromPlan]);
    
    const handleSwapMeal = useCallback((oldMealId, newMeal, mealType) => {
        swapMeal(oldMealId, newMeal, mealType);
    }, [swapMeal]);
    
    const handleRegenerate = useCallback(async (mealTypes) => {
        if (!user) {
            console.warn("User not authenticated, cannot generate plan.");
            return;
        }

        setIsGenerating(true);
        try {
            console.log("Generating plan with:", { interestQuery, nutritionTargets });
            const result = await generatePersonalizedMealPlan(
                apolloClient, 
                user.id, 
                interestQuery, 
                nutritionTargets
            );
            
            console.log("Generation result:", result);
            setGeneratedPlan(result);
        } catch (error) {
            console.error("Optimization failed:", error);
            // Could add a toast notification here
        } finally {
            setIsGenerating(false);
        }
    }, [user, interestQuery, nutritionTargets, apolloClient, setIsGenerating, setGeneratedPlan]);
    
    const handleAddMeal = useCallback((mealType) => {
        console.log('Add meal to', mealType);
    }, []);
    
    const handleExport = useCallback((type) => {
        switch (type) {
            case 'grocery':
                const groceryList = exportGroceryList();
                console.log('Grocery list:', groceryList);
                break;
            case 'schedule':
                console.log('Export prep schedule');
                break;
            case 'print':
                window.print();
                break;
        }
        setExportDialogOpen(false);
    }, [exportGroceryList]);
    
    const totalMeals = Object.values(mealPlan).flat().length;
    
    return (
        <Box sx={{ height: '100%', display: 'flex' }}>
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">
                        Today's Meal Plan
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            startIcon={isGenerating ? <CircularProgress size={20} /> : <RefreshIcon />}
                            onClick={() => handleRegenerate(['breakfast', 'lunch', 'dinner'])}
                            variant="outlined"
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Optimizing...' : 'Regenerate All'}
                        </Button>
                        <Button
                            startIcon={<ExportIcon />}
                            onClick={() => setExportDialogOpen(true)}
                            variant="outlined"
                        >
                            Export
                        </Button>
                    </Box>
                </Box>
                
                {isGenerating && (
                    <Box sx={{ width: '100%', mb: 3 }}>
                         <LinearProgress />
                         <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                             Finding the best meals for your diet...
                         </Typography>
                    </Box>
                )}

                {!isGenerating && totalMeals === 0 && (
                    <Card sx={{ p: 4, textAlign: 'center', mb: 3 }}>
                        <RestaurantIcon sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            No meals planned yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Start by browsing the meal catalog or use one of these quick options:
                        </Typography>
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button variant="outlined" onClick={() => handleAddMeal('breakfast')}>
                                Add Breakfast
                            </Button>
                            <Button variant="outlined" onClick={() => handleAddMeal('lunch')}>
                                Add Lunch
                            </Button>
                            <Button variant="outlined" onClick={() => handleAddMeal('dinner')}>
                                Add Dinner
                            </Button>
                        </Stack>
                    </Card>
                )}
                
                {['breakfast', 'lunch', 'dinner', 'snacks'].map((mealType) => (
                    <MealSection
                        key={mealType}
                        mealType={mealType}
                        meals={mealPlan[mealType] || []}
                        onUpdateServings={handleUpdateServings}
                        onSwap={handleSwapMeal}
                        onRemove={handleRemoveMeal}
                        onRegenerate={handleRegenerate}
                        onAddMeal={handleAddMeal}
                    />
                ))}
            </Box>
            
            <Box sx={{ width: 320, borderLeft: `1px solid ${theme.palette.divider}`, p: 2 }}>
                <TotalsPanel
                    totals={dailyTotals}
                    targets={nutritionTargets}
                    complianceScore={complianceScore}
                    onExplainPlan={() => setExplanationDrawerOpen(true)}
                />
            </Box>
            
            <ExportOptions
                open={exportDialogOpen}
                onClose={() => setExportDialogOpen(false)}
                onExport={handleExport}
            />
            
            <PlanExplanationDrawer
                open={explanationDrawerOpen}
                onClose={() => setExplanationDrawerOpen(false)}
                explanation=""
            />
        </Box>
    );
};

export default ResultsPanelModule;
