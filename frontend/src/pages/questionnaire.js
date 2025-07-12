import { Container } from '@mui/material';
import React from 'react';
import QuestionnaireWizard from '../components/Questionnaire/QuestionnaireWizard';

export default function QuestionnairePage() {
    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <QuestionnaireWizard />
        </Container>
    );
}
