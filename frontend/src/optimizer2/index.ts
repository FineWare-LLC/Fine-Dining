// @ts-nocheck
import { performance } from 'node:perf_hooks';
import { writeAuditRecord } from './audit';
import { getCachedResult, setCachedResult } from './cache';
import { fetchRecipeCatalog } from './catalog';
import { hashModelInput } from './hash';
import { interpretOptimization } from './interpreter';
import { buildOptimizationModel } from './modelBuilder';
import { buildMealPlanRequestSignature, normalizeMealPlanRequest } from './normalizer';
import { solveHighsModel, interpretModelStatus } from './solver';

const OPTIMIZATION_FAILURE_MESSAGE = 'Optimization failed. Please try again.';

function buildOptimizationFailureResponse({ modelHash = null, solveMs = null } = {}) {
    return {
        status: 'error',
        message: OPTIMIZATION_FAILURE_MESSAGE,
        objective: { name: 'min_cost' },
        daily: [],
        diagnostics: {
            ...(modelHash ? { model_hash: modelHash } : {}),
            ...(Number.isFinite(solveMs) ? { solve_time_ms: solveMs } : {}),
            warnings: ['Optimization failed before a plan could be produced.'],
        },
    };
}

export async function optimizeMealPlan(payload, options = {}) {
    const normalized = normalizeMealPlanRequest(payload);

    const requestSignature = buildMealPlanRequestSignature(normalized);

    const operationStart = performance.now();
    let catalog = null;
    let modelHash = null;

    try {
        catalog = await fetchRecipeCatalog(normalized);
        modelHash = hashModelInput([
            'request',
            requestSignature,
            'catalog',
            catalog.metadata.versionToken,
        ]);

        const cached = getCachedResult(modelHash);
        if (cached && cached.status === 'optimal') {
            const diagnostics = cached.diagnostics
                ? { ...cached.diagnostics, cache_hit: true }
                : { cache_hit: true };
            return { ...cached, diagnostics };
        }

        const buildResult = buildOptimizationModel(normalized, catalog);
        if (catalog.metadata?.fallback) {
            buildResult.warnings.push('Using fallback recipe catalog due to unavailable database connection');
        }

        const solveStart = performance.now();
        const solverResult = await solveHighsModel(buildResult.model, {
            timeLimitSec: options.timeLimitSec ?? 3,
            logToConsole: options.logToConsole ?? false,
        });
        const solveMs = performance.now() - solveStart;

        const response = interpretOptimization({
            request: normalized,
            catalog,
            buildResult,
            solverResult,
            modelHash,
            timings: { solveMs },
        });

        if (response.status === 'optimal') {
            setCachedResult(modelHash, response, options.cacheTtlMs ?? 2 * 60 * 1000);
        }

        await writeAuditRecord({
            timestamp: new Date().toISOString(),
            modelHash,
            request: requestSignature,
            catalogMeta: catalog.metadata,
            solver: {
                status: interpretModelStatus(solverResult.status),
                info: solverResult.info,
                version: solverResult.solverVersion,
                solveMs,
            },
            warnings: buildResult.warnings,
            responseStatus: response.status,
        });

        return response;
    } catch (error) {
        const solveMs = performance.now() - operationStart;
        const response = buildOptimizationFailureResponse({ modelHash, solveMs });

        await writeAuditRecord({
            timestamp: new Date().toISOString(),
            modelHash,
            request: requestSignature,
            catalogMeta: catalog?.metadata,
            solver: {
                status: 'error',
                info: null,
                version: null,
                solveMs,
            },
            warnings: response.diagnostics.warnings,
            responseStatus: response.status,
        });

        return response;
    }
}
