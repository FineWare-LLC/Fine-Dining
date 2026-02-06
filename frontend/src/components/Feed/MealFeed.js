/**
 * MealFeed - TikTok-style meal feed with nutrition overlays.
 */
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import BookmarkModule from '@mui/icons-material/Bookmark';
import FavoriteModule from '@mui/icons-material/Favorite';
import ShareModule from '@mui/icons-material/Share';
import {
    Box,
    Button,
    Card,
    Chip,
    IconButton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { resolveMuiIcon } from '@/utils/muiIcon';
import { formatAllergenLabel } from '@/constants/allergens';

const FavoriteIcon = resolveMuiIcon(FavoriteModule);
const BookmarkIcon = resolveMuiIcon(BookmarkModule);
const ShareIcon = resolveMuiIcon(ShareModule);

const MEAL_BOOK_KEY = 'meal-book';
const LIKED_KEY = 'meal-feed-liked';

const GET_ALL_MEALS = gql`
  query GetAllMeals($page: Int, $limit: Int) {
    getAllMeals(page: $page, limit: $limit) {
      id
      mealName
      price
      restaurant {
        restaurantName
      }
      nutrition {
        carbohydrates
        protein
        fat
        sodium
      }
    }
  }
`;

const formatNumber = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    return Math.round(value).toString();
};

const buildCalories = (nutrition = {}) => {
    const carbs = Number(nutrition.carbohydrates || 0);
    const protein = Number(nutrition.protein || 0);
    const fat = Number(nutrition.fat || 0);
    return carbs * 4 + protein * 4 + fat * 9;
};

const MealReelCard = ({ meal, index, liked, inBook, onLike, onToggleBook }) => {
    const background = meal.imageUrl || `https://source.unsplash.com/1200x1600/?food&sig=${index}`;

    return (
        <Card
            elevation={0}
            sx={{
                position: 'relative',
                height: { xs: '78vh', sm: '82vh', md: '86vh' },
                borderRadius: { xs: 4, md: 6 },
                overflow: 'hidden',
                scrollSnapAlign: 'start',
                backgroundColor: 'black',
                display: 'grid',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${background})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'saturate(1.15)',
                    transform: 'scale(1.02)',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background:
            'linear-gradient(180deg, rgba(10,10,15,0.1) 0%, rgba(10,10,15,0.35) 45%, rgba(10,10,15,0.8) 100%)',
                }}
            />

            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    height: '100%',
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
                    alignItems: 'end',
                    gap: 2,
                    p: { xs: 2.5, md: 4 },
                }}
            >
                <Box sx={{ maxWidth: 520 }}>
                    <Chip
                        label={meal.restaurant || 'Chef Pick'}
                        size="small"
                        sx={{
                            mb: 1.5,
                            bgcolor: 'rgba(255,255,255,0.16)',
                            color: 'white',
                            fontWeight: 600,
                            letterSpacing: 0.3,
                        }}
                    />
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                        {meal.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 2 }}>
                        {meal.description || 'Balanced, bold, and ready to hit your targets.'}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                            label={`${formatNumber(meal.calories)} kcal`}
                            sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white' }}
                        />
                        <Chip
                            label={`${formatNumber(meal.nutrition.protein)}g protein`}
                            sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white' }}
                        />
                        <Chip
                            label={`${formatNumber(meal.nutrition.carbohydrates)}g carbs`}
                            sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white' }}
                        />
                        <Chip
                            label={`${formatNumber(meal.nutrition.fat)}g fat`}
                            sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white' }}
                        />
                        <Chip
                            label={`${formatNumber(meal.nutrition.sodium)}mg sodium`}
                            sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white' }}
                        />
                        {meal.allergens?.length > 0 && (
                            <Chip
                                label={`Allergens: ${meal.allergens.map(formatAllergenLabel).join(', ')}`}
                                sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white' }}
                            />
                        )}
                    </Stack>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'row', md: 'column' },
                        justifyContent: { xs: 'space-between', md: 'flex-end' },
                        alignItems: 'center',
                        gap: { xs: 2, md: 2.5 },
                        color: 'white',
                    }}
                >
                    {[
                        { icon: FavoriteIcon, label: 'Like', onClick: onLike, active: liked },
                        { icon: BookmarkIcon, label: 'Book', onClick: onToggleBook, active: inBook },
                        { icon: ShareIcon, label: 'Share' },
                    ].map((item) => (
                        <Box key={item.label} sx={{ textAlign: 'center' }}>
                            <IconButton
                                onClick={item.onClick}
                                sx={{
                                    bgcolor: item.active ? 'rgba(255,200,90,0.35)' : 'rgba(255,255,255,0.12)',
                                    color: item.active ? '#FFD166' : 'white',
                                    mb: 0.5,
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                                }}
                            >
                                <item.icon />
                            </IconButton>
                            <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.7)' }}>
                                {item.label}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            <Box
                sx={{
                    position: 'absolute',
                    top: 24,
                    right: 24,
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    gap: 1,
                    bgcolor: 'rgba(12,12,16,0.55)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 3,
                    p: 2,
                    color: 'white',
                    width: 200,
                    backdropFilter: 'blur(12px)',
                }}
            >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Nutrition Facts
                </Typography>
                <Stack spacing={0.5}>
                    <Typography variant="body2">Calories: {formatNumber(meal.calories)}</Typography>
                    <Typography variant="body2">Protein: {formatNumber(meal.nutrition.protein)}g</Typography>
                    <Typography variant="body2">Carbs: {formatNumber(meal.nutrition.carbohydrates)}g</Typography>
                    <Typography variant="body2">Fat: {formatNumber(meal.nutrition.fat)}g</Typography>
                    <Typography variant="body2">Sodium: {formatNumber(meal.nutrition.sodium)}mg</Typography>
                </Stack>
            </Box>
        </Card>
    );
};

export default function MealFeed() {
    const theme = useTheme();
    const router = useRouter();
    const { data, loading, error } = useQuery(GET_ALL_MEALS, {
        variables: { page: 1, limit: 40 },
        fetchPolicy: 'network-only',
    });
    const [fallbackMeals, setFallbackMeals] = useState([]);
    const [fallbackLoaded, setFallbackLoaded] = useState(false);
    const [likedMeals, setLikedMeals] = useState({});
    const [bookMeals, setBookMeals] = useState({});

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const raw = window.localStorage.getItem(LIKED_KEY);
            if (raw) {
                setLikedMeals(JSON.parse(raw));
            }
            const bookRaw = window.localStorage.getItem(MEAL_BOOK_KEY);
            if (bookRaw) {
                const list = JSON.parse(bookRaw);
                const map = Object.fromEntries(list.map(item => [item.id, item]));
                setBookMeals(map);
            }
        } catch (err) {
            console.warn('Failed to load local meal data', err);
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(LIKED_KEY, JSON.stringify(likedMeals));
        } catch (err) {
            console.warn('Failed to persist liked meals', err);
        }
    }, [likedMeals]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const list = Object.values(bookMeals);
            window.localStorage.setItem(MEAL_BOOK_KEY, JSON.stringify(list));
        } catch (err) {
            console.warn('Failed to persist meal book', err);
        }
    }, [bookMeals]);

    const loadFallbackMeals = useCallback(() => {
        if (fallbackLoaded) return;
        let mounted = true;
        fetch('/api/test-meals')
            .then(res => res.ok ? res.json() : null)
            .then(payload => {
                if (!mounted || !payload?.meals) return;
                setFallbackMeals(payload.meals);
                setFallbackLoaded(true);
            })
            .catch(() => {
                setFallbackLoaded(true);
            });

        return () => {
            mounted = false;
        };
    }, [fallbackLoaded]);

    useEffect(() => {
        if (data?.getAllMeals?.length) return;

        const timeoutId = setTimeout(() => {
            if (!data?.getAllMeals?.length) {
                loadFallbackMeals();
            }
        }, 1200);

        if (!loading && !data?.getAllMeals?.length) {
            loadFallbackMeals();
        }

        return () => clearTimeout(timeoutId);
    }, [loading, data, loadFallbackMeals]);

    const meals = useMemo(() => {
        if (data?.getAllMeals?.length) {
            return data.getAllMeals.map((meal, index) => {
                const nutrition = meal.nutrition || {};
                return {
                    id: meal.id,
                    title: meal.mealName || `Meal ${index + 1}`,
                    restaurant: meal.restaurant?.restaurantName,
                    price: meal.price,
                    nutrition: {
                        carbohydrates: Number(nutrition.carbohydrates || 0),
                        protein: Number(nutrition.protein || 0),
                        fat: Number(nutrition.fat || 0),
                        sodium: Number(nutrition.sodium || 0),
                    },
                    calories: buildCalories(nutrition),
                };
            });
        }

        return fallbackMeals.map((meal, index) => ({
            id: meal.id || `sample-${index}`,
            title: meal.meal_name,
            restaurant: meal.restaurant,
            price: meal.price,
            imageUrl: meal.image,
            description: meal.description,
            nutrition: {
                carbohydrates: Number(meal.carbohydrates || 0),
                protein: Number(meal.protein || 0),
                fat: Number(meal.fat || 0),
                sodium: Number(meal.sodium || 0),
                calories: meal.calories,
            },
            allergens: meal.allergens || [],
            calories: Number(meal.calories || 0),
        }));
    }, [data, fallbackMeals]);

    const likedList = useMemo(() => Object.values(likedMeals), [likedMeals]);
    const bookList = useMemo(() => Object.values(bookMeals), [bookMeals]);

    const handleToggleLike = (meal) => {
        setLikedMeals(prev => {
            const next = { ...prev };
            if (next[meal.id]) {
                delete next[meal.id];
            } else {
                next[meal.id] = meal;
            }
            return next;
        });
    };

    const handleToggleBook = (meal) => {
        setBookMeals(prev => {
            const next = { ...prev };
            if (next[meal.id]) {
                delete next[meal.id];
            } else {
                next[meal.id] = {
                    id: meal.id,
                    name: meal.title,
                    price: meal.price ?? 0,
                    nutrition: meal.nutrition,
                    allergens: meal.allergens || [],
                    tags: {},
                    maxServings: '',
                };
            }
            return next;
        });
    };

    return (
        <Box
            sx={{
                background: 'radial-gradient(circle at 0% 0%, #1A1A26 0%, #0F1016 45%, #0A0B10 100%)',
                borderRadius: { xs: 4, md: 6 },
                p: { xs: 2, md: 3 },
                boxShadow: '0 40px 80px rgba(10, 12, 20, 0.35)',
            }}
        >
            <Box sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                    Your Meal Stream
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Scroll to discover meals with full nutrition data.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                    <Chip
                        label={`${likedList.length} liked`}
                        sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}
                    />
                    <Chip
                        label={`${bookList.length} in your book`}
                        sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }}
                    />
                    <Button
                        variant="contained"
                        onClick={() => router.push('/meal-book')}
                        sx={{
                            alignSelf: 'flex-start',
                            bgcolor: '#FF6B35',
                            '&:hover': { bgcolor: '#F95D1A' },
                        }}
                    >
                        Open Meal Book
                    </Button>
                </Stack>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gap: { xs: 2, md: 3 },
                    maxHeight: { xs: '80vh', md: '85vh' },
                    overflowY: 'auto',
                    scrollSnapType: 'y mandatory',
                    pr: 1,
                    '&::-webkit-scrollbar': { width: 8 },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 20,
                    },
                }}
            >
                {loading && (
                    <Card
                        elevation={0}
                        sx={{
                            height: { xs: '78vh', sm: '82vh' },
                            borderRadius: { xs: 4, md: 6 },
                            bgcolor: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}
                    />
                )}
                {!loading && meals.length === 0 && (
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        No meals yet. Add some meals to see them here.
                    </Typography>
                )}
                {meals.map((meal, index) => (
                    <MealReelCard
                        key={meal.id}
                        meal={meal}
                        index={index + 1}
                        liked={Boolean(likedMeals[meal.id])}
                        inBook={Boolean(bookMeals[meal.id])}
                        onLike={() => handleToggleLike(meal)}
                        onToggleBook={() => handleToggleBook(meal)}
                    />
                ))}
                {error && (
                    <Typography sx={{ color: theme.palette.error.light }}>
                        Could not load meals. Showing available samples.
                    </Typography>
                )}
            </Box>
        </Box>
    );
}
