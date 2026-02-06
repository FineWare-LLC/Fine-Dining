/**
 * HighsControlPanel - Liquid glass optimizer workspace.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Collapse,
    Divider,
    Drawer,
    Fab,
    IconButton,
    LinearProgress,
    Menu,
    MenuItem,
    Paper,
    Popover,
    Stack,
    Step,
    StepLabel,
    Stepper,
    Switch,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    Slider,
    Skeleton,
    useMediaQuery,
} from '@mui/material';
import AutocompleteModule from '@mui/material/Autocomplete';
import TableSortLabelModule from '@mui/material/TableSortLabel';
import AddModule from '@mui/icons-material/Add';
import DeleteModule from '@mui/icons-material/Delete';
import FilterListModule from '@mui/icons-material/FilterList';
import MoreVertModule from '@mui/icons-material/MoreVert';
import SearchModule from '@mui/icons-material/Search';
import ViewColumnModule from '@mui/icons-material/ViewColumn';
import FileDownloadModule from '@mui/icons-material/FileDownload';
import DensityMediumModule from '@mui/icons-material/DensityMedium';
import DensitySmallModule from '@mui/icons-material/DensitySmall';
import CheckCircleModule from '@mui/icons-material/CheckCircle';
import WarningAmberModule from '@mui/icons-material/WarningAmber';
import ErrorOutlineModule from '@mui/icons-material/ErrorOutline';
import RefreshModule from '@mui/icons-material/Refresh';
import PlayArrowModule from '@mui/icons-material/PlayArrow';
import InsightsModule from '@mui/icons-material/Insights';
import RestaurantModule from '@mui/icons-material/Restaurant';
import ReportProblemModule from '@mui/icons-material/ReportProblem';
import ErrorModule from '@mui/icons-material/Error';
import FileUploadModule from '@mui/icons-material/UploadFile';
import ContentPasteModule from '@mui/icons-material/ContentPaste';
import ContentCopyModule from '@mui/icons-material/ContentCopy';
import RemoveModule from '@mui/icons-material/Remove';
import EditModule from '@mui/icons-material/Edit';
import SaveModule from '@mui/icons-material/Save';
import CloseModule from '@mui/icons-material/Close';
import SwapHorizModule from '@mui/icons-material/SwapHoriz';
import LockModule from '@mui/icons-material/Lock';
import LockOpenModule from '@mui/icons-material/LockOpen';
import AutoFixHighModule from '@mui/icons-material/AutoFixHigh';
import ViewListModule from '@mui/icons-material/ViewList';
import TableRowsModule from '@mui/icons-material/TableRows';
import ExpandMoreModule from '@mui/icons-material/ExpandMore';
import ExpandLessModule from '@mui/icons-material/ExpandLess';
import { resolveMuiIcon } from '@/utils/muiIcon';
import {
    ALLERGEN_OPTIONS,
    formatAllergenLabel,
    normalizeAllergenList,
} from '@/constants/allergens';
import OPTIMIZER_COPY from '@/constants/optimizerCopy';

const Autocomplete = AutocompleteModule?.default ?? AutocompleteModule;
const TableSortLabel = TableSortLabelModule?.default ?? TableSortLabelModule;

const AddIcon = resolveMuiIcon(AddModule);
const DeleteIcon = resolveMuiIcon(DeleteModule);
const FilterListIcon = resolveMuiIcon(FilterListModule);
const MoreVertIcon = resolveMuiIcon(MoreVertModule);
const SearchIcon = resolveMuiIcon(SearchModule);
const ViewColumnIcon = resolveMuiIcon(ViewColumnModule);
const FileDownloadIcon = resolveMuiIcon(FileDownloadModule);
const DensityMediumIcon = resolveMuiIcon(DensityMediumModule);
const DensitySmallIcon = resolveMuiIcon(DensitySmallModule);
const CheckCircleIcon = resolveMuiIcon(CheckCircleModule);
const WarningAmberIcon = resolveMuiIcon(WarningAmberModule);
const ErrorOutlineIcon = resolveMuiIcon(ErrorOutlineModule);
const RefreshIcon = resolveMuiIcon(RefreshModule);
const PlayArrowIcon = resolveMuiIcon(PlayArrowModule);
const InsightsIcon = resolveMuiIcon(InsightsModule);
const RestaurantIcon = resolveMuiIcon(RestaurantModule);
const ReportProblemIcon = resolveMuiIcon(ReportProblemModule);
const ErrorIcon = resolveMuiIcon(ErrorModule);
const FileUploadIcon = resolveMuiIcon(FileUploadModule);
const ContentPasteIcon = resolveMuiIcon(ContentPasteModule);
const ContentCopyIcon = resolveMuiIcon(ContentCopyModule);
const RemoveIcon = resolveMuiIcon(RemoveModule);
const EditIcon = resolveMuiIcon(EditModule);
const SaveIcon = resolveMuiIcon(SaveModule);
const CloseIcon = resolveMuiIcon(CloseModule);
const SwapHorizIcon = resolveMuiIcon(SwapHorizModule);
const LockIcon = resolveMuiIcon(LockModule);
const LockOpenIcon = resolveMuiIcon(LockOpenModule);
const AutoFixHighIcon = resolveMuiIcon(AutoFixHighModule);
const ViewListIcon = resolveMuiIcon(ViewListModule);
const TableRowsIcon = resolveMuiIcon(TableRowsModule);
const ExpandMoreIcon = resolveMuiIcon(ExpandMoreModule);
const ExpandLessIcon = resolveMuiIcon(ExpandLessModule);

const PLAN_STORAGE_KEY = 'optimizerPlanState';

const statusConfig = {
    ready: { label: OPTIMIZER_COPY.status.ready, color: 'success', icon: CheckCircleIcon },
    missing: { label: OPTIMIZER_COPY.status.missing, color: 'warning', icon: WarningAmberIcon },
    outlier: { label: OPTIMIZER_COPY.status.outlier, color: 'warning', icon: WarningAmberIcon },
    duplicate: { label: OPTIMIZER_COPY.status.duplicate, color: 'warning', icon: WarningAmberIcon },
    excluded: { label: OPTIMIZER_COPY.status.excluded, color: 'default', icon: ErrorOutlineIcon },
    error: { label: OPTIMIZER_COPY.status.error, color: 'error', icon: ErrorOutlineIcon },
};

const COLUMN_CONFIG = [
    { id: 'meal', label: 'Meal', key: 'meal_name', minWidth: 220, sticky: true },
    { id: 'restaurant', label: 'Restaurant', key: 'chain', minWidth: 180 },
    { id: 'cuisine', label: 'Cuisine', key: 'cuisine', minWidth: 120 },
    { id: 'mealType', label: 'Meal type', key: 'mealType', minWidth: 120 },
    { id: 'budgetTier', label: 'Budget', key: 'budgetTier', minWidth: 110 },
    { id: 'calories', label: 'Calories', key: 'calories', numeric: true, minWidth: 110 },
    { id: 'protein', label: 'Protein (g)', key: 'protein', numeric: true, minWidth: 120 },
    { id: 'carbohydrates', label: 'Carbs (g)', key: 'carbohydrates', numeric: true, minWidth: 120 },
    { id: 'fat', label: 'Fat (g)', key: 'fat', numeric: true, minWidth: 110 },
    { id: 'sodium', label: 'Sodium (mg)', key: 'sodium', numeric: true, minWidth: 130 },
    { id: 'price', label: 'Price', key: 'price', numeric: true, minWidth: 100 },
    { id: 'allergens', label: 'Allergens', key: 'allergens', minWidth: 160 },
    { id: 'status', label: 'Status', key: 'status', minWidth: 130 },
    { id: 'issues', label: OPTIMIZER_COPY.labels.warnings, key: 'issues', numeric: true, minWidth: 110 },
    { id: 'createdAt', label: 'Added', key: 'createdAt', minWidth: 140 },
];

const DEFAULT_COLUMNS = new Set(['meal', 'restaurant', 'calories', 'protein', 'price', 'status', 'issues']);

const initialMealForm = {
    chain: '',
    meal_name: '',
    price: '',
    calories: '',
    protein: '',
    carbohydrates: '',
    fat: '',
    sodium: '',
    allergens: [],
    cuisine: '',
    mealType: '',
    dietary: [],
    budgetTier: '',
    includeInOptimization: true,
};

const initialConstraints = {
    calories: { min: 2200, max: 2600 },
    protein: { min: 100, max: 160 },
    carbohydrates: { min: 250, max: 350 },
    fat: { min: 50, max: 90 },
    sodium: { min: 1500, max: 2300 },
};

const goalPresets = {
    Cut: {
        calories: { min: 1600, max: 1900 },
        protein: { min: 130, max: 180 },
        carbohydrates: { min: 120, max: 180 },
        fat: { min: 45, max: 70 },
        sodium: { min: 1400, max: 2000 },
    },
    Maintain: {
        calories: { min: 2000, max: 2400 },
        protein: { min: 120, max: 170 },
        carbohydrates: { min: 200, max: 280 },
        fat: { min: 55, max: 85 },
        sodium: { min: 1500, max: 2300 },
    },
    Bulk: {
        calories: { min: 2600, max: 3200 },
        protein: { min: 160, max: 220 },
        carbohydrates: { min: 280, max: 380 },
        fat: { min: 70, max: 110 },
        sodium: { min: 1800, max: 2500 },
    },
};

const goalPresetOptions = ['Cut', 'Maintain', 'Bulk', 'Custom'];

const initialSafetyCaps = {
    sugar: 65,
    cholesterol: 300,
};

const dateRangeOptions = [
    { value: 'all', label: 'All time' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
];

const cuisineOptions = ['Global', 'Mediterranean', 'Asian', 'American', 'Latin', 'French', 'Middle Eastern', 'Italian'];
const mealTypeOptions = ['Main', 'Bowl', 'Salad', 'Soup', 'Snack', 'Dessert'];
const dietaryOptions = ['High Protein', 'Low Carb', 'Vegetarian', 'Vegan', 'Gluten Free', 'Dairy Free'];
const budgetTiers = ['Low', 'Mid', 'High'];

const macroDefinitions = [
    { key: 'calories', label: OPTIMIZER_COPY.labels.dailyCalories, min: 1200, max: 4000 },
    { key: 'protein', label: OPTIMIZER_COPY.labels.proteinPerDay, min: 60, max: 260 },
    { key: 'carbohydrates', label: OPTIMIZER_COPY.labels.carbsPerDay, min: 80, max: 450 },
    { key: 'fat', label: OPTIMIZER_COPY.labels.fatPerDay, min: 30, max: 180 },
    { key: 'sodium', label: OPTIMIZER_COPY.labels.sodiumPerDay, min: 800, max: 3000 },
];

const safetyDefinitions = [
    { key: 'sugar', label: 'Sugar max (g)', min: 0, max: 120 },
    { key: 'cholesterol', label: 'Cholesterol max (mg)', min: 0, max: 600 },
];

const tagOptions = {
    cuisine: cuisineOptions,
    mealType: mealTypeOptions,
    dietary: dietaryOptions,
    budgetTier: budgetTiers,
};

const tagLabels = {
    cuisine: 'Cuisine',
    mealType: 'Meal type',
    dietary: 'Dietary',
    budgetTier: 'Budget',
};

const glassTier = (tier) => {
    const settings = {
        1: { fill: 0.08, border: 0.14, blur: 16 },
        2: { fill: 0.12, border: 0.18, blur: 22 },
        3: { fill: 0.16, border: 0.22, blur: 28 },
    };
    const { fill, border, blur } = settings[tier] || settings[2];
    return {
        backgroundColor: `rgba(255,255,255,${fill})`,
        border: `1px solid rgba(255,255,255,${border})`,
        backdropFilter: `blur(${blur}px)`,
        boxShadow: '0 30px 60px rgba(15, 18, 30, 0.18)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0))',
        },
        '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(10, 12, 20, 0.12)',
            pointerEvents: 'none',
        },
    };
};

const inputSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.6)',
        border: '1px solid rgba(255,255,255,0.35)',
        backdropFilter: 'blur(14px)',
        transition: 'all 200ms ease',
        '&:hover': {
            borderColor: 'rgba(255,255,255,0.6)',
        },
        '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(94, 140, 255, 0.25)',
            borderColor: 'rgba(94, 140, 255, 0.6)',
        },
    },
};

const srOnly = {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: 1,
};

const formatNumber = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    return Math.round(Number(value)).toLocaleString();
};

const formatCurrency = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    return `$${Number(value).toFixed(2)}`;
};

const formatDate = (value) => {
    if (!value) return '—';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date?.getTime?.())) return '—';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const parseNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const cleaned = String(value).replace(/[^0-9.-]/g, '');
    const numeric = Number(cleaned);
    return Number.isFinite(numeric) ? numeric : 0;
};

const parseBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (value === null || value === undefined || value === '') return true;
    const normalized = String(value).trim().toLowerCase();
    if (['false', '0', 'no', 'n'].includes(normalized)) return false;
    if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
    return Boolean(value);
};

const buildPlanRowsFromMealPlan = (mealPlan = []) => {
    return mealPlan.map((item) => {
        const servings = Math.max(1, Math.round(item.servings || 0));
        const perServing = {
            calories: servings ? (item.totalCalories || 0) / servings : 0,
            protein: servings ? (item.totalProtein || 0) / servings : 0,
            carbohydrates: servings ? (item.totalCarbs || 0) / servings : 0,
            fat: servings ? (item.totalFat || 0) / servings : 0,
            sodium: servings ? (item.totalSodium || 0) / servings : 0,
            cost: servings ? (item.totalCost || 0) / servings : 0,
        };
        return {
            mealId: item.mealId,
            mealName: item.mealName,
            source: 'solver',
            servings,
            perServing,
            totals: {
                calories: perServing.calories * servings,
                protein: perServing.protein * servings,
                carbohydrates: perServing.carbohydrates * servings,
                fat: perServing.fat * servings,
                sodium: perServing.sodium * servings,
                cost: perServing.cost * servings,
            },
        };
    });
};

const splitList = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    const raw = String(value);
    if (!raw.trim()) return [];
    const delimiter = raw.includes('|') ? '|' : raw.includes(';') ? ';' : ',';
    return raw
        .split(delimiter)
        .map((item) => item.trim())
        .filter(Boolean);
};

const normalizeTagList = (list = []) => {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    return list
        .map((item) => String(item || '').trim())
        .filter(Boolean)
        .filter((item) => {
            const key = item.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
};

const buildIssues = (meal, duplicateSet) => {
    const issues = [];
    if (meal.includeInOptimization === false) {
        issues.push({ code: 'excluded', label: 'Excluded from plan', severity: 'info' });
    }
    if (!meal.meal_name) {
        issues.push({ code: 'missing_name', label: 'Missing meal name', severity: 'error' });
    }
    if (!meal.calories || meal.calories <= 0) {
        issues.push({ code: 'missing_calories', label: 'Missing calories', severity: 'error' });
    }
    if (!meal.protein || !meal.carbohydrates || !meal.fat) {
        issues.push({ code: 'missing_macros', label: 'Missing macro values', severity: 'warning' });
    }
    if (!meal.price || meal.price <= 0) {
        issues.push({ code: 'missing_price', label: 'Missing price', severity: 'warning' });
    }
    if (meal.sodium && meal.sodium > 2000) {
        issues.push({ code: 'high_sodium', label: 'High sodium', severity: 'warning' });
    }
    if (meal.price > 65 || meal.calories > 1400) {
        issues.push({ code: 'outlier', label: 'Outlier values', severity: 'warning' });
    }
    const nameKey = (meal.meal_name || '').trim().toLowerCase();
    if (nameKey && duplicateSet?.has?.(nameKey)) {
        issues.push({ code: 'duplicate', label: 'Possible duplicate', severity: 'warning' });
    }
    return issues;
};

const buildStatus = (issues, meal) => {
    if (meal.includeInOptimization === false) return 'excluded';
    if (issues.some((issue) => issue.code?.startsWith('missing'))) return 'missing';
    if (issues.some((issue) => issue.code === 'duplicate')) return 'duplicate';
    if (issues.some((issue) => issue.code === 'outlier')) return 'outlier';
    if (issues.some((issue) => issue.severity === 'error')) return 'error';
    return 'ready';
};

const HEADER_ALIASES = {
    meal: 'meal_name',
    name: 'meal_name',
    meal_name: 'meal_name',
    mealname: 'meal_name',
    restaurant: 'chain',
    chain: 'chain',
    calories: 'calories',
    kcal: 'calories',
    protein: 'protein',
    carbs: 'carbohydrates',
    carbohydrates: 'carbohydrates',
    fat: 'fat',
    sodium: 'sodium',
    price: 'price',
    allergens: 'allergens',
    cuisine: 'cuisine',
    mealtype: 'mealType',
    meal_type: 'mealType',
    dietary: 'dietary',
    budget: 'budgetTier',
    budgettier: 'budgetTier',
    include: 'includeInOptimization',
};

const normalizeHeader = (header) => {
    if (!header) return null;
    const key = String(header).trim().toLowerCase().replace(/\s+/g, '_');
    return HEADER_ALIASES[key] || key;
};

const parseDelimited = (text) => {
    if (!text) return [];
    const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    if (lines.length === 0) return [];
    const delimiter = lines[0].includes('\t') ? '\t' : ',';

    const parseLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i += 1) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i += 1;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result.map((value) => value.trim());
    };

    const headers = parseLine(lines[0]).map(normalizeHeader);
    return lines.slice(1).map((line) => {
        const values = parseLine(line);
        return headers.reduce((acc, header, index) => {
            if (!header) return acc;
            acc[header] = values[index] ?? '';
            return acc;
        }, {});
    });
};

const buildMealsFromRows = (rows, baseDate = new Date()) => {
    return rows
        .map((row, index) => {
            const id = row.id || `import-${baseDate.getTime()}-${index}`;
            const mealName = row.meal_name || row.name || row.meal || `Imported meal ${index + 1}`;
            return {
                id,
                chain: row.chain || row.restaurant || 'Imported',
                meal_name: String(mealName).trim(),
                price: parseNumber(row.price),
                calories: parseNumber(row.calories),
                protein: parseNumber(row.protein),
                carbohydrates: parseNumber(row.carbohydrates),
                fat: parseNumber(row.fat),
                sodium: parseNumber(row.sodium),
                allergens: normalizeAllergenList(splitList(row.allergens)),
                cuisine: row.cuisine || 'Global',
                mealType: row.mealType || 'Main',
                dietary: normalizeTagList(splitList(row.dietary)),
                budgetTier: row.budgetTier || 'Mid',
                includeInOptimization: parseBoolean(row.includeInOptimization),
                createdAt: new Date(baseDate.getTime() - index * 60000).toISOString(),
            };
        })
        .filter((meal) => meal.meal_name);
};

const HighsControlPanel = () => {
    const [mealForm, setMealForm] = useState(initialMealForm);
    const [customMeals, setCustomMeals] = useState([]);
    const [constraints, setConstraints] = useState(initialConstraints);
    const [goalPreset, setGoalPreset] = useState('');
    const [safetyCaps, setSafetyCaps] = useState(initialSafetyCaps);
    const [horizonDays, setHorizonDays] = useState(7);
    const [mealsPerDay, setMealsPerDay] = useState(3);
    const [maxServingsPerMeal, setMaxServingsPerMeal] = useState(3);
    const [frequencyLimits, setFrequencyLimits] = useState({ perEntry: {}, perTag: {} });
    const [entryLimitDraft, setEntryLimitDraft] = useState({ mealId: '', max: '' });
    const [tagLimitDraft, setTagLimitDraft] = useState({ tagKey: 'cuisine', tagValue: '', max: '' });

    const [optimizationResults, setOptimizationResults] = useState(null);
    const [manualAdditions, setManualAdditions] = useState({});
    const [planRows, setPlanRows] = useState([]);
    const [lockedMeals, setLockedMeals] = useState({});
    const [planSaved, setPlanSaved] = useState(false);
    const [planExported, setPlanExported] = useState(false);
    const [planGeneratedAt, setPlanGeneratedAt] = useState(null);
    const [planFeedbackMessage, setPlanFeedbackMessage] = useState('');
    const [planFeedbackOpen, setPlanFeedbackOpen] = useState(false);
    const [optimizationError, setOptimizationError] = useState(null);
    const [constraintError, setConstraintError] = useState(null);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isLoadingSamples, setIsLoadingSamples] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [statusFilters, setStatusFilters] = useState(Object.keys(statusConfig));
    const [issueFilter, setIssueFilter] = useState('');
    const [allergenFilters, setAllergenFilters] = useState([]);
    const [includeFilter, setIncludeFilter] = useState('all');
    const [cuisineFilter, setCuisineFilter] = useState([]);
    const [mealTypeFilter, setMealTypeFilter] = useState([]);
    const [dietaryFilter, setDietaryFilter] = useState([]);
    const [budgetFilter, setBudgetFilter] = useState([]);
    const [dateRange, setDateRange] = useState('all');
    const [density, setDensity] = useState('comfortable');
    const [viewMode, setViewMode] = useState('list');
    const [columns, setColumns] = useState(() => {
        const initial = {};
        COLUMN_CONFIG.forEach((col) => {
            initial[col.id] = DEFAULT_COLUMNS.has(col.id);
        });
        return initial;
    });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(12);
    const [sortBy, setSortBy] = useState('calories');
    const [sortDirection, setSortDirection] = useState('desc');

    const [anchorEl, setAnchorEl] = useState(null);
    const [columnsAnchor, setColumnsAnchor] = useState(null);

    const [selectedMeal, setSelectedMeal] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [detailsTab, setDetailsTab] = useState('overview');

    const [addOpen, setAddOpen] = useState(false);
    const [addMode, setAddMode] = useState('basic');

    const [editingMealId, setEditingMealId] = useState(null);
    const [editingDraft, setEditingDraft] = useState(null);

    const [swapAnchorEl, setSwapAnchorEl] = useState(null);
    const [swapTarget, setSwapTarget] = useState(null);
    const [planMealLimitDraft, setPlanMealLimitDraft] = useState({ mealId: '', max: '' });
    const [manualMealDraft, setManualMealDraft] = useState({ mealId: '', servings: 1 });

    const [showTour, setShowTour] = useState(false);
    const [tourStep, setTourStep] = useState(0);
    const [advancedLimitsOpen, setAdvancedLimitsOpen] = useState(false);
    const [varietyRulesOpen, setVarietyRulesOpen] = useState(false);

    const fileInputRef = useRef(null);
    const datasetRef = useRef(null);
    const constraintsRef = useRef(null);
    const resultsRef = useRef(null);
    const runButtonRef = useRef(null);
    const planSummaryRef = useRef(null);
    const lastGoalRef = useRef('');
    const restoredPlanRef = useRef(false);
    const customMealsRef = useRef([]);
    const manualAdditionsRef = useRef({});

    const isDesktop = useMediaQuery('(min-width: 900px)');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (process.env.NODE_ENV === 'test') return;
        const seen = window.localStorage.getItem('optimizerTourSeen');
        if (!seen) {
            setShowTour(true);
            window.localStorage.setItem('optimizerTourSeen', 'true');
        }
    }, []);

    useEffect(() => {
        customMealsRef.current = customMeals;
    }, [customMeals]);

    useEffect(() => {
        manualAdditionsRef.current = manualAdditions;
    }, [manualAdditions]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (process.env.NODE_ENV === 'test') return;
        try {
            const stored = window.localStorage.getItem(PLAN_STORAGE_KEY);
            if (!stored) return;
            const parsed = JSON.parse(stored);
            if (parsed?.optimizationResults) {
                setOptimizationResults(parsed.optimizationResults);
            }
            if (Array.isArray(parsed?.planRows)) {
                setPlanRows(parsed.planRows);
                restoredPlanRef.current = true;
            }
            if (parsed?.lockedMeals) {
                setLockedMeals(parsed.lockedMeals);
            }
            if (parsed?.frequencyLimits) {
                setFrequencyLimits(parsed.frequencyLimits);
            }
            if (parsed?.manualAdditions) {
                setManualAdditions(parsed.manualAdditions);
            }
            if (parsed?.planGeneratedAt) {
                setPlanGeneratedAt(new Date(parsed.planGeneratedAt));
            }
            if (parsed?.lastUpdated) {
                setLastUpdated(new Date(parsed.lastUpdated));
            }
        } catch (error) {
            // Ignore invalid stored state.
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (process.env.NODE_ENV === 'test') return;
        const payload = {
            optimizationResults,
            planRows,
            lockedMeals,
            frequencyLimits,
            manualAdditions,
            planGeneratedAt: planGeneratedAt ? planGeneratedAt.toISOString() : null,
            lastUpdated: lastUpdated ? lastUpdated.toISOString() : null,
        };
        try {
            window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(payload));
        } catch (error) {
            // Ignore storage failures.
        }
    }, [
        optimizationResults,
        planRows,
        lockedMeals,
        frequencyLimits,
        manualAdditions,
        planGeneratedAt,
        lastUpdated,
    ]);

    useEffect(() => {
        if (!optimizationResults?.mealPlan) {
            if (!restoredPlanRef.current) {
                setPlanRows([]);
            }
            setPlanSaved(false);
            setPlanExported(false);
            return;
        }
        if (restoredPlanRef.current) {
            restoredPlanRef.current = false;
            return;
        }

        const additions = manualAdditionsRef.current || {};
        const baseRows = buildPlanRowsFromMealPlan(optimizationResults.mealPlan);

        const rowMap = new Map(baseRows.map((row) => [row.mealId, row]));
        Object.entries(additions).forEach(([mealId, extra]) => {
            const extraServings = Math.max(0, Number(extra || 0));
            if (!extraServings) return;
            const limit = frequencyLimits.perEntry?.[mealId];
            if (rowMap.has(mealId)) {
                const row = rowMap.get(mealId);
                const nextServings = row.servings + extraServings;
                const capped = Number.isFinite(limit) ? Math.min(nextServings, limit) : nextServings;
                rowMap.set(mealId, {
                    ...row,
                    source: 'adjusted',
                    servings: capped,
                    totals: {
                        calories: row.perServing.calories * capped,
                        protein: row.perServing.protein * capped,
                        carbohydrates: row.perServing.carbohydrates * capped,
                        fat: row.perServing.fat * capped,
                        sodium: row.perServing.sodium * capped,
                        cost: row.perServing.cost * capped,
                    },
                });
                return;
            }
            const meal = customMealsRef.current.find((item) => String(item.id) === String(mealId));
            if (!meal) return;
            const perServing = {
                calories: Number(meal.calories || 0),
                protein: Number(meal.protein || 0),
                carbohydrates: Number(meal.carbohydrates || 0),
                fat: Number(meal.fat || 0),
                sodium: Number(meal.sodium || 0),
                cost: Number(meal.price || 0),
            };
            const finalServings = Number.isFinite(limit) ? Math.min(extraServings, limit) : extraServings;
            rowMap.set(mealId, {
                mealId: meal.id,
                mealName: meal.meal_name,
                source: 'manual',
                servings: finalServings,
                perServing,
                totals: {
                    calories: perServing.calories * finalServings,
                    protein: perServing.protein * finalServings,
                    carbohydrates: perServing.carbohydrates * finalServings,
                    fat: perServing.fat * finalServings,
                    sodium: perServing.sodium * finalServings,
                    cost: perServing.cost * finalServings,
                },
            });
        });

        setPlanRows(Array.from(rowMap.values()));
        setPlanSaved(false);
        setPlanExported(false);
    }, [optimizationResults]);

    useEffect(() => {
        if (!goalPreset || goalPreset === lastGoalRef.current) return;
        lastGoalRef.current = goalPreset;
        if (planSummaryRef.current) {
            planSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            planSummaryRef.current.focus({ preventScroll: true });
        }
    }, [goalPreset]);

    const handleInputChange = (field) => (event) => {
        setMealForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleConstraintChange = (nutrient, bound) => (event) => {
        const value = Number(event.target.value);
        setConstraints((prev) => ({
            ...prev,
            [nutrient]: {
                ...prev[nutrient],
                [bound]: Number.isFinite(value) ? value : 0,
            },
        }));
        setGoalPreset('Custom');
    };

    const handleRangeChange = (nutrient) => (_, newValue) => {
        if (!Array.isArray(newValue)) return;
        setConstraints((prev) => ({
            ...prev,
            [nutrient]: { min: newValue[0], max: newValue[1] },
        }));
        setGoalPreset('Custom');
    };

    const applyPreset = (presetName) => {
        const preset = goalPresets[presetName];
        if (!preset) return;
        setConstraints((prev) => ({ ...prev, ...preset }));
        setGoalPreset(presetName);
        setLastUpdated(new Date());
    };

    const handleGoalPreset = (_, value) => {
        if (!value) return;
        if (value === 'Custom') {
            setGoalPreset('Custom');
            return;
        }
        applyPreset(value);
    };

    const handleAddMeal = () => {
        if (!mealForm.meal_name || !mealForm.calories) {
            setConstraintError('Meal name and calories are required.');
            return;
        }

        const newMeal = {
            id: Date.now(),
            chain: mealForm.chain || 'Custom',
            meal_name: mealForm.meal_name.trim(),
            price: parseFloat(mealForm.price) || 0,
            calories: parseFloat(mealForm.calories) || 0,
            protein: parseFloat(mealForm.protein) || 0,
            carbohydrates: parseFloat(mealForm.carbohydrates) || 0,
            fat: parseFloat(mealForm.fat) || 0,
            sodium: parseFloat(mealForm.sodium) || 0,
            allergens: normalizeAllergenList(mealForm.allergens || []),
            cuisine: mealForm.cuisine || 'Global',
            mealType: mealForm.mealType || 'Main',
            dietary: normalizeTagList(mealForm.dietary || []),
            budgetTier: mealForm.budgetTier || 'Mid',
            includeInOptimization: mealForm.includeInOptimization !== false,
            createdAt: new Date().toISOString(),
        };

        setCustomMeals((prev) => [newMeal, ...prev]);
        setMealForm(initialMealForm);
        setConstraintError(null);
        setLastUpdated(new Date());
        setAddOpen(false);
    };

    const handleRemoveMeal = (id) => {
        setCustomMeals((prev) => prev.filter((meal) => meal.id !== id));
        setLastUpdated(new Date());
    };

    const handleToggleInclude = (id) => {
        setCustomMeals((prev) =>
            prev.map((meal) =>
                meal.id === id ? { ...meal, includeInOptimization: !meal.includeInOptimization } : meal,
            ),
        );
    };

    const handleDuplicateMeal = (meal) => {
        const clone = {
            ...meal,
            id: `${meal.id}-copy-${Date.now()}`,
            meal_name: `${meal.meal_name} (Copy)`,
            createdAt: new Date().toISOString(),
        };
        setCustomMeals((prev) => [clone, ...prev]);
        setLastUpdated(new Date());
    };

    const startEditMeal = (meal) => {
        setEditingMealId(meal.id);
        setEditingDraft({
            calories: meal.calories ?? 0,
            protein: meal.protein ?? 0,
            price: meal.price ?? 0,
        });
    };

    const handleEditChange = (field) => (event) => {
        const value = event.target.value;
        setEditingDraft((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditSave = (mealId) => {
        if (!editingDraft) return;
        setCustomMeals((prev) =>
            prev.map((meal) =>
                meal.id === mealId
                    ? {
                        ...meal,
                        calories: parseNumber(editingDraft.calories),
                        protein: parseNumber(editingDraft.protein),
                        price: parseNumber(editingDraft.price),
                    }
                    : meal,
            ),
        );
        setEditingMealId(null);
        setEditingDraft(null);
        setLastUpdated(new Date());
    };

    const handleEditCancel = () => {
        setEditingMealId(null);
        setEditingDraft(null);
    };

    const handleOptimize = async () => {
        if (runDisabledReason) {
            setConstraintError(runDisabledReason);
            return;
        }

        setConstraintError(null);
        setIsOptimizing(true);
        setOptimizationError(null);

        const lockedLimits = Object.entries(lockedMeals).reduce((acc, [mealId, servings]) => {
            const value = Number(servings);
            if (Number.isFinite(value) && value > 0) {
                acc[mealId] = { min: value, max: value };
            }
            return acc;
        }, {});

        try {
            const response = await fetch('/api/optimize-meals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    meals: customMeals,
                    constraints: {
                        horizon_days: horizonDays,
                        meals_per_day: mealsPerDay,
                        max_servings_per_meal: maxServingsPerMeal,
                        serving_step: 1,
                        servings_integer: true,
                        allergens: { forbidden: allergenFilters },
                        nutrition: Object.keys(constraints).reduce((acc, key) => {
                            acc[key] = { ...constraints[key], period: 'total' };
                            return acc;
                        }, {}),
                        safety: Object.entries(safetyCaps).reduce((acc, [key, value]) => {
                            const numeric = Number(value);
                            if (Number.isFinite(numeric) && numeric > 0) {
                                acc[key] = { max: numeric };
                            }
                            return acc;
                        }, {}),
                        frequency: {
                            per_entry: { ...frequencyLimits.perEntry, ...lockedLimits },
                            per_tag: frequencyLimits.perTag,
                        },
                    },
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const results = await response.json();
            setOptimizationResults(results);
            if (Array.isArray(results?.mealPlan)) {
                setPlanRows(buildPlanRowsFromMealPlan(results.mealPlan));
            }
            const now = new Date();
            setPlanGeneratedAt(now);
            setPlanFeedbackMessage('New plan generated.');
            setPlanFeedbackOpen(true);
            setLastUpdated(new Date());
        } catch (error) {
            setOptimizationError(error.message);
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleLoadSamples = async () => {
        setIsLoadingSamples(true);
        setOptimizationError(null);
        try {
            const response = await fetch('/api/test-meals');
            if (!response.ok) {
                throw new Error(`Sample fetch failed: ${response.status}`);
            }
            const payload = await response.json();
            const baseDate = new Date(payload.generatedAt || Date.now());
            const meals = (payload.meals || []).map((meal, idx) => ({
                id: meal.id,
                chain: meal.restaurant || 'Sample',
                meal_name: meal.meal_name,
                price: Number(meal.price) || 0,
                calories: Number(meal.calories) || 0,
                protein: Number(meal.protein) || 0,
                carbohydrates: Number(meal.carbohydrates) || 0,
                fat: Number(meal.fat) || 0,
                sodium: Number(meal.sodium) || 0,
                allergens: normalizeAllergenList(meal.allergens || []),
                cuisine: cuisineOptions[idx % cuisineOptions.length],
                mealType: mealTypeOptions[idx % mealTypeOptions.length],
                dietary: [],
                budgetTier: Number(meal.price) >= 35 ? 'High' : Number(meal.price) >= 20 ? 'Mid' : 'Low',
                includeInOptimization: true,
                createdAt: new Date(baseDate.getTime() - idx * 3600 * 1000).toISOString(),
            }));
            setCustomMeals(meals);
            setLastUpdated(new Date());
        } catch (error) {
            setOptimizationError(error.message);
        } finally {
            setIsLoadingSamples(false);
        }
    };

    const handleImportCsv = () => {
        fileInputRef.current?.click();
    };

    const handleImportFile = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const rows = parseDelimited(text);
            if (!rows.length) {
                setConstraintError('No rows detected in the CSV.');
                return;
            }
            const meals = buildMealsFromRows(rows);
            setCustomMeals((prev) => [...meals, ...prev]);
            setLastUpdated(new Date());
        } catch (error) {
            setConstraintError(error.message || 'Failed to import CSV.');
        } finally {
            event.target.value = '';
        }
    };

    const handlePasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) {
                setConstraintError('Clipboard is empty.');
                return;
            }
            const rows = parseDelimited(text);
            if (!rows.length) {
                setConstraintError('No rows detected in the clipboard data.');
                return;
            }
            const meals = buildMealsFromRows(rows);
            setCustomMeals((prev) => [...meals, ...prev]);
            setLastUpdated(new Date());
        } catch (error) {
            setConstraintError('Clipboard access failed.');
        }
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilters(Object.keys(statusConfig));
        setIssueFilter('');
        setAllergenFilters([]);
        setIncludeFilter('all');
        setCuisineFilter([]);
        setMealTypeFilter([]);
        setDietaryFilter([]);
        setBudgetFilter([]);
        setDateRange('all');
    };

    const duplicateNames = useMemo(() => {
        const counts = new Map();
        customMeals.forEach((meal) => {
            const key = (meal.meal_name || '').trim().toLowerCase();
            if (!key) return;
            counts.set(key, (counts.get(key) || 0) + 1);
        });
        return new Set(Array.from(counts.entries()).filter(([, count]) => count > 1).map(([key]) => key));
    }, [customMeals]);

    const filteredMeals = useMemo(() => {
        const now = Date.now();
        const rangeMap = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
        };
        const days = rangeMap[dateRange];
        return customMeals
            .map((meal) => {
                const issues = buildIssues(meal, duplicateNames);
                const status = buildStatus(issues, meal);
                return { ...meal, issues, status };
            })
            .filter((meal) => {
                if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    if (!meal.meal_name.toLowerCase().includes(term) && !meal.chain.toLowerCase().includes(term)) {
                        return false;
                    }
                }

                if (!statusFilters.includes(meal.status)) return false;

                if (issueFilter) {
                    const hasIssue = meal.issues?.some((issue) => issue.code === issueFilter);
                    if (!hasIssue) return false;
                }

                if (allergenFilters.length > 0) {
                    const hasAllergen = meal.allergens?.some((a) => allergenFilters.includes(a));
                    if (hasAllergen) return false;
                }

                if (includeFilter === 'included' && meal.includeInOptimization === false) return false;
                if (includeFilter === 'excluded' && meal.includeInOptimization !== false) return false;

                if (cuisineFilter.length > 0 && !cuisineFilter.includes(meal.cuisine)) return false;
                if (mealTypeFilter.length > 0 && !mealTypeFilter.includes(meal.mealType)) return false;
                if (budgetFilter.length > 0 && !budgetFilter.includes(meal.budgetTier)) return false;
                if (dietaryFilter.length > 0) {
                    const hasDietary = meal.dietary?.some((item) => dietaryFilter.includes(item));
                    if (!hasDietary) return false;
                }

                if (days) {
                    const created = new Date(meal.createdAt || 0).getTime();
                    if (!created || now - created > days * 24 * 60 * 60 * 1000) return false;
                }

                return true;
            });
    }, [
        customMeals,
        duplicateNames,
        searchTerm,
        statusFilters,
        allergenFilters,
        includeFilter,
        cuisineFilter,
        mealTypeFilter,
        dietaryFilter,
        budgetFilter,
        dateRange,
    ]);

    const eligibleMeals = useMemo(() => {
        return customMeals.filter((meal) => {
            if (meal.includeInOptimization === false) return false;
            if (!meal.calories || !meal.protein) return false;
            if (allergenFilters.length > 0) {
                const hasAllergen = meal.allergens?.some((a) => allergenFilters.includes(a));
                if (hasAllergen) return false;
            }
            return true;
        });
    }, [customMeals, allergenFilters]);

    const sortedMeals = useMemo(() => {
        const statusOrder = { error: 5, missing: 4, outlier: 3, duplicate: 2, excluded: 1, ready: 0 };
        const column = COLUMN_CONFIG.find((col) => col.id === sortBy);
        const isNumeric = column?.numeric;
        const getValue = (meal) => {
            if (sortBy === 'status') return statusOrder[meal.status] || 0;
            if (sortBy === 'issues') return meal.issues?.length || 0;
            if (sortBy === 'createdAt') return new Date(meal.createdAt || 0).getTime() || 0;
            if (sortBy === 'price') return Number(meal.price || 0);
            if (sortBy === 'meal') return meal.meal_name || '';
            if (sortBy === 'restaurant') return meal.chain || '';
            if (sortBy === 'allergens') return (meal.allergens || []).join(',');
            const key = column?.key;
            return key ? meal[key] ?? '' : '';
        };

        const sorted = [...filteredMeals].sort((a, b) => {
            const aVal = getValue(a);
            const bVal = getValue(b);
            if (isNumeric) {
                return Number(aVal) - Number(bVal);
            }
            return String(aVal).localeCompare(String(bVal));
        });

        return sortDirection === 'desc' ? sorted.reverse() : sorted;
    }, [filteredMeals, sortBy, sortDirection]);

    const pagedMeals = useMemo(() => {
        const start = page * rowsPerPage;
        return sortedMeals.slice(start, start + rowsPerPage);
    }, [sortedMeals, page, rowsPerPage]);

    const activeColumns = COLUMN_CONFIG.filter((col) => columns[col.id]);

    const statusCounts = useMemo(() => {
        const counts = {
            total: customMeals.length,
            ready: 0,
            missing: 0,
            outlier: 0,
            duplicate: 0,
            excluded: 0,
            error: 0,
        };
        customMeals.forEach((meal) => {
            const issues = buildIssues(meal, duplicateNames);
            const status = buildStatus(issues, meal);
            if (counts[status] !== undefined) counts[status] += 1;
        });
        return counts;
    }, [customMeals, duplicateNames]);

    const issueCounts = useMemo(() => {
        const counts = {
            missing_calories: 0,
            missing_macros: 0,
            missing_price: 0,
            outlier: 0,
            duplicate: 0,
        };
        customMeals.forEach((meal) => {
            const issues = buildIssues(meal, duplicateNames);
            issues.forEach((issue) => {
                if (counts[issue.code] !== undefined) {
                    counts[issue.code] += 1;
                }
            });
        });
        return counts;
    }, [customMeals, duplicateNames]);

    const totals = useMemo(() => {
        if (customMeals.length === 0) {
            return { total: 0, avgCalories: 0 };
        }
        const totalCalories = customMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
        return {
            total: customMeals.length,
            avgCalories: totalCalories / customMeals.length,
        };
    }, [customMeals]);

    const nutrientStats = useMemo(() => {
        const keys = ['calories', 'protein', 'carbohydrates', 'fat', 'sodium'];
        const stats = keys.reduce((acc, key) => {
            acc[key] = { min: Number.POSITIVE_INFINITY, max: 0, avg: 0 };
            return acc;
        }, {});
        if (eligibleMeals.length === 0) return stats;
        eligibleMeals.forEach((meal) => {
            keys.forEach((key) => {
                const value = Number(meal[key] || 0);
                stats[key].min = Math.min(stats[key].min, value);
                stats[key].max = Math.max(stats[key].max, value);
                stats[key].avg += value;
            });
        });
        keys.forEach((key) => {
            stats[key].avg = stats[key].avg / eligibleMeals.length;
        });
        return stats;
    }, [eligibleMeals]);

    const matchingMealCount = useMemo(() => {
        if (eligibleMeals.length === 0) return 0;
        return eligibleMeals.filter((meal) => {
            return Object.entries(constraints).every(([key, range]) => {
                if (!Number.isFinite(range.max)) return true;
                const value = Number(meal[key] || 0);
                return value <= range.max;
            });
        }).length;
    }, [eligibleMeals, constraints]);

    const invalidConstraint = useMemo(() => {
        return Object.entries(constraints).find(([, range]) => range.min > range.max);
    }, [constraints]);

    const feasibility = useMemo(() => {
        if (invalidConstraint || eligibleMeals.length === 0) {
            return { state: 'infeasible', label: 'Targets not achievable', color: 'error', value: 18 };
        }
        if (matchingMealCount < Math.max(3, Math.round(eligibleMeals.length * 0.2))) {
            return { state: 'tight', label: 'Targets tight', color: 'warning', value: 55 };
        }
        return {
            state: 'feasible',
            label: OPTIMIZER_COPY.labels.targetsAchievable,
            color: 'success',
            value: 90,
        };
    }, [invalidConstraint, eligibleMeals.length, matchingMealCount]);

    const autoFixSuggestions = useMemo(() => {
        const fixes = [];
        if (invalidConstraint) {
            const [key, range] = invalidConstraint;
            const label = macroDefinitions.find((item) => item.key === key)?.label || key;
            fixes.push({
                label: `Set ${label} max to ${range.min}`,
                apply: () => {
                    setConstraints((prev) => ({
                        ...prev,
                        [key]: { ...prev[key], max: prev[key].min },
                    }));
                },
            });
            fixes.push({
                label: `Lower ${label} min to ${range.max}`,
                apply: () => {
                    setConstraints((prev) => ({
                        ...prev,
                        [key]: { ...prev[key], min: prev[key].max },
                    }));
                },
            });
        }
        if (eligibleMeals.length === 0) {
            if (allergenFilters.length > 0) {
                fixes.push({
                    label: 'Clear allergen filters',
                    apply: () => setAllergenFilters([]),
                });
            }
            fixes.push({
                label: 'Include all meals',
                apply: () => setIncludeFilter('all'),
            });
        }
        if (!invalidConstraint && eligibleMeals.length > 0 && matchingMealCount === 0) {
            Object.entries(constraints).forEach(([key, range]) => {
                const max = nutrientStats[key]?.max;
                if (Number.isFinite(max) && range.max < max) {
                    fixes.push({
                        label: `Increase ${key} max to ${Math.round(max)}`,
                        apply: () => {
                            setConstraints((prev) => ({
                                ...prev,
                                [key]: { ...prev[key], max: Math.round(max) },
                            }));
                        },
                    });
                }
            });
        }
        return fixes.slice(0, 3);
    }, [invalidConstraint, eligibleMeals.length, allergenFilters.length, matchingMealCount, constraints, nutrientStats]);

    const datasetReady = customMeals.length >= 10;
    const goalReady = Boolean(goalPreset);
    const constraintsReady = goalReady && !invalidConstraint && feasibility.state !== 'infeasible';
    const optimized = optimizationResults?.status === 'optimal';
    const planSavedState = planSaved || planExported;

    const runDisabledReason = useMemo(() => {
        if (!datasetReady) {
            return 'Add at least 10 meals to start.';
        }
        if (!goalReady) {
            return OPTIMIZER_COPY.helper.generatePlanDisabled;
        }
        if (eligibleMeals.length === 0) {
            return 'No eligible meals after allergen or inclusion filters.';
        }
        if (invalidConstraint) {
            const [key] = invalidConstraint;
            const label = macroDefinitions.find((item) => item.key === key)?.label || key;
            return `${label} min cannot exceed max.`;
        }
        if (!Number.isFinite(horizonDays) || horizonDays < 1) {
            return 'Plan length must be at least 1 day.';
        }
        if (!Number.isFinite(mealsPerDay) || mealsPerDay < 1) {
            return 'Meals per day must be at least 1.';
        }
        return '';
    }, [datasetReady, goalReady, eligibleMeals.length, invalidConstraint, constraintsReady, horizonDays, mealsPerDay]);

    const displayPlanRows = useMemo(() => {
        if (planRows.length) return planRows;
        if (optimizationResults?.mealPlan) {
            return buildPlanRowsFromMealPlan(optimizationResults.mealPlan);
        }
        return [];
    }, [planRows, optimizationResults]);

    const planTotals = useMemo(() => {
        return displayPlanRows.reduce(
            (acc, row) => {
                acc.calories += row.totals.calories || 0;
                acc.protein += row.totals.protein || 0;
                acc.carbohydrates += row.totals.carbohydrates || 0;
                acc.fat += row.totals.fat || 0;
                acc.sodium += row.totals.sodium || 0;
                acc.cost += row.totals.cost || 0;
                return acc;
            },
            { calories: 0, protein: 0, carbohydrates: 0, fat: 0, sodium: 0, cost: 0 },
        );
    }, [displayPlanRows]);

    const totalIndicators = useMemo(() => {
        return macroDefinitions.map((item) => {
            const value = planTotals[item.key] || 0;
            const { min, max } = constraints[item.key];
            let status = 'success';
            if (Number.isFinite(min) && value < min) status = 'warning';
            if (Number.isFinite(max) && value > max) status = 'error';
            return {
                ...item,
                value,
                min,
                max,
                status,
            };
        });
    }, [planTotals, constraints]);

    const steps = useMemo(() => {
        return [
            { label: OPTIMIZER_COPY.stepper.addMeals, complete: datasetReady },
            { label: OPTIMIZER_COPY.stepper.pickGoal, complete: goalReady },
            { label: OPTIMIZER_COPY.stepper.adjustLimits, complete: constraintsReady },
            { label: OPTIMIZER_COPY.stepper.generatePlan, complete: optimized },
            { label: OPTIMIZER_COPY.stepper.reviewSave, complete: planSavedState },
        ];
    }, [datasetReady, goalReady, constraintsReady, optimized, planSavedState]);

    const activeStep = useMemo(() => {
        const index = steps.findIndex((step) => !step.complete);
        return index === -1 ? steps.length - 1 : index;
    }, [steps]);

    const nextAction = useMemo(() => {
        if (!datasetReady) {
            return {
                title: OPTIMIZER_COPY.stepper.addMeals,
                message: 'Import a dataset or add 10 meals to get reliable results.',
                actionLabel: OPTIMIZER_COPY.buttons.addMeals,
                onAction: () => setAddOpen(true),
            };
        }
        if (!goalReady) {
            return {
                title: OPTIMIZER_COPY.stepper.pickGoal,
                message: 'Pick a goal to set your calories and macros.',
                actionLabel: OPTIMIZER_COPY.buttons.pickGoal,
                onAction: () => constraintsRef.current?.scrollIntoView({ behavior: 'smooth' }),
            };
        }
        if (eligibleMeals.length === 0) {
            return {
                title: 'No eligible meals',
                message: 'Your allergen or inclusion filters remove every meal.',
                actionLabel: 'Clear allergens',
                onAction: () => setAllergenFilters([]),
            };
        }
        if (!constraintsReady) {
            return {
                title: OPTIMIZER_COPY.stepper.adjustLimits,
                message: 'Targets are too tight. Apply a fix or adjust your limits.',
                actionLabel: autoFixSuggestions[0] ? 'Auto-fix limits' : OPTIMIZER_COPY.stepper.adjustLimits,
                onAction: autoFixSuggestions[0]
                    ? autoFixSuggestions[0].apply
                    : () => constraintsRef.current?.scrollIntoView({ behavior: 'smooth' }),
            };
        }
        if (!optimized) {
            return {
                title: 'Ready to generate',
                message: 'Everything is ready. Generate your plan.',
                actionLabel: OPTIMIZER_COPY.buttons.generatePlan,
                onAction: handleOptimize,
            };
        }
        if (!planSavedState) {
            return {
                title: 'Save your plan',
                message: 'Save this plan so you can reuse or export it later.',
                actionLabel: OPTIMIZER_COPY.buttons.saveThisPlan,
                onAction: () => setPlanSaved(true),
            };
        }
        return {
            title: 'Plan saved',
            message: 'Your plan is saved. You can generate another plan anytime.',
            actionLabel: OPTIMIZER_COPY.buttons.runAgain,
            onAction: handleOptimize,
        };
    }, [
        datasetReady,
        goalReady,
        eligibleMeals.length,
        constraintsReady,
        optimized,
        planSavedState,
        autoFixSuggestions,
        handleOptimize,
    ]);

    const workflowAction = useMemo(() => {
        if (!datasetReady) {
            return { label: OPTIMIZER_COPY.buttons.addMeals, onClick: () => setAddOpen(true), disabled: false };
        }
        if (!goalReady) {
            return {
                label: OPTIMIZER_COPY.buttons.pickGoal,
                onClick: () => constraintsRef.current?.scrollIntoView({ behavior: 'smooth' }),
                disabled: false,
            };
        }
        if (eligibleMeals.length === 0) {
            return {
                label: 'Clear allergens',
                onClick: () => setAllergenFilters([]),
                disabled: false,
            };
        }
        if (!constraintsReady) {
            return {
                label: OPTIMIZER_COPY.stepper.adjustLimits,
                onClick: () => constraintsRef.current?.scrollIntoView({ behavior: 'smooth' }),
                disabled: false,
            };
        }
        if (!optimized) {
            return {
                label: OPTIMIZER_COPY.buttons.generatePlan,
                onClick: handleOptimize,
                disabled: Boolean(runDisabledReason) || isOptimizing,
            };
        }
        if (!planSavedState) {
            return {
                label: OPTIMIZER_COPY.buttons.saveThisPlan,
                onClick: () => setPlanSaved(true),
                disabled: false,
            };
        }
        return { label: 'Plan saved', onClick: () => {}, disabled: true };
    }, [
        datasetReady,
        goalReady,
        eligibleMeals.length,
        constraintsReady,
        optimized,
        planSavedState,
        runDisabledReason,
        isOptimizing,
        handleOptimize,
    ]);

    const workflowIcon = useMemo(() => {
        if (workflowAction.label === OPTIMIZER_COPY.buttons.addMeals) return <AddIcon />;
        if (workflowAction.label === OPTIMIZER_COPY.buttons.pickGoal) return <InsightsIcon />;
        if (workflowAction.label === OPTIMIZER_COPY.stepper.adjustLimits) return <FilterListIcon />;
        if (workflowAction.label === OPTIMIZER_COPY.buttons.generatePlan) return <PlayArrowIcon />;
        if (/save/i.test(workflowAction.label)) return <SaveIcon />;
        return null;
    }, [workflowAction.label]);

    const exportCsv = () => {
        if (filteredMeals.length === 0) return;
        const headers = activeColumns.map((col) => col.label);
        const rows = filteredMeals.map((meal) => {
            return activeColumns.map((col) => {
                switch (col.id) {
                    case 'status':
                        return statusConfig[meal.status]?.label || 'Ready';
                    case 'issues':
                        return meal.issues?.length || 0;
                    case 'allergens':
                        return (meal.allergens || []).map(formatAllergenLabel).join('; ');
                    case 'createdAt':
                        return formatDate(meal.createdAt);
                    case 'price':
                        return Number(meal.price || 0).toFixed(2);
                    default:
                        return meal[col.key] ?? '';
                }
            });
        });
        const csv = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'optimizer-meals.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportPlan = () => {
        if (!planRows.length) return;
        const headers = ['Meal', 'Servings', 'Calories', 'Protein', 'Carbs', 'Fat', 'Sodium', 'Cost'];
        const rows = planRows.map((row) => [
            row.mealName,
            row.servings,
            Math.round(row.totals.calories),
            Math.round(row.totals.protein),
            Math.round(row.totals.carbohydrates),
            Math.round(row.totals.fat),
            Math.round(row.totals.sodium),
            row.totals.cost.toFixed(2),
        ]);
        const csv = [headers, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'meal-plan.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setPlanExported(true);
    };

    const handleRowClick = (meal, tab = 'overview', event) => {
        if (event?.detail && event.detail > 1) return;
        setSelectedMeal(meal);
        setDetailsTab(tab);
        setDetailsOpen(true);
    };

    const handleSort = (columnId) => {
        if (sortBy === columnId) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(columnId);
            setSortDirection('asc');
        }
    };

    const handleSwapOpen = (event, row) => {
        setSwapAnchorEl(event.currentTarget);
        setSwapTarget(row);
    };

    const handleSwapClose = () => {
        setSwapAnchorEl(null);
        setSwapTarget(null);
    };

    const swapOptions = useMemo(() => {
        if (!swapTarget) return [];
        const targetCalories = swapTarget.perServing?.calories || 0;
        return eligibleMeals
            .filter((meal) => meal.id !== swapTarget.mealId)
            .map((meal) => {
                const calories = Number(meal.calories || 0);
                const score = Math.abs(calories - targetCalories);
                return { meal, score };
            })
            .sort((a, b) => a.score - b.score)
            .slice(0, 6)
            .map((item) => item.meal);
    }, [swapTarget, eligibleMeals]);

    const handleSwapSelect = (meal) => {
        if (!swapTarget || !meal) return;
        setPlanRows((prev) =>
            prev.map((row) => {
                if (row.mealId !== swapTarget.mealId) return row;
                const perServing = {
                    calories: Number(meal.calories || 0),
                    protein: Number(meal.protein || 0),
                    carbohydrates: Number(meal.carbohydrates || 0),
                    fat: Number(meal.fat || 0),
                    sodium: Number(meal.sodium || 0),
                    cost: Number(meal.price || 0),
                };
                return {
                    ...row,
                    mealId: meal.id,
                    mealName: meal.meal_name,
                    perServing,
                    totals: {
                        calories: perServing.calories * row.servings,
                        protein: perServing.protein * row.servings,
                        carbohydrates: perServing.carbohydrates * row.servings,
                        fat: perServing.fat * row.servings,
                        sodium: perServing.sodium * row.servings,
                        cost: perServing.cost * row.servings,
                    },
                };
            }),
        );
        handleSwapClose();
    };

    const toggleLockMeal = (row) => {
        setLockedMeals((prev) => {
            if (prev[row.mealId]) {
                const next = { ...prev };
                delete next[row.mealId];
                return next;
            }
            return { ...prev, [row.mealId]: row.servings };
        });
    };

    const adjustServings = (row, delta) => {
        let updatedServings = row.servings;
        const limit = frequencyLimits.perEntry?.[row.mealId];
        setPlanRows((prev) =>
            prev.map((item) => {
                if (item.mealId !== row.mealId) return item;
                const nextServings = Math.max(1, item.servings + delta);
                const cappedServings = Number.isFinite(limit) ? Math.min(nextServings, limit) : nextServings;
                updatedServings = cappedServings;
                return {
                    ...item,
                    servings: cappedServings,
                    totals: {
                        calories: item.perServing.calories * cappedServings,
                        protein: item.perServing.protein * cappedServings,
                        carbohydrates: item.perServing.carbohydrates * cappedServings,
                        fat: item.perServing.fat * cappedServings,
                        sodium: item.perServing.sodium * cappedServings,
                        cost: item.perServing.cost * cappedServings,
                    },
                };
            }),
        );
        setLockedMeals((prev) =>
            prev[row.mealId] ? { ...prev, [row.mealId]: updatedServings } : prev,
        );
    };

    const applyMealLimit = () => {
        if (!planMealLimitDraft.mealId || !planMealLimitDraft.max) return;
        const limit = Math.max(1, parseNumber(planMealLimitDraft.max));
        const mealId = planMealLimitDraft.mealId;
        setFrequencyLimits((prev) => ({
            ...prev,
            perEntry: {
                ...prev.perEntry,
                [mealId]: limit,
            },
        }));
        setPlanRows((prev) =>
            prev.map((row) => {
                if (row.mealId !== mealId) return row;
                const nextServings = Math.min(row.servings, limit);
                return {
                    ...row,
                    servings: nextServings,
                    totals: {
                        calories: row.perServing.calories * nextServings,
                        protein: row.perServing.protein * nextServings,
                        carbohydrates: row.perServing.carbohydrates * nextServings,
                        fat: row.perServing.fat * nextServings,
                        sodium: row.perServing.sodium * nextServings,
                        cost: row.perServing.cost * nextServings,
                    },
                };
            }),
        );
        setLockedMeals((prev) =>
            prev[mealId] ? { ...prev, [mealId]: Math.min(prev[mealId], limit) } : prev,
        );
        setPlanMealLimitDraft({ mealId: '', max: '' });
    };

    const handleAddPlannedMeal = () => {
        if (!manualMealDraft.mealId) return;
        const meal = customMeals.find((item) => item.id === manualMealDraft.mealId);
        if (!meal) return;
        const servings = Math.max(1, parseNumber(manualMealDraft.servings));
        const limit = frequencyLimits.perEntry?.[meal.id];
        const perServing = {
            calories: Number(meal.calories || 0),
            protein: Number(meal.protein || 0),
            carbohydrates: Number(meal.carbohydrates || 0),
            fat: Number(meal.fat || 0),
            sodium: Number(meal.sodium || 0),
            cost: Number(meal.price || 0),
        };
        setPlanRows((prev) => {
            const existing = prev.find((row) => row.mealId === meal.id);
            if (existing) {
                const nextServings = Number.isFinite(limit)
                    ? Math.min(existing.servings + servings, limit)
                    : existing.servings + servings;
                return prev.map((row) =>
                    row.mealId === meal.id
                        ? {
                            ...row,
                            source: row.source === 'solver' ? 'adjusted' : row.source,
                            servings: nextServings,
                            totals: {
                                calories: row.perServing.calories * nextServings,
                                protein: row.perServing.protein * nextServings,
                                carbohydrates: row.perServing.carbohydrates * nextServings,
                                fat: row.perServing.fat * nextServings,
                                sodium: row.perServing.sodium * nextServings,
                                cost: row.perServing.cost * nextServings,
                            },
                        }
                        : row,
                );
            }
            const finalServings = Number.isFinite(limit) ? Math.min(servings, limit) : servings;
            return [
                {
                    mealId: meal.id,
                    mealName: meal.meal_name,
                    source: 'manual',
                    servings: finalServings,
                    perServing,
                    totals: {
                        calories: perServing.calories * finalServings,
                        protein: perServing.protein * finalServings,
                        carbohydrates: perServing.carbohydrates * finalServings,
                        fat: perServing.fat * finalServings,
                        sodium: perServing.sodium * finalServings,
                        cost: perServing.cost * finalServings,
                    },
                },
                ...prev,
            ];
        });
        setManualAdditions((prev) => ({
            ...prev,
            [meal.id]: (prev[meal.id] || 0) + servings,
        }));
        setManualMealDraft({ mealId: '', servings: 1 });
    };

    const removeManualPlanRow = (mealId) => {
        setPlanRows((prev) => prev.filter((row) => !(row.mealId === mealId && row.source === 'manual')));
        setManualAdditions((prev) => {
            if (!prev[mealId]) return prev;
            const next = { ...prev };
            delete next[mealId];
            return next;
        });
    };

    const rowPadding = density === 'compact' ? '6px 12px' : '12px 16px';

    const activeFilterChips = [
        searchTerm ? { label: `Search: ${searchTerm}`, onDelete: () => setSearchTerm('') } : null,
        dateRange !== 'all'
            ? { label: `Date: ${dateRangeOptions.find((o) => o.value === dateRange)?.label}`, onDelete: () => setDateRange('all') }
            : null,
        allergenFilters.length > 0
            ? {
                label: `Avoid: ${allergenFilters.map(formatAllergenLabel).join(', ')}`,
                onDelete: () => setAllergenFilters([]),
            }
            : null,
        includeFilter !== 'all'
            ? { label: `Include: ${includeFilter}`, onDelete: () => setIncludeFilter('all') }
            : null,
        cuisineFilter.length > 0 ? { label: `Cuisine: ${cuisineFilter.join(', ')}`, onDelete: () => setCuisineFilter([]) } : null,
        mealTypeFilter.length > 0 ? { label: `Meal type: ${mealTypeFilter.join(', ')}`, onDelete: () => setMealTypeFilter([]) } : null,
        dietaryFilter.length > 0 ? { label: `Dietary: ${dietaryFilter.join(', ')}`, onDelete: () => setDietaryFilter([]) } : null,
        budgetFilter.length > 0 ? { label: `Budget: ${budgetFilter.join(', ')}`, onDelete: () => setBudgetFilter([]) } : null,
        statusFilters.length < Object.keys(statusConfig).length
            ? {
                label: `Status: ${statusFilters.map((status) => statusConfig[status]?.label).join(', ')}`,
                onDelete: () => setStatusFilters(Object.keys(statusConfig)),
            }
            : null,
        issueFilter
            ? {
                label: `${OPTIMIZER_COPY.labels.warnings}: ${issueFilter.replace(/_/g, ' ')}`,
                onDelete: () => setIssueFilter(''),
            }
            : null,
    ].filter(Boolean);

    const issueSummary = useMemo(
        () => [
            { code: 'missing_calories', label: 'Missing calories', count: issueCounts.missing_calories },
            { code: 'missing_macros', label: 'Missing macros', count: issueCounts.missing_macros },
            { code: 'missing_price', label: 'Missing price', count: issueCounts.missing_price },
            { code: 'outlier', label: 'Outliers', count: issueCounts.outlier },
            { code: 'duplicate', label: 'Duplicates', count: issueCounts.duplicate },
        ],
        [issueCounts],
    );

    const selectedStatus = selectedMeal ? statusConfig[selectedMeal.status] : statusConfig.ready;
    const SelectedStatusIcon = selectedStatus.icon;

    const tourSteps = [
        { title: 'Dataset', body: 'Save meals here to build your planning pool.', anchor: datasetRef },
        { title: 'Plan settings', body: 'Pick a goal and adjust limits when you need to.', anchor: constraintsRef },
        { title: 'Generate plan', body: 'Generate a plan once your goal is set.', anchor: runButtonRef },
        { title: 'Results', body: 'Lock, swap, and apply your optimized plan.', anchor: resultsRef },
    ];

    const currentTour = tourSteps[tourStep];

    return (
        <Box
            sx={{
                display: 'grid',
                gap: 3,
                fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                color: 'text.primary',
                '& .MuiTypography-body2': { fontSize: '0.85rem' },
                '& .MuiTableCell-root': { fontSize: '0.92rem' },
                ...inputSx,
            }}
        >
            <Card elevation={0} sx={{ borderRadius: 4, ...glassTier(2) }}>
                <CardContent>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: 28 }}>
                                Meal Optimizer
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Last updated: {lastUpdated ? formatDate(lastUpdated) : 'Never'}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Button
                                variant="contained"
                                startIcon={workflowIcon}
                                onClick={workflowAction.onClick}
                                disabled={workflowAction.disabled}
                                sx={{
                                    backgroundImage: 'none',
                                    bgcolor: 'primary.main',
                                    '&:hover': { bgcolor: 'primary.dark', transform: 'translateY(-1px)' },
                                    transition: 'all 220ms ease',
                                }}
                            >
                                {workflowAction.label}
                            </Button>
                            <IconButton aria-label="More actions" onClick={(event) => setAnchorEl(event.currentTarget)}>
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={() => setAnchorEl(null)}
                            >
                                <MenuItem
                                    onClick={() => {
                                        setAnchorEl(null);
                                        setAddOpen(true);
                                    }}
                                >
                                    <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                                    Add meal
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        setAnchorEl(null);
                                        handleImportCsv();
                                    }}
                                >
                                    <FileUploadIcon fontSize="small" style={{ marginRight: 8 }} />
                                    Import CSV
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        setAnchorEl(null);
                                        handlePasteFromClipboard();
                                    }}
                                >
                                    <ContentPasteIcon fontSize="small" style={{ marginRight: 8 }} />
                                    Paste from clipboard
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        setAnchorEl(null);
                                        handleLoadSamples();
                                    }}
                                >
                                    <RefreshIcon fontSize="small" style={{ marginRight: 8 }} />
                                    Load 400 sample meals
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        setAnchorEl(null);
                                        setCustomMeals([]);
                                        setOptimizationResults(null);
                                        setGoalPreset('');
                                        setLastUpdated(new Date());
                                    }}
                                >
                                    Clear dataset
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        setAnchorEl(null);
                                        resetFilters();
                                    }}
                                >
                                    Reset filters
                                </MenuItem>
                                <MenuItem
                                    onClick={() => {
                                        setAnchorEl(null);
                                        setShowTour(true);
                                        setTourStep(0);
                                    }}
                                >
                                    {OPTIMIZER_COPY.buttons.quickTour}
                                </MenuItem>
                            </Menu>
                        </Stack>
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Box
                        role="group"
                        tabIndex={0}
                        aria-label={`Step ${activeStep + 1} of ${steps.length}, ${steps[activeStep]?.label || ''}`}
                    >
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {steps.map((step) => (
                                <Step key={step.label} completed={step.complete}>
                                    <StepLabel>{step.label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                </CardContent>
            </Card>

            <Card elevation={0} sx={{ borderRadius: 4, ...glassTier(2) }}>
                <CardContent>
                    <Stack spacing={1.5}>
                        <Typography variant="overline" color="text.secondary">
                            {OPTIMIZER_COPY.sections.nextStep}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {nextAction.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {nextAction.message}
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
                            <Button
                                variant="outlined"
                                onClick={nextAction.onAction}
                                size="small"
                            >
                                {nextAction.actionLabel}
                            </Button>
                            <Button
                                variant="text"
                                size="small"
                                onClick={() => {
                                    setShowTour(true);
                                    setTourStep(0);
                                }}
                            >
                                {OPTIMIZER_COPY.buttons.quickTour}
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                {[
                    {
                        label: 'Meals in dataset',
                        value: totals.total,
                        icon: RestaurantIcon,
                        onClick: () => setStatusFilters(Object.keys(statusConfig)),
                    },
                    { label: OPTIMIZER_COPY.labels.mealsThatFit, value: eligibleMeals.length, icon: InsightsIcon },
                    { label: OPTIMIZER_COPY.labels.needsInfo, value: statusCounts.missing, icon: ReportProblemIcon, onClick: () => setStatusFilters(['missing']) },
                    { label: OPTIMIZER_COPY.labels.needsAttention, value: statusCounts.outlier + statusCounts.duplicate, icon: ErrorIcon, onClick: () => setStatusFilters(['outlier', 'duplicate']) },
                ].map((kpi) => (
                    <Card key={kpi.label} elevation={0} sx={{ borderRadius: 3, ...glassTier(1), cursor: kpi.onClick ? 'pointer' : 'default' }} onClick={kpi.onClick}>
                        <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center">
                                {kpi.icon && <kpi.icon color="primary" />}
                                <Typography variant="body2" color="text.secondary">{kpi.label}</Typography>
                            </Stack>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>{kpi.value}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Card elevation={0} sx={{ borderRadius: 4, ...glassTier(2) }}>
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
                            <TextField
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search meals"
                                size="small"
                                inputProps={{ 'aria-label': 'Search meals' }}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                }}
                                sx={{ flex: 1, minWidth: 220 }}
                            />
                            <TextField
                                select
                                label="Date range"
                                size="small"
                                value={dateRange}
                                onChange={(event) => setDateRange(event.target.value)}
                                sx={{ minWidth: 180 }}
                            >
                                {dateRangeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <Button
                                variant="outlined"
                                startIcon={<FilterListIcon />}
                                onClick={() => setFiltersOpen((prev) => !prev)}
                            >
                                Filters
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ViewColumnIcon />}
                                onClick={(event) => setColumnsAnchor(event.currentTarget)}
                            >
                                Columns
                            </Button>
                            <Menu
                                anchorEl={columnsAnchor}
                                open={Boolean(columnsAnchor)}
                                onClose={() => setColumnsAnchor(null)}
                            >
                                {COLUMN_CONFIG.map((col) => (
                                    <MenuItem
                                        key={col.id}
                                        disabled={col.id === 'meal'}
                                        onClick={() => {
                                            if (col.id === 'meal') return;
                                            setColumns((prev) => ({ ...prev, [col.id]: !prev[col.id] }));
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <input type="checkbox" checked={columns[col.id]} readOnly />
                                            <Typography variant="body2">{col.label}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Menu>
                            <Button
                                variant="outlined"
                                startIcon={<FileDownloadIcon />}
                                onClick={exportCsv}
                            >
                                Export
                            </Button>
                            <ToggleButtonGroup
                                exclusive
                                size="small"
                                value={density}
                                onChange={(_, next) => next && setDensity(next)}
                            >
                                <ToggleButton value="comfortable" aria-label="Comfortable density">
                                    <DensityMediumIcon fontSize="small" />
                                </ToggleButton>
                                <ToggleButton value="compact" aria-label="Compact density">
                                    <DensitySmallIcon fontSize="small" />
                                </ToggleButton>
                            </ToggleButtonGroup>
                            <ToggleButtonGroup
                                exclusive
                                size="small"
                                value={viewMode}
                                onChange={(_, next) => next && setViewMode(next)}
                            >
                                <ToggleButton value="list">
                                    <ViewListIcon fontSize="small" />
                                    <Typography sx={{ ml: 0.5, fontSize: '0.75rem' }}>List</Typography>
                                </ToggleButton>
                                <ToggleButton value="table">
                                    <TableRowsIcon fontSize="small" />
                                    <Typography sx={{ ml: 0.5, fontSize: '0.75rem' }}>Table</Typography>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Stack>

                        {activeFilterChips.length > 0 && (
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {activeFilterChips.map((chip) => (
                                    <Chip key={chip.label} label={chip.label} size="small" onDelete={chip.onDelete} />
                                ))}
                            </Stack>
                        )}

                        <Collapse in={filtersOpen}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.4)', ...glassTier(1) }}>
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        {Object.keys(statusConfig).map((status) => (
                                            <Chip
                                                key={status}
                                                label={statusConfig[status].label}
                                                color={statusConfig[status].color}
                                                variant={statusFilters.includes(status) ? 'filled' : 'outlined'}
                                                onClick={() => {
                                                    setStatusFilters((prev) =>
                                                        prev.includes(status)
                                                            ? prev.filter((item) => item !== status)
                                                            : [...prev, status],
                                                    );
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                    <ToggleButtonGroup
                                        exclusive
                                        size="small"
                                        value={includeFilter}
                                        onChange={(_, next) => next && setIncludeFilter(next)}
                                    >
                                        <ToggleButton value="all">All meals</ToggleButton>
                                        <ToggleButton value="included">Included</ToggleButton>
                                        <ToggleButton value="excluded">Excluded</ToggleButton>
                                    </ToggleButtonGroup>
                                    <Autocomplete
                                        multiple
                                        options={ALLERGEN_OPTIONS.map((option) => option.value)}
                                        value={allergenFilters}
                                        onChange={(_, newValue) => setAllergenFilters(normalizeAllergenList(newValue))}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    key={option}
                                                    label={formatAllergenLabel(option)}
                                                    {...getTagProps({ index })}
                                                />
                                            ))
                                        }
                                        renderInput={(params) => (
                                            <TextField {...params} label="Avoid allergens" placeholder="Select allergens to exclude" />
                                        )}
                                    />
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                                        <Autocomplete
                                            multiple
                                            options={cuisineOptions}
                                            value={cuisineFilter}
                                            onChange={(_, newValue) => setCuisineFilter(newValue)}
                                            renderInput={(params) => <TextField {...params} label="Cuisine" />}
                                            sx={{ flex: 1 }}
                                        />
                                        <Autocomplete
                                            multiple
                                            options={mealTypeOptions}
                                            value={mealTypeFilter}
                                            onChange={(_, newValue) => setMealTypeFilter(newValue)}
                                            renderInput={(params) => <TextField {...params} label="Meal type" />}
                                            sx={{ flex: 1 }}
                                        />
                                        <Autocomplete
                                            multiple
                                            options={dietaryOptions}
                                            value={dietaryFilter}
                                            onChange={(_, newValue) => setDietaryFilter(newValue)}
                                            renderInput={(params) => <TextField {...params} label="Dietary" />}
                                            sx={{ flex: 1 }}
                                        />
                                        <Autocomplete
                                            multiple
                                            options={budgetTiers}
                                            value={budgetFilter}
                                            onChange={(_, newValue) => setBudgetFilter(newValue)}
                                            renderInput={(params) => <TextField {...params} label="Budget" />}
                                            sx={{ flex: 1 }}
                                        />
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Collapse>
                    </Stack>
                </CardContent>
            </Card>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 3 }}>
                <Stack spacing={3} ref={datasetRef}>
                    <Card elevation={0} sx={{ borderRadius: 4, ...glassTier(2) }} ref={resultsRef}>
                        <CardContent>
                            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Plan results</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {planGeneratedAt ? `Generated ${formatDate(planGeneratedAt)}` : 'No plan yet'}
                                    </Typography>
                                </Box>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    <Button variant="outlined" onClick={() => setPlanSaved(true)} disabled={!planRows.length}>
                                        {OPTIMIZER_COPY.buttons.savePlan}
                                    </Button>
                                    <Button variant="text" onClick={handleOptimize} disabled={Boolean(runDisabledReason) || isOptimizing}>
                                        {OPTIMIZER_COPY.buttons.generatePlan}
                                    </Button>
                                    <Button variant="text" onClick={exportPlan} disabled={!planRows.length}>
                                        {OPTIMIZER_COPY.buttons.export}
                                    </Button>
                                </Stack>
                            </Stack>
                            {!planRows.length ? (
                                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', ...glassTier(1) }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Build your first plan
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Pick a goal and generate a plan to see results here.
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        sx={{ mt: 2 }}
                                        onClick={() => constraintsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        {OPTIMIZER_COPY.buttons.pickGoal}
                                    </Button>
                                </Paper>
                            ) : (
                                <>
                                    {optimizationResults?.status === 'optimal' ? (
                                        <Box>
                                            <Alert severity="success" sx={{ mb: 2 }}>Plan ready!</Alert>
                                            <Paper variant="outlined" sx={{ p: 2, mb: 2, ...glassTier(1) }}>
                                                <Stack spacing={1.5}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        Plan adjustments
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Update servings or add meals you already planned. These changes apply to this plan and
                                                        will be used next time you generate a plan.
                                                    </Typography>
                                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                                                        <Autocomplete
                                                            options={planRows.map((row) => ({ id: row.mealId, label: row.mealName }))}
                                                            value={
                                                                planRows.find((row) => row.mealId === planMealLimitDraft.mealId)
                                                                    ? {
                                                                        id: planMealLimitDraft.mealId,
                                                                        label: planRows.find((row) => row.mealId === planMealLimitDraft.mealId)?.mealName,
                                                                    }
                                                                    : null
                                                            }
                                                            onChange={(_, value) =>
                                                                setPlanMealLimitDraft((prev) => ({ ...prev, mealId: value?.id || '' }))
                                                            }
                                                            renderInput={(params) => (
                                                                <TextField {...params} label="Limit a meal" size="small" />
                                                            )}
                                                            sx={{ flex: 1 }}
                                                        />
                                                        <TextField
                                                            label={OPTIMIZER_COPY.labels.maxRepeats}
                                                            type="number"
                                                            size="small"
                                                            value={planMealLimitDraft.max}
                                                            onChange={(event) =>
                                                                setPlanMealLimitDraft((prev) => ({ ...prev, max: event.target.value }))
                                                            }
                                                            sx={{ width: 160 }}
                                                        />
                                                        <Button
                                                            variant="outlined"
                                                            onClick={applyMealLimit}
                                                            disabled={!planMealLimitDraft.mealId || !planMealLimitDraft.max}
                                                        >
                                                            {OPTIMIZER_COPY.buttons.addRule}
                                                        </Button>
                                                    </Stack>
                                                    <Divider />
                                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                                                        <Autocomplete
                                                            options={customMeals.map((meal) => ({ id: meal.id, label: meal.meal_name }))}
                                                            value={
                                                                customMeals.find((meal) => meal.id === manualMealDraft.mealId)
                                                                    ? {
                                                                        id: manualMealDraft.mealId,
                                                                        label: customMeals.find((meal) => meal.id === manualMealDraft.mealId)?.meal_name,
                                                                    }
                                                                    : null
                                                            }
                                                            onChange={(_, value) =>
                                                                setManualMealDraft((prev) => ({ ...prev, mealId: value?.id || '' }))
                                                            }
                                                            renderInput={(params) => (
                                                                <TextField {...params} label="Add a planned meal" size="small" />
                                                            )}
                                                            sx={{ flex: 1 }}
                                                        />
                                                        <TextField
                                                            label="Servings"
                                                            type="number"
                                                            size="small"
                                                            value={manualMealDraft.servings}
                                                            onChange={(event) =>
                                                                setManualMealDraft((prev) => ({ ...prev, servings: event.target.value }))
                                                            }
                                                            sx={{ width: 120 }}
                                                        />
                                                        <Button
                                                            variant="outlined"
                                                            onClick={handleAddPlannedMeal}
                                                            disabled={!manualMealDraft.mealId}
                                                        >
                                                            Add to plan
                                                        </Button>
                                                    </Stack>
                                                </Stack>
                                            </Paper>
                                            <TableContainer component={Paper} variant="outlined" sx={{ ...glassTier(1) }}>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Meal</TableCell>
                                                            <TableCell align="right">Servings</TableCell>
                                                            <TableCell align="right">Calories</TableCell>
                                                            <TableCell align="right">Protein (g)</TableCell>
                                                            <TableCell align="right">Carbs (g)</TableCell>
                                                            <TableCell align="right">Fat (g)</TableCell>
                                                            <TableCell align="right">Sodium (mg)</TableCell>
                                                            <TableCell align="right">Cost</TableCell>
                                                            <TableCell align="right">Actions</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {planRows.map((row) => {
                                                            const isLocked = Boolean(lockedMeals[row.mealId]);
                                                            const mealLimit = frequencyLimits.perEntry?.[row.mealId];
                                                            const isManual = row.source === 'manual';
                                                            const isAdjusted = row.source === 'adjusted';
                                                            const exceedsMax = macroDefinitions.some((item) => {
                                                                const max = constraints[item.key].max;
                                                                return Number.isFinite(max) && row.totals[item.key] > max;
                                                            });
                                                            return (
                                                                <TableRow key={row.mealId} hover>
                                                                    <TableCell sx={{ maxWidth: 240 }}>
                                                                        <Stack spacing={0.5}>
                                                                            <Tooltip title={row.mealName}>
                                                                                <Typography variant="body2" noWrap>
                                                                                    {row.mealName}
                                                                                </Typography>
                                                                            </Tooltip>
                                                                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                                                                {isManual && <Chip label="Planned" size="small" />}
                                                                                {isAdjusted && <Chip label="Adjusted" size="small" />}
                                                                                {Number.isFinite(mealLimit) && (
                                                                                    <Chip label={`Max ${mealLimit}`} size="small" />
                                                                                )}
                                                                            </Stack>
                                                                        </Stack>
                                                                    </TableCell>
                                                                    <TableCell align="right">
                                                                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                                                                            <IconButton size="small" aria-label="Decrease servings" onClick={() => adjustServings(row, -1)}>
                                                                                <RemoveIcon fontSize="small" />
                                                                            </IconButton>
                                                                            <Typography variant="body2" sx={{ minWidth: 20, textAlign: 'center' }}>{row.servings}</Typography>
                                                                            <IconButton size="small" aria-label="Increase servings" onClick={() => adjustServings(row, 1)}>
                                                                                <AddIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Stack>
                                                                    </TableCell>
                                                                    <TableCell align="right">{Math.round(row.totals.calories)}</TableCell>
                                                                    <TableCell align="right">{Math.round(row.totals.protein)}</TableCell>
                                                                    <TableCell align="right">{Math.round(row.totals.carbohydrates)}</TableCell>
                                                                    <TableCell align="right">{Math.round(row.totals.fat)}</TableCell>
                                                                    <TableCell align="right">{Math.round(row.totals.sodium)}</TableCell>
                                                                    <TableCell align="right">{formatCurrency(row.totals.cost)}</TableCell>
                                                                    <TableCell align="right">
                                                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                                                                            {!isManual && (
                                                                                <>
                                                                                    <Tooltip title={isLocked ? 'Unlock meal' : 'Lock meal'}>
                                                                                        <IconButton size="small" aria-label={isLocked ? 'Unlock meal' : 'Lock meal'} onClick={() => toggleLockMeal(row)}>
                                                                                            {isLocked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                                                                                        </IconButton>
                                                                                    </Tooltip>
                                                                                    <Tooltip title="Swap meal">
                                                                                        <IconButton size="small" aria-label="Swap meal" onClick={(event) => handleSwapOpen(event, row)}>
                                                                                            <SwapHorizIcon fontSize="small" />
                                                                                        </IconButton>
                                                                                    </Tooltip>
                                                                                </>
                                                                            )}
                                                                            {isManual && (
                                                                                <Tooltip title="Remove planned meal">
                                                                                    <IconButton size="small" aria-label="Remove planned meal" onClick={() => removeManualPlanRow(row.mealId)}>
                                                                                        <DeleteIcon fontSize="small" />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            )}
                                                                            <Tooltip title={exceedsMax ? 'Exceeds limits' : 'Within limits'}>
                                                                                <IconButton
                                                                                    size="small"
                                                                                    color={exceedsMax ? 'warning' : 'success'}
                                                                                    aria-label={exceedsMax ? 'Exceeds limits' : 'Within limits'}
                                                                                >
                                                                                    {exceedsMax ? <WarningAmberIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Stack>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>

                                            <Box sx={{ mt: 2 }}>
                                                <Typography variant="subtitle2" gutterBottom>Totals vs targets</Typography>
                                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                                    {totalIndicators.map((item) => (
                                                        <Chip
                                                            key={item.key}
                                                            label={`${item.label}: ${Math.round(item.value)} (target ${item.min}-${item.max})`}
                                                            color={item.status}
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                    <Chip label={`Cost: ${formatCurrency(planTotals.cost)}`} />
                                                </Stack>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Alert severity="warning">No plan found. Try adjusting your limits.</Alert>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card elevation={0} sx={{ borderRadius: 4, ...glassTier(2) }}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Meal dataset ({filteredMeals.length})
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Sorted by {COLUMN_CONFIG.find((col) => col.id === sortBy)?.label?.toLowerCase() || 'meal'}
                                </Typography>
                            </Stack>
                            {issueSummary.some((item) => item.count > 0) && (
                                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                                    {issueSummary.filter((item) => item.count > 0).map((item) => (
                                        <Chip
                                            key={item.code}
                                            label={`${item.label}: ${item.count}`}
                                            onClick={() => {
                                                setIssueFilter(item.code);
                                                setStatusFilters(Object.keys(statusConfig));
                                            }}
                                            variant={issueFilter === item.code ? 'filled' : 'outlined'}
                                        />
                                    ))}
                                    {issueFilter && (
                                        <Chip
                                            label={`Clear ${OPTIMIZER_COPY.labels.warnings.toLowerCase()}`}
                                            onClick={() => setIssueFilter('')}
                                            variant="outlined"
                                        />
                                    )}
                                </Stack>
                            )}
                            {isLoadingSamples ? (
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 520, ...glassTier(1) }}>
                                    <Table stickyHeader size={density === 'compact' ? 'small' : 'medium'}>
                                        <TableHead>
                                            <TableRow>
                                                {activeColumns.map((col) => (
                                                    <TableCell
                                                        key={col.id}
                                                        align={col.numeric ? 'right' : 'left'}
                                                        sx={{
                                                            minWidth: col.minWidth,
                                                            fontWeight: 600,
                                                            position: col.sticky ? 'sticky' : 'static',
                                                            left: col.sticky ? 0 : undefined,
                                                            zIndex: col.sticky ? 3 : 1,
                                                            backgroundColor: 'rgba(255,255,255,0.7)',
                                                        }}
                                                    >
                                                        {col.label}
                                                    </TableCell>
                                                ))}
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {Array.from({ length: 6 }).map((_, idx) => (
                                                <TableRow key={`skeleton-${idx}`}>
                                                    {activeColumns.map((col) => (
                                                        <TableCell key={`${idx}-${col.id}`} sx={{ padding: rowPadding }}>
                                                            <Skeleton variant="text" />
                                                        </TableCell>
                                                    ))}
                                                    <TableCell sx={{ padding: rowPadding }}>
                                                        <Skeleton variant="circular" width={24} height={24} />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : filteredMeals.length === 0 ? (
                                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', ...glassTier(1) }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Your dataset is empty
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Add meals or import data to start building your meal book.
                                    </Typography>
                                    <Stack spacing={1} sx={{ mt: 2 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<AddIcon />}
                                            onClick={() => setAddOpen(true)}
                                        >
                                            Add meal
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<FileUploadIcon />}
                                            onClick={handleImportCsv}
                                        >
                                            Import CSV
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<RefreshIcon />}
                                            onClick={handleLoadSamples}
                                            disabled={isLoadingSamples}
                                        >
                                            {isLoadingSamples ? 'Loading...' : 'Load sample meals'}
                                        </Button>
                                    </Stack>
                                </Paper>
                            ) : viewMode === 'table' ? (
                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 520, ...glassTier(1) }}>
                                    <Table stickyHeader size={density === 'compact' ? 'small' : 'medium'}>
                                        <TableHead>
                                            <TableRow>
                                                {activeColumns.map((col) => (
                                                    <TableCell
                                                        key={col.id}
                                                        align={col.numeric ? 'right' : 'left'}
                                                        sx={{
                                                            minWidth: col.minWidth,
                                                            fontWeight: 600,
                                                            position: col.sticky ? 'sticky' : 'static',
                                                            left: col.sticky ? 0 : undefined,
                                                            zIndex: col.sticky ? 3 : 1,
                                                            backgroundColor: 'rgba(255,255,255,0.7)',
                                                        }}
                                                    >
                                                        <TableSortLabel
                                                            active={sortBy === col.id}
                                                            direction={sortBy === col.id ? sortDirection : 'asc'}
                                                            onClick={() => handleSort(col.id)}
                                                        >
                                                            {col.label}
                                                        </TableSortLabel>
                                                    </TableCell>
                                                ))}
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {pagedMeals.map((meal, index) => {
                                                const status = statusConfig[meal.status];
                                                const isEditing = editingMealId === meal.id;
                                                return (
                                                    <TableRow
                                                        key={meal.id}
                                                        hover
                                                        sx={{
                                                            backgroundColor: index % 2 === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.35)',
                                                            cursor: 'pointer',
                                                            '&:hover .row-actions': {
                                                                opacity: 1,
                                                                transform: 'translateX(0)',
                                                            },
                                                        }}
                                                        onClick={(event) => handleRowClick(meal, 'overview', event)}
                                                        onDoubleClick={(event) => {
                                                            event.stopPropagation();
                                                            startEditMeal(meal);
                                                        }}
                                                    >
                                                        {activeColumns.map((col) => {
                                                            let value = meal[col.key];
                                                            let cellContent = value;
                                                            if (col.id === 'status') {
                                                                cellContent = (
                                                                    <Chip
                                                                        label={status.label}
                                                                        color={status.color}
                                                                        icon={<status.icon />}
                                                                        size="small"
                                                                    />
                                                                );
                                                            }
                                                            if (col.id === 'meal') {
                                                                cellContent = (
                                                                    <Tooltip title={meal.meal_name || ''}>
                                                                        <Typography noWrap sx={{ maxWidth: col.minWidth || 220 }}>
                                                                            {meal.meal_name}
                                                                        </Typography>
                                                                    </Tooltip>
                                                                );
                                                            }
                                                            if (col.id === 'issues') {
                                                                cellContent = (
                                                                    <Chip
                                                                        label={meal.issues.length}
                                                                        size="small"
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            handleRowClick(meal, 'issues');
                                                                        }}
                                                                    />
                                                                );
                                                            }
                                                            if (col.id === 'price') {
                                                                cellContent = isEditing ? (
                                                                    <TextField
                                                                        value={editingDraft?.price ?? ''}
                                                                        onChange={handleEditChange('price')}
                                                                        size="small"
                                                                        type="number"
                                                                        inputProps={{ 'aria-label': 'Price', 'data-testid': 'inline-price' }}
                                                                        onClick={(event) => event.stopPropagation()}
                                                                    />
                                                                ) : (
                                                                    formatCurrency(value)
                                                                );
                                                            }
                                                            if (col.id === 'calories') {
                                                                cellContent = isEditing ? (
                                                                    <TextField
                                                                        value={editingDraft?.calories ?? ''}
                                                                        onChange={handleEditChange('calories')}
                                                                        size="small"
                                                                        type="number"
                                                                        inputProps={{ 'aria-label': 'Calories', 'data-testid': 'inline-calories' }}
                                                                        onClick={(event) => event.stopPropagation()}
                                                                    />
                                                                ) : (
                                                                    formatNumber(value)
                                                                );
                                                            }
                                                            if (col.id === 'protein') {
                                                                cellContent = isEditing ? (
                                                                    <TextField
                                                                        value={editingDraft?.protein ?? ''}
                                                                        onChange={handleEditChange('protein')}
                                                                        size="small"
                                                                        type="number"
                                                                        inputProps={{ 'aria-label': 'Protein', 'data-testid': 'inline-protein' }}
                                                                        onClick={(event) => event.stopPropagation()}
                                                                    />
                                                                ) : (
                                                                    formatNumber(value)
                                                                );
                                                            }
                                                            if (col.id === 'allergens') {
                                                                cellContent = meal.allergens?.length
                                                                    ? meal.allergens.map(formatAllergenLabel).join(', ')
                                                                    : '—';
                                                            }
                                                            if (col.id === 'createdAt') {
                                                                cellContent = formatDate(value);
                                                            }
                                                            if (col.numeric && !['price', 'calories', 'protein', 'issues'].includes(col.id)) {
                                                                cellContent = formatNumber(value);
                                                            }
                                                            return (
                                                                <TableCell
                                                                    key={`${meal.id}-${col.id}`}
                                                                    align={col.numeric ? 'right' : 'left'}
                                                                    sx={{
                                                                        padding: rowPadding,
                                                                        position: col.sticky ? 'sticky' : 'static',
                                                                        left: col.sticky ? 0 : undefined,
                                                                        backgroundColor: col.sticky
                                                                            ? (index % 2 === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.35)')
                                                                            : undefined,
                                                                        zIndex: col.sticky ? 2 : 1,
                                                                    }}
                                                                >
                                                                    {cellContent}
                                                                </TableCell>
                                                            );
                                                        })}
                                                        <TableCell align="right" sx={{ padding: rowPadding }}>
                                                            <Stack
                                                                direction="row"
                                                                spacing={0.5}
                                                                className="row-actions"
                                                                sx={{
                                                                    opacity: 0,
                                                                    transform: 'translateX(6px)',
                                                                    transition: 'all 200ms ease',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'flex-end',
                                                                }}
                                                            >
                                                                {isEditing ? (
                                                                    <>
                                                                        <Tooltip title="Save">
                                                                            <IconButton
                                                                                size="small"
                                                                                color="primary"
                                                                                aria-label="Save edit"
                                                                                onClick={(event) => {
                                                                                    event.stopPropagation();
                                                                                    handleEditSave(meal.id);
                                                                                }}
                                                                            >
                                                                                <SaveIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Cancel">
                                                                            <IconButton
                                                                                size="small"
                                                                                aria-label="Cancel edit"
                                                                                onClick={(event) => {
                                                                                    event.stopPropagation();
                                                                                    handleEditCancel();
                                                                                }}
                                                                            >
                                                                                <CloseIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Tooltip title="Quick edit">
                                                                            <IconButton
                                                                                size="small"
                                                                                aria-label="Quick edit"
                                                                                onClick={(event) => {
                                                                                    event.stopPropagation();
                                                                                    startEditMeal(meal);
                                                                                }}
                                                                            >
                                                                                <EditIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Duplicate">
                                                                            <IconButton
                                                                                size="small"
                                                                                aria-label="Duplicate meal"
                                                                                onClick={(event) => {
                                                                                    event.stopPropagation();
                                                                                    handleDuplicateMeal(meal);
                                                                                }}
                                                                            >
                                                                                <ContentCopyIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </>
                                                                )}
                                                                <Tooltip title={meal.includeInOptimization ? 'Included in plan' : 'Excluded from plan'}>
                                                                    <Switch
                                                                        checked={meal.includeInOptimization !== false}
                                                                        onClick={(event) => event.stopPropagation()}
                                                                        onChange={() => handleToggleInclude(meal.id)}
                                                                        size="small"
                                                                        inputProps={{ 'aria-label': 'Include meal in plan' }}
                                                                    />
                                                                </Tooltip>
                                                                <Tooltip title="Remove">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        aria-label="Remove meal"
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            handleRemoveMeal(meal.id);
                                                                        }}
                                                                    >
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box component="ul" role="list" sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 1 }}>
                                    {pagedMeals.map((meal) => {
                                        const status = statusConfig[meal.status];
                                        const isEditing = editingMealId === meal.id;
                                        const titleId = `meal-title-${meal.id}`;
                                        return (
                                            <Box component="li" key={meal.id} sx={{ listStyle: 'none' }}>
                                                <Card
                                                    component="article"
                                                    aria-labelledby={titleId}
                                                    elevation={0}
                                                    sx={{ borderRadius: 3, ...glassTier(1), cursor: 'pointer' }}
                                                    onClick={(event) => handleRowClick(meal, 'overview', event)}
                                                >
                                                    <CardContent>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                            <Box>
                                                                <Typography id={titleId} variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                                    {meal.meal_name}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {meal.chain} • {meal.cuisine || 'Global'} • {meal.mealType || 'Main'}
                                                                </Typography>
                                                            </Box>
                                                            <Chip
                                                                label={status.label}
                                                                color={status.color}
                                                                icon={<status.icon />}
                                                                size="small"
                                                            />
                                                        </Stack>
                                                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                                                            <Chip label={`Calories ${formatNumber(meal.calories)}`} size="small" />
                                                            <Chip label={`Protein ${formatNumber(meal.protein)}g`} size="small" />
                                                            <Chip label={`Price ${formatCurrency(meal.price)}`} size="small" />
                                                            <Chip
                                                                label={`${OPTIMIZER_COPY.labels.warnings} ${meal.issues.length}`}
                                                                size="small"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    handleRowClick(meal, 'issues');
                                                                }}
                                                            />
                                                        </Stack>
                                                        {isEditing && (
                                                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                                                <TextField
                                                                    value={editingDraft?.calories ?? ''}
                                                                    onChange={handleEditChange('calories')}
                                                                    size="small"
                                                                    type="number"
                                                                    inputProps={{ 'aria-label': 'Calories', 'data-testid': 'inline-calories' }}
                                                                    onClick={(event) => event.stopPropagation()}
                                                                />
                                                                <TextField
                                                                    value={editingDraft?.protein ?? ''}
                                                                    onChange={handleEditChange('protein')}
                                                                    size="small"
                                                                    type="number"
                                                                    inputProps={{ 'aria-label': 'Protein', 'data-testid': 'inline-protein' }}
                                                                    onClick={(event) => event.stopPropagation()}
                                                                />
                                                                <TextField
                                                                    value={editingDraft?.price ?? ''}
                                                                    onChange={handleEditChange('price')}
                                                                    size="small"
                                                                    type="number"
                                                                    inputProps={{ 'aria-label': 'Price', 'data-testid': 'inline-price' }}
                                                                    onClick={(event) => event.stopPropagation()}
                                                                />
                                                            </Stack>
                                                        )}
                                                        <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ mt: 1 }}>
                                                            {isEditing ? (
                                                                <>
                                                                    <Tooltip title="Save">
                                                                        <IconButton
                                                                            size="small"
                                                                            color="primary"
                                                                            aria-label="Save edit"
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                handleEditSave(meal.id);
                                                                            }}
                                                                        >
                                                                            <SaveIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Cancel">
                                                                        <IconButton
                                                                            size="small"
                                                                            aria-label="Cancel edit"
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                handleEditCancel();
                                                                            }}
                                                                        >
                                                                            <CloseIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Tooltip title="Quick edit">
                                                                        <IconButton
                                                                            size="small"
                                                                            aria-label="Quick edit"
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                startEditMeal(meal);
                                                                            }}
                                                                        >
                                                                            <EditIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                    <Tooltip title="Duplicate">
                                                                        <IconButton
                                                                            size="small"
                                                                            aria-label="Duplicate meal"
                                                                            onClick={(event) => {
                                                                                event.stopPropagation();
                                                                                handleDuplicateMeal(meal);
                                                                            }}
                                                                        >
                                                                            <ContentCopyIcon fontSize="small" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </>
                                                            )}
                                                            <Tooltip title={meal.includeInOptimization ? 'Included in plan' : 'Excluded from plan'}>
                                                                <Switch
                                                                    checked={meal.includeInOptimization !== false}
                                                                    onClick={(event) => event.stopPropagation()}
                                                                    onChange={() => handleToggleInclude(meal.id)}
                                                                    size="small"
                                                                    inputProps={{ 'aria-label': 'Include meal in plan' }}
                                                                />
                                                            </Tooltip>
                                                            <Tooltip title="Remove">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    aria-label="Remove meal"
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        handleRemoveMeal(meal.id);
                                                                    }}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}

                            <Divider sx={{ my: 2 }} />

                            <TablePagination
                                component="div"
                                count={filteredMeals.length}
                                page={page}
                                onPageChange={(_, next) => setPage(next)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(event) => {
                                    setRowsPerPage(parseInt(event.target.value, 10));
                                    setPage(0);
                                }}
                                rowsPerPageOptions={[10, 12, 25, 50]}
                            />
                        </CardContent>
                    </Card>

                </Stack>

                <Stack spacing={3} ref={constraintsRef}>
                    <Card elevation={0} sx={{ borderRadius: 4, ...glassTier(2) }}>
                        <CardContent>
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{OPTIMIZER_COPY.sections.planSettings}</Typography>
                                    <Chip label={feasibility.label} color={feasibility.color} />
                                </Stack>

                                <Box role="status" aria-live="polite" sx={srOnly}>
                                    {`${OPTIMIZER_COPY.labels.targetsAchievable}: ${feasibility.label}`}
                                </Box>

                                <LinearProgress variant="determinate" value={feasibility.value} color={feasibility.color} sx={{ height: 6, borderRadius: 999 }} />

                                <Stack spacing={1}>
                                    <Typography variant="subtitle2" color="text.secondary">{OPTIMIZER_COPY.labels.goal}</Typography>
                                    <ToggleButtonGroup
                                        exclusive
                                        size="small"
                                        value={goalPreset || ''}
                                        onChange={handleGoalPreset}
                                        aria-label="Goal presets"
                                    >
                                        {goalPresetOptions.map((preset) => (
                                            <ToggleButton key={preset} value={preset}>
                                                {preset}
                                            </ToggleButton>
                                        ))}
                                    </ToggleButtonGroup>
                                    <Typography variant="caption" color="text.secondary">
                                        {goalPreset
                                            ? OPTIMIZER_COPY.helper.goalDescriptions[goalPreset]
                                            : OPTIMIZER_COPY.helper.goalPrompt}
                                    </Typography>
                                </Stack>

                                <Stack direction="row" spacing={1} justifyContent="space-between">
                                    <TextField
                                        label={OPTIMIZER_COPY.labels.planLength}
                                        type="number"
                                        size="small"
                                        value={horizonDays}
                                        onChange={(event) => setHorizonDays(parseNumber(event.target.value))}
                                        sx={{ flex: 1 }}
                                    />
                                    <TextField
                                        label={OPTIMIZER_COPY.labels.mealsPerDay}
                                        type="number"
                                        size="small"
                                        value={mealsPerDay}
                                        onChange={(event) => setMealsPerDay(parseNumber(event.target.value))}
                                        sx={{ flex: 1 }}
                                    />
                                </Stack>

                                <Divider />

                                <Button
                                    variant="text"
                                    onClick={() => setAdvancedLimitsOpen((prev) => !prev)}
                                    aria-expanded={advancedLimitsOpen}
                                    aria-controls="advanced-limits"
                                    endIcon={advancedLimitsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    sx={{ justifyContent: 'space-between' }}
                                >
                                    {OPTIMIZER_COPY.sections.nutritionLimits}
                                </Button>
                                <Collapse in={advancedLimitsOpen} id="advanced-limits">
                                    <Stack spacing={2} sx={{ mt: 1 }}>
                                        {macroDefinitions.map((item) => (
                                            <Box key={item.key}>
                                                <Typography variant="subtitle2" color="text.secondary">{item.label}</Typography>
                                                <Slider
                                                    value={[constraints[item.key].min, constraints[item.key].max]}
                                                    onChange={handleRangeChange(item.key)}
                                                    valueLabelDisplay="auto"
                                                    min={item.min}
                                                    max={item.max}
                                                />
                                                <Stack direction="row" spacing={1}>
                                                    <TextField
                                                        label="Min"
                                                        type="number"
                                                        value={constraints[item.key].min}
                                                        onChange={handleConstraintChange(item.key, 'min')}
                                                        size="small"
                                                        inputProps={{ 'data-testid': `${item.key}-min` }}
                                                    />
                                                    <TextField
                                                        label="Max"
                                                        type="number"
                                                        value={constraints[item.key].max}
                                                        onChange={handleConstraintChange(item.key, 'max')}
                                                        size="small"
                                                        inputProps={{ 'data-testid': `${item.key}-max` }}
                                                    />
                                                </Stack>
                                            </Box>
                                        ))}

                                        <Divider />

                                        <Stack spacing={1}>
                                            {safetyDefinitions.map((item) => (
                                                <TextField
                                                    key={item.key}
                                                    label={item.label}
                                                    type="number"
                                                    size="small"
                                                    value={safetyCaps[item.key] ?? ''}
                                                    onChange={(event) =>
                                                        setSafetyCaps((prev) => ({
                                                            ...prev,
                                                            [item.key]: event.target.value,
                                                        }))
                                                    }
                                                />
                                            ))}
                                        </Stack>

                                        <Divider />

                                        <Typography variant="subtitle2" color="text.secondary">Allergens to avoid</Typography>
                                        <Autocomplete
                                            multiple
                                            options={ALLERGEN_OPTIONS.map((option) => option.value)}
                                            value={allergenFilters}
                                            onChange={(_, newValue) => setAllergenFilters(normalizeAllergenList(newValue))}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        key={option}
                                                        label={formatAllergenLabel(option)}
                                                        {...getTagProps({ index })}
                                                    />
                                                ))
                                            }
                                            renderInput={(params) => (
                                                <TextField {...params} label="Allergens" placeholder="Select allergens" />
                                            )}
                                        />

                                        <Divider />

                                        <Stack spacing={1}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                {OPTIMIZER_COPY.labels.mealsThatFit}: {matchingMealCount} of {eligibleMeals.length}
                                            </Typography>
                                            {autoFixSuggestions.length > 0 && (
                                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                                    {autoFixSuggestions.map((fix) => (
                                                        <Chip
                                                            key={fix.label}
                                                            icon={<AutoFixHighIcon fontSize="small" />}
                                                            label={fix.label}
                                                            onClick={fix.apply}
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Stack>
                                            )}
                                        </Stack>
                                    </Stack>
                                </Collapse>

                                <Divider />

                                <Button
                                    variant="text"
                                    onClick={() => setVarietyRulesOpen((prev) => !prev)}
                                    aria-expanded={varietyRulesOpen}
                                    aria-controls="variety-rules"
                                    endIcon={varietyRulesOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    sx={{ justifyContent: 'space-between' }}
                                >
                                    {OPTIMIZER_COPY.sections.varietyRules}
                                </Button>
                                <Collapse in={varietyRulesOpen} id="variety-rules">
                                    <Stack spacing={2} sx={{ mt: 1 }}>
                                        <TextField
                                            label={OPTIMIZER_COPY.labels.maxRepeats}
                                            type="number"
                                            size="small"
                                            value={maxServingsPerMeal}
                                            onChange={(event) => setMaxServingsPerMeal(parseNumber(event.target.value))}
                                        />

                                        <Stack spacing={1}>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                                <Autocomplete
                                                    options={customMeals.map((meal) => ({ id: meal.id, label: meal.meal_name }))}
                                                    value={customMeals.find((meal) => meal.id === entryLimitDraft.mealId) ? { id: entryLimitDraft.mealId, label: customMeals.find((meal) => meal.id === entryLimitDraft.mealId)?.meal_name } : null}
                                                    onChange={(_, value) => setEntryLimitDraft((prev) => ({ ...prev, mealId: value?.id || '' }))}
                                                    renderInput={(params) => <TextField {...params} label="Meal" size="small" />}
                                                    sx={{ flex: 1 }}
                                                />
                                                <TextField
                                                    label={OPTIMIZER_COPY.labels.maxRepeats}
                                                    type="number"
                                                    size="small"
                                                    value={entryLimitDraft.max}
                                                    onChange={(event) => setEntryLimitDraft((prev) => ({ ...prev, max: event.target.value }))}
                                                    sx={{ width: 140 }}
                                                />
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => {
                                                        if (!entryLimitDraft.mealId || !entryLimitDraft.max) return;
                                                        setFrequencyLimits((prev) => ({
                                                            ...prev,
                                                            perEntry: {
                                                                ...prev.perEntry,
                                                                [entryLimitDraft.mealId]: Number(entryLimitDraft.max),
                                                            },
                                                        }));
                                                        setEntryLimitDraft({ mealId: '', max: '' });
                                                    }}
                                                >
                                                    {OPTIMIZER_COPY.buttons.addRule}
                                                </Button>
                                            </Stack>
                                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                                <TextField
                                                    select
                                                    label="Category"
                                                    size="small"
                                                    value={tagLimitDraft.tagKey}
                                                    onChange={(event) => setTagLimitDraft((prev) => ({ ...prev, tagKey: event.target.value, tagValue: '' }))}
                                                    sx={{ width: 140 }}
                                                >
                                                    {Object.keys(tagLabels).map((key) => (
                                                        <MenuItem key={key} value={key}>{tagLabels[key]}</MenuItem>
                                                    ))}
                                                </TextField>
                                                <TextField
                                                    select
                                                    label="Value"
                                                    size="small"
                                                    value={tagLimitDraft.tagValue}
                                                    onChange={(event) => setTagLimitDraft((prev) => ({ ...prev, tagValue: event.target.value }))}
                                                    sx={{ flex: 1 }}
                                                >
                                                    {tagOptions[tagLimitDraft.tagKey]?.map((option) => (
                                                        <MenuItem key={option} value={option}>{option}</MenuItem>
                                                    ))}
                                                </TextField>
                                                <TextField
                                                    label={OPTIMIZER_COPY.labels.maxRepeats}
                                                    type="number"
                                                    size="small"
                                                    value={tagLimitDraft.max}
                                                    onChange={(event) => setTagLimitDraft((prev) => ({ ...prev, max: event.target.value }))}
                                                    sx={{ width: 140 }}
                                                />
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => {
                                                        if (!tagLimitDraft.tagValue || !tagLimitDraft.max) return;
                                                        setFrequencyLimits((prev) => ({
                                                            ...prev,
                                                            perTag: {
                                                                ...prev.perTag,
                                                                [tagLimitDraft.tagKey]: {
                                                                    ...(prev.perTag[tagLimitDraft.tagKey] || {}),
                                                                    [tagLimitDraft.tagValue]: Number(tagLimitDraft.max),
                                                                },
                                                            },
                                                        }));
                                                        setTagLimitDraft({ tagKey: tagLimitDraft.tagKey, tagValue: '', max: '' });
                                                    }}
                                                >
                                                    {OPTIMIZER_COPY.buttons.addRule}
                                                </Button>
                                            </Stack>
                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                {Object.entries(frequencyLimits.perEntry).map(([mealId, limit]) => {
                                                    const mealName = customMeals.find((meal) => meal.id === mealId)?.meal_name || mealId;
                                                    return (
                                                        <Chip
                                                            key={mealId}
                                                            label={`${mealName}: max ${limit}`}
                                                            onDelete={() => {
                                                                setFrequencyLimits((prev) => {
                                                                    const next = { ...prev.perEntry };
                                                                    delete next[mealId];
                                                                    return { ...prev, perEntry: next };
                                                                });
                                                            }}
                                                        />
                                                    );
                                                })}
                                                {Object.entries(frequencyLimits.perTag).flatMap(([tagKey, tagValues]) =>
                                                    Object.entries(tagValues).map(([tagValue, limit]) => (
                                                        <Chip
                                                            key={`${tagKey}-${tagValue}`}
                                                            label={`${tagLabels[tagKey]} ${tagValue}: max ${limit}`}
                                                            onDelete={() => {
                                                                setFrequencyLimits((prev) => {
                                                                    const nextTag = { ...(prev.perTag[tagKey] || {}) };
                                                                    delete nextTag[tagValue];
                                                                    return {
                                                                        ...prev,
                                                                        perTag: {
                                                                            ...prev.perTag,
                                                                            [tagKey]: nextTag,
                                                                        },
                                                                    };
                                                                });
                                                            }}
                                                        />
                                                    )),
                                                )}
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                </Collapse>

                                <Divider />

                                <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600 }}
                                    ref={planSummaryRef}
                                    tabIndex={-1}
                                >
                                    Plan: {horizonDays} days, {mealsPerDay} meals per day, repeats up to {maxServingsPerMeal} times
                                </Typography>

                                <Button
                                    variant="outlined"
                                    startIcon={<PlayArrowIcon />}
                                    onClick={handleOptimize}
                                    disabled={isOptimizing || Boolean(runDisabledReason)}
                                    ref={runButtonRef}
                                    data-testid="generate-plan"
                                >
                                    {isOptimizing ? 'Generating...' : OPTIMIZER_COPY.buttons.generatePlan}
                                </Button>

                                {runDisabledReason && (
                                    <Typography variant="caption" color="text.secondary">
                                        {runDisabledReason}
                                    </Typography>
                                )}
                                {!goalReady && (
                                    <Typography variant="caption" color="text.secondary">
                                        {OPTIMIZER_COPY.helper.generatePlanHint}
                                    </Typography>
                                )}

                                {optimizationError && (
                                    <Alert severity="error">Plan generation failed: {optimizationError}</Alert>
                                )}
                                {constraintError && (
                                    <Alert severity="warning">{constraintError}</Alert>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            </Box>

            <Drawer anchor="right" open={detailsOpen} onClose={() => setDetailsOpen(false)}>
                <Box sx={{ width: { xs: 320, sm: 380 }, p: 3, ...glassTier(3), height: '100%' }}>
                    {selectedMeal ? (
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedMeal.meal_name}</Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                        label={selectedStatus.label}
                                        color={selectedStatus.color}
                                        icon={SelectedStatusIcon ? <SelectedStatusIcon /> : undefined}
                                        size="small"
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedMeal.chain}
                                    </Typography>
                                </Stack>
                            </Box>

                            <Stack direction="row" spacing={1}>
                                <Button size="small" variant={detailsTab === 'overview' ? 'contained' : 'outlined'} onClick={() => setDetailsTab('overview')}>Overview</Button>
                                <Button size="small" variant={detailsTab === 'issues' ? 'contained' : 'outlined'} onClick={() => setDetailsTab('issues')}>{OPTIMIZER_COPY.labels.warnings}</Button>
                                <Button size="small" variant={detailsTab === 'history' ? 'contained' : 'outlined'} onClick={() => setDetailsTab('history')}>History</Button>
                            </Stack>

                            {detailsTab === 'overview' && (
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="subtitle2">Nutrition</Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            <Chip label={`Calories: ${formatNumber(selectedMeal.calories)}`} />
                                            <Chip label={`Protein: ${formatNumber(selectedMeal.protein)}g`} />
                                            <Chip label={`Carbs: ${formatNumber(selectedMeal.carbohydrates)}g`} />
                                            <Chip label={`Fat: ${formatNumber(selectedMeal.fat)}g`} />
                                            <Chip label={`Sodium: ${formatNumber(selectedMeal.sodium)}mg`} />
                                        </Stack>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2">Tags</Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            <Chip label={`Cuisine: ${selectedMeal.cuisine || 'Global'}`} />
                                            <Chip label={`Meal type: ${selectedMeal.mealType || 'Main'}`} />
                                            <Chip label={`Budget: ${selectedMeal.budgetTier || 'Mid'}`} />
                                            {(selectedMeal.dietary || []).map((tag) => (
                                                <Chip key={tag} label={tag} />
                                            ))}
                                        </Stack>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2">Allergens</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedMeal.allergens?.length
                                                ? selectedMeal.allergens.map(formatAllergenLabel).join(', ')
                                                : 'None listed'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2">Pricing</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {formatCurrency(selectedMeal.price)}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Switch
                                            checked={selectedMeal.includeInOptimization !== false}
                                            onChange={() => handleToggleInclude(selectedMeal.id)}
                                            inputProps={{ 'aria-label': 'Include meal in plan' }}
                                        />
                                        <Typography variant="body2">Include in plan</Typography>
                                    </Stack>
                                </Stack>
                            )}

                            {detailsTab === 'issues' && (
                                <Stack spacing={1}>
                                    {selectedMeal.issues.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">No warnings detected.</Typography>
                                    ) : (
                                        selectedMeal.issues.map((issue) => (
                                            <Alert key={issue.code} severity={issue.severity === 'error' ? 'error' : 'warning'}>
                                                {issue.label}
                                            </Alert>
                                        ))
                                    )}
                                </Stack>
                            )}

                            {detailsTab === 'history' && (
                                <Stack spacing={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        Added: {formatDate(selectedMeal.createdAt)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Last updated: {lastUpdated ? formatDate(lastUpdated) : '—'}
                                    </Typography>
                                </Stack>
                            )}
                        </Stack>
                    ) : (
                        <Typography variant="body2" color="text.secondary">Select a meal to view details.</Typography>
                    )}
                </Box>
            </Drawer>

            <Drawer anchor="right" open={addOpen} onClose={() => setAddOpen(false)}>
                <Box sx={{ width: { xs: 320, sm: 380 }, p: 3, ...glassTier(3), height: '100%' }}>
                    <Stack spacing={2}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Add meal</Typography>
                        <ToggleButtonGroup
                            exclusive
                            value={addMode}
                            onChange={(_, next) => next && setAddMode(next)}
                            size="small"
                        >
                            <ToggleButton value="basic">Basic</ToggleButton>
                            <ToggleButton value="advanced">Advanced</ToggleButton>
                        </ToggleButtonGroup>
                        <TextField label="Restaurant" value={mealForm.chain} onChange={handleInputChange('chain')} />
                        <TextField label="Meal name" value={mealForm.meal_name} onChange={handleInputChange('meal_name')} />
                        <Stack direction="row" spacing={1}>
                            <TextField label="Calories" type="number" value={mealForm.calories} onChange={handleInputChange('calories')} />
                            <TextField label="Price" type="number" value={mealForm.price} onChange={handleInputChange('price')} />
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <TextField label="Protein (g)" type="number" value={mealForm.protein} onChange={handleInputChange('protein')} />
                            <TextField label="Carbs (g)" type="number" value={mealForm.carbohydrates} onChange={handleInputChange('carbohydrates')} />
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <TextField label="Fat (g)" type="number" value={mealForm.fat} onChange={handleInputChange('fat')} />
                            <TextField label="Sodium (mg)" type="number" value={mealForm.sodium} onChange={handleInputChange('sodium')} />
                        </Stack>
                        {addMode === 'advanced' && (
                            <Stack spacing={2}>
                                <Autocomplete
                                    options={cuisineOptions}
                                    value={mealForm.cuisine || null}
                                    onChange={(_, value) => setMealForm((prev) => ({ ...prev, cuisine: value || '' }))}
                                    renderInput={(params) => <TextField {...params} label="Cuisine" />}
                                />
                                <Autocomplete
                                    options={mealTypeOptions}
                                    value={mealForm.mealType || null}
                                    onChange={(_, value) => setMealForm((prev) => ({ ...prev, mealType: value || '' }))}
                                    renderInput={(params) => <TextField {...params} label="Meal type" />}
                                />
                                <Autocomplete
                                    multiple
                                    options={dietaryOptions}
                                    value={mealForm.dietary}
                                    onChange={(_, newValue) =>
                                        setMealForm((prev) => ({
                                            ...prev,
                                            dietary: normalizeTagList(newValue),
                                        }))
                                    }
                                    renderInput={(params) => (
                                        <TextField {...params} label="Dietary" placeholder="Add tags" />
                                    )}
                                />
                                <TextField
                                    select
                                    label="Budget tier"
                                    value={mealForm.budgetTier}
                                    onChange={handleInputChange('budgetTier')}
                                >
                                    {budgetTiers.map((tier) => (
                                        <MenuItem key={tier} value={tier}>{tier}</MenuItem>
                                    ))}
                                </TextField>
                                <Autocomplete
                                    multiple
                                    freeSolo
                                    options={ALLERGEN_OPTIONS.map((option) => option.value)}
                                    value={mealForm.allergens}
                                    onChange={(_, newValue) =>
                                        setMealForm((prev) => ({
                                            ...prev,
                                            allergens: normalizeAllergenList(newValue),
                                        }))
                                    }
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                key={option}
                                                label={formatAllergenLabel(option)}
                                                {...getTagProps({ index })}
                                            />
                                        ))
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Allergens"
                                            placeholder="Select allergens"
                                        />
                                    )}
                                />
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Switch
                                        checked={mealForm.includeInOptimization !== false}
                                        onChange={(event) =>
                                            setMealForm((prev) => ({ ...prev, includeInOptimization: event.target.checked }))
                                        }
                                        inputProps={{ 'aria-label': 'Include meal in plan' }}
                                    />
                                    <Typography variant="body2">Include in plan</Typography>
                                </Stack>
                            </Stack>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddMeal}
                            sx={{
                                backgroundImage: 'none',
                                bgcolor: 'primary.main',
                                '&:hover': { bgcolor: 'primary.dark' },
                            }}
                        >
                            Add to dataset
                        </Button>
                    </Stack>
                </Box>
            </Drawer>

            <Menu
                anchorEl={swapAnchorEl}
                open={Boolean(swapAnchorEl)}
                onClose={handleSwapClose}
            >
                {swapOptions.length === 0 ? (
                    <MenuItem disabled>No alternatives found</MenuItem>
                ) : (
                    swapOptions.map((meal) => (
                        <MenuItem key={meal.id} onClick={() => handleSwapSelect(meal)}>
                            {meal.meal_name}
                        </MenuItem>
                    ))
                )}
            </Menu>

            <Popover
                open={showTour && Boolean(currentTour?.anchor?.current)}
                anchorEl={currentTour?.anchor?.current || null}
                onClose={() => setShowTour(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <Box sx={{ p: 2, maxWidth: 260 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {currentTour?.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {currentTour?.body}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Button size="small" onClick={() => setShowTour(false)}>Skip</Button>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                                if (tourStep >= tourSteps.length - 1) {
                                    setShowTour(false);
                                    setTourStep(0);
                                } else {
                                    setTourStep((prev) => prev + 1);
                                }
                            }}
                        >
                            {tourStep >= tourSteps.length - 1 ? 'Done' : 'Next'}
                        </Button>
                    </Stack>
                </Box>
            </Popover>

            <Snackbar
                open={planFeedbackOpen}
                autoHideDuration={3000}
                onClose={() => setPlanFeedbackOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setPlanFeedbackOpen(false)} severity="success" sx={{ width: '100%' }}>
                    {planFeedbackMessage || 'Plan updated.'}
                </Alert>
            </Snackbar>

            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleImportFile}
                style={{ display: 'none' }}
            />

            <Fab
                color="inherit"
                onClick={() => setAddOpen(true)}
                aria-label="Add meal"
                variant={isDesktop ? 'extended' : 'circular'}
                sx={{
                    position: 'fixed',
                    bottom: 32,
                    right: 32,
                    bgcolor: 'rgba(255,255,255,0.75)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    backdropFilter: 'blur(18px)',
                    boxShadow: '0 18px 40px rgba(36, 50, 90, 0.2)',
                }}
            >
                <AddIcon />
                {isDesktop && (
                    <Typography sx={{ ml: 1, fontWeight: 600 }}>Add meal</Typography>
                )}
            </Fab>
        </Box>
    );
};

export default HighsControlPanel;
