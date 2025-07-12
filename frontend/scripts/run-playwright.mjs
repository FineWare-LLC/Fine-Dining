import { execSync } from 'child_process';

function run(cmd) {
    execSync(cmd, { stdio: 'inherit', shell: true });
}

try {
    // Install browsers if they haven't been installed
    run('npx playwright install');
    // Run Playwright tests
    run('npx playwright test');
} catch (err) {
    console.error('Playwright tests failed:', err);
    process.exit(1);
}
