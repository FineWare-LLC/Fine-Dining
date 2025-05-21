import highsDefault from 'highs-addon';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

const { Solver } = highsDefault;

export function loadConfig(configFile) {
    try {
        return JSON.parse(fs.readFileSync(configFile, 'utf8'));
    } catch (_) {
        return {};
    }
}

export function saveConfig(configFile, config) {
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

// Simple auto-tuner: tries a grid of parameter values and picks the fastest
export async function autoTune(data, buildModel, configFile) {
    const search = [
        { threads: 1 },
        { threads: 2 },
        { threads: 4 }
    ];

    let best = null;
    for (const params of search) {
        const solver = new Solver();
        Object.entries(params).forEach(([k, v]) => {
            try { solver.setOptionValue(k, v); } catch (_) {}
        });
        solver.passModel(buildModel(data));
        const start = performance.now();
        await new Promise((resolve, reject) => {
            solver.run(err => err ? reject(err) : resolve());
        });
        const elapsed = performance.now() - start;
        if (!best || elapsed < best.time) {
            best = { time: elapsed, params };
        }
    }

    if (best) {
        saveConfig(configFile, best.params);
        console.log(`Tuning complete. Best params: ${JSON.stringify(best.params)} (${best.time.toFixed(0)}ms)`);
        return best.params;
    }
    return {};
}
