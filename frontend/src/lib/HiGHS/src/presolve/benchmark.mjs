import { readMeals, buildMealPlanModel } from '../solver/index.mjs';
import { run as presolve } from './index.mjs';

async function benchmark() {
    const data = await readMeals();
    const baseModel = buildMealPlanModel(data);
    const baseCols = baseModel.columnCount;

    const presolved = presolve(baseModel);
    const presCols = presolved.columnCount;

    console.log(`Variables before presolve: ${baseCols}`);
    console.log(`Variables after presolve : ${presCols}`);
}

benchmark().catch(err => {
    console.error('Benchmark failed:', err);
});
