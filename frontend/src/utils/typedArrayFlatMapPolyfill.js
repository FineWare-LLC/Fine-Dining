export default function applyTypedArrayFlatMapPolyfill() {
    const constructors = [
        Int8Array,
        Uint8Array,
        Uint8ClampedArray,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,
        BigInt64Array,
        BigUint64Array,
    ];

    for (const Ctor of constructors) {
        if (!Ctor?.prototype?.flatMap) {
            Object.defineProperty(Ctor.prototype, 'flatMap', {
                value: function (fn, thisArg) {
                    return Array.prototype.flatMap.call(this, fn, thisArg);
                },
                writable: true,
                configurable: true,
            });
        }
    }
}
