import React from 'react';
import { Container } from '@mui/material';
import QuestionnaireWizard from '../components/Questionnaire/QuestionnaireWizard';

export default function QuestionnairePage() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <QuestionnaireWizard />
    </Container>
  );
}
