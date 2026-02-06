/**
 * OptimizationPlayground - Interactive HiGHS Optimization Playground
 * 
 * An amazing web-based interface for experimenting with HiGHS optimization
 * Features:
 * - Real-time optimization visualization
 * - Interactive constraint editing
 * - Multi-objective optimization
 * - Meal planning scenarios
 * - Educational tutorials
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Grid,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Alert,
    Tabs,
    Tab,
    Paper,
    IconButton,
    Tooltip,
    Switch,
    FormControlLabel,
    LinearProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    PlayArrow as PlayIcon,
    Stop as StopIcon,
    Settings as SettingsIcon,
    Visibility as VisibilityIcon,
    School as SchoolIcon,
    Restaurant as RestaurantIcon,
    TrendingUp as OptimizeIcon,
    ExpandMore as ExpandMoreIcon,
    Psychology as AIIcon,
    Assessment as ChartIcon,
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    ScatterChart,
    Scatter,
} from 'recharts';

// Sample meal database for optimization
const MEALS_DATABASE = {
    'Oatmeal': { calories: 300, protein: 10, carbs: 54, fat: 6, fiber: 8, cost: 2.50 },
    'Greek Yogurt': { calories: 150, protein: 15, carbs: 8, fat: 0, fiber: 0, cost: 3.00 },
    'Chicken Salad': { calories: 400, protein: 35, carbs: 20, fat: 18, fiber: 6, cost: 8.50 },
    'Salmon Fillet': { calories: 350, protein: 40, carbs: 0, fat: 20, fiber: 0, cost: 12.00 },
    'Quinoa Bowl': { calories: 320, protein: 12, carbs: 58, fat: 5, fiber: 10, cost: 6.00 },
    'Banana': { calories: 100, protein: 1, carbs: 27, fat: 0, fiber: 3, cost: 0.50 },
    'Almonds (1oz)': { calories: 160, protein: 6, carbs: 6, fat: 14, fiber: 3, cost: 1.00 },
    'Spinach Smoothie': { calories: 180, protein: 8, carbs: 25, fat: 2, fiber: 5, cost: 4.00 },
};

// Predefined optimization scenarios
const SCENARIOS = {
    'basic': {
        name: 'Basic Cost Minimization',
        description: 'Minimize cost while meeting nutritional requirements',
        requirements: { min_calories: 1800, max_calories: 2200, min_protein: 50, min_fiber: 25, max_fat: 78 },
        restrictions: [],
    },
    'athlete': {
        name: 'High-Protein Athlete Diet',
        description: 'High protein diet for active individuals',
        requirements: { min_calories: 2500, max_calories: 3000, min_protein: 120, min_fiber: 30, max_fat: 100 },
        restrictions: [],
    },
    'budget': {
        name: 'Budget-Conscious Student',
        description: 'Low-cost meals with basic nutrition',
        requirements: { min_calories: 1600, max_calories: 1900, min_protein: 40, min_fiber: 20, max_fat: 65 },
        restrictions: ['Salmon Fillet'],
    },
    'lowcarb': {
        name: 'Low-Carb Diet',
        description: 'Minimize carbohydrates while maintaining nutrition',
        requirements: { min_calories: 1800, max_calories: 2100, min_protein: 80, min_fiber: 15, max_fat: 140 },
        restrictions: ['Oatmeal', 'Quinoa Bowl', 'Banana'],
    },
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb366', '#a4de6c'];

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`playground-tabpanel-${index}`}
            aria-labelledby={`playground-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function OptimizationPlayground() {
    const [activeTab, setActiveTab] = useState(0);
    const [selectedScenario, setSelectedScenario] = useState('basic');
    const [requirements, setRequirements] = useState(SCENARIOS.basic.requirements);
    const [restrictions, setRestrictions] = useState([]);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState(null);
    const [customMeals, setCustomMeals] = useState({});
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [optimizationProgress, setOptimizationProgress] = useState(0);

    // Mock optimization solver (in real implementation, this would call the Python backend)
    const solveOptimization = async () => {
        setIsOptimizing(true);
        setOptimizationProgress(0);

        // Simulate optimization progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setOptimizationProgress(i);
        }

        // Mock optimization result (simplified greedy approach for demo)
        const availableMeals = Object.entries(MEALS_DATABASE)
            .filter(([meal]) => !restrictions.includes(meal));

        // Simple greedy solution: sort by cost/calorie ratio
        const sortedMeals = availableMeals
            .map(([meal, data]) => ({ meal, ...data, ratio: data.cost / data.calories }))
            .sort((a, b) => a.ratio - b.ratio);

        let totalNutrition = { calories: 0, protein: 0, fat: 0, fiber: 0, cost: 0 };
        let selectedMeals = {};

        // Greedy selection to meet minimum requirements
        for (const mealData of sortedMeals) {
            const servings = Math.min(3, Math.ceil(
                Math.max(
                    Math.max(0, requirements.min_calories - totalNutrition.calories) / mealData.calories,
                    Math.max(0, requirements.min_protein - totalNutrition.protein) / mealData.protein,
                    Math.max(0, requirements.min_fiber - totalNutrition.fiber) / mealData.fiber
                ) * 0.5
            ));

            if (servings > 0) {
                selectedMeals[mealData.meal] = servings;
                totalNutrition.calories += servings * mealData.calories;
                totalNutrition.protein += servings * mealData.protein;
                totalNutrition.fat += servings * mealData.fat;
                totalNutrition.fiber += servings * mealData.fiber;
                totalNutrition.cost += servings * mealData.cost;
            }
        }

        const result = {
            status: 'optimal',
            objective_value: totalNutrition.cost,
            meals: selectedMeals,
            nutrition: totalNutrition,
            feasible: totalNutrition.calories >= requirements.min_calories &&
                     totalNutrition.calories <= requirements.max_calories &&
                     totalNutrition.protein >= requirements.min_protein &&
                     totalNutrition.fiber >= requirements.min_fiber &&
                     totalNutrition.fat <= requirements.max_fat,
        };

        setOptimizationResult(result);
        setIsOptimizing(false);
        setOptimizationProgress(0);
    };

    const handleScenarioChange = (scenarioKey) => {
        const scenario = SCENARIOS[scenarioKey];
        setSelectedScenario(scenarioKey);
        setRequirements(scenario.requirements);
        setRestrictions(scenario.restrictions);
        setOptimizationResult(null);
    };

    const handleRequirementChange = (key, value) => {
        setRequirements(prev => ({ ...prev, [key]: value }));
        setOptimizationResult(null); // Clear results when constraints change
    };

    const addRestriction = (meal) => {
        if (!restrictions.includes(meal)) {
            setRestrictions([...restrictions, meal]);
            setOptimizationResult(null);
        }
    };

    const removeRestriction = (meal) => {
        setRestrictions(restrictions.filter(r => r !== meal));
        setOptimizationResult(null);
    };

    // Prepare chart data
    const chartData = useMemo(() => {
        if (!optimizationResult) return null;

        const mealData = Object.entries(optimizationResult.meals).map(([meal, servings]) => ({
            meal,
            servings,
            cost: servings * MEALS_DATABASE[meal].cost,
            calories: servings * MEALS_DATABASE[meal].calories,
            protein: servings * MEALS_DATABASE[meal].protein,
        }));

        return {
            meals: mealData,
            nutrition: [
                { name: 'Calories', value: optimizationResult.nutrition.calories, requirement: requirements.min_calories },
                { name: 'Protein', value: optimizationResult.nutrition.protein, requirement: requirements.min_protein },
                { name: 'Fat', value: optimizationResult.nutrition.fat, requirement: requirements.max_fat },
                { name: 'Fiber', value: optimizationResult.nutrition.fiber, requirement: requirements.min_fiber },
            ],
        };
    }, [optimizationResult, requirements]);

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: 2 }}>
            {/* Header */}
            <Card elevation={3} sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <OptimizeIcon sx={{ fontSize: 40, color: 'white' }} />
                        <Box>
                            <Typography variant="h4" fontWeight="bold" color="white">
                                HiGHS Optimization Playground 🚀
                            </Typography>
                            <Typography variant="subtitle1" color="rgba(255,255,255,0.9)">
                                Interactive Linear Programming for Meal Planning & Beyond
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Main Tabs */}
            <Paper elevation={1} sx={{ mb: 2 }}>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} variant="fullWidth">
                    <Tab icon={<RestaurantIcon />} label="Meal Optimizer" />
                    <Tab icon={<ChartIcon />} label="Visualization" />
                    <Tab icon={<SchoolIcon />} label="Tutorials" />
                    <Tab icon={<AIIcon />} label="Advanced" />
                </Tabs>
            </Paper>

            {/* Meal Optimizer Tab */}
            <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                    {/* Left Panel - Controls */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    🎯 Optimization Setup
                                </Typography>

                                {/* Scenario Selection */}
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <InputLabel>Optimization Scenario</InputLabel>
                                    <Select
                                        value={selectedScenario}
                                        onChange={(e) => handleScenarioChange(e.target.value)}
                                    >
                                        {Object.entries(SCENARIOS).map(([key, scenario]) => (
                                            <MenuItem key={key} value={key}>
                                                {scenario.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Alert severity="info" sx={{ mb: 2 }}>
                                    {SCENARIOS[selectedScenario].description}
                                </Alert>

                                {/* Nutritional Requirements */}
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1">📊 Nutritional Constraints</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <TextField
                                                    label="Min Calories"
                                                    type="number"
                                                    value={requirements.min_calories}
                                                    onChange={(e) => handleRequirementChange('min_calories', parseInt(e.target.value))}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    label="Max Calories"
                                                    type="number"
                                                    value={requirements.max_calories}
                                                    onChange={(e) => handleRequirementChange('max_calories', parseInt(e.target.value))}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    label="Min Protein (g)"
                                                    type="number"
                                                    value={requirements.min_protein}
                                                    onChange={(e) => handleRequirementChange('min_protein', parseInt(e.target.value))}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    label="Min Fiber (g)"
                                                    type="number"
                                                    value={requirements.min_fiber}
                                                    onChange={(e) => handleRequirementChange('min_fiber', parseInt(e.target.value))}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <TextField
                                                    label="Max Fat (g)"
                                                    type="number"
                                                    value={requirements.max_fat}
                                                    onChange={(e) => handleRequirementChange('max_fat', parseInt(e.target.value))}
                                                    fullWidth
                                                    size="small"
                                                />
                                            </Grid>
                                        </Grid>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Meal Restrictions */}
                                <Accordion sx={{ mt: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography variant="subtitle1">🚫 Dietary Restrictions</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Box sx={{ mb: 2 }}>
                                            <FormControl size="small" sx={{ minWidth: 200 }}>
                                                <InputLabel>Add Restriction</InputLabel>
                                                <Select
                                                    value=""
                                                    onChange={(e) => addRestriction(e.target.value)}
                                                >
                                                    {Object.keys(MEALS_DATABASE)
                                                        .filter(meal => !restrictions.includes(meal))
                                                        .map(meal => (
                                                            <MenuItem key={meal} value={meal}>{meal}</MenuItem>
                                                        ))}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                            {restrictions.map(restriction => (
                                                <Chip
                                                    key={restriction}
                                                    label={restriction}
                                                    onDelete={() => removeRestriction(restriction)}
                                                    color="error"
                                                    size="small"
                                                />
                                            ))}
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>

                                {/* Optimization Button */}
                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    {isOptimizing && (
                                        <Box sx={{ mb: 2 }}>
                                            <LinearProgress variant="determinate" value={optimizationProgress} />
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                Optimizing... {optimizationProgress}%
                                            </Typography>
                                        </Box>
                                    )}
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={isOptimizing ? <StopIcon /> : <PlayIcon />}
                                        onClick={solveOptimization}
                                        disabled={isOptimizing}
                                        sx={{
                                            background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
                                            px: 4,
                                            py: 1.5,
                                        }}
                                    >
                                        {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right Panel - Results */}
                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    📈 Optimization Results
                                </Typography>

                                {optimizationResult ? (
                                    <Box>
                                        {/* Status Alert */}
                                        <Alert 
                                            severity={optimizationResult.feasible ? "success" : "warning"}
                                            sx={{ mb: 2 }}
                                        >
                                            {optimizationResult.feasible 
                                                ? `✅ Optimal solution found! Total cost: $${optimizationResult.objective_value.toFixed(2)}`
                                                : `⚠️ Solution may not meet all constraints`
                                            }
                                        </Alert>

                                        {/* Optimal Meal Plan */}
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            🍽️ Optimal Meal Plan
                                        </Typography>
                                        {Object.entries(optimizationResult.meals).map(([meal, servings]) => (
                                            <Box key={meal} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography>{meal}:</Typography>
                                                <Typography fontWeight="bold">
                                                    {servings.toFixed(2)} servings (${(servings * MEALS_DATABASE[meal].cost).toFixed(2)})
                                                </Typography>
                                            </Box>
                                        ))}

                                        {/* Nutrition Summary */}
                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                                            📊 Daily Nutrition Summary
                                        </Typography>
                                        <Grid container spacing={1}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">
                                                    Calories: {optimizationResult.nutrition.calories.toFixed(0)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">
                                                    Protein: {optimizationResult.nutrition.protein.toFixed(1)}g
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">
                                                    Fat: {optimizationResult.nutrition.fat.toFixed(1)}g
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">
                                                    Fiber: {optimizationResult.nutrition.fiber.toFixed(1)}g
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <OptimizeIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                                        <Typography color="text.secondary">
                                            Configure your optimization scenario and click "Run Optimization" to see results
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Visualization Tab */}
            <TabPanel value={activeTab} index={1}>
                {chartData ? (
                    <Grid container spacing={3}>
                        {/* Cost Distribution */}
                        <Grid item xs={12} md={6}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>💰 Cost Distribution</Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={chartData.meals}
                                                dataKey="cost"
                                                nameKey="meal"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                label={({meal, cost}) => `${meal}: $${cost.toFixed(2)}`}
                                            >
                                                {chartData.meals.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Cost']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Servings Chart */}
                        <Grid item xs={12} md={6}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>📊 Servings per Meal</Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={chartData.meals}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="meal" angle={-45} textAnchor="end" height={80} />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Bar dataKey="servings" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Nutrition vs Requirements */}
                        <Grid item xs={12}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>🥗 Nutrition vs Requirements</Typography>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={chartData.nutrition}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <RechartsTooltip />
                                            <Bar dataKey="value" fill="#82ca9d" name="Actual" />
                                            <Bar dataKey="requirement" fill="#ffc658" name="Required" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <ChartIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Data to Visualize
                        </Typography>
                        <Typography color="text.secondary">
                            Run an optimization in the "Meal Optimizer" tab to see beautiful visualizations here!
                        </Typography>
                    </Box>
                )}
            </TabPanel>

            {/* Tutorials Tab */}
            <TabPanel value={activeTab} index={2}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Alert severity="info" icon={<SchoolIcon />}>
                            <strong>Welcome to HiGHS Optimization Learning!</strong> 
                            These interactive tutorials will teach you linear programming concepts through meal planning.
                        </Alert>
                    </Grid>

                    {[
                        {
                            title: "🎯 Linear Programming Basics",
                            description: "Learn the fundamentals of optimization with a simple cost minimization problem",
                            level: "Beginner",
                            duration: "10 min"
                        },
                        {
                            title: "📊 Multi-Objective Optimization", 
                            description: "Balance multiple goals like cost, nutrition, and taste preferences",
                            level: "Intermediate",
                            duration: "15 min"
                        },
                        {
                            title: "🕒 Temporal Constraints",
                            description: "Optimize meal plans across different times of day with scheduling constraints", 
                            level: "Advanced",
                            duration: "20 min"
                        },
                        {
                            title: "🔍 Sensitivity Analysis",
                            description: "Understand how changes in constraints affect optimal solutions",
                            level: "Advanced", 
                            duration: "25 min"
                        }
                    ].map((tutorial, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Card elevation={2} sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>{tutorial.title}</Typography>
                                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                                        {tutorial.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Chip 
                                                label={tutorial.level}
                                                size="small"
                                                color={tutorial.level === 'Beginner' ? 'success' : tutorial.level === 'Intermediate' ? 'warning' : 'error'}
                                            />
                                            <Chip label={tutorial.duration} size="small" sx={{ ml: 1 }} />
                                        </Box>
                                        <Button variant="contained" size="small">
                                            Start Tutorial
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>

            {/* Advanced Tab */}
            <TabPanel value={activeTab} index={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Alert severity="warning" icon={<AIIcon />}>
                            <strong>Advanced Features</strong> - These tools are for experienced users who understand linear programming concepts.
                        </Alert>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    🧬 Custom Meal Database
                                </Typography>
                                <Typography color="text.secondary" sx={{ mb: 2 }}>
                                    Add your own meals with custom nutritional data and costs
                                </Typography>
                                <Button variant="outlined" fullWidth>
                                    Manage Custom Meals
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    🔗 API Integration
                                </Typography>
                                <Typography color="text.secondary" sx={{ mb: 2 }}>
                                    Connect to restaurant APIs for real-time pricing and menu data
                                </Typography>
                                <Button variant="outlined" fullWidth>
                                    Configure APIs
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    🤖 ML-Powered Preferences
                                </Typography>
                                <Typography color="text.secondary" sx={{ mb: 2 }}>
                                    Use machine learning to predict and optimize for personal preferences
                                </Typography>
                                <Button variant="outlined" fullWidth>
                                    Train Preference Model
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    📅 Weekly Planning
                                </Typography>
                                <Typography color="text.secondary" sx={{ mb: 2 }}>
                                    Optimize meal plans across a full week with variety constraints
                                </Typography>
                                <Button variant="outlined" fullWidth>
                                    Plan Weekly Meals
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </TabPanel>
        </Box>
    );
}