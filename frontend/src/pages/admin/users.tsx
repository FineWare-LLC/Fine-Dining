// @ts-nocheck
import Head from 'next/head';
import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserManagement from '@/components/legacy/Admin/UserManagement';

export default function AdminUsersPage() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <Head>
                <title>Admin Users - Control Center</title>
            </Head>
            <UserManagement />
        </ProtectedRoute>
    );
}
