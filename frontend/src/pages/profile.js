import {gql, useApolloClient} from '@apollo/client';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Fade,
    Grid,
    Skeleton,
    Typography,
} from '@mui/material';
import {useQuery as useRQ} from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import {useRouter} from 'next/router';
import React, {useCallback, useEffect, useState} from 'react';
import ProfileEditor from '../components/Profile/ProfileEditor';
import QuestionnaireWizard from '../components/Questionnaire/QuestionnaireWizard';
import {useAuth} from '../context/AuthContext';
import styles from '@/styles/ProfilePage.module.css';

const ThemeToggle = dynamic(() => import('../components/ThemeToggle'), {ssr: false});
const AvatarUpload = dynamic(() => import('../components/Profile/AvatarUpload'), {ssr: false});
const ProfileDetails = dynamic(() => import('../components/Profile/ProfileDetails'), {ssr: false});

const GET_USER = gql`
    query GetUser($id: ID!) {
        getUser(id: $id) {
            id
            name
            email
            role
            accountStatus
            weight
            height
            gender
            measurementSystem
            dailyCalories
            avatarUrl
            createdAt
        }
    }
`;

const ProfileSkeleton = () => (<Box>
    <Skeleton variant="rectangular" width={80} height={32} sx={{mb: 2}}/>
    <Skeleton variant="text" width="40%" height={32}/>
    <Card elevation={0}
        sx={{mt: 2, borderColor: 'surface.light', borderWidth: 1, borderStyle: 'solid', borderRadius: 2}}>
        <CardContent>
            <Grid container spacing={2} alignItems="center">
                <Grid item>
                    <Skeleton variant="circular" width={64} height={64}/>
                </Grid>
                <Grid item xs>
                    <Skeleton variant="text" width="80%"/>
                    <Skeleton variant="text" width="60%"/>
                </Grid>
            </Grid>
            <Grid container spacing={1} sx={{mt: 2}}>
                {Array.from({length: 4}).map((_, i) => (<Grid item xs={6} key={i}>
                    <Skeleton variant="text" width="80%"/>
                    <Skeleton variant="text" width="60%"/>
                </Grid>))}
            </Grid>
        </CardContent>
    </Card>
    <Skeleton variant="text" width="80%" sx={{mt: 3}}/>
    <Skeleton variant="rectangular" width={120} height={36} sx={{mt: 2}}/>
</Box>);

export default function ProfilePage() {
    const router = useRouter();
    const {user, logout} = useAuth();
    const client = useApolloClient();

    const {
        data, isLoading, error,
    } = useRQ({
        queryKey: ['user', user?.id], queryFn: async () => {
            const {data} = await client.query({
                query: GET_USER, variables: {id: user.id}, fetchPolicy: 'network-only',
            });
            return data.getUser;
        }, enabled: !!user,
    });
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        if (data?.getUser) {
            setAvatarUrl(data.getUser.avatarUrl || '');
        }
    }, [data]);

    const handleUpload = useCallback(async (file) => {
        const localUrl = URL.createObjectURL(file);
        setAvatarUrl(localUrl);
        try {
            const res = await fetch('/api/profile/avatar', {
                method: 'POST', headers: {'Content-Type': file.type}, body: file,
            });
            const json = await res.json();
            if (json.url) setAvatarUrl(json.url);
        } catch (err) {
            console.error('Avatar upload failed', err);
            setAvatarUrl(data?.getUser?.avatarUrl || '');
        }
    }, [data]);

    const [showSkeleton, setShowSkeleton] = useState(true);
    useEffect(() => {
        let timer;
        if (!isLoading) {
            timer = setTimeout(() => setShowSkeleton(false), 400);
        } else {
            setShowSkeleton(true);
        }
        return () => clearTimeout(timer);
    }, [isLoading]);

    return (<Container maxWidth="sm" className={styles.container}>
        <Fade in={showSkeleton} timeout={{enter: 200, exit: 200}} unmountOnExit>
            <Box>
                <ProfileSkeleton/>
            </Box>
        </Fade>
        <Fade in={!showSkeleton} timeout={{enter: 200, exit: 200}} unmountOnExit>
            <Box>
                <Button
                    startIcon={<ArrowBackIcon/>}
                    onClick={() => router.back()}
                    size="small"
                    sx={{mb: 2}}
                >
                        Back
                </Button>
                <Typography variant="h5" gutterBottom className={styles.heading}>
                        Profile
                </Typography>
                {error && <Alert severity="error">Failed to load profile.</Alert>}
                {data && (
                    <>
                        {/* Profile Information Section */}
                        <Box className={styles.profileSection}>
                            <Typography variant="h6" className={styles.sectionTitle} 
                                sx={{ borderBottomColor: 'primary.main', color: 'text.primary' }}>
                                Profile Information
                            </Typography>
                            <Box className={styles.infoGrid}>
                                {/* Avatar and Basic Info Card */}
                                <Card className={styles.profileCard} 
                                    sx={{ 
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: 3
                                    }}>
                                    <CardContent>
                                        <Box className={styles.avatarSection}>
                                            <AvatarUpload
                                                user={{ name: data.name, avatarUrl }}
                                                onUpload={handleUpload}
                                            />
                                            <Box className={styles.userInfo}>
                                                <Typography className={styles.userName} 
                                                    sx={{ color: 'text.primary' }}>
                                                    {data.name}
                                                </Typography>
                                                <Typography className={styles.userEmail} 
                                                    sx={{ color: 'text.secondary' }}>
                                                    {data.email}
                                                </Typography>
                                                <Box className={styles.statusChips}>
                                                    <Chip
                                                        label={data.role}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: `role.${data.role.toLowerCase()}`,
                                                            color: 'common.white',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    <Chip
                                                        label={data.accountStatus}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: `state.${data.accountStatus.toLowerCase()}`,
                                                            color: 'common.white',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>

                                {/* Health & Preferences Card */}
                                <Card className={styles.profileCard} 
                                    sx={{ 
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: 3
                                    }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 600 }}>
                                            Health Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Weight
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                                    {data.weight ? `${data.weight} ${data.measurementSystem === 'IMPERIAL' ? 'lbs' : 'kg'}` : 'N/A'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Height
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                                    {data.height ? `${data.height} ${data.measurementSystem === 'IMPERIAL' ? 'in' : 'cm'}` : 'N/A'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Gender
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                                    {data.gender || 'N/A'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Daily Calories
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                                    {data.dailyCalories || 'N/A'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Member Since
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                                    {new Date(data.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Box>

                        {/* Settings Section */}
                        <Box className={styles.profileSection}>
                            <Typography variant="h6" className={styles.sectionTitle} 
                                sx={{ borderBottomColor: 'primary.main', color: 'text.primary' }}>
                                Preferences & Settings
                            </Typography>
                            <Card sx={{ 
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 3,
                                p: 2,
                                mb: 3
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                            Theme Preference
                                        </Typography>
                                        <ThemeToggle />
                                    </Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Choose between light and dark mode for better readability
                                    </Typography>
                                </CardContent>
                            </Card>
                            
                            <Typography variant="body1" className={styles.description} sx={{ color: 'text.primary' }}>
                                Update your dietary preferences and health information below.
                            </Typography>
                            <Box>
                                <QuestionnaireWizard/>
                            </Box>
                        </Box>

                        {/* Actions Section */}
                        <Box className={styles.actionSection}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={logout}
                                size="large"
                                sx={{ 
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 600,
                                    textTransform: 'none'
                                }}
                            >
                                Sign Out
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Fade>
    </Container>);
}
