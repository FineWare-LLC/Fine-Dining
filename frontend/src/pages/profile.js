import React from 'react';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { gql, useQuery } from '@apollo/client';
import QuestionnaireWizard from '../components/Questionnaire/QuestionnaireWizard';
import ProfileDetails from '../components/Profile/ProfileDetails';
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
      createdAt
      avatarUrl
    }
  }
`;

export default function ProfilePage() {
  const { user } = useAuth();
  const { data, loading, error } = useQuery(GET_USER, {
    skip: !user,
    variables: { id: user?.id },
    fetchPolicy: 'network-only'
  });

  return (
    <Container maxWidth="sm" className={styles.container}>
      <Typography variant="h5" gutterBottom className={styles.heading}>
        Profile
      </Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">Failed to load profile.</Alert>}
      {data?.getUser && <ProfileDetails user={data.getUser} />}
      <Typography variant="body1" className={styles.description} sx={{ mt: 3 }}>
        Update your preferences below.
      </Typography>
      <Box>
        <QuestionnaireWizard />
      </Box>
    </Container>
  );
}
