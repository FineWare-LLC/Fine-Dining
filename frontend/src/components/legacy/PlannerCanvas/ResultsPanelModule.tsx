// @ts-nocheck
import { useApolloClient } from '@apollo/client/react';
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
    Alert,
    AlertTitle,
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
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { generatePersonalizedMealPlan } from '../../services/mealPlanGenerator';
import {
    buildGroceryListExportFeedbackContainerStyles,
    buildGroceryListExportFeedbackState,
} from '@/utils/shoppingListFeedback';
import NutritionSummaryFeedback from './NutritionSummaryFeedback';
import {
    calculateMealNutritionTotals,
    buildNutritionSummaryFeedbackState,
    resolveNutritionSummaryDisplayState,
    usePlannerStore,
} from './store/plannerStore';

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

const ZERO_NUTRITION_TOTALS = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    sodium: 0,
    fiber: 0,
    sugar: 0,
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
    const mealTotals = calculateMealNutritionTotals([meal]);
    const totalCalories = mealTotals.calories;
    const totalProtein = mealTotals.protein;

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
    const sectionTotals = calculateMealNutritionTotals(meals);
    const sectionCalories = sectionTotals.calories;

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

const TotalsPanel = ({
    totals,
    targets,
    complianceScore,
    onExplainPlan,
    nutritionSummaryDisplayState,
}) => {
    const theme = useTheme();
    const shouldShowRecoveryAlert = nutritionSummaryDisplayState?.shouldShowRecoveryAlert;

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

                {shouldShowRecoveryAlert ? (
                    <Box
                        sx={{
                            mt: 2,
                            minHeight: 180,
                            borderRadius: 2,
                            border: '1px dashed rgba(255,255,255,0.16)',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            px: 2,
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Daily totals will reappear after the planner recovers.
                        </Typography>
                    </Box>
                ) : (
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
                )}

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

const ExportOptions = ({ open, onClose, onExport, feedbackState = null }) => {
    const exportFeedbackStyles = buildGroceryListExportFeedbackContainerStyles(feedbackState?.state);
    const isLoading = feedbackState?.state === 'loading';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Export Options</DialogTitle>
            <DialogContent>
                <Box
                    role={feedbackState?.role || 'status'}
                    aria-live={feedbackState?.ariaLive || 'polite'}
                    aria-busy={feedbackState?.ariaBusy || 'false'}
                    aria-atomic="true"
                    sx={{
                        minHeight: feedbackState?.minHeight || 56,
                        mb: feedbackState ? 2 : 0,
                        p: 2,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: isLoading ? 'center' : 'flex-start',
                        gap: 1.5,
                        ...exportFeedbackStyles,
                    }}
                >
                    {feedbackState ? (
                        isLoading ? (
                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                <CircularProgress size={18} />
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    {feedbackState.title && (
                                        <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700 }}>
                                            {feedbackState.title}
                                        </Typography>
                                    )}
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                                        {feedbackState.message}
                                    </Typography>
                                </Box>
                            </Box>
                        ) : (
                            <Alert
                                severity={feedbackState.severity || 'info'}
                                role="presentation"
                                sx={{ alignItems: 'flex-start' }}
                            >
                                <Box>
                                    {feedbackState.title && <AlertTitle>{feedbackState.title}</AlertTitle>}
                                    {feedbackState.message}
                                </Box>
                            </Alert>
                        )
                    ) : null}
                </Box>
                <Stack spacing={2}>
                    <Button
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => onExport('grocery')}
                        variant="outlined"
                        fullWidth
                        disabled={isLoading}
                    >
                        Grocery List
                    </Button>
                    <Button
                        startIcon={<ScheduleIcon />}
                        onClick={() => onExport('schedule')}
                        variant="outlined"
                        fullWidth
                        disabled={isLoading}
                    >
                        Prep Schedule
                    </Button>
                    <Button
                        startIcon={<PrintIcon />}
                        onClick={() => onExport('print')}
                        variant="outlined"
                        fullWidth
                        disabled={isLoading}
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
        selectedMeals,
        nutritionTargets,
        complianceScore,
        updateMealServings,
        removeMealFromPlan,
        swapMeal,
        regenerateMealPlan,
        exportGroceryList,
        interestQuery,
        isGenerating,
        setIsGenerating,
        setGeneratedPlan,
    } = usePlannerStore();

    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [exportFeedbackState, setExportFeedbackState] = useState(null);
    const [explanationDrawerOpen, setExplanationDrawerOpen] = useState(false);
    const exportFeedbackTimeoutRef = useRef(null);

    const nutritionSummaryState = resolveNutritionSummaryDisplayState(selectedMeals);
    const nutritionSummaryFeedbackState = buildNutritionSummaryFeedbackState({
        isLoading: isGenerating,
        summaryState: nutritionSummaryState.summaryState,
    });
    const dailyTotals = nutritionSummaryState.dailyTotals || ZERO_NUTRITION_TOTALS;
    const selectedMealCount = selectedMeals.length;

    const clearExportFeedbackTimeout = useCallback(() => {
        if (exportFeedbackTimeoutRef.current !== null) {
            clearTimeout(exportFeedbackTimeoutRef.current);
            exportFeedbackTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => () => {
        clearExportFeedbackTimeout();
    }, [clearExportFeedbackTimeout]);

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

    const handleOpenExportDialog = useCallback(() => {
        clearExportFeedbackTimeout();
        setExportFeedbackState(buildGroceryListExportFeedbackState({
            selectedMealCount,
        }));
        setExportDialogOpen(true);
    }, [clearExportFeedbackTimeout, selectedMealCount]);

    const handleCloseExportDialog = useCallback(() => {
        clearExportFeedbackTimeout();
        setExportFeedbackState(null);
        setExportDialogOpen(false);
    }, [clearExportFeedbackTimeout]);

    const handleExport = useCallback((type) => {
        try {
            switch (type) {
                case 'grocery': {
                    clearExportFeedbackTimeout();
                    setExportFeedbackState(buildGroceryListExportFeedbackState({
                        isLoading: true,
                    }));
                    exportFeedbackTimeoutRef.current = setTimeout(() => {
                        try {
                            const groceryList = exportGroceryList();
                            console.log('Grocery list:', groceryList);
                            setExportFeedbackState(buildGroceryListExportFeedbackState({
                                exportedItemCount: Array.isArray(groceryList) ? groceryList.length : 0,
                            }));
                        } catch (error) {
                            console.error('Meal plan export failed:', error);
                            setExportFeedbackState(buildGroceryListExportFeedbackState({ error }));
                        } finally {
                            exportFeedbackTimeoutRef.current = null;
                        }
                    }, 0);
                    break;
                }
                case 'schedule':
                    console.log('Export prep schedule');
                    clearExportFeedbackTimeout();
                    setExportFeedbackState(null);
                    setExportDialogOpen(false);
                    break;
                case 'print':
                    window.print();
                    clearExportFeedbackTimeout();
                    setExportFeedbackState(null);
                    setExportDialogOpen(false);
                    break;
            }
        } catch (error) {
            console.error('Meal plan export failed:', error);
            setExportFeedbackState(buildGroceryListExportFeedbackState({ error }));
        }
    }, [clearExportFeedbackTimeout, exportGroceryList]);

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
                            onClick={handleOpenExportDialog}
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

            <Box sx={{ width: 320, borderLeft: `1px solid ${theme.palette.divider}`, p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <NutritionSummaryFeedback feedbackState={nutritionSummaryFeedbackState} />
                <TotalsPanel
                    totals={dailyTotals}
                    targets={nutritionTargets}
                    complianceScore={complianceScore}
                    onExplainPlan={() => setExplanationDrawerOpen(true)}
                    nutritionSummaryDisplayState={nutritionSummaryState}
                />
            </Box>

            <ExportOptions
                open={exportDialogOpen}
                onClose={handleCloseExportDialog}
                onExport={handleExport}
                feedbackState={exportFeedbackState}
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
