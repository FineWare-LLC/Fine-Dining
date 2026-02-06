import highs from 'highs-addon';
import { MODEL_STATUS } from './constants.js';

const { Solver, solverVersion } = highs;

export async function solveHighsModel(model, options = {}) {
    const solver = new Solver();
    solver.setOption('presolve', 'on');
    solver.setOption('parallel', 'choose');
    solver.setOption('primal_feasibility_tolerance', 1e-7);
    solver.setOption('dual_feasibility_tolerance', 1e-7);
    solver.setOption('time_limit', options.timeLimitSec ?? 3);
    solver.setOption('mip_abs_gap', 1e-6);
    solver.setOption('mip_rel_gap', 1e-5);
    solver.setOption('log_to_console', options.logToConsole ?? false);

    solver.passModel(model);

    return new Promise((resolve, reject) => {
        solver.run(err => {
            if (err) {
                reject(err);
                return;
            }
            const status = solver.getModelStatus();
            const info = solver.getInfo();
            const solution = solver.getSolution();
            resolve({
                status,
                info,
                solution,
                solverVersion: solverVersion(),
            });
        });
    });
}

export function interpretModelStatus(status) {
    const invert = Object.entries(MODEL_STATUS).reduce((acc, [key, value]) => {
        acc[value] = key.toLowerCase();
        return acc;
    }, {});
    return invert[status] || 'unknown';
}

