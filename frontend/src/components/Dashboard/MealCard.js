/**
 * Enhanced meal card with modern design and detailed information
 */
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FitnessIcon from '@mui/icons-material/FitnessCenter';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Chip,
    IconButton,
    useTheme,
    LinearProgress,
} from '@mui/material';
import React from 'react';

export default function MealCard({ meal }) {
    const theme = useTheme();
    const [isFavorite, setIsFavorite] = React.useState(false);

    if (!meal) return null;

    const handleFavoriteToggle = () => {
        setIsFavorite(!isFavorite);
    };

    return (
        <Card
            sx={{
                mt: 3,
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.12)',
                },
            }}
        >
            {/* Image Section with Overlay */}
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={meal.imageUrl}
                    alt={meal.title}
                    sx={{
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.05)',
                        },
                    }}
                />

                {/* Gradient Overlay */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
                    }}
                />

                {/* Favorite Button */}
                <IconButton
                    onClick={handleFavoriteToggle}
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                            transform: 'scale(1.1)',
                        },
                        transition: 'all 0.3s ease',
                    }}
                >
                    {isFavorite ? (
                        <FavoriteIcon sx={{ color: theme.palette.primary.main }} />
                    ) : (
                        <FavoriteBorderIcon sx={{ color: theme.palette.text.secondary }} />
                    )}
                </IconButton>

                {/* Meal Type Badge */}
                <Chip
                    label={meal.timeLabel || 'Meal'}
                    sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: theme.palette.gradient?.primary || theme.palette.primary.main,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }}
                />
            </Box>

            <CardContent sx={{ p: 3 }}>
                {/* Title */}
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        mb: 2,
                        background: theme.palette.gradient?.hero || 'linear-gradient(135deg, #FF6B35 0%, #4CAF50 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    {meal.title}
                </Typography>

                {/* Nutrition Info */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    {/* Calories */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocalFireDepartmentIcon
                            sx={{
                                fontSize: 18,
                                color: theme.palette.primary.main,
                            }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                            {meal.calories || 0} cal
                        </Typography>
                    </Box>

                    {/* Protein */}
                    {meal.protein && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <FitnessIcon
                                sx={{
                                    fontSize: 18,
                                    color: theme.palette.secondary.main,
                                }}
                            />
                            <Typography variant="body2" fontWeight={600}>
                                {meal.protein}g protein
                            </Typography>
                        </Box>
                    )}

                    {/* Prep Time */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon
                            sx={{
                                fontSize: 18,
                                color: theme.palette.accent?.main || theme.palette.warning.main,
                            }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                            {meal.prepTime || '30'} min
                        </Typography>
                    </Box>
                </Box>

                {/* Progress Bar for Nutrition Goals */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
              Daily Nutrition Goal
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {Math.round(((meal.calories || 0) / 2000) * 100)}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(((meal.calories || 0) / 2000) * 100, 100)}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: theme.palette.surface?.light || '#f5f5f5',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: theme.palette.gradient?.secondary || theme.palette.secondary.main,
                            },
                        }}
                    />
                </Box>

                {/* Tags */}
                {meal.tags && meal.tags.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {meal.tags.map((tag, index) => (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                sx={{
                                    backgroundColor: theme.palette.surface?.light || '#f5f5f5',
                                    color: theme.palette.text.secondary,
                                    fontWeight: 500,
                                    '&:hover': {
                                        backgroundColor: theme.palette.primary.main,
                                        color: 'white',
                                        transform: 'scale(1.05)',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            />
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}
