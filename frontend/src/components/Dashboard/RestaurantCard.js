/**
 * Compact restaurant card with border‑elevation substitute.
 */
import React from 'react';
import { Card, CardContent, Typography, CardMedia } from '@mui/material';

export default function RestaurantCard({ restaurant, source }) {
  return (
    <Card
      elevation={0}
      sx={{ borderColor:'surface.light', borderWidth:1, borderStyle:'solid', borderRadius:2, mt:1 }}
    >
      <CardMedia
        component="img"
        height="100"
        image={restaurant.imageUrl || '/favicon.ico'}
        alt={restaurant.name}
      />
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600}>{restaurant.name}</Typography>
        {restaurant.vicinity && (
          <Typography variant="body2" color="text.secondary">{restaurant.vicinity}</Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          Rating: {restaurant.rating ?? 'N/A'}
        </Typography>
        {source && (
          <Typography variant="caption" color="text.secondary">
            Data source: {source === 'google' ? 'Google Places' : 'OpenStreetMap'}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}