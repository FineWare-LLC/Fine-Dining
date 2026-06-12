import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readSource = (relativePath) =>
    fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');

test('RecipeSwiper component sources remain present', () => {
    const recipeSwiperSource = readSource('../../components/RecipeSwiper/RecipeSwiper.js');
    const swipeCardSource = readSource('../../components/RecipeSwiper/SwipeCard.js');

    assert.match(recipeSwiperSource, /const RecipeSwiper/);
    assert.match(swipeCardSource, /const SwipeCard/);
});
