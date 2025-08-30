import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Slider,
    TextField,
    Button,
    Chip,
    Stack,
    Grid,
    Divider,
    Alert,
    IconButton,
    Tooltip,
    CircularProgress,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Switch,
    FormControlLabel,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Info as InfoIcon,
    Refresh as RefreshIcon,
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    TrendingUp as TrendingUpIcon,
    Speed as SpeedIcon,
} from '@mui/icons-material';

import { usePlannerStore } from './store/plannerStore';

const StrictnessGauge = ({ level, onInfo }) => {
    const theme = useTheme();
    
    const getGaugeColor = (level) => {
        switch (level) {
            case 'Easy': return theme.palette.success.main;
            case 'Moderate': return theme.palette.info.main;
            case 'Tight': return theme.palette.warning.main;
            case 'Very Tight': return theme.palette.error.main;
            default: return theme.palette.grey[500];
        }
    };
    
    const getGaugeValue = (level) => {
        switch (level) {
            case 'Easy': return 25;
            case 'Moderate': return 50;
            case 'Tight': return 75;
            case 'Very Tight': return 100;
            default: return 0;
        }
    };
    
    return (
        <Card sx={{ p: 2, backgroundColor: alpha(getGaugeColor(level), 0.1) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                    Constraint Strictness
                </Typography>
                <Tooltip title="How difficult your targets are to meet based on available meals">
                    <IconButton size="small" onClick={onInfo}>
                        <InfoIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SpeedIcon sx={{ color: getGaugeColor(level) }} />
                <Box sx={{ flex: 1 }}>
                    <LinearProgress
                        variant="determinate"
                        value={getGaugeValue(level)}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: getGaugeColor(level),
                                borderRadius: 4,
                            },
                        }}
                    />
                </Box>
                <Typography variant="body2" fontWeight={600} color={getGaugeColor(level)}>
                    {level}
                </Typography>
            </Box>
        </Card>
    );
};

const NutrientSlider = ({ 
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 1000, 
    step = 1, 
    unit = 'g',
    target,
    current = 0,
    showRange = true 
}) => {
    const theme = useTheme();
    const [localValue, setLocalValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        setLocalValue(value);
    }, [value]);
    
    const handleSliderChange = (event, newValue) => {
        setLocalValue(newValue);
        onChange(newValue);
    };
    
    const handleInputChange = (field, newValue) => {
        const numValue = parseInt(newValue) || 0;
        const updatedValue = showRange 
            ? { ...localValue, [field]: numValue }
            : numValue;
        setLocalValue(updatedValue);
        onChange(updatedValue);
    };
    
    const getComplianceColor = () => {
        if (!showRange) {
            if (current >= value * 0.9 && current <= value * 1.1) return theme.palette.success.main;
            if (current >= value * 0.8 && current <= value * 1.2) return theme.palette.warning.main;
            return theme.palette.error.main;
        }
        
        if (current >= value.min && current <= value.max) return theme.palette.success.main;
        if (current >= value.min * 0.8 && current <= value.max * 1.2) return theme.palette.warning.main;
        return theme.palette.error.main;
    };
    
    return (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                    {label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        Current: {current}{unit}
                    </Typography>
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: getComplianceColor(),
                        }}
                    />
                </Box>
            </Box>
            
            {showRange ? (
                <>
                    <Slider
                        value={[localValue.min, localValue.max]}
                        onChange={(e, newValue) => handleSliderChange(e, { min: newValue[0], max: newValue[1] })}
                        min={min}
                        max={max}
                        step={step}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}${unit}`}
                        sx={{
                            '& .MuiSlider-thumb': {
                                backgroundColor: theme.palette.primary.main,
                            },
                            '& .MuiSlider-track': {
                                backgroundColor: theme.palette.primary.main,
                            },
                        }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <TextField
                            label="Min"
                            type="number"
                            size="small"
                            value={localValue.min}
                            onChange={(e) => handleInputChange('min', e.target.value)}
                            InputProps={{ endAdornment: unit }}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Max"
                            type="number"
                            size="small"
                            value={localValue.max}
                            onChange={(e) => handleInputChange('max', e.target.value)}
                            InputProps={{ endAdornment: unit }}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Target"
                            type="number"
                            size="small"
                            value={target || Math.round((localValue.min + localValue.max) / 2)}
                            onChange={(e) => {
                                const targetValue = parseInt(e.target.value) || 0;
                                const newValue = {
                                    ...localValue,
                                    target: targetValue,
                                    min: Math.min(localValue.min, targetValue * 0.8),
                                    max: Math.max(localValue.max, targetValue * 1.2),
                                };
                                setLocalValue(newValue);
                                onChange(newValue);
                            }}
                            InputProps={{ endAdornment: unit }}
                            sx={{ flex: 1 }}
                        />
                    </Box>
                </>
            ) : (
                <>
                    <Slider
                        value={localValue}
                        onChange={handleSliderChange}
                        min={min}
                        max={max}
                        step={step}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${value}${unit}`}
                    />
                    <TextField
                        fullWidth
                        type="number"
                        size="small"
                        value={localValue}
                        onChange={(e) => handleInputChange('value', e.target.value)}
                        InputProps={{ endAdornment: unit }}
                        sx={{ mt: 1 }}
                    />
                </>
            )}
        </Box>
    );
};

const LivePreviewChips = ({ nutritionTargets, currentTotals }) => {
    const theme = useTheme();
    
    const getStatusIcon = (nutrient, target, current) => {
        if (!target || current === undefined) return null;
        
        const isInRange = target.min ? 
            (current >= target.min && current <= target.max) :
            (current >= target * 0.9 && current <= target * 1.1);
            
        if (isInRange) return <CheckIcon fontSize="small" />;
        
        const isClose = target.min ?
            (current >= target.min * 0.8 && current <= target.max * 1.2) :
            (current >= target * 0.8 && current <= target * 1.2);
            
        return isClose ? <WarningIcon fontSize="small" /> : <ErrorIcon fontSize="small" />;
    };
    
    const getStatusColor = (nutrient, target, current) => {
        if (!target || current === undefined) return 'default';
        
        const isInRange = target.min ? 
            (current >= target.min && current <= target.max) :
            (current >= target * 0.9 && current <= target * 1.1);
            
        if (isInRange) return 'success';
        
        const isClose = target.min ?
            (current >= target.min * 0.8 && current <= target.max * 1.2) :
            (current >= target * 0.8 && current <= target * 1.2);
            
        return isClose ? 'warning' : 'error';
    };
    
    return (
        <Box>
            <Typography variant="subtitle2" gutterBottom>
                Live Preview
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(nutritionTargets).map(([nutrient, target]) => {
                    const current = currentTotals[nutrient] || 0;
                    const unit = nutrient === 'calories' ? 'cal' : 'g';
                    
                    return (
                        <Chip
                            key={nutrient}
                            icon={getStatusIcon(nutrient, target, current)}
                            label={`${nutrient}: ${current}${unit}`}
                            color={getStatusColor(nutrient, target, current)}
                            variant="outlined"
                            size="small"
                        />
                    );
                })}
            </Stack>
        </Box>
    );
};

const IntelligentSuggestions = ({ nutritionTargets, suggestions, onApplySuggestion }) => {
    if (!suggestions || suggestions.length === 0) return null;
    
    return (
        <Alert 
            severity="info" 
            sx={{ mt: 2 }}
            action={
                <Button size="small" onClick={() => onApplySuggestion(suggestions[0])}>
                    Apply
                </Button>
            }
        >
            <Typography variant="body2">
                {suggestions[0].message}
            </Typography>
        </Alert>
    );
};

const NutritionRequirementsModule = () => {
    const theme = useTheme();
    const {
        nutritionTargets,
        setNutritionTargets,
        applyPreset,
        dietaryProfile,
        strictnessGauge,
        getDailyTotals,
    } = usePlannerStore();
    
    const [activePreset, setActivePreset] = useState('Custom');
    const [showMicronutrients, setShowMicronutrients] = useState(false);
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [strictnessInfoOpen, setStrictnessInfoOpen] = useState(false);
    
    const currentTotals = getDailyTotals();
    
    useEffect(() => {
        const newSuggestions = [];
        
        if (strictnessGauge === 'Very Tight') {
            newSuggestions.push({
                type: 'relax_constraints',
                message: 'Your constraints are very tight. Consider increasing protein range by 10g to unlock 200+ more meal options.',
                action: () => {
                    setNutritionTargets({
                        protein: {
                            ...nutritionTargets.protein,
                            max: nutritionTargets.protein.max + 10
                        }
                    });
                }
            });
        }
        
        const totalCaloriesFromMacros = 
            (nutritionTargets.protein?.min || 0) * 4 +
            (nutritionTargets.carbohydrates?.min || 0) * 4 +
            (nutritionTargets.fat?.min || 0) * 9;
            
        if (totalCaloriesFromMacros > (nutritionTargets.calories?.max || 0)) {
            newSuggestions.push({
                type: 'macro_calorie_mismatch',
                message: 'Your macro minimums exceed your calorie maximum. Adjust macros or increase calorie target.',
                action: () => {
                    const newCalorieMax = Math.ceil(totalCaloriesFromMacros * 1.1);
                    setNutritionTargets({
                        calories: {
                            ...nutritionTargets.calories,
                            max: newCalorieMax
                        }
                    });
                }
            });
        }
        
        setSuggestions(newSuggestions);
    }, [nutritionTargets, strictnessGauge, setNutritionTargets]);
    
    const handlePresetSelect = (presetName) => {
        setActivePreset(presetName);
        if (presetName !== 'Custom') {
            applyPreset(presetName);
        }
    };
    
    const handleNutrientChange = (nutrient, value) => {
        setNutritionTargets({ [nutrient]: value });
        setActivePreset('Custom');
    };
    
    return (
        <Box sx={{ height: '100%', overflow: 'auto' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Nutrition Presets
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {dietaryProfile.presets.map((preset) => (
                        <Chip
                            key={preset.name}
                            label={preset.name}
                            clickable
                            color={activePreset === preset.name ? 'primary' : 'default'}
                            variant={activePreset === preset.name ? 'filled' : 'outlined'}
                            onClick={() => handlePresetSelect(preset.name)}
                        />
                    ))}
                    <Chip
                        label="Custom"
                        clickable
                        color={activePreset === 'Custom' ? 'primary' : 'default'}
                        variant={activePreset === 'Custom' ? 'filled' : 'outlined'}
                        onClick={() => handlePresetSelect('Custom')}
                    />
                </Stack>
            </Box>
            
            <Box sx={{ mb: 3 }}>
                <StrictnessGauge 
                    level={strictnessGauge} 
                    onInfo={() => setStrictnessInfoOpen(true)}
                />
            </Box>
            
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Primary Targets
                    </Typography>
                    
                    <NutrientSlider
                        label="Calories"
                        value={nutritionTargets.calories}
                        onChange={(value) => handleNutrientChange('calories', value)}
                        min={1000}
                        max={4000}
                        step={50}
                        unit="cal"
                        target={nutritionTargets.calories?.target}
                        current={currentTotals.calories}
                    />
                    
                    <NutrientSlider
                        label="Protein"
                        value={nutritionTargets.protein}
                        onChange={(value) => handleNutrientChange('protein', value)}
                        min={50}
                        max={300}
                        step={5}
                        unit="g"
                        target={nutritionTargets.protein?.target}
                        current={currentTotals.protein}
                    />
                    
                    <NutrientSlider
                        label="Carbohydrates"
                        value={nutritionTargets.carbohydrates}
                        onChange={(value) => handleNutrientChange('carbohydrates', value)}
                        min={50}
                        max={500}
                        step={10}
                        unit="g"
                        target={nutritionTargets.carbohydrates?.target}
                        current={currentTotals.carbohydrates}
                    />
                    
                    <NutrientSlider
                        label="Fat"
                        value={nutritionTargets.fat}
                        onChange={(value) => handleNutrientChange('fat', value)}
                        min={20}
                        max={200}
                        step={5}
                        unit="g"
                        target={nutritionTargets.fat?.target}
                        current={currentTotals.fat}
                    />
                </CardContent>
            </Card>
            
            <Accordion expanded={showMicronutrients} onChange={() => setShowMicronutrients(!showMicronutrients)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">Micronutrients</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <NutrientSlider
                        label="Sodium"
                        value={nutritionTargets.sodium}
                        onChange={(value) => handleNutrientChange('sodium', value)}
                        min={500}
                        max={3000}
                        step={50}
                        unit="mg"
                        target={nutritionTargets.sodium?.target}
                        current={currentTotals.sodium}
                    />
                    
                    <NutrientSlider
                        label="Fiber"
                        value={nutritionTargets.fiber}
                        onChange={(value) => handleNutrientChange('fiber', value)}
                        min={15}
                        max={50}
                        step={1}
                        unit="g"
                        target={nutritionTargets.fiber?.target}
                        current={currentTotals.fiber}
                    />
                    
                    <NutrientSlider
                        label="Sugar"
                        value={nutritionTargets.sugar}
                        onChange={(value) => handleNutrientChange('sugar', value)}
                        min={0}
                        max={100}
                        step={5}
                        unit="g"
                        target={nutritionTargets.sugar?.target}
                        current={currentTotals.sugar}
                    />
                </AccordionDetails>
            </Accordion>
            
            <Box sx={{ mt: 3 }}>
                <LivePreviewChips 
                    nutritionTargets={nutritionTargets}
                    currentTotals={currentTotals}
                />
            </Box>
            
            <IntelligentSuggestions
                nutritionTargets={nutritionTargets}
                suggestions={suggestions}
                onApplySuggestion={(suggestion) => suggestion.action()}
            />
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => applyPreset('Maintenance')}
                >
                    Reset to Default
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => setShowVersionHistory(true)}
                >
                    Version History
                </Button>
            </Box>
            
            <Dialog
                open={strictnessInfoOpen}
                onClose={() => setStrictnessInfoOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Constraint Strictness</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" paragraph>
                        The strictness gauge shows how difficult your nutrition targets are to meet based on available meals in our catalog.
                    </Typography>
                    <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: theme.palette.success.main }} />
                            <Typography variant="body2"><strong>Easy:</strong> 80%+ of meals can meet your targets</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: theme.palette.info.main }} />
                            <Typography variant="body2"><strong>Moderate:</strong> 50-80% of meals can meet your targets</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: theme.palette.warning.main }} />
                            <Typography variant="body2"><strong>Tight:</strong> 20-50% of meals can meet your targets</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: theme.palette.error.main }} />
                            <Typography variant="body2"><strong>Very Tight:</strong> Less than 20% of meals can meet your targets</Typography>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStrictnessInfoOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NutritionRequirementsModule;
