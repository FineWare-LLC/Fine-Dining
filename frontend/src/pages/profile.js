import React from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import QuestionnaireWizard from '../components/Questionnaire/QuestionnaireWizard';
import ProfileDetails from '../components/Profile/ProfileDetails';
import ThemeToggle from '../components/ThemeToggle';
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

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { data, loading, error } = useQuery(GET_USER, {
    skip: !user,
    variables: { id: user?.id },
    fetchPolicy: 'network-only'
  });

  return (
    <Container maxWidth="sm" className={styles.container}>
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
      {data?.getUser && <ProfileDetails user={data.getUser} />}
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
