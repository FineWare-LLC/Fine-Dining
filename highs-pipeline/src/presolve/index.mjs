import { boundTightening } from './boundTightening.mjs';
import { coefficientAggregation } from './coefficientAggregation.mjs';

export function run(model) {
    let result = boundTightening(model);
    result = coefficientAggregation(result);
    return result;
}

export { boundTightening, coefficientAggregation };
