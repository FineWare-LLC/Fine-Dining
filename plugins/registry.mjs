// Simple plugin registry for solver extensions
const registry = new Map();

/**
 * Register a solver plugin.
 * @param {string} name - Unique plugin identifier
 * @param {(solver: any) => void} setup - Setup function invoked with the solver instance
 */
export function registerPlugin(name, setup) {
  if (registry.has(name)) {
    throw new Error(`Plugin '${name}' already registered`);
  }
  registry.set(name, setup);
}

/**
 * Get a previously registered plugin setup function.
 * @param {string} name
 * @returns {(solver: any) => void | undefined}
 */
export function getPlugin(name) {
  return registry.get(name);
}

/**
 * Apply all registered plugins to the target solver instance.
 * @param {any} solver
 */
export function applyPlugins(solver) {
  for (const setup of registry.values()) {
    setup(solver);
  }
}

/**
 * List registered plugin names.
 * @returns {string[]}
 */
export function listPlugins() {
  return Array.from(registry.keys());
}
