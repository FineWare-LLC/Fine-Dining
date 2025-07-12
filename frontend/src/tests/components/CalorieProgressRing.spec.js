import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import CalorieProgressRing from '../../components/Profile/CalorieProgressRing';

const DAILY = 2000;

test.describe('CalorieProgressRing', () => {
    test('0% progress', async ({ mount }) => {
        const component = await mount(<CalorieProgressRing dailyCalories={DAILY} consumed={0} />);
        const circle = component.locator('circle').nth(1);
        await expect(circle).toHaveAttribute('stroke', '#10B981');
        await expect(component).toHaveAttribute('title', `0 kcal of ${DAILY} kcal`);
    });

    test('50% progress', async ({ mount }) => {
        const component = await mount(<CalorieProgressRing dailyCalories={DAILY} consumed={1000} />);
        const circle = component.locator('circle').nth(1);
        await expect(circle).toHaveAttribute('stroke', '#10B981');
        await expect(component).toHaveAttribute('title', `1000 kcal of ${DAILY} kcal`);
    });

    test('over 100% progress', async ({ mount }) => {
        const component = await mount(<CalorieProgressRing dailyCalories={DAILY} consumed={2500} />);
        const circle = component.locator('circle').nth(1);
        await expect(circle).toHaveAttribute('stroke', '#F43F5E');
        await expect(component).toHaveAttribute('title', `2500 kcal of ${DAILY} kcal`);
    });
});
