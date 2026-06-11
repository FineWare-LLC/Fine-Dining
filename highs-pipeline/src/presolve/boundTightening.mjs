export function boundTightening(model) {
    const { columnCount, rowCount, rowLowerBounds, rowUpperBounds } = model;
    const { offsets, values } = model.weights;

    const newLower = model.columnLowerBounds.slice();
    const newUpper = model.columnUpperBounds.slice();

    for (let j = 0; j < columnCount; ++j) {
        for (let i = 0; i < rowCount; ++i) {
            const coeff = values[offsets[i] + j];
            if (coeff <= 0) continue;
            const maxUb = rowUpperBounds[i] / coeff;
            if (maxUb < newUpper[j]) {
                newUpper[j] = maxUb;
            }
            const minLb = rowLowerBounds[i] / coeff;
            if (minLb > newLower[j]) {
                newLower[j] = minLb;
            }
        }
        if (newLower[j] > newUpper[j]) {
            newLower[j] = newUpper[j];
        }
    }

    return {
        ...model,
        columnLowerBounds: newLower,
        columnUpperBounds: newUpper,
    };
}
