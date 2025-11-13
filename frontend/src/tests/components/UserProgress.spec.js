import { test, expect } from '@playwright/experimental-ct-react';
import React from 'react';
import UserProgress from '../../components/Analytics/UserProgress';
import { mountWithGuard } from '../utils/mountWithGuard';

test('shows improvement only for unseen questions', async ({ mount, page }) => {
    const results = [
        { questionId: 1, correct: false },
        { questionId: 2, correct: false },
        { questionId: 1, correct: true },
        { questionId: 3, correct: true },
        { questionId: 4, correct: true },
    ];
    const component = await mountWithGuard(page, mount, <UserProgress results={results} />);
    await expect(component.getByTestId('improvement')).toHaveText('100% improvement');
});
