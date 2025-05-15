import { Page } from '@playwright/test';
import type { Locator } from '@playwright/test';
import { JSX } from 'react';

/**
 * Playwright CT mount function signature.
 * @param component - The React component to mount.
 * @param options - Optional mount configuration (e.g., props, hooks).
 * @returns A Locator pointing to the mounted component.
 */
type MountFn = (component: JSX.Element, options?: any) => Promise<Locator>;

/**
 * A wrapper around the mount function.
 * (The original guard logic for server URL validity is less relevant now,
 * as Playwright handles dev server startup based on config).
 *
 * @param page - The Playwright page object (often not directly needed for basic mount)
 * @param mount - The original mount function from Playwright CT
 * @param component - The React component to mount
 * @param options - Optional mount options (e.g., props, hooks) to pass to the actual mount function
 * @returns A Locator pointing to the mounted component
 */
export async function mountWithGuard(
  page: Page, // page might not be strictly necessary if only forwarding to mount
  mount: MountFn,
  component: JSX.Element,
  options?: any // Allow passing standard mount options (like props or hooksConfig)
): Promise<Locator> {
  // Remove the incorrect serverOptions block
  return mount(component, options); // Pass through any valid mount options
}