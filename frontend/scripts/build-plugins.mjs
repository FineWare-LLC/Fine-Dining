import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginsDir = path.resolve(__dirname, '../../plugins');

if (!fs.existsSync(pluginsDir)) {
    console.log('No plugins directory found.');
    process.exit(0);
}

for (const dirent of fs.readdirSync(pluginsDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;
    const pluginPath = path.join(pluginsDir, dirent.name);
    const pkgPath = path.join(pluginPath, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    console.log(`Building plugin ${dirent.name}...`);
    spawnSync('npm', ['install', '--production'], { cwd: pluginPath, stdio: 'inherit' });
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.scripts && pkg.scripts.build) {
        const res = spawnSync('npm', ['run', 'build'], { cwd: pluginPath, stdio: 'inherit' });
        if (res.status !== 0) process.exit(res.status);
    }
}
