import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import QuestionnaireWizard from '../components/Questionnaire/QuestionnaireWizard';

export default function ProfilePage() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Profile
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Complete the questionnaire below to personalize your experience.
      </Typography>
      <Box>
        <QuestionnaireWizard />
      </Box>
    </Container>
  );
}
