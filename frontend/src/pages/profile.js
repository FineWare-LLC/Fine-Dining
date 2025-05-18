import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import QuestionnaireWizard from '../components/Questionnaire/QuestionnaireWizard';
import styles from '@/styles/ProfilePage.module.css';

export default function ProfilePage() {
  return (
    <Container maxWidth="sm" className={styles.container}>
      <Typography variant="h5" gutterBottom className={styles.heading}>
        Profile
      </Typography>
      <Typography variant="body1" className={styles.description}>
        Complete the questionnaire below to personalize your experience.
      </Typography>
      <Box>
        <QuestionnaireWizard />
      </Box>
    </Container>
  );
}
