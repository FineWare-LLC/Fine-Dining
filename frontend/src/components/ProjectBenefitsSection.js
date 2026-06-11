// components/ProjectBenefitsSection.js
/**
 * @fileoverview Project Benefits section explaining what Fine Dining does and how it helps
 */

import React from 'react';
import {
    Box,
    Typography,
    Container,
    Grid,
    Paper,
    Button,
    useTheme,
    Card,
    CardContent,
    Avatar,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Psychology,
    TrendingUp,
    Group,
    AttachMoney,
    HealthAndSafety,
    Speed,
    CheckCircle,
    Business,
    People,
    Analytics
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';

// Animation for cards
const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const projectFeatures = [
    {
        icon: <Psychology />,
        title: "AI-Powered Optimization",
        description: "Our advanced algorithms analyze your nutritional needs, preferences, and constraints to create perfectly balanced meal plans.",
        color: "#4CAF50"
    },
    {
        icon: <AttachMoney />,
        title: "Cost Optimization",
        description: "Get maximum nutrition value while staying within your budget. Our system finds the best price-to-nutrition ratio.",
        color: "#FF9800"
    },
    {
        icon: <HealthAndSafety />,
        title: "Health-First Approach",
        description: "Every recommendation prioritizes your health goals, dietary restrictions, and nutritional requirements.",
        color: "#2196F3"
    },
    {
        icon: <Speed />,
        title: "Real-Time Adaptation",
        description: "Plans adjust instantly based on availability, seasonal changes, and your feedback.",
        color: "#E91E63"
    }
];

const individualBenefits = [
    "Personalized meal plans based on your unique needs",
    "Automatic grocery list generation with cost optimization",
    "Nutritional tracking and progress monitoring",
    "Recipe suggestions with preparation guidance",
    "Health goal alignment and achievement tracking",
    "Time-saving automated meal planning"
];

const organizationBenefits = [
    "Employee wellness program integration",
    "Bulk meal planning for cafeterias and restaurants",
    "Cost reduction through optimized purchasing",
    "Nutritional compliance for healthcare facilities",
    "Scalable solutions for any organization size",
    "Analytics and reporting on nutrition outcomes"
];

const impactStats = [
    { number: "10,000+", label: "Users Helped", icon: <People /> },
    { number: "2.5M+", label: "Meals Optimized", icon: <HealthAndSafety /> },
    { number: "$850K", label: "Money Saved", icon: <AttachMoney /> },
    { number: "95%", label: "User Satisfaction", icon: <TrendingUp /> }
];

export default function ProjectBenefitsSection() {
    const theme = useTheme();

    return (
        <Box sx={{ py: 8 }}>
            <Container maxWidth="lg">
                {/* Main Project Description */}
                <Box textAlign="center" mb={8}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            mb: 3,
                            background: theme.palette.gradient?.primary || 'linear-gradient(45deg, #ff6b35, #f7931e)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        What is Fine Dining?
                    </Typography>
                    <Typography variant="h5" color="text.secondary" maxWidth="900px" mx="auto" mb={4}>
                        Fine Dining is an AI-powered nutrition optimization platform that revolutionizes 
                        how people and organizations approach meal planning. We combine cutting-edge 
                        algorithms with nutritional science to deliver personalized, cost-effective, 
                        and health-focused meal solutions.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" maxWidth="800px" mx="auto">
                        Our mission is to make optimal nutrition accessible to everyone by removing the 
                        complexity of meal planning while maximizing health benefits and minimizing costs.
                    </Typography>
                </Box>

                {/* Core Features */}
                <Grid container spacing={4} mb={8}>
                    {projectFeatures.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={feature.title}>
                            <Card
                                sx={{
                                    height: '100%',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease',
                                    animation: `${slideInUp} 0.6s ease-out ${index * 0.1}s both`,
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: theme.shadows[10],
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 4 }}>
                                    <Avatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            mx: 'auto',
                                            mb: 3,
                                            backgroundColor: feature.color,
                                            '& .MuiSvgIcon-root': {
                                                fontSize: '2.5rem',
                                            },
                                        }}
                                    >
                                        {feature.icon}
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="bold" mb={2}>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Impact Statistics */}
                <Paper
                    sx={{
                        p: 6,
                        mb: 8,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
                        borderRadius: 4,
                    }}
                >
                    <Typography variant="h3" textAlign="center" fontWeight="bold" mb={4}>
                        Our Impact
                    </Typography>
                    <Grid container spacing={4}>
                        {impactStats.map((stat, index) => (
                            <Grid item xs={6} md={3} key={stat.label}>
                                <Box textAlign="center">
                                    <Avatar
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            mx: 'auto',
                                            mb: 2,
                                            backgroundColor: theme.palette.primary.main,
                                        }}
                                    >
                                        {stat.icon}
                                    </Avatar>
                                    <Typography variant="h3" fontWeight="800" color="primary.main">
                                        {stat.number}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {stat.label}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>

                {/* Individual vs Organization Benefits */}
                <Grid container spacing={6} mb={8}>
                    {/* Individual Benefits */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%', p: 4 }}>
                            <Box display="flex" alignItems="center" mb={3}>
                                <Avatar
                                    sx={{
                                        backgroundColor: theme.palette.success.main,
                                        mr: 2,
                                    }}
                                >
                                    <People />
                                </Avatar>
                                <Typography variant="h4" fontWeight="bold">
                                    For Individuals
                                </Typography>
                            </Box>
                            <Typography variant="body1" color="text.secondary" mb={3}>
                                Take control of your nutrition with personalized, science-backed meal plans 
                                that fit your lifestyle, budget, and health goals.
                            </Typography>
                            <List>
                                {individualBenefits.map((benefit, index) => (
                                    <ListItem key={index} sx={{ py: 0.5 }}>
                                        <ListItemIcon>
                                            <CheckCircle color="success" />
                                        </ListItemIcon>
                                        <ListItemText primary={benefit} />
                                    </ListItem>
                                ))}
                            </List>
                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                sx={{ mt: 3 }}
                            >
                                Start Your Journey
                            </Button>
                        </Card>
                    </Grid>

                    {/* Organization Benefits */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ height: '100%', p: 4 }}>
                            <Box display="flex" alignItems="center" mb={3}>
                                <Avatar
                                    sx={{
                                        backgroundColor: theme.palette.primary.main,
                                        mr: 2,
                                    }}
                                >
                                    <Business />
                                </Avatar>
                                <Typography variant="h4" fontWeight="bold">
                                    For Organizations
                                </Typography>
                            </Box>
                            <Typography variant="body1" color="text.secondary" mb={3}>
                                Scale nutrition optimization across your organization. Perfect for hospitals, 
                                schools, corporate cafeterias, and wellness programs.
                            </Typography>
                            <List>
                                {organizationBenefits.map((benefit, index) => (
                                    <ListItem key={index} sx={{ py: 0.5 }}>
                                        <ListItemIcon>
                                            <CheckCircle color="primary" />
                                        </ListItemIcon>
                                        <ListItemText primary={benefit} />
                                    </ListItem>
                                ))}
                            </List>
                            <Button
                                variant="outlined"
                                size="large"
                                fullWidth
                                sx={{ mt: 3 }}
                            >
                                Contact Sales
                            </Button>
                        </Card>
                    </Grid>
                </Grid>

                {/* Call to Action */}
                <Paper
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        background: theme.palette.gradient?.hero || 'linear-gradient(135deg, #ff6b35, #f7931e)',
                        color: 'white',
                        borderRadius: 4,
                    }}
                >
                    <Typography variant="h3" fontWeight="bold" mb={2}>
                        Ready to Transform Your Nutrition?
                    </Typography>
                    <Typography variant="h6" mb={4} sx={{ opacity: 0.9 }}>
                        Join thousands of users who have already improved their health and saved money 
                        with Fine Dining's AI-powered meal optimization.
                    </Typography>
                    <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                backgroundColor: 'white',
                                color: theme.palette.primary.main,
                                '&:hover': {
                                    backgroundColor: 'grey.100',
                                },
                            }}
                        >
                            Get Started Free
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            sx={{
                                borderColor: 'white',
                                color: 'white',
                                '&:hover': {
                                    borderColor: 'white',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                },
                            }}
                        >
                            Learn More
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}