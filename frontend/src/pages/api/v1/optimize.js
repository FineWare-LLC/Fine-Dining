import { optimizeMealPlan } from '@/server/optimizer/index.js';
import { MealPlanRequestSchema, MealPlanResponseSchema } from '@/server/optimizer/schema.js';

const idempotencyStore = new Map();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const validation = MealPlanRequestSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ errors: validation.error.format() });
        }

        const idempotencyKey = req.headers['idempotency-key'];
        if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
            return res.status(200).json(idempotencyStore.get(idempotencyKey));
        }

        const result = await optimizeMealPlan(validation.data);
        const response = MealPlanResponseSchema.parse(result);

        if (idempotencyKey) {
            idempotencyStore.set(idempotencyKey, response);
        }

        return res.status(200).json(response);
    } catch (error) {
        console.error('optimize endpoint error', error);
        if (error.message && error.message.startsWith('Energy balance mismatch')) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Optimization failed', detail: error.message });
    }
}

