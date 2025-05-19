import React from 'react';
import { Card, CardContent, Avatar, Typography, Grid, Chip } from '@mui/material';

export default function ProfileDetails({ user }) {
  if (!user) return null;
  const joinDate = new Date(user.createdAt).toLocaleDateString();
  const weightUnit = user.measurementSystem === 'IMPERIAL' ? 'lbs' : 'kg';
  const heightUnit = user.measurementSystem === 'IMPERIAL' ? 'in' : 'cm';
  return (
    <Card elevation={0} sx={{ borderColor: 'surface.light', borderWidth: 1, borderStyle: 'solid', borderRadius: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar src={user.avatarUrl} alt={user.name} sx={{ width: 64, height: 64 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h6" fontWeight={600}>{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item>
                <Chip
                  label={user.role}
                  aria-label={`User role: ${user.role}`}
                  sx={{
                    bgcolor: `role.${user.role.toLowerCase()}`,
                    color: 'common.white',
                    boxShadow: 1,
                    '@keyframes fadeIn': {
                      from: { opacity: 0 },
                      to: { opacity: 1 }
                    },
                    animation: 'fadeIn 0.3s ease-in'
                  }}
                />
              </Grid>
              <Grid item>
                <Chip
                  label={user.accountStatus}
                  aria-label={`User status: ${user.accountStatus}`}
                  sx={{
                    bgcolor: `state.${user.accountStatus.toLowerCase()}`,
                    color: 'common.white',
                    boxShadow: 1,
                    '@keyframes fadeIn': {
                      from: { opacity: 0 },
                      to: { opacity: 1 }
                    },
                    animation: 'fadeIn 0.3s ease-in'
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={1} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Role</Typography>
            <Typography variant="body2">{user.role}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Status</Typography>
            <Typography variant="body2">{user.accountStatus}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Weight</Typography>
            <Typography variant="body2">{user.weight ?? 'N/A'} {weightUnit}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Height</Typography>
            <Typography variant="body2">{user.height ?? 'N/A'} {heightUnit}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Gender</Typography>
            <Typography variant="body2">{user.gender}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Daily Calories</Typography>
            <Typography variant="body2">{user.dailyCalories ?? 'N/A'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Joined</Typography>
            <Typography variant="body2">{joinDate}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
