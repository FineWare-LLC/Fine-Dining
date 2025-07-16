import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'fs/promises';

// Verify that handleAddMeals uses the configured default meal type

test('handleAddMeals sends configured meal type', async () => {
    const createMeal = (...args) => {
        createMeal.calls.push(args);
        return Promise.resolve({});
    };
    createMeal.calls = [];

    const reactUrl = 'data:text/javascript;base64,' + Buffer.from(
        'export const useState=v=>[v,()=>{}];export const useCallback=f=>f;'
    ).toString('base64');
    const apolloCode = `export const gql=()=>{};let c=0;export function useMutation(){c++;return c===1?[async()=>{},{}]:[globalThis.__createMeal];}`;
    const apolloUrl = 'data:text/javascript;base64,' + Buffer.from(apolloCode).toString('base64');
    const gqlUrl = 'data:text/javascript;base64,' + Buffer.from('export const CreateMealDocument={};').toString('base64');

    let src = await readFile(new URL('../../hooks/useMealOptimization.js', import.meta.url), 'utf8');
    src = src.replace("'react'", `'${reactUrl}'`)
             .replace("'@apollo/client'", `'${apolloUrl}'`)
             .replace("'@/gql/graphql'", `'${gqlUrl}'`);

    globalThis.__createMeal = createMeal;
    const hookUrl = 'data:text/javascript;base64,' + Buffer.from(src).toString('base64') + `#${Date.now()}`;
    const { useMealOptimization } = await import(hookUrl);

    const { handleAddMeals } = useMealOptimization({ defaultMealType: 'LUNCH' });
    const meal = { mealName: 'A', price: 5, nutrition: {}, allergens: [] };
    await handleAddMeals([meal], 'plan');

    const vars = createMeal.calls[0][0].variables;
    assert.equal(vars.mealType, 'LUNCH');
    delete globalThis.__createMeal;
});
