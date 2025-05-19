import React from 'react';
import { Card, CardContent, Avatar, Typography, Grid } from '@mui/material';
import EditableField from './EditableField';

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
            <EditableField
              label="Weight"
              field="weight"
              value={user.weight}
              unit={weightUnit}
              userId={user.id}
              measurementSystem={user.measurementSystem}
            />
          </Grid>
          <Grid item xs={6}>
            <EditableField
              label="Height"
              field="height"
              value={user.height}
              unit={heightUnit}
              userId={user.id}
              measurementSystem={user.measurementSystem}
            />
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
