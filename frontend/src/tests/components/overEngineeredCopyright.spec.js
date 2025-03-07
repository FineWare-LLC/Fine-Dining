/***************************************************************
 * File: tests/OverEngineeredCopyright.spec.jsx
 * Description: A Playwright *component test* suite containing
 *              20 thorough tests for the OverEngineeredCopyright
 *              React component.
 *
 * Pre-requisites:
 *  1. Playwright >= 1.30 with experimental-ct-react
 *  2. A Next.js or React project containing:
 *     - OverEngineeredCopyright.jsx
 *     - GraphQL set up with Apollo Client
 *  3. @apollo/client/testing for mocking GraphQL queries
 *
 * Usage (example):
 *  npx playwright test --config=playwright-ct.config.js
 ***************************************************************/

import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';
import { MockedProvider } from '@apollo/client/testing';
import OverEngineeredCopyright from "@/components/Footer/Simple Info/CopyWright";

// We’ll need to import the actual GraphQL query our component uses:

/**
 * Example Mocks
 * ---------------------------------------------------------
 * 1. SUCCESS_MOCK: returns getYear = 2099
 * 2. ERROR_MOCK: simulates a GraphQL failure
 * 3. CUSTOM_YEAR_MOCK: returns getYear = 2025, for demonstration
 */
const SUCCESS_MOCK = [
    {
        request: {
            query: GET_CURRENT_YEAR,
        },
        result: {
            data: {
                getYear: 2099,
            },
        },
    },
];

const ERROR_MOCK = [
    {
        request: {
            query: GET_CURRENT_YEAR,
        },
        error: new Error('Mocked GraphQL error'),
    },
];

const CUSTOM_YEAR_MOCK = [
    {
        request: {
            query: GET_CURRENT_YEAR,
        },
        result: {
            data: {
                getYear: 2025,
            },
        },
    },
];

test.describe('OverEngineeredCopyright Component', () => {
    /***************************************************************
     * 01. Default Rendering
     ***************************************************************/
    test('Should render with default props and show "YourCompany" & current year', async ({ mount }) => {
        const thisYear = new Date().getFullYear();

        const component = await mount(
            <MockedProvider mocks={CUSTOM_YEAR_MOCK} addTypename={false}>
                <div data-testid="test-wrapper">
                    <h2>Test Wrapper</h2>
                    <CopyrightWrapper />
                </div>
            </MockedProvider>
        );

        async function CopyrightWrapper() {
            return <OverEngineeredCopyright />;
        }

        // Expect the component to contain the fallback text and the current year
        await expect(component).toContainText(String(thisYear));
        await expect(component).toContainText('YourCompany');
        await expect(component).toContainText('All rights reserved.');
    });

    /***************************************************************
     * 02. Custom Company Name
     ***************************************************************/
    test('Should display the correct custom company name', async ({ mount }) => {
        const component = await mount(
            <MockedProvider mocks={CUSTOM_YEAR_MOCK} addTypename={false}>
                <OverEngineeredCopyright companyName="ACME_Inc" />
            </MockedProvider>
        );

        await expect(component).toContainText('ACME_Inc');
    });

    /***************************************************************
     * 03. Start Year == Current Year
     ***************************************************************/
    test('Should display a single year if startYear == currentYear', async ({ mount }) => {
        const thisYear = new Date().getFullYear();

        const component = await mount(
            <MockedProvider mocks={CUSTOM_YEAR_MOCK} addTypename={false}>
                <OverEngineeredCopyright startYear={thisYear} />
            </MockedProvider>
        );

        // Should display just "xxxx" if startYear == currentYear
        await expect(component).toContainText(String(thisYear));
        await expect(component).not.toContainText('-');
    });

    /***************************************************************
     * 04. Start Year Less Than Current Year
     ***************************************************************/
    test('Should display a range "startYear - currentYear" if startYear < currentYear', async ({ mount }) => {
        const thisYear = new Date().getFullYear();
        const startYear = thisYear - 5;

        const component = await mount(
            <MockedProvider mocks={CUSTOM_YEAR_MOCK} addTypename={false}>
                <OverEngineeredCopyright startYear={startYear} />
            </MockedProvider>
        );

        await expect(component).toContainText(`${startYear} - ${thisYear}`);
    });

    /***************************************************************
     * 05. Start Year > Current Year (unusual scenario)
     ***************************************************************/
    test('Should handle an unusual future startYear gracefully', async ({ mount }) => {
        const thisYear = new Date().getFullYear();
        const futureYear = thisYear + 2;

        const component = await mount(
            <MockedProvider mocks={CUSTOM_YEAR_MOCK} addTypename={false}>
                <OverEngineeredCopyright startYear={futureYear} />
            </MockedProvider>
        );

        // We expect it to display "futureYear" outright,
        // though the logic is up to the component.
        await expect(component).toContainText(String(futureYear));
    });

    /***************************************************************
     * 06. Override Year
     ***************************************************************/
    test('Should prioritize overrideYear over actual current year', async ({ mount }) => {
        const component = await mount(
            <MockedProvider mocks={CUSTOM_YEAR_MOCK} addTypename={false}>
                <OverEngineeredCopyright overrideYear={2028} />
            </MockedProvider>
        );

        await expect(component).toContainText('2028');
    });

    /***************************************************************
     * 07. Fallback Year
     ***************************************************************/
    test('Should display fallbackYear if GraphQL or override is not available', async ({ mount }) => {
        // We'll use the error mock to simulate GraphQL failure
        const component = await mount(
            <MockedProvider mocks={ERROR_MOCK} addTypename={false}>
                <OverEngineeredCopyright fallbackYear={2030} />
            </MockedProvider>
        );

        // Should show 2030 instead of the actual year because GET_CURRENT_YEAR failed
        await expect(component).toContainText('2030');
    });

    /***************************************************************
     * 08. Override vs. Fallback Priority
     ***************************************************************/
    test('Should prioritize overrideYear over fallbackYear', async ({ mount }) => {
        const component = await mount(
            <MockedProvider mocks={ERROR_MOCK} addTypename={false}>
                <OverEngineeredCopyright overrideYear={2040} fallbackYear={2050} />
            </MockedProvider>
        );

        await expect(component).toContainText('2040');
        await expect(component).not.toContainText('2050');
    });

    /***************************************************************
     * 09. No Message Provided
     ***************************************************************/
    test('Should display default message "All rights reserved." if none is provided', async ({ mount }) => {
        const component = await mount(
            <MockedProvider mocks={CUSTOM_YEAR_MOCK} addTypename={false}>
                <OverEngineeredCopyright />
            </MockedProvider>
        );
        await expect(component).toContainText('All rights reserved.');
    });

    /***************************************************************
     * 10. Custom Message
     ***************************************************************/
    test('Should display custom message when provided', async ({ mount }) => {
        const customMessage = 'All rights somewhat reserved.';
        const component = await mount(
            <MockedProvider mocks={CUSTOM_YEAR_MOCK} addTypename={false}>
                <OverEngineeredCopyright message={customMessage} />
            </MockedProvider>
        );
        await expect(component).toContainText(customMessage);
    });

    /***************************************************************
     * 11. GraphQL Year Fetch Success
     ***************************************************************/
    test('Should display the year from GraphQL if successful', async ({ mount }) => {
        // By default, our SUCCESS_MOCK returns 2099
        const component = await mount(
            <MockedProvider mocks={SUCCESS_MOCK} addTypename={false}>
                <OverEngineeredCopyright />
            </MockedProvider>
        );

        // Wait a moment for the Apollo query to resolve
        await expect(component).toContainText('2099');
    });

    /***************************************************************
     * 12. GraphQL Year Fetch Failure
     ***************************************************************/
    test('Should gracefully fallback if GraphQL query fails', async ({ mount }) => {
        // We provide a fallbackYear to handle the error scenario
        const component = await mount(
            <MockedProvider mocks={ERROR_MOCK} addTypename={false}>
                <OverEngineeredCopyright fallbackYear={2100} />
            </MockedProvider>
        );
        // Should show fallbackYear since the query fails
        await expect(component).toContainText('2100');
    });

    /***************************************************************
     * 13. Style Check - Footer Container
     ***************************************************************/
    test('Should apply dashed border, center alignment, and background color', async ({ mount }) => {
        const component = await mount(
            <MockedProvider mocks={SUCCESS_MOCK} addTypename={false}>
                <OverEngineeredCopyright />
            </MockedProvider>
        );

        // Query the 'footer' in the rendered output
        const footer = await component.locator('footer');

        // Evaluate styles
        const borderStyle = await footer.evaluate((el) => getComputedStyle(el).borderStyle);
        const textAlign = await footer.evaluate((el) => getComputedStyle(el).textAlign);
        const backgroundColor = await footer.evaluate((el) => getComputedStyle(el).backgroundColor);

        expect(borderStyle).toBe('dashed');
        expect(textAlign).toBe('center');
        expect(backgroundColor).toMatch(/f7f7f7|rgb\(247,\s*247,\s*247\)/i);
    });

    /***************************************************************
     * 14. Style Check - Italic Message
     ***************************************************************/
    test('Should ensure italic styling on the message text', async ({ mount }) => {
        const component = await mount(
            <MockedProvider mocks={SUCCESS_MOCK} addTypename={false}>
                <OverEngineeredCopyright message="Check Italic" />
            </MockedProvider>
        );

        const messageDiv = component.locator('footer div >> nth=1'); // second div in the footer
        const fontStyle = await messageDiv.evaluate((el) => getComputedStyle(el).fontStyle);
        expect(fontStyle).toBe('italic');
    });

    /***************************************************************
     * 15. Minimal Props
     ***************************************************************/
    test('Should handle minimal props (no companyName, no startYear, no message) without error', async ({ mount }) => {
        const component = await mount(
            <MockedProvider mocks={SUCCESS_MOCK} addTypename={false}>
                <OverEngineeredCopyright />
            </MockedProvider>
        );

        await expect(component).toBeVisible();
        // Expect fallback text for company
        await expect(component).toContainText('YourCompany');
    });

    /***************************************************************
     * 16. Invalid Props (Negative Years)
     ***************************************************************/
    test('Should handle negative years gracefully (no crash)', async ({ mount }) => {
        const component = await mount(
            <MockedProvider mocks={SUCCESS_MOCK} addTypename={false}>
                <OverEngineeredCopyright startYear={-10} overrideYear={-100} />
            </MockedProvider>
        );

        await expect(component).toBeVisible();
        // The component might display negative years or fallback.
        // Just ensure it doesn't blow up or show 'undefined'.
        await expect(component).not.toContainText('undefined');
    });

    /***************************************************************
     * 17. Snapshot Test
     ***************************************************************/
    test('Should match the visual snapshot for default state', async ({ mount }) => {
        const component = await mount(
            <MockedProvider mocks={SUCCESS_MOCK} addTypename={false}>
                <OverEngineeredCopyright />
            </MockedProvider>
        );

        expect(await component.screenshot()).toMatchSnapshot('overengineered-default.png');
    });

    /***************************************************************
     * 18. SSR-Like Behavior Check
     * (While true SSR tests might be separate, we can at least
     *  confirm that initial render does not break.)
     ***************************************************************/
    test('Should render content on initial mount without waiting for client side', async ({ mount }) => {
        const component = await mount(
            <MockedProvider mocks={SUCCESS_MOCK} addTypename={false}>
                <OverEngineeredCopyright />
            </MockedProvider>
        );

        // We can at least confirm the fallback year or default text is initially visible
        const thisYear = new Date().getFullYear().toString();
        await expect(component).toContainText(thisYear);
    });

    /***************************************************************
     * 19. Complex Prop Combos
     ***************************************************************/
    test('Should handle multiple prop combos: startYear, overrideYear, fallbackYear, message', async ({ mount }) => {
        const component = await mount(
            <MockedProvider mocks={ERROR_MOCK} addTypename={false}>
                <OverEngineeredCopyright
                    companyName="OverkillCo"
                    startYear={1999}
                    overrideYear={2025}
                    fallbackYear={1900}
                    message="Complex Props Test"
                />
            </MockedProvider>
        );

        // Because overrideYear is 2025, it should appear instead of the actual or fallback
        await expect(component).toContainText('1999 - 2025');
        await expect(component).toContainText('OverkillCo');
        await expect(component).toContainText('Complex Props Test');
    });

    /***************************************************************
     * 20. Extreme Overengineering
     ***************************************************************/
    test('Should still function smoothly despite all the extra logic', async ({ mount }) => {
        const component = await mount(
            <MockedProvider mocks={SUCCESS_MOCK} addTypename={false}>
                <OverEngineeredCopyright
                    companyName="ExtremeInc"
                    startYear={1980}
                    overrideYear={2088}
                    fallbackYear={2022}
                    message="Final Overkill"
                />
            </MockedProvider>
        );

        // The success mock will return 2099, but overrideYear is 2088, so that wins
        await expect(component).toContainText('1980 - 2088');
        await expect(component).toContainText('ExtremeInc');
        await expect(component).toContainText('Final Overkill');
    });
});
