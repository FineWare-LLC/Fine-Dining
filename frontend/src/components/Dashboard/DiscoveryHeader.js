/**
 * Section header for the restaurant discovery list.
 */
import { Typography } from '@mui/material';
import React from 'react';

export default function DiscoveryHeader() {
    return (
        <Typography variant="h6" fontWeight={600} sx={{ mt:3 }}>
      Discover Nearby Eats
        </Typography>
    );
}