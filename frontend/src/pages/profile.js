import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  Button,
  Skeleton,
  Fade,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router';
import { gql, useApolloClient } from '@apollo/client';
import { useQuery as useRQ } from '@tanstack/react-query';
import QuestionnaireWizard from '../components/Questionnaire/QuestionnaireWizard';
import ProfileDetails from '../components/Profile/ProfileDetails';
import ThemeToggle from '../components/ThemeToggle';
import ProfileEditor from '../components/Profile/ProfileEditor';
import AvatarUpload from '../components/Profile/AvatarUpload';
import { useAuth } from '../context/AuthContext';
import styles from '@/styles/ProfilePage.module.css';

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

const ProfileSkeleton = () => (
  <Box>
    <Skeleton variant="rectangular" width={80} height={32} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="40%" height={32} />
    <Card elevation={0} sx={{ mt: 2, borderColor: 'surface.light', borderWidth: 1, borderStyle: 'solid', borderRadius: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Skeleton variant="circular" width={64} height={64} />
          </Grid>
          <Grid item xs>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </Grid>
        </Grid>
        <Grid container spacing={1} sx={{ mt: 2 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={6} key={i}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
    <Skeleton variant="text" width="80%" sx={{ mt: 3 }} />
    <Skeleton variant="rectangular" width={120} height={36} sx={{ mt: 2 }} />
  </Box>
);

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const client = useApolloClient();

  const {
    data,
    isLoading,
    error,
  } = useRQ({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      const { data } = await client.query({
        query: GET_USER,
        variables: { id: user.id },
        fetchPolicy: 'network-only',
      });
      return data.getUser;
    },
    enabled: !!user,
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
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file
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

  return (
    <Container maxWidth="sm" className={styles.container}>
      <Fade in={showSkeleton} timeout={{ enter: 200, exit: 200 }} unmountOnExit>
        <Box>
          <ProfileSkeleton />
        </Box>
      </Fade>
      <Fade in={!showSkeleton} timeout={{ enter: 200, exit: 200 }} unmountOnExit>
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            size="small"
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          <Typography variant="h5" gutterBottom className={styles.heading}>
            Profile
          </Typography>
          {error && <Alert severity="error">Failed to load profile.</Alert>}
          {data && <ProfileDetails user={data} />}
          <Typography variant="body1" className={styles.description} sx={{ mt: 3 }}>
            Update your preferences below.
          </Typography>
          <Box>
            <QuestionnaireWizard />
          </Box>
          <Button
            variant="outlined"
            color="secondary"
            onClick={logout}
            sx={{ mt: 3 }}
          >
            Log Out
          </Button>
        </Box>
      </Fade>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        size="small"
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      <Typography variant="h5" gutterBottom className={styles.heading}>
        Profile
      </Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">Failed to load profile.</Alert>}
      {data?.getUser && (
        <>
          <ProfileDetails user={data.getUser} />
          <ProfileEditor user={data.getUser} />
        </>
      )}
      {data?.getUser && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AvatarUpload user={{ name: data.getUser.name, avatarUrl }} onUpload={handleUpload} />
          <ProfileDetails user={{ ...data.getUser, avatarUrl }} />
        </Box>
      )}
      <Typography variant="body1" className={styles.description} sx={{ mt: 3 }}>
        Update your preferences below.
      </Typography>
      <Box sx={{ my: 2 }}>
        <ThemeToggle />
      </Box>
      <Box>
        <QuestionnaireWizard />
      </Box>
      <Button
        variant="outlined"
        color="secondary"
        onClick={logout}
        sx={{ mt: 3 }}
      >
        Log Out
      </Button>
    </Container>
  );
}
