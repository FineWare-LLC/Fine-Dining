import React from 'react';
import { Container, Typography } from '@mui/material';
import MainLayout from '../components/Layout/MainLayout';

export default function AdminPage() {
    return (
        <MainLayout title="Admin">
            <Container>
                <Typography variant="h4">Admin Dashboard (Simplified)</Typography>
            </Container>
        </MainLayout>
    );
}
