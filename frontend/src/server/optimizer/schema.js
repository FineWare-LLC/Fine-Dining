import { z } from 'zod';

export const NutrientRangeSchema = z.object({
    min: z.number().finite().optional(),
    max: z.number().finite().optional(),
});

export const MealPlanRequestSchema = z.object({
    user_id: z.string().min(1),
    horizon_days: z.number().int().min(1).max(14).default(1),
    meals_per_day: z.number().int().min(1).max(8).default(3),
    diet: z.object({
        kcal: z.number().finite().min(600).max(6000),
        protein_g: z.number().finite().min(0),
        carb_g: z.number().finite().min(0),
        fat_g: z.number().finite().min(0),
    }),
    micros: z.record(NutrientRangeSchema).default({}),
    allergens: z.array(z.string()).default([]),
    banned_ingredients: z.array(z.string()).default([]),
    preferences: z.record(z.any()).default({}),
    inventory: z
        .array(
            z.object({
                ingredient_id: z.string().min(1),
                grams: z.number().finite().nonnegative(),
            }),
        )
        .default([]),
    budget: z
        .object({
            max_usd_per_day: z.number().finite().nonnegative().optional(),
        })
        .default({}),
    time_per_meal_min: z.number().int().min(1).max(240).optional(),
    binary_vars: z
        .object({
            use_recipe_level: z.boolean().default(true),
            integer_servings: z.boolean().default(false),
        })
        .default({}),
    allow_leftovers: z.boolean().default(true),
});

export const MealPlanResponseSchema = z.object({
    status: z.enum(['optimal', 'infeasible', 'error', 'partial']),
    objective: z.object({
        name: z.string(),
        value: z.number().finite().optional(),
        breakdown: z.record(z.number()).optional(),
    }),
    daily: z
        .array(
            z.object({
                day_index: z.number().int().min(1),
                meals: z.array(
                    z.object({
                        name: z.string(),
                        items: z.array(
                            z.object({
                                recipe_id: z.string(),
                                servings: z.number().finite().nonnegative(),
                            }),
                        ),
                    }),
                ),
                totals: z.object({
                    kcal: z.number().finite().nonnegative(),
                    protein_g: z.number().finite().nonnegative(),
                    carb_g: z.number().finite().nonnegative(),
                    fat_g: z.number().finite().nonnegative(),
                    cost_usd: z.number().finite().nonnegative(),
                }),
            }),
        )
        .default([]),
    shadow_prices: z.record(z.number()).optional(),
    diagnostics: z
        .object({
            solve_time_ms: z.number().finite().nonnegative().optional(),
            iterations: z.number().int().nonnegative().optional(),
            warnings: z.array(z.string()).optional(),
            model_hash: z.string().optional(),
            cache_hit: z.boolean().optional(),
            solver: z
                .object({
                    version: z.string().optional(),
                    status_code: z.number().int().optional(),
                })
                .optional(),
        })
        .default({}),
});

export function validateMealPlanRequest(payload) {
    return MealPlanRequestSchema.safeParse(payload);
}
