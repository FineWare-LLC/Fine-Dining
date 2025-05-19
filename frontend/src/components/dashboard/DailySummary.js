/**
 * One‑glance daily nutrition / calorie summary card.
 */
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

export default function DailySummary({ meal }) {
  if (!meal) return null;
  return (
    <Card elevation={0} sx={{ borderWidth:1.5, borderStyle:'solid', borderColor:'accent.main', mt:2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Today’s Featured Meal</Typography>
        <Typography variant="body1">{meal.title}</Typography>
        <Typography variant="caption" color="text.secondary">
          {meal.calories} cal • {meal.protein} g protein
        </Typography>
      </CardContent>
    </Card>
  );
}
