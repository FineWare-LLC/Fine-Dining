/**
 * Sign In Page - User login
 * Uses dynamic import to avoid SSR issues
 */
import dynamic from 'next/dynamic';
import React from 'react';
import Head from 'next/head';

// Dynamically import the login content with SSR disabled
const SignInContent = dynamic(
    () => import('@/components/SignInContent'),
    { 
        ssr: false,
        loading: () => (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading...
            </div>
        )
    }
);

export default function SignInPage() {
    return (
        <>
            <Head>
                <title>Sign In - Fine Dining</title>
            </Head>
            <SignInContent />
        </>
    );
}
