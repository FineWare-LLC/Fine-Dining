/**
 * Greeting banner with teal background and rounded corners.
 */
import React from 'react';
import { Box, Typography } from '@mui/material';

export default function GreetingSegment({ userName='Guest' }) {
  return (
    <Box
      className="rounded-section"
      sx={{ bgcolor:'secondary.main', color:'#fff', p:2, borderRadius:3, mt:1 }}
    >
      <Typography variant="h5" fontWeight={600}>Hi {userName}!</Typography>
      <Typography variant="body2">Ready for today’s culinary adventure?</Typography>
    </Box>
  );
}