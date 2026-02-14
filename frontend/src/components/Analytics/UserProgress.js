import React from 'react';
import { Box, Typography } from '@mui/material';

export function calculateImprovement(results = []) {
    const seen = new Set();
    const unique = [];
    for (const r of results) {
        if (!seen.has(r.questionId)) {
            seen.add(r.questionId);
            unique.push(r);
        }
    }
    if (unique.length < 2) return 0;
    const half = Math.floor(unique.length / 2);
    const first = unique.slice(0, half);
    const second = unique.slice(half);
    const accuracy = arr => arr.reduce((sum, r) => sum + (r.correct ? 1 : 0), 0) / arr.length;
    return accuracy(second) - accuracy(first);
}

export default function UserProgress({ results = [] }) {
    const improvement = calculateImprovement(results);
    const pct = Math.round(improvement * 100);
    return (
        <Box>
            <Typography data-testid="improvement">{pct}% improvement</Typography>
        </Box>
    );
}
