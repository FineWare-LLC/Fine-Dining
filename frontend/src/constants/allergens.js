export const ALLERGEN_OPTIONS = [
    { label: 'Dairy', value: 'dairy' },
    { label: 'Eggs', value: 'eggs' },
    { label: 'Peanuts', value: 'peanuts' },
    { label: 'Tree Nuts', value: 'tree_nuts' },
    { label: 'Wheat', value: 'wheat' },
    { label: 'Soy', value: 'soy' },
    { label: 'Fish', value: 'fish' },
    { label: 'Shellfish', value: 'shellfish' },
    { label: 'Sesame', value: 'sesame' },
];

const LABEL_TO_VALUE = new Map(
    ALLERGEN_OPTIONS.map((option) => [option.label.toLowerCase(), option.value]),
);
const VALUE_SET = new Set(ALLERGEN_OPTIONS.map((option) => option.value));

export function normalizeAllergenToken(input) {
    if (input === null || input === undefined) return null;
    const raw = String(input).trim().toLowerCase();
    if (!raw) return null;
    if (LABEL_TO_VALUE.has(raw)) return LABEL_TO_VALUE.get(raw);
    const normalized = raw.replace(/\s+/g, '_');
    if (VALUE_SET.has(normalized)) return normalized;
    return normalized;
}

export function normalizeAllergenList(list) {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    const output = [];
    for (const entry of list) {
        const token = normalizeAllergenToken(entry);
        if (!token || seen.has(token)) continue;
        seen.add(token);
        output.push(token);
    }
    return output;
}

export function formatAllergenLabel(value) {
    const match = ALLERGEN_OPTIONS.find((option) => option.value === value);
    if (match) return match.label;
    return String(value).replace(/_/g, ' ');
}
