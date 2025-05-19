/**
 * Greeting banner with teal background and rounded corners.
 */
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/router';

export default function GreetingSegment({ userName='Guest' }) {
  const router = useRouter();
  return (
    <Box
      className="rounded-section"
      sx={{ bgcolor:'secondary.main', color:'#fff', p:2, borderRadius:3, mt:1 }}
    >
      <Typography variant="h5" fontWeight={600}>Hi {userName}!</Typography>
      <Typography variant="body2">Ready for today’s culinary adventure?</Typography>
      <Button
        variant="outlined"
        size="small"
        sx={{ mt: 1, color:'#fff', borderColor:'currentColor' }}
        onClick={() => router.push('/profile')}
      >
        View Profile
      </Button>
    </Box>
  );
}