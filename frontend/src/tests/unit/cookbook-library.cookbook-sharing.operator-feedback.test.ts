// @ts-nocheck
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const cookbookPagePath = fileURLToPath(new URL('../../pages/cookbook.tsx', import.meta.url));
const recipesPagePath = fileURLToPath(new URL('../../pages/recipes.tsx', import.meta.url));
const cookbookFeedbackPath = fileURLToPath(new URL('../../utils/cookbookFeedback.ts', import.meta.url));

const cookbookPageSource = fs.readFileSync(cookbookPagePath, 'utf8');
const recipesPageSource = fs.readFileSync(recipesPagePath, 'utf8');
const cookbookFeedbackSource = fs.readFileSync(cookbookFeedbackPath, 'utf8');

test('cookbook sharing pages announce the resolved state without shifting layout shells', () => {
    assert.match(cookbookFeedbackSource, /COOKBOOK_LIBRARY_RESOLVED_MESSAGE = 'Cookbooks loaded\.'/);
    assert.match(cookbookPageSource, /cookbookFeedback\.state === 'resolved'/);
    assert.match(cookbookPageSource, /sx=\{srOnly\}/);
    assert.match(cookbookPageSource, /COOKBOOK_LIBRARY_RESOLVED_MESSAGE/);
    assert.match(recipesPageSource, /cookbookFeedback\.state === 'resolved'/);
    assert.match(recipesPageSource, /sx=\{srOnly\}/);
    assert.match(recipesPageSource, /COOKBOOK_LIBRARY_RESOLVED_MESSAGE/);
});
