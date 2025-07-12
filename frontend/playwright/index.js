// playwright/index.js
import { beforeMount, afterMount } from '@playwright/experimental-ct-react/hooks';
import '../src/styles/globals.css'; // Adjust this path if your global CSS is elsewhere

// This file is used by Playwright to setup the React component testing environment

// You can add any global context providers here
beforeMount(async ({ App, component }) => {
    // You can wrap your components with context providers here
    return ({
        component,
    });
});

afterMount(async ({ page }) => {
    // You can add any cleanup or post-mount actions here
});