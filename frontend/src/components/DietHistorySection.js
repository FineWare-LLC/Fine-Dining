// components/DietHistorySection.js
/**
 * @fileoverview American Diet History section with visual data representations
 */

import React from 'react';
import {
    Box,
    Typography,
    Container,
    Grid,
    Paper,
    LinearProgress,
    useTheme,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import { keyframes } from '@emotion/react';

// Animation for progressive bars
const progressAnimation = keyframes`
  from {
    width: 0%;
  }
  to {
    width: var(--target-width);
  }
`;

// Diet data for American history
const dietHistoryData = [
    {
        decade: "1950s",
        description: "Post-war prosperity led to increased consumption of processed foods and convenience meals",
        obesity: 13,
        processed: 20,
        vegetables: 65,
        highlight: "Introduction of TV dinners and fast food chains"
    },
    {
        decade: "1970s",
        description: "Rise of fast food culture and supersizing trends",
        obesity: 15,
        processed: 35,
        vegetables: 55,
        highlight: "Fast food becomes mainstream"
    },
    {
        decade: "1990s",
        description: "Low-fat diet trends, but increased sugar consumption",
        obesity: 23,
        processed: 55,
        vegetables: 45,
        highlight: "Diet culture boom with processed 'diet' foods"
    },
    {
        decade: "2010s",
        description: "Awareness grows about nutrition, but obesity continues to rise",
        obesity: 36,
        processed: 60,
        vegetables: 40,
        highlight: "Organic and health food movements gain traction"
    },
    {
        decade: "2020s",
        description: "Technology meets nutrition - personalized diet solutions emerge",
        obesity: 42,
        processed: 58,
        vegetables: 42,
        highlight: "AI-powered nutrition optimization begins"
    }
];

const nutritionBenefits = [
    {
        benefit: "Heart Health",
        description: "Proper nutrition reduces cardiovascular disease risk by up to 80%",
        stat: "80%"
    },
    {
        benefit: "Mental Clarity",
        description: "Balanced diets improve cognitive function and reduce brain fog",
        stat: "65%"
    },
    {
        benefit: "Energy Levels",
        description: "Optimized nutrition increases daily energy and reduces fatigue",
        stat: "90%"
    },
    {
        benefit: "Longevity",
        description: "Healthy eating habits can extend lifespan by 10-15 years",
        stat: "+12 years"
    }
];

const ProgressBar = ({ value, color, label }) => {
    const theme = useTheme();
    
    return (
        <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                    {value}%
                </Typography>
            </Box>
            <Box
                sx={{
                    height: 8,
                    backgroundColor: 'grey.200',
                    borderRadius: 4,
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        height: '100%',
                        backgroundColor: color,
                        borderRadius: 4,
                        animation: `${progressAnimation} 2s ease-out`,
                        '--target-width': `${value}%`,
                    }}
                />
            </Box>
        </Box>
    );
};

export default function DietHistorySection() {
    const theme = useTheme();

    return (
        <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
            <Container maxWidth="lg">
                {/* Section Header */}
                <Box textAlign="center" mb={6}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            mb: 2,
                            background: theme.palette.gradient?.primary || 'linear-gradient(45deg, #ff6b35, #f7931e)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        The American Diet Evolution
                    </Typography>
                    <Typography variant="h6" color="text.secondary" maxWidth="800px" mx="auto">
                        Understanding how our eating habits have changed over the decades and 
                        why personalized nutrition is more important than ever.
                    </Typography>
                </Box>

                {/* Diet History Timeline */}
                <Grid container spacing={3} mb={8}>
                    {dietHistoryData.map((period, index) => (
                        <Grid item xs={12} md={6} lg={4} key={period.decade}>
                            <Card
                                sx={{
                                    height: '100%',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: theme.shadows[8],
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <Chip
                                            label={period.decade}
                                            color="primary"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Box>
                                    
                                    <Typography variant="body1" mb={3} color="text.secondary">
                                        {period.description}
                                    </Typography>

                                    <Box mb={2}>
                                        <ProgressBar
                                            value={period.obesity}
                                            color={theme.palette.error.main}
                                            label="Obesity Rate"
                                        />
                                        <ProgressBar
                                            value={period.processed}
                                            color={theme.palette.warning.main}
                                            label="Processed Foods"
                                        />
                                        <ProgressBar
                                            value={period.vegetables}
                                            color={theme.palette.success.main}
                                            label="Fresh Produce"
                                        />
                                    </Box>

                                    <Paper
                                        sx={{
                                            p: 2,
                                            backgroundColor: theme.palette.primary.light + '10',
                                            borderLeft: `4px solid ${theme.palette.primary.main}`,
                                        }}
                                    >
                                        <Typography variant="body2" fontStyle="italic">
                                            "{period.highlight}"
                                        </Typography>
                                    </Paper>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Nutrition Benefits Section */}
                <Box textAlign="center" mb={4}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 700,
                            mb: 2,
                            color: theme.palette.primary.main,
                        }}
                    >
                        How Good Nutrition Transforms Lives
                    </Typography>
                    <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto">
                        Scientific research consistently shows the profound impact of proper nutrition 
                        on every aspect of human health and wellbeing.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {nutritionBenefits.map((item, index) => (
                        <Grid item xs={12} sm={6} md={3} key={item.benefit}>
                            <Paper
                                sx={{
                                    p: 3,
                                    textAlign: 'center',
                                    height: '100%',
                                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                    },
                                }}
                            >
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 800,
                                        color: theme.palette.primary.main,
                                        mb: 1,
                                    }}
                                >
                                    {item.stat}
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    {item.benefit}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {item.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}