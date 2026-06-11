export default function safeFlatMap(data, fn) {
    if (!Array.isArray(data)) return [];
    return data.flatMap(fn);
}
