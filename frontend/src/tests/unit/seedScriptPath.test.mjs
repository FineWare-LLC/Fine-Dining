import test from 'node:test';
import { readFile } from 'fs/promises';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function nodeCheck(scriptPath) {
  await new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, ['--check', scriptPath], { stdio: 'ignore' });
    proc.on('exit', code => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
    proc.on('error', reject);
  });
}

test('seed script path in package.json is valid', async () => {
  const pkgPath = path.join(__dirname, '../../../package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  const cmd = pkg.scripts.seed;
  const scriptRel = cmd.replace(/^node\s+/, '');
  const scriptPath = path.join(__dirname, '../../..', scriptRel);
  await nodeCheck(scriptPath);
});
