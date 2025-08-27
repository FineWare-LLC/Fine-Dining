import React, { useState, useEffect } from 'react';
import {
    Box,
    useTheme,
    useMediaQuery,
    Tabs,
    Tab,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Button,
    Drawer,
    Paper,
    Chip,
    Stack,
    LinearProgress,
} from '@mui/material';
import {
    CalendarToday as CalendarIcon,
    Undo as UndoIcon,
    Redo as RedoIcon,
    Settings as SettingsIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

import MealCatalogModule from './MealCatalogModule';
import NutritionRequirementsModule from './NutritionRequirementsModule';
import ResultsPanelModule from './ResultsPanelModule';

import { usePlannerStore } from './store/plannerStore';

const PlannerCanvas = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const {
        selectedDay,
        setSelectedDay,
        nutritionTargets,
        selectedMeals,
        complianceScore,
        canUndo,
        canRedo,
        undo,
        redo,
        dietaryProfile,
    } = usePlannerStore();

    const [activeTab, setActiveTab] = useState(0);
    const [nutritionDrawerOpen, setNutritionDrawerOpen] = useState(false);
    const [nutritionDrawerPinned, setNutritionDrawerPinned] = useState(false);

    const [dayPickerOpen, setDayPickerOpen] = useState(false);

    const formatSelectedDay = (date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const getComplianceColor = (score) => {
        if (score >= 85) return theme.palette.success.main;
        if (score >= 70) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    const DesktopLayout = () => (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Box
                sx={{
                    width: '40%',
                    borderRight: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <MealCatalogModule />
            </Box>

            <Box
                sx={{
                    width: '60%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <ResultsPanelModule />
            </Box>

            <Drawer
                anchor="bottom"
                open={nutritionDrawerOpen || nutritionDrawerPinned}
                onClose={() => !nutritionDrawerPinned && setNutritionDrawerOpen(false)}
                variant={nutritionDrawerPinned ? 'persistent' : 'temporary'}
                sx={{
                    '& .MuiDrawer-paper': {
                        height: nutritionDrawerPinned ? '40%' : 'auto',
                        maxHeight: '60%',
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                    },
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Nutrition Requirements</Typography>
                        <Box>
                            <IconButton
                                onClick={() => setNutritionDrawerPinned(!nutritionDrawerPinned)}
                                size="small"
                            >
                                {nutritionDrawerPinned ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                            </IconButton>
                        </Box>
                    </Box>
                    <NutritionRequirementsModule />
                </Box>
            </Drawer>
        </Box>
    );

    const MobileLayout = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <AppBar position="static" color="default" elevation={0}>
                <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="fullWidth"
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label="Catalog" />
                    <Tab label="Targets" />
                    <Tab label="Plan" />
                </Tabs>
            </AppBar>

            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {activeTab === 0 && <MealCatalogModule />}
                {activeTab === 1 && <NutritionRequirementsModule />}
                {activeTab === 2 && <ResultsPanelModule />}
            </Box>

            <Paper
                elevation={8}
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    backgroundColor: theme.palette.background.paper,
                    borderTop: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Compliance
                        </Typography>
                        <Chip
                            label={`${complianceScore}%`}
                            size="small"
                            sx={{
                                backgroundColor: getComplianceColor(complianceScore),
                                color: 'white',
                                fontWeight: 600,
                            }}
                        />
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={complianceScore}
                        sx={{
                            flex: 1,
                            mx: 2,
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
            </Paper>
        </Box>
    );

    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
                event.preventDefault();
                if (canUndo) undo();
            }
            if ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) {
                event.preventDefault();
                if (canRedo) redo();
            }
            if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
                event.preventDefault();
                if (canRedo) redo();
            }
            if (event.key === 't' && !event.ctrlKey && !event.metaKey && !event.altKey) {
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                    return; 
                }
                event.preventDefault();
                setNutritionDrawerOpen(!nutritionDrawerOpen);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [canUndo, canRedo, undo, redo, nutritionDrawerOpen]);

    return (
        <Box 
            sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
            role="main"
            aria-label="Meal Planning Canvas"
        >
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    backgroundColor: theme.palette.background.paper,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }}
                role="banner"
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                            onClick={() => setDayPickerOpen(true)}
                            sx={{ color: theme.palette.text.primary }}
                            aria-label={`Select day for meal planning. Currently selected: ${formatSelectedDay(selectedDay)}`}
                            title={`Select day (Currently: ${formatSelectedDay(selectedDay)})`}
                        >
                            <CalendarIcon />
                        </IconButton>
                        <Typography 
                            variant="h6" 
                            color="text.primary"
                            id="selected-day-label"
                            aria-live="polite"
                        >
                            {formatSelectedDay(selectedDay)}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} role="group" aria-label="History controls">
                        <IconButton
                            onClick={undo}
                            disabled={!canUndo}
                            sx={{ color: theme.palette.text.primary }}
                            aria-label="Undo last action"
                            title="Undo (Ctrl+Z)"
                        >
                            <UndoIcon />
                        </IconButton>
                        <IconButton
                            onClick={redo}
                            disabled={!canRedo}
                            sx={{ color: theme.palette.text.primary }}
                            aria-label="Redo last undone action"
                            title="Redo (Ctrl+Shift+Z)"
                        >
                            <RedoIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} role="group" aria-label="Settings and presets">
                        {!isMobile && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setNutritionDrawerOpen(!nutritionDrawerOpen)}
                                startIcon={<SettingsIcon />}
                                aria-label="Toggle nutrition targets panel"
                                title="Toggle nutrition targets (T)"
                            >
                                Targets
                            </Button>
                        )}
                        
                        <Stack direction="row" spacing={1} role="group" aria-label="Quick nutrition presets">
                            {dietaryProfile?.presets?.slice(0, 2).map((preset) => (
                                <Chip
                                    key={preset.name}
                                    label={preset.name}
                                    size="small"
                                    variant="outlined"
                                    clickable
                                    aria-label={`Apply ${preset.name} nutrition preset`}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                </Toolbar>
            </AppBar>

            {isMobile ? <MobileLayout /> : <DesktopLayout />}
        </Box>
    );
};

export default PlannerCanvas;
