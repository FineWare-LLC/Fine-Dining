import { performance } from 'node:perf_hooks';
import { normalizeMealPlanRequest } from './normalizer.js';
import { fetchRecipeCatalog } from './catalog.js';
import { buildOptimizationModel } from './modelBuilder.js';
import { solveHighsModel, interpretModelStatus } from './solver.js';
import { interpretOptimization } from './interpreter.js';
import { hashModelInput } from './hash.js';
import { getCachedResult, setCachedResult } from './cache.js';
import { writeAuditRecord } from './audit.js';

export async function optimizeMealPlan(payload, options = {}) {
    const normalized = normalizeMealPlanRequest(payload);

    const requestSignature = {
        userId: normalized.userId,
        horizonDays: normalized.horizonDays,
        mealsPerDay: normalized.mealsPerDay,
        diet: normalized.diet,
        micros: normalized.micros,
        allergens: normalized.allergens,
        bannedIngredients: normalized.bannedIngredients,
        inventory: normalized.inventory,
        budget: normalized.budget,
        binary: normalized.binary,
        allowLeftovers: normalized.allowLeftovers,
    };

    const catalog = await fetchRecipeCatalog(normalized);
    const modelHash = hashModelInput([
        'request',
        requestSignature,
        'catalog',
        catalog.metadata.versionToken,
    ]);

    const cached = getCachedResult(modelHash);
    if (cached) {
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

    setCachedResult(modelHash, response, options.cacheTtlMs ?? 2 * 60 * 1000);

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
}
