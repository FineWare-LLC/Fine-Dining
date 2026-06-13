// @ts-nocheck
import { useQuery, useMutation } from '@apollo/client/react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import {
    Box, Typography, Container, Grid, Card, CardContent, CardActions,
    Button, TextField, AppBar, Toolbar, IconButton, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, Chip, Slider,
    FormControl, InputLabel, Select, MenuItem, OutlinedInput, Snackbar, Alert,
} from '@mui/material';
import { gql } from 'graphql-tag';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { buildCookbookSharingDisplayState } from '@/utils/cookbookSharing';
import { updateCookbookEntryAndRefresh } from '@/utils/cookbookRevision';
import {
    buildCookbookLibraryFeedbackContainerStyles,
    buildCookbookLibraryFeedbackState,
    COOKBOOK_LIBRARY_RESOLVED_MESSAGE,
} from '@/utils/cookbookFeedback';

const GET_COOKBOOKS = gql`
    query GetCookbooksByUser($userId: ID!) {
        getCookbooksByUser(userId: $userId) {
            id name description isPublic
            entries {
                id desiredServings maxTimesPerWeek minTimesPerWeek
                allowedMealTypes preferenceScore notes addedAt
                recipe { id recipeName prepTime difficulty cuisine
                    nutritionPerServing { calories protein carbohydrates fat fiber }
                    costPerServing allergens dietaryTags
                }
            }
        }
    }
`;

const CREATE_COOKBOOK = gql`
    mutation CreateCookbook($userId: ID!, $input: CreateCookbookInput!) {
        createCookbook(userId: $userId, input: $input) { id name }
    }
`;

const REMOVE_ENTRY = gql`
    mutation RemoveRecipeFromCookbook($cookbookId: ID!, $entryId: ID!) {
        removeRecipeFromCookbook(cookbookId: $cookbookId, entryId: $entryId) { id }
    }
`;

const UPDATE_ENTRY = gql`
    mutation UpdateCookbookEntry($cookbookId: ID!, $entryId: ID!, $entry: CookbookEntryInput!) {
        updateCookbookEntry(cookbookId: $cookbookId, entryId: $entryId, entry: $entry) { id }
    }
`;

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'DESSERT', 'SIDE'];
const srOnly = {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
};

export default function CookbookPage() {
    const { logout, user } = useAuth();
    const router = useRouter();
    const [createOpen, setCreateOpen] = useState(false);
    const [editEntry, setEditEntry] = useState(null);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const { data, loading, error, refetch } = useQuery(GET_COOKBOOKS, {
        variables: { userId: user?.id }, skip: !user?.id,
    });
    const [createCookbook] = useMutation(CREATE_COOKBOOK);
    const [removeEntry] = useMutation(REMOVE_ENTRY);
    const [updateEntry] = useMutation(UPDATE_ENTRY);

    const cookbooks = Array.isArray(data?.getCookbooksByUser) ? data.getCookbooksByUser : [];
    const cookbookFeedback = buildCookbookLibraryFeedbackState({
        isLoading: loading,
        error,
        cookbooks: data?.getCookbooksByUser,
    });

    const handleCookbookFeedbackAction = () => {
        if (cookbookFeedback.actionKind === 'retry-cookbooks') {
            refetch().catch(() => {});
            return;
        }

        if (cookbookFeedback.actionKind === 'open-create-cookbook') {
            setCreateOpen(true);
        }
    };

    const cookbookSharingResolvedAnnouncement = cookbookFeedback.state === 'resolved' ? (
        <Box role={cookbookFeedback.role} aria-live={cookbookFeedback.ariaLive} aria-atomic="true" sx={srOnly}>
            {COOKBOOK_LIBRARY_RESOLVED_MESSAGE}
        </Box>
    ) : null;

    const handleCreate = async () => {
        try {
            await createCookbook({ variables: { userId: user.id, input: { name: newName, description: newDesc } } });
            setSnackbar({ open: true, message: 'Cookbook created!', severity: 'success' });
            setCreateOpen(false); setNewName(''); setNewDesc('');
            refetch();
        } catch (err) { setSnackbar({ open: true, message: err.message, severity: 'error' }); }
    };

    const handleRemove = async (cookbookId, entryId) => {
        try {
            await removeEntry({ variables: { cookbookId, entryId } });
            setSnackbar({ open: true, message: 'Recipe removed', severity: 'success' });
            refetch();
        } catch (err) { setSnackbar({ open: true, message: err.message, severity: 'error' }); }
    };

    const handleUpdateEntry = async () => {
        if (!editEntry) return;
        try {
            await updateCookbookEntryAndRefresh({
                updateCookbookMutation: updateEntry,
                refetchCookbooks: refetch,
                cookbookId: editEntry.cookbookId,
                entryId: editEntry.id,
                entry: {
                    recipeId: editEntry.recipe.id,
                    desiredServings: editEntry.desiredServings,
                    maxTimesPerWeek: editEntry.maxTimesPerWeek,
                    minTimesPerWeek: editEntry.minTimesPerWeek,
                    allowedMealTypes: editEntry.allowedMealTypes,
                    preferenceScore: editEntry.preferenceScore,
                },
            });
            setSnackbar({ open: true, message: 'Entry updated', severity: 'success' });
            setEditEntry(null);
        } catch (err) { setSnackbar({ open: true, message: err.message, severity: 'error' }); }
    };

    return (
        <ProtectedRoute allowedRoles={['USER', 'PREMIUM', 'PRO', 'ADMIN']}>
            <Head><title>My Cookbooks - Fine Dining</title></Head>
            <MainLayout>
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h4" sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, color: '#fff' }}>
                        My Cookbooks
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
                        New Cookbook
                    </Button>
                </Box>
                {cookbookFeedback.state === 'loading' ? (
                    <Box
                        role={cookbookFeedback.role}
                        aria-live={cookbookFeedback.ariaLive}
                        aria-busy={cookbookFeedback.ariaBusy}
                        aria-atomic="true"
                        sx={{
                            m: 2,
                            py: 4,
                            px: 2,
                            minHeight: cookbookFeedback.minHeight,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1.25,
                            borderRadius: 1,
                            ...buildCookbookLibraryFeedbackContainerStyles(cookbookFeedback.state),
                        }}
                    >
                        {cookbookFeedback.showSpinner && <CircularProgress />}
                        <Typography variant="body2" color="text.secondary">
                            {cookbookFeedback.message}
                        </Typography>
                    </Box>
                ) : cookbookFeedback.state === 'error' ? (
                    <Box
                        role={cookbookFeedback.role}
                        aria-live={cookbookFeedback.ariaLive}
                        aria-atomic="true"
                        sx={{
                            m: 2,
                            py: 4,
                            px: 2,
                            minHeight: cookbookFeedback.minHeight,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1.25,
                            borderRadius: 1,
                            ...buildCookbookLibraryFeedbackContainerStyles(cookbookFeedback.state),
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {cookbookFeedback.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, textAlign: 'center' }}>
                            {cookbookFeedback.message}
                        </Typography>
                        <Button variant="outlined" size="small" color="error" onClick={handleCookbookFeedbackAction}>
                            {cookbookFeedback.actionLabel}
                        </Button>
                    </Box>
                ) : cookbookFeedback.state === 'empty' ? (
                    <Box
                        role={cookbookFeedback.role}
                        aria-live={cookbookFeedback.ariaLive}
                        aria-busy={cookbookFeedback.ariaBusy}
                        aria-atomic="true"
                        sx={{
                            textAlign: 'center',
                            py: 8,
                            px: 2,
                            minHeight: cookbookFeedback.minHeight,
                            ...buildCookbookLibraryFeedbackContainerStyles(cookbookFeedback.state),
                        }}
                    >
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {cookbookFeedback.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {cookbookFeedback.message}
                        </Typography>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCookbookFeedbackAction}>
                            {cookbookFeedback.actionLabel}
                        </Button>
                    </Box>
                ) : (
                    <>
                        {cookbookSharingResolvedAnnouncement}
                        {cookbooks.map((cb) => {
                            const sharingState = buildCookbookSharingDisplayState(cb);

                            return (
                                <Box key={cb.id} sx={{ mb: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
                                            {cb.name}
                                        </Typography>
                                        <Chip
                                            size="small"
                                            label={sharingState.label}
                                            color={sharingState.color}
                                            variant={sharingState.variant}
                                            aria-label={sharingState.ariaLabel}
                                        />
                                    </Box>
                                    {cb.description && <Typography variant="body2" color="text.secondary" gutterBottom>{cb.description}</Typography>}
                                    <Typography variant="body2" sx={{ mb: 2 }}>{cb.entries?.length || 0} recipes</Typography>
                                    <Grid container spacing={2}>
                                        {(cb.entries || []).map((entry) => (
                                            <Grid item xs={12} sm={6} md={4} key={entry.id}>
                                                <Card variant="outlined">
                                                    <CardContent>
                                                        <Typography variant="subtitle1" noWrap>{entry.recipe?.recipeName}</Typography>
                                                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', my: 1 }}>
                                                            <Chip label={`${entry.desiredServings} srv`} size="small" />
                                                            <Chip label={`Pref: ${entry.preferenceScore}/10`} size="small" color="primary" variant="outlined" />
                                                            {entry.maxTimesPerWeek != null && <Chip label={`≤${entry.maxTimesPerWeek}/wk`} size="small" />}
                                                            {entry.minTimesPerWeek > 0 && <Chip label={`≥${entry.minTimesPerWeek}/wk`} size="small" />}
                                                        </Box>
                                                        {entry.recipe?.nutritionPerServing && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                {Math.round(entry.recipe.nutritionPerServing.calories)} cal · {Math.round(entry.recipe.nutritionPerServing.protein)}g protein
                                                            </Typography>
                                                        )}
                                                    </CardContent>
                                                    <CardActions>
                                                        <IconButton size="small" onClick={() => setEditEntry({ ...entry, cookbookId: cb.id })}><EditIcon fontSize="small" /></IconButton>
                                                        <IconButton size="small" color="error" onClick={() => handleRemove(cb.id, entry.id)}><DeleteIcon fontSize="small" /></IconButton>
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            );
                        })}
                    </>
                )}

            {/* Create Cookbook Dialog */}
            <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Cookbook</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} sx={{ mt: 1, mb: 2 }} />
                    <TextField fullWidth label="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} multiline rows={2} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={!newName.trim()}>Create</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Entry Dialog */}
            <Dialog open={!!editEntry} onClose={() => setEditEntry(null)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit: {editEntry?.recipe?.recipeName}</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom sx={{ mt: 1 }}>Servings: {editEntry?.desiredServings}</Typography>
                    <Slider value={editEntry?.desiredServings || 1} min={0.5} max={10} step={0.5}
                        onChange={(_, v) => setEditEntry({ ...editEntry, desiredServings: v })} />
                    <Typography gutterBottom>Preference Score: {editEntry?.preferenceScore}/10</Typography>
                    <Slider value={editEntry?.preferenceScore || 5} min={1} max={10} step={1}
                        onChange={(_, v) => setEditEntry({ ...editEntry, preferenceScore: v })} />
                    <TextField fullWidth size="small" label="Min Times/Week" type="number" sx={{ mb: 2 }}
                        value={editEntry?.minTimesPerWeek || 0}
                        onChange={(e) => setEditEntry({ ...editEntry, minTimesPerWeek: parseInt(e.target.value) || 0 })} />
                    <TextField fullWidth size="small" label="Max Times/Week (empty = no limit)" type="number" sx={{ mb: 2 }}
                        value={editEntry?.maxTimesPerWeek ?? ''}
                        onChange={(e) => setEditEntry({ ...editEntry, maxTimesPerWeek: e.target.value ? parseInt(e.target.value) : null })} />
                    <FormControl fullWidth size="small">
                        <InputLabel>Allowed Meal Types</InputLabel>
                        <Select multiple value={editEntry?.allowedMealTypes || []}
                            onChange={(e) => setEditEntry({ ...editEntry, allowedMealTypes: e.target.value })}
                            input={<OutlinedInput label="Allowed Meal Types" />}>
                            {MEAL_TYPES.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditEntry(null)}>Cancel</Button>
                    <Button variant="contained" onClick={handleUpdateEntry}>Save</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
            </Snackbar>
            </MainLayout>
        </ProtectedRoute>
    );
}
