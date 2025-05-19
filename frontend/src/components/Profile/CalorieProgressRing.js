/**
 * @fileoverview CalorieProgressRing component
 */
import React, { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Box } from '@mui/material';

const GET_STATS_BY_USER = gql`
  query GetStatsByUser($userId: ID!) {
    getStatsByUser(userId: $userId) {
      id
      dateLogged
      caloriesConsumed
    }
  }
`;

/**
 * CalorieProgressRing component
 * @param {object} props
 * @returns {JSX.Element}
 */
export default function CalorieProgressRing({ userId, dailyCalories = 0, consumed }) {
  const { data } = useQuery(GET_STATS_BY_USER, {
    variables: { userId },
    fetchPolicy: 'network-only',
    skip: consumed !== undefined || !userId,
  });

  const todayCalories = useMemo(() => {
    if (consumed !== undefined) return consumed;
    if (!data?.getStatsByUser) return 0;
    const today = new Date().toDateString();
    return data.getStatsByUser
      .filter(s => new Date(s.dateLogged).toDateString() === today)
      .reduce((sum, s) => sum + (s.caloriesConsumed || 0), 0);
  }, [consumed, data]);

  const pct = dailyCalories ? (todayCalories / dailyCalories) * 100 : 0;
  const displayPct = Math.min(Math.max(pct, 0), 100);

  let color = '#10B981'; // emerald
  if (pct >= 70 && pct <= 100) color = '#F59E0B'; // amber
  if (pct > 100) color = '#F43F5E'; // rose

  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayPct / 100) * circumference;

  return (
    <Box title={`${todayCalories} kcal of ${dailyCalories} kcal`} sx={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
    </Box>
  );
}
