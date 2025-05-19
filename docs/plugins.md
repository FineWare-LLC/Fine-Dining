# Plugin Architecture

Fine Dining supports optional solver extensions that can be loaded at runtime. Plugins live in the top-level `plugins/` directory and expose a setup function used by the solver.

## Registration API

Use the utilities exported from `plugins/registry.mjs`:

```javascript
import { registerPlugin, listPlugins } from '../plugins/registry.mjs';

registerPlugin('myPlugin', solver => {
  // customise solver instance
});

console.log(listPlugins()); // ['myPlugin']
```

The `registerPlugin(name, setup)` function accepts a unique plugin name and a callback. When the solver starts, each registered plugin is invoked with the solver instance allowing it to modify options, register callbacks or collect metrics.

## Using Plugins in the Solver

`OptimizationService` automatically loads all registered plugins. Create and register your plugins before calling any solver methods:

```javascript
import { registerPlugin } from '../plugins/registry.mjs';
import OptimizationService from './src/services/OptimizationService.js';

registerPlugin('logger', solver => {
  solver.setOptionValue('log_to_console', true);
});
```

The solver will call your plugin during initialisation.

## Building Plugins

Optional plugins may contain their own `package.json` and build steps. Run the following command to compile all plugins individually:

```bash
npm run build:plugins
```

The script looks for packages inside `plugins/` and executes `npm install` and `npm run build` if available.

## Example Plugin Structure

```
plugins/
└── logger/
    ├── package.json
    └── index.js
```

`index.js` should register the plugin when loaded:

```javascript
import { registerPlugin } from '../registry.mjs';

registerPlugin('logger', solver => {
  solver.setOptionValue('log_to_console', true);
});
```
