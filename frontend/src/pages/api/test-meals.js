/**
 * API endpoint that returns a large, realistic set of meals for testing.
 * Generated deterministically to ensure stable data between runs.
 */
import { normalizeAllergenList } from '@/constants/allergens';

const MEAL_COUNT = 400;
const CACHE = { meals: null };

const RESTAURANTS = [
    'Heritage Steakhouse', 'Coastal Brasserie', 'Garden Atelier', 'Urban Hearth',
    'Midtown Market Kitchen', 'Night Market Noodle Bar', 'Maison Delice',
    'Maritime Social', 'Silk Road Table', 'Citrine Room', 'Velvet Province',
    'Cinder & Salt', 'Roan & Rye', 'Copper Orchard', 'Lumiere Bay',
    'Atlas Bistro', 'Paloma Verde', 'Marigold House', 'Emberline',
    'The Gilded Spoon', 'Aurora Table', 'Juniper & Co.', 'Basil & Bloom',
    'The Pearl Coast', 'Saffron Atelier', 'Ivory Street', 'Alta Vista',
    'Stone & Vine', 'The Royal Grove', 'Golden Harbor',
];

const PROTEINS = [
    { name: 'Dry-Aged Ribeye', base: { protein: 60, fat: 48, carbs: 0, sodium: 320 }, allergens: [], price: 38, category: 'beef' },
    { name: 'Braised Short Rib', base: { protein: 50, fat: 34, carbs: 6, sodium: 420 }, allergens: [], price: 32, category: 'beef' },
    { name: 'Grilled Filet Mignon', base: { protein: 54, fat: 28, carbs: 0, sodium: 280 }, allergens: [], price: 42, category: 'beef' },
    { name: 'Cedar Plank Salmon', base: { protein: 42, fat: 24, carbs: 0, sodium: 240 }, allergens: ['fish'], price: 30, category: 'fish' },
    { name: 'Seared Tuna', base: { protein: 46, fat: 10, carbs: 0, sodium: 260 }, allergens: ['fish'], price: 32, category: 'fish' },
    { name: 'Crispy Skin Trout', base: { protein: 38, fat: 18, carbs: 0, sodium: 220 }, allergens: ['fish'], price: 28, category: 'fish' },
    { name: 'Lemon-Pepper Cod', base: { protein: 36, fat: 8, carbs: 0, sodium: 200 }, allergens: ['fish'], price: 26, category: 'fish' },
    { name: 'Harissa Chicken Thighs', base: { protein: 40, fat: 26, carbs: 4, sodium: 360 }, allergens: [], price: 24, category: 'chicken' },
    { name: 'Roasted Chicken Breast', base: { protein: 46, fat: 12, carbs: 0, sodium: 240 }, allergens: [], price: 22, category: 'chicken' },
    { name: 'Citrus Glazed Turkey', base: { protein: 38, fat: 12, carbs: 6, sodium: 260 }, allergens: [], price: 22, category: 'turkey' },
    { name: 'Herb Turkey Meatballs', base: { protein: 34, fat: 16, carbs: 8, sodium: 420 }, allergens: ['wheat', 'eggs'], price: 20, category: 'turkey' },
    { name: 'Pomegranate Lamb Chops', base: { protein: 44, fat: 32, carbs: 2, sodium: 340 }, allergens: [], price: 34, category: 'lamb' },
    { name: 'Braised Lamb Shank', base: { protein: 46, fat: 36, carbs: 4, sodium: 380 }, allergens: [], price: 36, category: 'lamb' },
    { name: 'Duck Confit', base: { protein: 32, fat: 44, carbs: 0, sodium: 420 }, allergens: [], price: 30, category: 'duck' },
    { name: 'Miso-Glazed Tofu', base: { protein: 22, fat: 16, carbs: 8, sodium: 520 }, allergens: ['soy'], price: 18, category: 'plant' },
    { name: 'Crispy Tempeh', base: { protein: 26, fat: 18, carbs: 10, sodium: 380 }, allergens: ['soy'], price: 20, category: 'plant' },
    { name: 'Smoked Chickpeas', base: { protein: 18, fat: 6, carbs: 26, sodium: 260 }, allergens: [], price: 16, category: 'plant' },
    { name: 'Seared Scallops', base: { protein: 28, fat: 8, carbs: 4, sodium: 220 }, allergens: ['shellfish'], price: 34, category: 'shellfish' },
    { name: 'Garlic Shrimp', base: { protein: 30, fat: 10, carbs: 2, sodium: 260 }, allergens: ['shellfish'], price: 28, category: 'shellfish' },
    { name: 'Herb-Crusted Pork Chop', base: { protein: 38, fat: 24, carbs: 4, sodium: 320 }, allergens: [], price: 26, category: 'pork' },
    { name: 'Crispy Pork Belly', base: { protein: 24, fat: 48, carbs: 0, sodium: 440 }, allergens: [], price: 28, category: 'pork' },
];

const STARCHES = [
    { name: 'Truffle Mash', base: { protein: 6, fat: 12, carbs: 28, sodium: 280 }, allergens: ['dairy'] },
    { name: 'Saffron Couscous', base: { protein: 6, fat: 4, carbs: 34, sodium: 160 }, allergens: ['wheat'] },
    { name: 'Carnaroli Risotto', base: { protein: 8, fat: 10, carbs: 40, sodium: 240 }, allergens: ['dairy'] },
    { name: 'Turmeric Farro', base: { protein: 8, fat: 4, carbs: 38, sodium: 120 }, allergens: ['wheat'] },
    { name: 'Charred Sweet Potato', base: { protein: 4, fat: 6, carbs: 34, sodium: 120 }, allergens: [] },
    { name: 'Ancient Grain Quinoa', base: { protein: 8, fat: 6, carbs: 32, sodium: 120 }, allergens: [] },
    { name: 'Brown Rice Pilaf', base: { protein: 6, fat: 4, carbs: 36, sodium: 140 }, allergens: [] },
    { name: 'Silky Polenta', base: { protein: 4, fat: 8, carbs: 30, sodium: 180 }, allergens: ['dairy'] },
    { name: 'Buckwheat Soba', base: { protein: 8, fat: 2, carbs: 38, sodium: 220 }, allergens: ['wheat'] },
    { name: 'House-Made Gnocchi', base: { protein: 6, fat: 8, carbs: 34, sodium: 200 }, allergens: ['wheat', 'eggs', 'dairy'] },
    { name: 'Charred Corn Tortillas', base: { protein: 4, fat: 4, carbs: 26, sodium: 200 }, allergens: [] },
    { name: 'Herbed Orzo', base: { protein: 6, fat: 4, carbs: 32, sodium: 200 }, allergens: ['wheat'] },
    { name: 'Lentil Ragout', base: { protein: 14, fat: 4, carbs: 28, sodium: 180 }, allergens: [] },
    { name: 'Coconut Rice', base: { protein: 4, fat: 10, carbs: 34, sodium: 140 }, allergens: [] },
];

const SAUCES = [
    { name: 'Lemon Beurre Blanc', base: { protein: 1, fat: 8, carbs: 2, sodium: 180 }, allergens: ['dairy'] },
    { name: 'Basil Pesto', base: { protein: 2, fat: 10, carbs: 2, sodium: 160 }, allergens: ['dairy', 'tree_nuts'] },
    { name: 'Tahini Date Glaze', base: { protein: 2, fat: 8, carbs: 10, sodium: 140 }, allergens: ['sesame'] },
    { name: 'Peanut Satay', base: { protein: 4, fat: 10, carbs: 6, sodium: 220 }, allergens: ['peanuts'] },
    { name: 'Soy-Ginger Reduction', base: { protein: 2, fat: 2, carbs: 6, sodium: 420 }, allergens: ['soy'] },
    { name: 'Herb Chimichurri', base: { protein: 1, fat: 6, carbs: 3, sodium: 140 }, allergens: [] },
    { name: 'Charred Lemon Yogurt', base: { protein: 3, fat: 6, carbs: 4, sodium: 180 }, allergens: ['dairy'] },
    { name: 'Smoked Paprika Romesco', base: { protein: 2, fat: 8, carbs: 6, sodium: 160 }, allergens: ['tree_nuts'] },
    { name: 'Coconut Curry', base: { protein: 2, fat: 12, carbs: 6, sodium: 220 }, allergens: [] },
    { name: 'Hollandaise', base: { protein: 2, fat: 12, carbs: 1, sodium: 200 }, allergens: ['eggs', 'dairy'] },
];

const VEGETABLES = [
    { name: 'Charred Broccolini', base: { protein: 3, fat: 2, carbs: 6, sodium: 80 }, allergens: [] },
    { name: 'Shaved Fennel Salad', base: { protein: 2, fat: 4, carbs: 8, sodium: 90 }, allergens: [] },
    { name: 'Roasted Heirloom Carrots', base: { protein: 2, fat: 4, carbs: 10, sodium: 80 }, allergens: [] },
    { name: 'Citrus Kale', base: { protein: 3, fat: 4, carbs: 8, sodium: 90 }, allergens: [] },
    { name: 'Grilled Asparagus', base: { protein: 2, fat: 3, carbs: 6, sodium: 70 }, allergens: [] },
    { name: 'Smoked Eggplant Puree', base: { protein: 2, fat: 6, carbs: 10, sodium: 120 }, allergens: [] },
    { name: 'Charred Brussels Sprouts', base: { protein: 3, fat: 4, carbs: 10, sodium: 100 }, allergens: [] },
    { name: 'Pomegranate Herb Salad', base: { protein: 2, fat: 4, carbs: 8, sodium: 70 }, allergens: [] },
];

const GARNISHES = [
    { name: 'Toasted Almonds', base: { protein: 2, fat: 4, carbs: 2, sodium: 30 }, allergens: ['tree_nuts'] },
    { name: 'Pistachio Dukkah', base: { protein: 2, fat: 5, carbs: 2, sodium: 40 }, allergens: ['tree_nuts'] },
    { name: 'Crispy Shallots', base: { protein: 1, fat: 3, carbs: 3, sodium: 50 }, allergens: [] },
    { name: 'Parmesan Shavings', base: { protein: 2, fat: 3, carbs: 1, sodium: 90 }, allergens: ['dairy'] },
    { name: 'Soft-Boiled Egg', base: { protein: 6, fat: 5, carbs: 1, sodium: 70 }, allergens: ['eggs'] },
    { name: 'Sesame Crunch', base: { protein: 2, fat: 4, carbs: 2, sodium: 50 }, allergens: ['sesame'] },
];

const STYLES = [
    'Charred', 'Slow-Braised', 'Herb-Crusted', 'Citrus-Glazed', 'Smoked',
    'Blackened', 'Roasted', 'Seared', 'Wood-Fired', 'Spiced',
];

const FORMATS = [
    'plate',
    'bowl',
    'tacos',
];

const TEMPLATES = [
    ({ protein, starch }) => `${protein} with ${starch}`,
    ({ protein, starch }) => `${protein} over ${starch}`,
    ({ protein, starch }) => `${protein} atop ${starch}`,
];

function mulberry32(seed) {
    let t = seed;
    return () => {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ t >>> 15, t | 1);
        r ^= r + Math.imul(r ^ r >>> 7, r | 61);
        return ((r ^ r >>> 14) >>> 0) / 4294967296;
    };
}

function pick(list, rng) {
    return list[Math.floor(rng() * list.length)];
}

function slugify(value) {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function buildMeal(index, rng) {
    const protein = pick(PROTEINS, rng);
    const starch = pick(STARCHES, rng);
    const sauce = pick(SAUCES, rng);
    const veg = pick(VEGETABLES, rng);
    const garnish = rng() > 0.35 ? pick(GARNISHES, rng) : null;
    const style = pick(STYLES, rng);
    const restaurant = RESTAURANTS[index % RESTAURANTS.length];
    const format = pick(FORMATS, rng);
    const template = pick(TEMPLATES, rng);

    let mealName = template({
        protein: `${style} ${protein.name}`,
        starch: starch.name,
    });

    const description = [
        `${protein.name} finished with ${sauce.name.toLowerCase()}`,
        `${starch.name.toLowerCase()}`,
        `${veg.name.toLowerCase()}`,
        garnish ? garnish.name.toLowerCase() : null,
    ]
        .filter(Boolean)
        .join(', ');

    const macroSum = [protein, starch, sauce, veg, garnish]
        .filter(Boolean)
        .reduce((acc, item) => {
            acc.protein += item.base.protein;
            acc.fat += item.base.fat;
            acc.carbohydrates += item.base.carbs;
            acc.sodium += item.base.sodium;
            return acc;
        }, { protein: 0, fat: 0, carbohydrates: 0, sodium: 0 });

    const variance = 0.92 + rng() * 0.16;
    macroSum.protein = Math.round(macroSum.protein * variance);
    macroSum.fat = Math.round(macroSum.fat * variance);
    macroSum.carbohydrates = Math.round(macroSum.carbohydrates * variance);
    macroSum.sodium = Math.round(macroSum.sodium * (0.9 + rng() * 0.2));

    const calories = Math.round(macroSum.protein * 4 + macroSum.carbohydrates * 4 + macroSum.fat * 9);
    const price = Math.round((protein.price + 6 + rng() * 10) * 10) / 10;

    const allergens = normalizeAllergenList([
        ...protein.allergens,
        ...starch.allergens,
        ...sauce.allergens,
        ...veg.allergens,
        ...(garnish?.allergens || []),
    ]);

    const id = `meal-${index + 1}-${slugify(mealName).slice(0, 32)}`;

    if (index > 0 && index % 25 === 0) {
        mealName = `${mealName} (${index + 1})`;
    }

    return {
        id,
        restaurant,
        meal_name: mealName,
        description: description.charAt(0).toUpperCase() + description.slice(1),
        serving_size: format === 'tacos' ? '3 tacos' : `1 ${format}`,
        calories,
        protein: macroSum.protein,
        carbohydrates: macroSum.carbohydrates,
        fat: macroSum.fat,
        sodium: macroSum.sodium,
        price,
        allergens,
        image: `https://source.unsplash.com/1200x1600/?food&sig=${index + 1}`,
    };
}

function buildMeals() {
    if (CACHE.meals) return CACHE.meals;
    const rng = mulberry32(42);
    const meals = [];
    const seenNames = new Set();
    for (let i = 0; i < MEAL_COUNT; i += 1) {
        let meal = buildMeal(i, rng);
        if (seenNames.has(meal.meal_name)) {
            meal = { ...meal, meal_name: `${meal.meal_name} #${i + 1}` };
        }
        seenNames.add(meal.meal_name);
        meals.push(meal);
    }
    CACHE.meals = meals;
    return meals;
}

export default function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    return res.status(200).json({
        meals: buildMeals(),
        generatedAt: new Date().toISOString(),
    });
}
