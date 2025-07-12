import { test, expect } from '@playwright/experimental-ct-react';
import { SummaryStep } from '../../components/Questionnaire/QuestionnaireWizard';

const sample = {
    gender: 'male',
    otherGender: '',
    height: 180,
    weight: 75,
    system: 'metric',
    goal: 'maintain',
    desired: 0,
};

test('renders summary definition list in order', async ({ mount }) => {
    const component = await mount(<SummaryStep data={sample} onBack={() => {}} />);
    const dts = component.locator('dl dt');
    const dds = component.locator('dl dd');
    await expect(dts).toHaveCount(5);
    await expect(dds).toHaveCount(5);
    await expect(component.locator('dl dt + dd')).toHaveCount(5);
});

