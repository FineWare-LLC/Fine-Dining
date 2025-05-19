import { test, expect } from '@playwright/experimental-ct-react';
import QuestionnaireWizard from '../../components/Questionnaire/QuestionnaireWizard';
import { mountWithGuard } from '../utils/mountWithGuard';

// Helper to focus first step button for keyboard navigation
async function focusStep(page, stepLocator) {
  await stepLocator.focus();
  await expect(stepLocator).toBeFocused();
}

test.describe('QuestionnaireWizard Stepper accessibility', () => {
  test('roving tabindex and arrow key navigation', async ({ mount, page }) => {
    const component = await mountWithGuard(page, mount, <QuestionnaireWizard />);
    const steps = component.locator('button');
    await expect(steps).toHaveCount(3);

    // Initial tabindex state
    await expect(steps.nth(0)).toHaveAttribute('tabindex', '0');
    await expect(steps.nth(1)).toHaveAttribute('tabindex', '-1');

    await focusStep(page, steps.nth(0));
    await page.keyboard.press('ArrowRight');
    await expect(steps.nth(1)).toBeFocused();
    await expect(steps.nth(1)).toHaveAttribute('tabindex', '0');
    await expect(steps.nth(0)).toHaveAttribute('tabindex', '-1');
  });

  test('enter key activates focused step and live region announces state', async ({ mount, page }) => {
    const component = await mountWithGuard(page, mount, <QuestionnaireWizard />);
    const steps = component.locator('button');
    const live = component.locator('[role="status"]');

    await focusStep(page, steps.nth(1));
    await page.keyboard.press('Enter');
    await expect(component.locator('li[aria-current="step"]')).toContainText('Weight Goal');
    await expect(live).toHaveText(/Step 2 of 3: Weight Goal/);

    await focusStep(page, steps.nth(0));
    await page.keyboard.press('ArrowLeft');
    // wrap-around should focus last step
    await expect(steps.nth(2)).toBeFocused();
    await page.keyboard.press('Space');
    await expect(component.locator('li[aria-current="step"]')).toContainText('Summary');
    await expect(live).toHaveText(/Step 3 of 3: Summary/);
  });
});
