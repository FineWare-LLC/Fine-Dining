// @ts-nocheck
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import StopIcon from '@mui/icons-material/Stop';
import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    CircularProgress,
    Divider,
    FormControlLabel,
    IconButton,
    Paper,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    buildCrawlerQueueFeedbackContainerStyles,
    buildCrawlerQueueFeedbackState,
} from '@/utils/crawlerQueueFeedback';
import { getCrawlerApiBaseUrl } from '@/utils/crawlerApi';
import {
    loadRestaurantCrawlerRunDraft,
    persistRestaurantCrawlerRunDraft,
    resolveRestaurantCrawlerRunDraft,
    validateRestaurantCrawlerRunRequest,
} from '@/utils/restaurantCrawlerRun';
import storage from '@/utils/storage';

function authHeaders() {
    const token = storage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
    };
}

function panelSx() {
    return {
        p: 2.5,
        bgcolor: '#FFFFFF',
        borderRadius: 2,
        border: '1px solid #DFE5DD',
        color: '#17201A',
        boxShadow: '0 1px 2px rgba(23,32,26,0.06)',
    };
}

function statCard(label, value, tone = '#2E7D32') {
    return (
        <Box
            sx={{
                flex: '1 1 150px',
                p: 2,
                borderRadius: 1.5,
                bgcolor: '#F7FAF6',
                border: '1px solid #DFE5DD',
            }}
        >
            <Typography variant="h5" sx={{ color: tone, fontWeight: 800, lineHeight: 1.1 }}>
                {value ?? '-'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#5A675D', fontWeight: 700 }}>
                {label}
            </Typography>
        </Box>
    );
}

function areStringArraysEqual(left = [], right = []) {
    if (left.length !== right.length) {
        return false;
    }

    return left.every((value, index) => value === right[index]);
}

export default function CrawlerControlPanel() {
    const router = useRouter();
    const crawlerApi = getCrawlerApiBaseUrl();
    const [recipeStatus, setRecipeStatus] = useState(null);
    const [restaurantStatus, setRestaurantStatus] = useState(null);
    const [sources, setSources] = useState([]);
    const [selectedSources, setSelectedSources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);
    const [dryRun, setDryRun] = useState(true);
    const [includeAggregators, setIncludeAggregators] = useState(true);
    const [limitPerSource, setLimitPerSource] = useState(40);
    const [draftHydrated, setDraftHydrated] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [message, setMessage] = useState('');
    const [restaurantResult, setRestaurantResult] = useState(null);
    const [fetchError, setFetchError] = useState('');

    const selectedSourceIds = useMemo(
        () => selectedSources.filter(Boolean),
        [selectedSources],
    );

    useEffect(() => {
        const draft = loadRestaurantCrawlerRunDraft();
        setSelectedSources(draft.selectedSourceIds);
        setDryRun(draft.dryRun);
        setIncludeAggregators(draft.includeAggregators);
        setLimitPerSource(draft.limitPerSource);
        setDraftHydrated(true);
    }, []);

    useEffect(() => {
        if (!draftHydrated) {
            return;
        }

        persistRestaurantCrawlerRunDraft(storage.localStorage, {
            selectedSourceIds,
            dryRun,
            includeAggregators,
            limitPerSource,
        });
    }, [draftHydrated, dryRun, includeAggregators, limitPerSource, selectedSourceIds]);

    const fetchAll = useCallback(async () => {
        setFetchError('');
        try {
            const [recipeRes, restaurantStatusRes, sourceRes] = await Promise.all([
                fetch(`${crawlerApi}/crawler/status`),
                fetch(`${crawlerApi}/restaurant-crawler/status`),
                fetch(`${crawlerApi}/restaurant-crawler/sources?include_aggregators=${includeAggregators}`),
            ]);

            if (recipeRes.ok) {
                setRecipeStatus(await recipeRes.json());
            } else {
                setRecipeStatus(null);
            }

            if (restaurantStatusRes.ok) {
                setRestaurantStatus(await restaurantStatusRes.json());
            } else {
                setRestaurantStatus(null);
            }

            if (sourceRes.ok) {
                const data = await sourceRes.json();
                const sourceCatalog = Array.isArray(data.sources) ? data.sources : [];
                setSources(sourceCatalog);
                setSelectedSources(currentSelection => {
                    const nextSelection = resolveRestaurantCrawlerRunDraft(
                        { selectedSourceIds: currentSelection },
                        sourceCatalog,
                    ).selectedSourceIds;

                    return areStringArraysEqual(currentSelection, nextSelection)
                        ? currentSelection
                        : nextSelection;
                });
            } else {
                setSources([]);
            }
        } catch {
            setFetchError(`Crawler API is not reachable at ${crawlerApi}.`);
            setRecipeStatus(null);
            setRestaurantStatus(null);
            setSources([]);
        } finally {
            setLoading(false);
        }
    }, [crawlerApi, includeAggregators]);

    useEffect(() => {
        if (!draftHydrated) {
            return;
        }

        fetchAll();
        const interval = setInterval(fetchAll, 5000);
        return () => clearInterval(interval);
    }, [draftHydrated, fetchAll]);

    const startRecipeCrawler = async () => {
        setActing(true);
        setMessage('');
        try {
            const res = await fetch(`${crawlerApi}/crawler/start`, {
                method: 'POST',
                headers: authHeaders(),
            });
            const data = await res.json();
            setMessage(data.message || 'Recipe crawler started.');
            fetchAll();
        } catch {
            setMessage('Failed to start recipe crawler.');
        } finally {
            setActing(false);
        }
    };

    const stopRecipeCrawler = async () => {
        setActing(true);
        setMessage('');
        try {
            const res = await fetch(`${crawlerApi}/crawler/stop`, {
                method: 'POST',
                headers: authHeaders(),
            });
            const data = await res.json();
            setMessage(data.message || 'Recipe crawler stop requested.');
            fetchAll();
        } catch {
            setMessage('Failed to stop recipe crawler.');
        } finally {
            setActing(false);
        }
    };

    const addRecipeUrls = async () => {
        if (!urlInput.trim()) return;
        setActing(true);
        setMessage('');
        const urls = urlInput.split('\n').map(url => url.trim()).filter(Boolean);
        try {
            const res = await fetch(`${crawlerApi}/crawler/add-urls`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ urls }),
            });
            const data = await res.json();
            setMessage(data.message || `Added ${urls.length} URLs.`);
            setUrlInput('');
            fetchAll();
        } catch {
            setMessage('Failed to add recipe URLs.');
        } finally {
            setActing(false);
        }
    };

    const runRestaurantCrawler = async () => {
        setMessage('');
        setRestaurantResult(null);
        const requestValidation = validateRestaurantCrawlerRunRequest({
            sourceIds: selectedSourceIds,
            dryRun,
            limitPerSource,
            includeAggregators,
        });

        if (!requestValidation.valid) {
            setMessage(requestValidation.error.message);
            return;
        }

        setActing(true);
        try {
            const res = await fetch(`${crawlerApi}/restaurant-crawler/run`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(requestValidation.payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.detail || 'Restaurant crawler failed.');
            setRestaurantResult(data);
            setMessage(
                dryRun
                    ? `Dry run found ${data.itemsFound || 0} restaurant items.`
                    : `Imported ${data.itemsImported || 0} restaurant items.`,
            );
            fetchAll();
        } catch (error) {
            setMessage(error.message || 'Restaurant crawler failed.');
        } finally {
            setActing(false);
        }
    };

    const toggleSource = (sourceId) => {
        setSelectedSources(current =>
            current.includes(sourceId)
                ? current.filter(id => id !== sourceId)
                : [...current, sourceId],
        );
    };

    const recipeFeedback = buildCrawlerQueueFeedbackState({
        isLoading: loading,
        recipeStatus,
        errorMessage: fetchError,
    });
    const recipeFeedbackStyles = buildCrawlerQueueFeedbackContainerStyles(recipeFeedback.state);

    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <Head>
                <title>Crawler Admin - Fine Dining</title>
            </Head>
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: '#F4F7F2',
                    color: '#17201A',
                    px: { xs: 2, md: 4 },
                    py: 3,
                }}
            >
                <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <IconButton
                            onClick={() => router.push('/admin').catch(() => {})}
                            aria-label="Back to admin"
                            sx={{ color: '#2E7D32' }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                                Crawler Admin
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#5A675D', mt: 0.5 }}>
                                Manage recipe discovery and restaurant meal ingestion.
                            </Typography>
                        </Box>
                        <IconButton onClick={fetchAll} aria-label="Refresh crawler status" sx={{ color: '#2E7D32' }}>
                            <RefreshIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1.2fr' }, gap: 2.5 }}>
                        <Paper sx={panelSx()}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, flex: 1 }}>
                                    Recipe Queue
                                </Typography>
                                <Chip
                                    label={recipeStatus?.running ? 'Running' : 'Stopped'}
                                    sx={{
                                        bgcolor: recipeStatus?.running ? '#E5F2E3' : '#EEF1ED',
                                        color: recipeStatus?.running ? '#1B5E20' : '#5A675D',
                                        fontWeight: 700,
                                    }}
                                />
                            </Box>
                            <Box
                                id="recipe-crawler-feedback"
                                role={recipeFeedback.role}
                                aria-live={recipeFeedback.ariaLive}
                                aria-atomic="true"
                                aria-busy={recipeFeedback.state === 'loading' ? 'true' : 'false'}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    minHeight: recipeFeedback.minHeight,
                                    mb: 2,
                                    px: 2,
                                    py: 1.5,
                                    borderRadius: 1.5,
                                    ...recipeFeedbackStyles,
                                }}
                            >
                                {recipeFeedback.showSpinner && (
                                    <CircularProgress size={16} sx={{ color: '#2E7D32' }} />
                                )}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: recipeFeedback.state === 'error'
                                            ? '#B3261E'
                                            : recipeFeedback.state === 'success'
                                                ? '#1B5E20'
                                                : '#5A675D',
                                        fontWeight: 700,
                                    }}
                                >
                                    {recipeFeedback.message}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
                                {statCard('Recipes', recipeStatus?.total_recipes, '#2E7D32')}
                                {statCard('Pages', recipeStatus?.pages_crawled, '#8A5D00')}
                                {statCard('Queued', recipeStatus?.queue_pending, '#A14D1A')}
                                {statCard('Errors', recipeStatus?.errors, '#B3261E')}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<PlayArrowIcon />}
                                    disabled={acting || loading || Boolean(recipeStatus?.running)}
                                    onClick={startRecipeCrawler}
                                    sx={{ bgcolor: '#2E7D32', fontWeight: 800 }}
                                >
                                    Start
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<StopIcon />}
                                    disabled={acting || loading || !recipeStatus?.running}
                                    onClick={stopRecipeCrawler}
                                    sx={{ color: '#B3261E', borderColor: '#D7A09B', fontWeight: 800 }}
                                >
                                    Stop
                                </Button>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                                Add Recipe URLs
                            </Typography>
                            <TextField
                                multiline
                                minRows={3}
                                maxRows={8}
                                fullWidth
                                placeholder="Paste recipe page URLs, one per line"
                                value={urlInput}
                                onChange={(event) => setUrlInput(event.target.value)}
                                sx={{ mb: 1.5 }}
                            />
                            <Button
                                variant="outlined"
                                disabled={acting || loading || !urlInput.trim()}
                                onClick={addRecipeUrls}
                                sx={{ fontWeight: 800 }}
                            >
                                Add URLs
                            </Button>
                        </Paper>

                        <Paper sx={panelSx()}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, flex: 1 }}>
                                    Restaurant Meals
                                </Typography>
                                <Chip
                                    label={restaurantStatus?.running ? 'Running' : 'Ready'}
                                    sx={{
                                        bgcolor: restaurantStatus?.running ? '#E5F2E3' : '#EEF1ED',
                                        color: restaurantStatus?.running ? '#1B5E20' : '#5A675D',
                                        fontWeight: 700,
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
                                {statCard('Sources', restaurantStatus?.sourcesProcessed, '#2E7D32')}
                                {statCard('Found', restaurantStatus?.itemsFound, '#8A5D00')}
                                {statCard('Imported', restaurantStatus?.itemsImported, '#2E7D32')}
                                {statCard('Errors', restaurantStatus?.errors, '#B3261E')}
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                                <FormControlLabel
                                    control={<Switch checked={dryRun} onChange={(event) => setDryRun(event.target.checked)} />}
                                    label="Dry run"
                                />
                                <FormControlLabel
                                    control={<Switch checked={includeAggregators} onChange={(event) => setIncludeAggregators(event.target.checked)} />}
                                    label="Allow aggregators"
                                />
                                <TextField
                                    label="Limit/source"
                                    type="number"
                                    value={limitPerSource}
                                    onChange={(event) => setLimitPerSource(event.target.value)}
                                    inputProps={{ min: 1, max: 200 }}
                                    sx={{ width: 130 }}
                                />
                            </Box>

                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                                Sources
                            </Typography>
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                    gap: 1,
                                    mb: 2,
                                }}
                            >
                                {sources.map(source => (
                                    <Box
                                        key={source.id}
                                        sx={{
                                            border: '1px solid #DFE5DD',
                                            borderRadius: 1.5,
                                            p: 1,
                                            bgcolor: selectedSourceIds.includes(source.id) ? '#F0F7ED' : '#FFFFFF',
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={selectedSourceIds.includes(source.id)}
                                                    onChange={() => toggleSource(source.id)}
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                                        {source.restaurant}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: '#5A675D' }}>
                                                        {source.source_type} · price {source.supports_price ? 'yes' : 'market dependent'}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Box>
                                ))}
                            </Box>

                            <Button
                                variant="contained"
                                startIcon={<PlayArrowIcon />}
                                disabled={acting || loading || selectedSourceIds.length === 0}
                                onClick={runRestaurantCrawler}
                                sx={{ bgcolor: '#2E7D32', fontWeight: 800 }}
                            >
                                {dryRun ? 'Run Preview' : 'Import Menu Items'}
                            </Button>

                            {restaurantResult?.preview?.length > 0 && (
                                <Box sx={{ mt: 2.5 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                                        Preview
                                    </Typography>
                                    <Box sx={{ display: 'grid', gap: 1 }}>
                                        {restaurantResult.preview.slice(0, 8).map((item, index) => (
                                            <Box
                                                key={`${item.sourceId}-${item.mealName}-${index}`}
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 1.5,
                                                    bgcolor: '#F7FAF6',
                                                    border: '1px solid #DFE5DD',
                                                }}
                                            >
                                                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                                    {item.restaurant} - {item.mealName}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#5A675D' }}>
                                                    {item.price ? `$${item.price}` : 'No price'} · {item.calories ?? '-'} cal · P {item.protein ?? '-'} · C {item.carbohydrates ?? '-'} · F {item.fat ?? '-'}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                    </Box>

                    {message && (
                        <Alert severity={message.toLowerCase().includes('failed') ? 'error' : 'info'} sx={{ mt: 2 }}>
                            {message}
                        </Alert>
                    )}
                </Box>
            </Box>
        </ProtectedRoute>
    );
}
