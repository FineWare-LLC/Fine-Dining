import React from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Grid,
  Box,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import HeightIcon from '@mui/icons-material/Height';
import WcIcon from '@mui/icons-material/Wc';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ProfileDetailItem from './ProfileDetailItem';

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

        <Box component="dl" sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
          <ProfileDetailItem
            icon={<WorkIcon fontSize="small" />}
            term="Role"
            definition={user.role}
            tooltip="User role"
          />
          <ProfileDetailItem
            icon={<VerifiedUserIcon fontSize="small" />}
            term="Status"
            definition={user.accountStatus}
            tooltip="Account status"
          />
        </Box>

        <Box component="dl" sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
          <ProfileDetailItem
            icon={<MonitorWeightIcon fontSize="small" />}
            term="Weight"
            definition={`${user.weight ?? 'N/A'} ${weightUnit}`}
            tooltip="Current weight"
          />
          <ProfileDetailItem
            icon={<HeightIcon fontSize="small" />}
            term="Height"
            definition={`${user.height ?? 'N/A'} ${heightUnit}`}
            tooltip="Current height"
          />
          <ProfileDetailItem
            icon={<WcIcon fontSize="small" />}
            term="Gender"
            definition={user.gender}
            tooltip="Gender identity"
          />
          <ProfileDetailItem
            icon={<LocalFireDepartmentIcon fontSize="small" />}
            term="Daily Calories"
            definition={user.dailyCalories ?? 'N/A'}
            tooltip="Daily calorie allowance"
          />
          <ProfileDetailItem
            icon={<CalendarTodayIcon fontSize="small" />}
            term="Joined"
            definition={joinDate}
            tooltip="Date joined"
          />
        </Box>
      </CardContent>
    </Card>
  );
}
