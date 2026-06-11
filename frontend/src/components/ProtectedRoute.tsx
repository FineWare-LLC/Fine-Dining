// @ts-nocheck
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { buildProtectedRouteFeedbackState, resolveProtectedRouteState } from '@/context/authUtils';
import ProtectedRouteFeedback from './ProtectedRouteFeedback';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading, isAuthenticated, sessionNotice } = useAuth();
    const router = useRouter();
    const routeState = resolveProtectedRouteState({
        loading,
        isAuthenticated,
        userRole: user?.role,
        allowedRoles,
        sessionNotice,
    });

    useEffect(() => {
        if (routeState.state === 'redirect' && routeState.redirectTo) {
            router.push(routeState.redirectTo).catch(() => {});
        }
        if (routeState.state === 'error' && routeState.redirectTo) {
            router.push(routeState.redirectTo).catch(() => {});
        }
    }, [routeState.state, routeState.redirectTo, router]);

    if (routeState.canRender) {
        return children;
    }

    return <ProtectedRouteFeedback feedback={buildProtectedRouteFeedbackState(routeState)} />;
}
