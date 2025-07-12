export function coefficientAggregation(model) {
    const { columnCount, rowCount } = model;
    const { offsets, indices, values } = model.weights;

    const map = new Map();
    const keep = [];
    const colMap = new Array(columnCount).fill(-1);

    for (let j = 0; j < columnCount; ++j) {
        const keyParts = [];
        for (let i = 0; i < rowCount; ++i) {
            keyParts.push(values[offsets[i] + j]);
        }
        const key = keyParts.join(',');
        if (map.has(key)) {
            const k = map.get(key);
            model.columnUpperBounds[k] += model.columnUpperBounds[j];
            model.columnLowerBounds[k] += model.columnLowerBounds[j];
        } else {
            const k = keep.length;
            map.set(key, k);
            keep.push(j);
            colMap[j] = k;
        }
    }

    const newColumnCount = keep.length;
    const newUpper = new Float64Array(newColumnCount);
    const newLower = new Float64Array(newColumnCount);
    const newIndices = new Int32Array(rowCount * newColumnCount);
    const newValues = new Float64Array(rowCount * newColumnCount);
    const newOffsets = new Int32Array(rowCount + 1);

    for (let idx = 0; idx < keep.length; ++idx) {
        const orig = keep[idx];
        newUpper[idx] = model.columnUpperBounds[orig];
        newLower[idx] = model.columnLowerBounds[orig];
        for (let i = 0; i < rowCount; ++i) {
            newIndices[i * newColumnCount + idx] = idx;
            newValues[i * newColumnCount + idx] = values[offsets[i] + orig];
        }
    }
    for (let i = 0; i <= rowCount; ++i) {
        newOffsets[i] = i * newColumnCount;
    }

    return {
        ...model,
        columnCount: newColumnCount,
        columnUpperBounds: newUpper,
        columnLowerBounds: newLower,
        weights: {
            offsets: newOffsets,
            indices: newIndices,
            values: newValues,
        },
    };
}
