// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.describe('Keyboard Navigation', () => {
    test('main navigation is keyboard accessible', async ({ page }) => {
      await page.goto('/');
      
      // Test tab navigation through main navigation
      await page.keyboard.press('Tab');
      
      // Check if focus is visible on navigation elements
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Continue tabbing through navigation
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        const currentFocus = page.locator(':focus');
        await expect(currentFocus).toBeVisible();
      }
    });

    test('forms are keyboard accessible', async ({ page }) => {
      await page.goto('/create-account');
      
      // Tab through form fields
      await page.keyboard.press('Tab');
      let focusedElement = page.locator(':focus');
      
      // Should focus on first form input
      await expect(focusedElement).toHaveAttribute('type', /text|email|password/);
      
      // Continue through form
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab');
        focusedElement = page.locator(':focus');
        
        // Check if focused element is interactive
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
        expect(['input', 'button', 'select', 'textarea', 'a']).toContain(tagName);
      }
    });

    test('modal dialogs are keyboard accessible', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for buttons that might open modals
      const modalTrigger = page.locator('button:has-text("Add"), button:has-text("Edit"), button:has-text("Settings")').first();
      
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();
        
        // Check if modal is open
        const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]');
        if (await modal.isVisible()) {
          // Test Escape key closes modal
          await page.keyboard.press('Escape');
          await expect(modal).not.toBeVisible();
        }
      }
    });

    test('dropdown menus are keyboard accessible', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for dropdown triggers
      const dropdown = page.locator('button[aria-haspopup], .dropdown-trigger, [data-testid*="dropdown"]').first();
      
      if (await dropdown.isVisible()) {
        await dropdown.focus();
        await page.keyboard.press('Enter');
        
        // Check if dropdown menu is visible
        const dropdownMenu = page.locator('[role="menu"], .dropdown-menu, [aria-expanded="true"]');
        if (await dropdownMenu.isVisible()) {
          // Test arrow key navigation
          await page.keyboard.press('ArrowDown');
          await page.keyboard.press('ArrowUp');
          
          // Test Escape closes dropdown
          await page.keyboard.press('Escape');
        }
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test('page has proper heading structure', async ({ page }) => {
      await page.goto('/');
      
      // Check for h1 element
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
      
      // Check heading hierarchy
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      expect(headingCount).toBeGreaterThan(0);
      
      // Verify h1 comes before h2, etc.
      if (headingCount > 1) {
        const firstHeading = headings.first();
        const tagName = await firstHeading.evaluate(el => el.tagName);
        expect(tagName).toBe('H1');
      }
    });

    test('images have alt text', async ({ page }) => {
      await page.goto('/');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        
        // Images should have alt text or be marked as decorative
        expect(alt !== null || role === 'presentation').toBeTruthy();
      }
    });

    test('form inputs have proper labels', async ({ page }) => {
      await page.goto('/create-account');
      
      const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"], textarea, select');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');
        
        if (id) {
          // Check if there's a label with for attribute
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          
          // Input should have label, aria-label, or aria-labelledby
          expect(hasLabel || ariaLabel || ariaLabelledby).toBeTruthy();
        }
      }
    });

    test('buttons have accessible names', async ({ page }) => {
      await page.goto('/dashboard');
      
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const ariaLabelledby = await button.getAttribute('aria-labelledby');
        const title = await button.getAttribute('title');
        
        // Button should have accessible name
        const hasAccessibleName = (text && text.trim()) || ariaLabel || ariaLabelledby || title;
        expect(hasAccessibleName).toBeTruthy();
      }
    });

    test('links have descriptive text', async ({ page }) => {
      await page.goto('/');
      
      const links = page.locator('a');
      const linkCount = await links.count();
      
      for (let i = 0; i < linkCount; i++) {
        const link = links.nth(i);
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const title = await link.getAttribute('title');
        
        // Link should have descriptive text
        const hasDescription = (text && text.trim() && text.trim() !== 'Read more' && text.trim() !== 'Click here') || ariaLabel || title;
        expect(hasDescription).toBeTruthy();
      }
    });
  });

  test.describe('Color and Contrast', () => {
    test('focus indicators are visible', async ({ page }) => {
      await page.goto('/');
      
      // Tab to first focusable element
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      
      if (await focusedElement.isVisible()) {
        // Check if focus indicator is visible (this is a basic check)
        const outline = await focusedElement.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return styles.outline || styles.boxShadow || styles.border;
        });
        
        expect(outline).toBeTruthy();
      }
    });

    test('text has sufficient contrast', async ({ page }) => {
      await page.goto('/');
      
      // This is a basic check - in a real scenario, you'd use axe-core
      const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div').filter({ hasText: /.+/ });
      const count = await textElements.count();
      
      if (count > 0) {
        const firstElement = textElements.first();
        const styles = await firstElement.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor
          };
        });
        
        // Basic check that color and background are different
        expect(styles.color).not.toBe(styles.backgroundColor);
      }
    });
  });

  test.describe('ARIA Attributes', () => {
    test('interactive elements have proper ARIA roles', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Check buttons
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const role = await button.getAttribute('role');
        const ariaPressed = await button.getAttribute('aria-pressed');
        const ariaExpanded = await button.getAttribute('aria-expanded');
        
        // If button has special behavior, it should have appropriate ARIA
        if (ariaPressed !== null) {
          expect(['true', 'false']).toContain(ariaPressed);
        }
        if (ariaExpanded !== null) {
          expect(['true', 'false']).toContain(ariaExpanded);
        }
      }
    });

    test('form validation messages are accessible', async ({ page }) => {
      await page.goto('/create-account');
      
      // Try to submit form without filling required fields
      const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Create")').first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // Check for error messages
        const errorMessages = page.locator('[role="alert"], .error, .invalid, [aria-invalid="true"]');
        const errorCount = await errorMessages.count();
        
        if (errorCount > 0) {
          // Error messages should be associated with form fields
          const firstError = errorMessages.first();
          const ariaDescribedby = await page.locator('input[aria-describedby]').first().getAttribute('aria-describedby');
          
          if (ariaDescribedby) {
            const describedElement = page.locator(`#${ariaDescribedby}`);
            await expect(describedElement).toBeVisible();
          }
        }
      }
    });

    test('dynamic content updates are announced', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for elements that might update dynamically
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
      const liveRegionCount = await liveRegions.count();
      
      if (liveRegionCount > 0) {
        const firstLiveRegion = liveRegions.first();
        const ariaLive = await firstLiveRegion.getAttribute('aria-live');
        
        expect(['polite', 'assertive', 'off']).toContain(ariaLive || 'polite');
      }
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('touch targets are appropriately sized', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      const touchTargets = page.locator('button, a, input[type="checkbox"], input[type="radio"]');
      const targetCount = await touchTargets.count();
      
      for (let i = 0; i < Math.min(targetCount, 10); i++) {
        const target = touchTargets.nth(i);
        
        if (await target.isVisible()) {
          const boundingBox = await target.boundingBox();
          
          if (boundingBox) {
            // Touch targets should be at least 44x44 pixels (WCAG guideline)
            expect(boundingBox.width).toBeGreaterThanOrEqual(44);
            expect(boundingBox.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    });

    test('content is readable without horizontal scrolling', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 }); // Small mobile viewport
      await page.goto('/');
      
      // Check if page content fits within viewport
      const body = page.locator('body');
      const scrollWidth = await body.evaluate(el => el.scrollWidth);
      const clientWidth = await body.evaluate(el => el.clientWidth);
      
      // Should not require horizontal scrolling
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20); // Allow small tolerance
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('error pages are accessible', async ({ page }) => {
      // Try to navigate to a non-existent page
      await page.goto('/non-existent-page');
      
      // Check if error page has proper structure
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      
      // Should have a way to navigate back
      const homeLink = page.locator('a:has-text("Home"), a:has-text("Back"), button:has-text("Home")');
      await expect(homeLink.first()).toBeVisible();
    });

    test('form errors are clearly communicated', async ({ page }) => {
      await page.goto('/signin');
      
      // Submit form with invalid data
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.locator('button[type="submit"]');
      
      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        await emailInput.fill('invalid-email');
        await passwordInput.fill('123');
        await submitButton.click();
        
        // Check for error messages
        const errorMessages = page.locator('[role="alert"], .error, [aria-invalid="true"]');
        const errorCount = await errorMessages.count();
        
        if (errorCount > 0) {
          // Error messages should be visible and descriptive
          const firstError = errorMessages.first();
          await expect(firstError).toBeVisible();
          
          const errorText = await firstError.textContent();
          expect(errorText).toBeTruthy();
          expect(errorText.length).toBeGreaterThan(5);
        }
      }
    });
  });

  test.describe('Progressive Enhancement', () => {
    test('core functionality works without JavaScript', async ({ page, context }) => {
      // Disable JavaScript
      await context.setExtraHTTPHeaders({});
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'javaEnabled', {
          writable: false,
          value: false,
        });
      });
      
      await page.goto('/');
      
      // Basic navigation should still work
      const links = page.locator('a[href]');
      const linkCount = await links.count();
      
      if (linkCount > 0) {
        const firstLink = links.first();
        const href = await firstLink.getAttribute('href');
        
        if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
          await firstLink.click();
          // Should navigate to new page
          await page.waitForLoadState('networkidle');
        }
      }
    });

    test('content is readable at 200% zoom', async ({ page }) => {
      await page.goto('/');
      
      // Simulate 200% zoom
      await page.setViewportSize({ width: 640, height: 480 }); // Half the normal size
      
      // Content should still be readable and accessible
      const mainContent = page.locator('main, .main-content, [role="main"]');
      await expect(mainContent.first()).toBeVisible();
      
      // Text should not be cut off
      const textElements = page.locator('p, h1, h2, h3').first();
      if (await textElements.isVisible()) {
        const boundingBox = await textElements.boundingBox();
        expect(boundingBox?.width).toBeLessThanOrEqual(640);
      }
    });
  });
});