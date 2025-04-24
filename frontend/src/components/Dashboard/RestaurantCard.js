/**
 * Compact restaurant card with border‑elevation substitute.
 */
import React from 'react';
import { Card, CardContent, Typography, CardMedia } from '@mui/material';

export default function RestaurantCard({ restaurant }) {
  return (
    <Card
      elevation={0}
      sx={{ borderColor:'surface.light', borderWidth:1, borderStyle:'solid', borderRadius:2, mt:1 }}
    >
      <CardMedia component="img" height="100" image={restaurant.imageUrl} alt={restaurant.name} />
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600}>{restaurant.name}</Typography>
        <Typography variant="body2" color="text.secondary">{restaurant.cuisine}</Typography>
      </CardContent>
    </Card>
  );
}