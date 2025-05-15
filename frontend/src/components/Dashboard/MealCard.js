/**
 * Full‑bleed hero image card for the day’s meal.
 */
import React from 'react';
import { Card, CardMedia, CardContent, Typography, Box } from '@mui/material';

export default function MealCard({ meal }) {
  if (!meal) return null;
  return (
    <Card sx={{ mt:2, borderRadius:2, overflow:'hidden' }}>
      <CardMedia component="img" height="160" image={meal.imageUrl} alt={meal.title} />
      <CardContent>
        <Typography variant="h6">{meal.title}</Typography>
        <Box display="flex" gap={1}>
          {meal.tags.map(t => (
            <Typography key={t} variant="caption" sx={{ bgcolor:'brand.surface', px:1, borderRadius:1 }}>
              {t}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}