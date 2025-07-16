import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { useAuth } from '@/context/AuthContext';
import { CircularProgress } from '@mui/material';
import UserProgress from '@/components/Analytics/UserProgress';

const GET_USER_RESULTS = gql`
  query GetUserResults($userId: ID!) {
    getUserQuestionResults(userId: $userId) {
      questionId
      correct
    }
  }
`;

export default function AnalyticsPage() {
    const { user } = useAuth();
    const { data, loading } = useQuery(GET_USER_RESULTS, {
        variables: { userId: user?.id },
        skip: !user?.id,
        fetchPolicy: 'network-only',
    });

    if (!user) return null;
    if (loading) return <CircularProgress />;

    return <UserProgress results={data?.getUserQuestionResults || []} />;
}
