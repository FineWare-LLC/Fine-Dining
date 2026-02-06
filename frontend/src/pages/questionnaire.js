/**
 * Questionnaire Page - User onboarding questionnaire
 * Uses dynamic import to avoid SSR issues
 */
import dynamic from 'next/dynamic';
import React from 'react';
import Head from 'next/head';

// Dynamically import the actual component with SSR disabled
const QuestionnaireWizard = dynamic(
    () => import('@/components/Questionnaire/QuestionnaireWizard'),
    { 
        ssr: false,
        loading: () => (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
                Loading questionnaire...
            </div>
        )
    }
);

export default function QuestionnairePage() {
    return (
        <>
            <Head>
                <title>Questionnaire - Fine Dining</title>
            </Head>
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
                <QuestionnaireWizard />
            </div>
        </>
    );
}
