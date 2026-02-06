/**
 * Create Account Page - User registration
 * Uses dynamic import to avoid SSR issues
 */
import dynamic from 'next/dynamic';
import React from 'react';
import Head from 'next/head';

// Dynamically import the actual component with SSR disabled
const CreateAccountForm = dynamic(
    () => import('@/components/CreateAccountForm'),
    { 
        ssr: false,
        loading: () => (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
                Loading...
            </div>
        )
    }
);

export default function CreateAccountPage() {
    return (
        <>
            <Head>
                <title>Create Account - Fine Dining</title>
            </Head>
            <CreateAccountForm />
        </>
    );
}
