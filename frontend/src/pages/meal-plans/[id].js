/**
 * Meal Plan Detail Page - Dynamic route for individual meal plans
 * Uses dynamic import to avoid SSR issues
 */
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the actual component with SSR disabled
const MealPlanDetail = dynamic(
    () => import('@/components/MealPlanDetail'),
    { 
        ssr: false,
        loading: () => (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
                Loading...
            </div>
        )
    }
);

export default function MealPlanDetailPage() {
    return <MealPlanDetail />;
}
