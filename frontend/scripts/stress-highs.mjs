#!/usr/bin/env node
/**
 * HiGHS Stress Test - Meal plan generation load runner
 * Designed to test extreme payloads (up to 100k meals, 1000 days, 12 meals/day).
 *
 * Example:
 * node scripts/stress-highs.mjs \
 *   --url http://localhost:3000/api/optimize-meals \
 *   --requests 1000 \
 *   --concurrency 2 \
 *   --meals 100000 \
 *   --days 1000 \
 *   --meals-per-day 12
 */
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import fetch from 'node-fetch';
import { ALLERGEN_OPTIONS } from '../src/constants/allergens.js';

const argv = process.argv.slice(2);

const readFlag = (name, fallback = null) => {
    const idx = argv.indexOf(`--${name}`);
    if (idx === -1) return fallback;
    return argv[idx + 1] ?? fallback;
};

const hasFlag = (name) => argv.includes(`--${name}`);

if (hasFlag('help')) {
    // eslint-disable-next-line no-console
    console.log(`
HiGHS Meal Plan Stress Test
Usage:
  node scripts/stress-highs.mjs [options]

Options:
  --url <url>                 Target URL (default: http://localhost:3000/api/optimize-meals)
  --targets <url1,url2>       Comma-separated list of target URLs
  --requests <n>              Total request count (default: 100)
  --concurrency <n>           In-flight requests (default: 1)
  --meals <n>                 Meals per request (default: 100000)
  --days <n>                  Horizon days (default: 1000)
  --meals-per-day <n>         Meals per day (default: 12)
  --max-servings <n>          Max servings per meal (default: 6)
  --seed <n>                  RNG seed (default: 42)
  --allergen-max <n>          Max allergens to filter per request (default: 6)
  --per-entry-limits <n>      Random per-entry limits per request (default: 120)
  --per-tag-limits <n>        Random per-tag limits per request (default: 6)
  --timeout-ms <n>            Per-request timeout (default: 120000)
  --warmup <n>                Warmup requests (default: 0)
  --cache-meals <path>        Cache meals dataset JSON to disk
  --report <path>             Write JSON summary report
  --log-every <n>             Log progress every N requests (default: 10)
`);
    process.exit(0);
}

const config = {
    url: readFlag('url', 'http://localhost:3000/api/optimize-meals'),
    targets: readFlag('targets', null),
    requests: Number(readFlag('requests', 100)),
    concurrency: Number(readFlag('concurrency', 1)),
    meals: Number(readFlag('meals', 100000)),
    days: Number(readFlag('days', 1000)),
    mealsPerDay: Number(readFlag('meals-per-day', 12)),
    maxServings: Number(readFlag('max-servings', 6)),
    seed: Number(readFlag('seed', 42)),
    allergenMax: Number(readFlag('allergen-max', 6)),
    perEntryLimits: Number(readFlag('per-entry-limits', 120)),
    perTagLimits: Number(readFlag('per-tag-limits', 6)),
    timeoutMs: Number(readFlag('timeout-ms', 120000)),
    warmup: Number(readFlag('warmup', 0)),
    cacheMealsPath: readFlag('cache-meals', null),
    reportPath: readFlag('report', null),
    logEvery: Number(readFlag('log-every', 10)),
};

const ALLERGENS = ALLERGEN_OPTIONS.map((option) => option.value);
const CUISINES = ['Mediterranean', 'American', 'Asian', 'Latin', 'Nordic', 'French', 'Middle Eastern', 'Coastal'];
const MEAL_TYPES = ['Bowl', 'Plate', 'Salad', 'Wrap', 'Skillet', 'Soup', 'Tacos', 'Sandwich'];

const PROTEINS = [
    { name: 'Chicken', tag: 'chicken', protein: 36, fat: 8, carbs: 0, sodium: 180, price: 8, allergens: [] },
    { name: 'Beef', tag: 'beef', protein: 42, fat: 18, carbs: 0, sodium: 200, price: 12, allergens: [] },
    { name: 'Salmon', tag: 'fish', protein: 34, fat: 16, carbs: 0, sodium: 190, price: 14, allergens: ['fish'] },
    { name: 'Turkey', tag: 'turkey', protein: 38, fat: 10, carbs: 0, sodium: 170, price: 9, allergens: [] },
    { name: 'Tofu', tag: 'plant', protein: 22, fat: 12, carbs: 8, sodium: 250, price: 7, allergens: ['soy'] },
    { name: 'Shrimp', tag: 'shellfish', protein: 30, fat: 6, carbs: 0, sodium: 220, price: 13, allergens: ['shellfish'] },
    { name: 'Lentils', tag: 'plant', protein: 18, fat: 2, carbs: 24, sodium: 120, price: 6, allergens: [] },
    { name: 'Pork', tag: 'pork', protein: 32, fat: 16, carbs: 0, sodium: 210, price: 10, allergens: [] },
];

const CARBS = [
    { name: 'Rice', carbs: 42, protein: 4, fat: 2, sodium: 80, allergens: [] },
    { name: 'Quinoa', carbs: 34, protein: 6, fat: 3, sodium: 90, allergens: [] },
    { name: 'Pasta', carbs: 46, protein: 7, fat: 2, sodium: 120, allergens: ['wheat'] },
    { name: 'Potato', carbs: 38, protein: 4, fat: 2, sodium: 70, allergens: [] },
    { name: 'Couscous', carbs: 40, protein: 6, fat: 2, sodium: 100, allergens: ['wheat'] },
];

const SAUCES = [
    { name: 'Herb Sauce', carbs: 4, protein: 1, fat: 6, sodium: 120, allergens: [] },
    { name: 'Yogurt Sauce', carbs: 4, protein: 2, fat: 5, sodium: 140, allergens: ['dairy'] },
    { name: 'Soy Glaze', carbs: 8, protein: 2, fat: 2, sodium: 260, allergens: ['soy'] },
    { name: 'Tahini', carbs: 6, protein: 2, fat: 8, sodium: 150, allergens: ['sesame'] },
];

const mulberry32 = (seed) => {
    let t = seed;
    return () => {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), t | 1);
        r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
};

const pick = (list, rng) => list[Math.floor(rng() * list.length)];

const generateMeals = (count, seed) => {
    const rng = mulberry32(seed);
    const meals = new Array(count);
    for (let i = 0; i < count; i += 1) {
        const protein = pick(PROTEINS, rng);
        const carb = pick(CARBS, rng);
        const sauce = pick(SAUCES, rng);
        const cuisine = pick(CUISINES, rng);
        const mealType = pick(MEAL_TYPES, rng);
        const spice = rng() > 0.5 ? 'Roasted' : 'Seared';
        const mealName = `${spice} ${protein.name} ${mealType}`;
        const variance = 0.85 + rng() * 0.3;

        const macro = {
            protein: Math.round((protein.protein + carb.protein + sauce.protein) * variance),
            fat: Math.round((protein.fat + carb.fat + sauce.fat) * variance),
            carbohydrates: Math.round((protein.carbs + carb.carbs + sauce.carbs) * variance),
            sodium: Math.round((protein.sodium + carb.sodium + sauce.sodium) * (0.9 + rng() * 0.2)),
        };
        const calories = Math.round(macro.protein * 4 + macro.carbohydrates * 4 + macro.fat * 9);
        const price = Math.round((protein.price + 4 + rng() * 8) * 100) / 100;
        const allergens = Array.from(new Set([...protein.allergens, ...carb.allergens, ...sauce.allergens]));

        meals[i] = {
            id: `meal-${i + 1}`,
            meal_name: mealName,
            calories,
            protein: macro.protein,
            carbohydrates: macro.carbohydrates,
            fat: macro.fat,
            sodium: macro.sodium,
            price,
            allergens,
            tags: {
                protein: protein.tag,
                cuisine,
                meal_type: mealType.toLowerCase(),
            },
        };
    }
    return meals;
};

const generateConstraints = (rng, opts, mealIds, tagValues) => {
    const dailyCalories = 1800 + rng() * 1400;
    const dailyProtein = 120 + rng() * 140;
    const dailyCarbs = 150 + rng() * 250;
    const dailyFat = 45 + rng() * 80;
    const dailySodium = 1500 + rng() * 1200;
    const dailySugar = 40 + rng() * 30;
    const dailyChol = 200 + rng() * 120;

    const buildRange = (value, spread = 0.2) => {
        const min = Math.max(0, value * (1 - spread));
        const max = Math.max(min + 1, value * (1 + spread));
        return { min, max };
    };

    const allergenCount = Math.min(opts.allergenMax, ALLERGENS.length);
    const forbidden = [];
    for (let i = 0; i < allergenCount; i += 1) {
        if (rng() > 0.5) forbidden.push(ALLERGENS[i]);
    }

    const nutrition = {
        calories: {
            ...buildRange(dailyCalories),
            period: 'total',
        },
        protein: {
            ...buildRange(dailyProtein),
            period: 'total',
        },
        carbohydrates: {
            ...buildRange(dailyCarbs),
            period: 'total',
        },
        fat: {
            ...buildRange(dailyFat),
            period: 'total',
        },
        sodium: {
            ...buildRange(dailySodium),
            period: 'total',
        },
    };

    Object.keys(nutrition).forEach((key) => {
        nutrition[key].min = Math.round(nutrition[key].min * opts.days);
        nutrition[key].max = Math.round(nutrition[key].max * opts.days);
    });

    const safety = {
        sugar: { max: Math.round(dailySugar * opts.days) },
        cholesterol: { max: Math.round(dailyChol * opts.days) },
    };

    const perEntry = {};
    for (let i = 0; i < opts.perEntryLimits && i < mealIds.length; i += 1) {
        if (rng() < 0.4) continue;
        const id = mealIds[Math.floor(rng() * mealIds.length)];
        perEntry[id] = Math.max(1, Math.round(1 + rng() * 6));
    }

    const perTag = {};
    const proteinTags = tagValues.protein;
    const cuisineTags = tagValues.cuisine;
    for (let i = 0; i < opts.perTagLimits; i += 1) {
        if (rng() > 0.6) {
            const tag = pick(proteinTags, rng);
            perTag.protein = { ...(perTag.protein || {}), [tag]: Math.max(2, Math.round(opts.days * opts.mealsPerDay * 0.05)) };
        } else {
            const tag = pick(cuisineTags, rng);
            perTag.cuisine = { ...(perTag.cuisine || {}), [tag]: Math.max(2, Math.round(opts.days * opts.mealsPerDay * 0.04)) };
        }
    }

    return {
        horizon_days: opts.days,
        meals_per_day: opts.mealsPerDay,
        max_servings_per_meal: opts.maxServings,
        serving_step: 1,
        servings_integer: true,
        allergens: { forbidden },
        nutrition,
        safety,
        frequency: {
            per_entry: perEntry,
            per_tag: perTag,
        },
    };
};

const loadMealsDataset = () => {
    if (config.cacheMealsPath) {
        const absolutePath = path.resolve(config.cacheMealsPath);
        if (fs.existsSync(absolutePath)) {
            const raw = fs.readFileSync(absolutePath, 'utf-8');
            return JSON.parse(raw);
        }
        const dataset = generateMeals(config.meals, config.seed);
        fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
        fs.writeFileSync(absolutePath, JSON.stringify(dataset));
        return dataset;
    }
    return generateMeals(config.meals, config.seed);
};

const percentile = (values, p) => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
    return sorted[idx];
};

const runScenario = async (targetUrl, meals, constraintsList) => {
    const latencies = [];
    const statusCounts = new Map();
    const startAll = performance.now();
    let completed = 0;
    let failures = 0;
    let inFlight = 0;
    let cursor = 0;

    const mealsJson = JSON.stringify(meals);

    const makeBody = (constraints) => `{"meals":${mealsJson},"constraints":${JSON.stringify(constraints)}}`;

    const requestOnce = async (index) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
        const constraints = constraintsList[index % constraintsList.length];
        const body = makeBody(constraints);
        const started = performance.now();
        try {
            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body,
                signal: controller.signal,
            });
            const duration = performance.now() - started;
            latencies.push(duration);
            statusCounts.set(response.status, (statusCounts.get(response.status) || 0) + 1);
            if (!response.ok) failures += 1;
            await response.text();
        } catch (error) {
            failures += 1;
        } finally {
            clearTimeout(timeout);
        }
    };

    const launchNext = async () => {
        while (inFlight < config.concurrency && cursor < config.requests) {
            const idx = cursor;
            cursor += 1;
            inFlight += 1;
            requestOnce(idx)
                .finally(() => {
                    inFlight -= 1;
                    completed += 1;
                    if (completed % config.logEvery === 0 || completed === config.requests) {
                        const elapsed = (performance.now() - startAll) / 1000;
                        // eslint-disable-next-line no-console
                        console.log(`[${targetUrl}] ${completed}/${config.requests} done in ${elapsed.toFixed(1)}s`);
                    }
                    if (completed === config.requests) return;
                    void launchNext();
                });
        }
    };

    if (config.warmup > 0) {
        // eslint-disable-next-line no-console
        console.log(`[${targetUrl}] warmup: ${config.warmup} requests`);
        for (let i = 0; i < config.warmup; i += 1) {
            await requestOnce(i);
        }
    }

    await launchNext();
    while (completed < config.requests) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    const duration = (performance.now() - startAll) / 1000;
    const p50 = percentile(latencies, 50);
    const p95 = percentile(latencies, 95);
    const p99 = percentile(latencies, 99);
    const avg = latencies.reduce((sum, val) => sum + val, 0) / (latencies.length || 1);

    return {
        target: targetUrl,
        requests: config.requests,
        concurrency: config.concurrency,
        meals: config.meals,
        days: config.days,
        mealsPerDay: config.mealsPerDay,
        failures,
        durationSeconds: duration,
        rps: config.requests / duration,
        latency: {
            min: Math.min(...latencies),
            max: Math.max(...latencies),
            avg,
            p50,
            p95,
            p99,
        },
        statusCounts: Object.fromEntries(statusCounts.entries()),
        memory: process.memoryUsage(),
    };
};

const main = async () => {
    const targets = config.targets ? config.targets.split(',').map((url) => url.trim()).filter(Boolean) : [config.url];
    const meals = loadMealsDataset();
    const rng = mulberry32(config.seed);
    const tagValues = {
        protein: Array.from(new Set(PROTEINS.map((item) => item.tag))),
        cuisine: CUISINES,
    };
    const constraintsList = Array.from({ length: Math.max(1, Math.min(config.requests, 50)) }, (_, idx) =>
        generateConstraints(mulberry32(config.seed + idx + 17), config, meals.map((m) => m.id), tagValues),
    );

    const reports = [];
    for (const target of targets) {
        // eslint-disable-next-line no-console
        console.log(`Starting stress test against ${target}`);
        // eslint-disable-next-line no-console
        console.log(`Payload: ${config.meals} meals, horizon ${config.days} days, ${config.mealsPerDay} meals/day`);
        // eslint-disable-next-line no-console
        console.log(`Requests: ${config.requests}, concurrency: ${config.concurrency}`);
        // eslint-disable-next-line no-console
        console.log(`Note: This test will be extremely heavy with 100k x 100k. Ensure server limits allow large payloads.`);
        // eslint-disable-next-line no-console
        console.log('');

        // eslint-disable-next-line no-await-in-loop
        const report = await runScenario(target, meals, constraintsList);
        reports.push(report);
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(report, null, 2));
    }

    if (config.reportPath) {
        const outputPath = path.resolve(config.reportPath);
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, JSON.stringify(reports, null, 2));
    }
};

main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Stress test failed:', error);
    process.exit(1);
});
