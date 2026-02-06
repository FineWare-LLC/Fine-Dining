/**
 * Landing Page - Fine Dining home page
 * Uses dynamic import to avoid SSR issues
 */
import dynamic from 'next/dynamic';
import React from 'react';
import Head from 'next/head';

// Dynamically import the landing content with SSR disabled
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

export default function LandingPage() {
    return (
        <>
            <Head>
                <title>Fine Dining - Smart Meal Planning</title>
                <meta name="description" content="Optimize your meals with AI-powered nutrition planning" />
            </Head>
            <SignInContent />
        </>
    );
}
