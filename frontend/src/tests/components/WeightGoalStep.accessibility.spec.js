import { test, expect } from '@playwright/experimental-ct-react';
import { WeightGoalStep } from '../../components/Questionnaire/QuestionnaireWizard';

const noop = () => {};

test('info modal accessible with keyboard', async ({ mount, page }) => {
  const component = await mount(
    <WeightGoalStep data={{}} onChange={noop} onBack={noop} />
  );
  const info = component.getByLabel('Desired weight help');
  await info.focus();
  await expect(info).toBeFocused();
  await page.keyboard.press('Enter');
  const dialog = component.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const closeBtn = dialog.getByRole('button', { name: /close/i });
  await expect(closeBtn).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});
