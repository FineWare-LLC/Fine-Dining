// src/tests/components/overEngineeredCopyright.spec.js
import React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';
import { mountWithGuard } from '../utils/mountWithGuard';

import { Smoke } from './Smoke'; // Assuming Smoke.tsx is correctly located

// ---------------------------
// DEBUG UTILITIES – autogenerated
// These helpers are *only* for local debugging and can be
// safely removed or tree‑shaken in production builds.
// ---------------------------

/**
 * Pretty‑prints elapsed milliseconds as HH:MM:SS.mmm.
 * @param {number} ms
 * @returns {string}
 */
function _fmt(ms) {
  const d = new Date(ms);
  return d.toISOString().substr(11, 12);
}

/**
 * Attaches very verbose event listeners to the given Playwright `page`
 * so that every significant browser event is echoed to stdout.
 * @param {import('@playwright/test').Page} page
 */
export function enableVerbosePlaywrightDebug(page) {
  const suiteStart = Date.now();
  const stamp = () => `[${_fmt(Date.now() - suiteStart)}]`;

  console.log(`${stamp()} [DEBUG] Enabling verbose page listeners`);

  page.on('console', (msg) => {
    console.log(`${stamp()} [BROWSER CONSOLE]`, msg.type(), msg.text());
  });

  page.on('pageerror', (err) => {
    console.error(`${stamp()} [BROWSER ERROR]`, err);
  });

  page.on('request', (req) => {
    console.log(`${stamp()} [REQUEST]`, req.method(), req.url());
  });

  page.on('requestfailed', (req) => {
    console.warn(
      `${stamp()} [REQUEST FAILED]`,
      req.method(),
      req.url(),
      req.failure()?.errorText
    );
  });

  page.on('response', (res) => {
    const status = res.status();
    if (status >= 400) {
      console.warn(
        `${stamp()} [RESPONSE ${status}]`,
        res.request().method(),
        res.url()
      );
    }
  });

  page.on('crash', () => {
    console.error(`${stamp()} [PAGE CRASHED]`);
  });

  page.on('frameattached', (frame) => {
    console.log(`${stamp()} [FRAME ATTACHED]`, frame.url());
  });

  page.on('framenavigated', (frame) => {
    console.log(`${stamp()} [FRAME NAVIGATED]`, frame.url());
  });

  // Log when the service worker / web‑worker spins up
  page.on('worker', (worker) => {
    console.log(`${stamp()} [WORKER]`, worker.url());
  });
}


test('Smoke test mounts a simple component', async ({ mount, page }, testInfo) => {
  // ─── GLOBAL DEBUG ──────────────────────────────────────────────────────────
  enableVerbosePlaywrightDebug(page);
  console.log('[DEBUG] Node version:', process.version);
  console.log('[DEBUG] Platform:', process.platform, process.arch);
  console.log('[DEBUG] Working directory:', process.cwd());
  // ──────────────────────────────────────────────────────────────────────────

  await test.step('mount <Smoke />', async () => {
    const t0 = Date.now();
    let component;
    try {
      component = await mountWithGuard(page, mount, <Smoke />);
      console.log(`[DEBUG] mountWithGuard completed in ${Date.now() - t0} ms`);
    } catch (err) {
      console.error('[DEBUG] mountWithGuard threw:', err);
      throw err; // re‑throw so Playwright still fails the test
    }
    await expect(component).toContainText('It works!');
  });

  // Capture artifacts for post‑mortem inspection
  await test.step('capture page artifacts', async () => {
    const fs = require('fs');
    const dir = 'playwright-artifacts';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const stamp = Date.now();
    await page.screenshot({
      path: `${dir}/smoke-${stamp}.png`,
      fullPage: true
    });

    const html = await page.content();
    fs.writeFileSync(`${dir}/smoke-${stamp}.html`, html);

    fs.writeFileSync(
      `${dir}/env-${stamp}.json`,
      JSON.stringify(
        {
          memory: process.memoryUsage(),
          versions: process.versions,
          uptime: process.uptime(),
          test: testInfo.title
        },
        null,
        2
      )
    );
    console.log('[DEBUG] Artifacts written to', dir);
  });
});