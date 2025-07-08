// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.describe('Page Load Performance', () => {
    test('home page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      
      // Wait for main content to be visible
      await expect(page.locator('main, .main-content, [data-testid="main"]')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      console.log(`[DEBUG_LOG] Home page load time: ${loadTime}ms`);
    });

    test('dashboard loads efficiently for authenticated users', async ({ page }) => {
      // Mock authentication
      await page.evaluate(() => {
        localStorage.setItem('userToken', 'mock-token');
        localStorage.setItem('userProfile', JSON.stringify({
          name: 'Test User',
          preferences: { dietaryRestrictions: ['vegetarian'] }
        }));
      });
      
      const startTime = Date.now();
      
      await page.goto('/dashboard');
      
      // Wait for dashboard content to load
      await expect(page.locator('h1, h2, .dashboard-content')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Dashboard should load within 4 seconds (more complex page)
      expect(loadTime).toBeLessThan(4000);
      
      console.log(`[DEBUG_LOG] Dashboard load time: ${loadTime}ms`);
    });

    test('meal catalog loads and renders efficiently', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/meals');
      
      // Wait for meal items to be visible
      await expect(page.locator('.meal-card, [data-testid*="meal"]').first()).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Meal catalog should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
      
      console.log(`[DEBUG_LOG] Meal catalog load time: ${loadTime}ms`);
    });

    test('restaurant listing loads within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/restaurants');
      
      // Wait for restaurant cards to be visible
      await expect(page.locator('.restaurant-card, [data-testid*="restaurant"]').first()).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Restaurant listing should load within 4 seconds
      expect(loadTime).toBeLessThan(4000);
      
      console.log(`[DEBUG_LOG] Restaurant listing load time: ${loadTime}ms`);
    });
  });

  test.describe('Core Web Vitals', () => {
    test('measures Largest Contentful Paint (LCP)', async ({ page }) => {
      await page.goto('/');
      
      // Measure LCP using Performance Observer
      const lcp = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Fallback timeout
          setTimeout(() => resolve(0), 5000);
        });
      });
      
      // LCP should be under 2.5 seconds (good threshold)
      expect(lcp).toBeLessThan(2500);
      
      console.log(`[DEBUG_LOG] LCP: ${lcp}ms`);
    });

    test('measures First Input Delay (FID) simulation', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Wait for page to be interactive
      await page.waitForLoadState('networkidle');
      
      const startTime = Date.now();
      
      // Simulate user interaction
      const button = page.locator('button').first();
      if (await button.isVisible()) {
        await button.click();
      }
      
      const responseTime = Date.now() - startTime;
      
      // Response should be under 100ms (good FID threshold)
      expect(responseTime).toBeLessThan(100);
      
      console.log(`[DEBUG_LOG] Simulated FID: ${responseTime}ms`);
    });

    test('measures Cumulative Layout Shift (CLS)', async ({ page }) => {
      await page.goto('/');
      
      // Measure CLS
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;
          
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
          }).observe({ entryTypes: ['layout-shift'] });
          
          // Resolve after a delay to capture layout shifts
          setTimeout(() => resolve(clsValue), 3000);
        });
      });
      
      // CLS should be under 0.1 (good threshold)
      expect(cls).toBeLessThan(0.1);
      
      console.log(`[DEBUG_LOG] CLS: ${cls}`);
    });
  });

  test.describe('Resource Loading Performance', () => {
    test('images load efficiently', async ({ page }) => {
      await page.goto('/');
      
      // Get all images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        const startTime = Date.now();
        
        // Wait for all images to load
        for (let i = 0; i < Math.min(imageCount, 10); i++) {
          const img = images.nth(i);
          if (await img.isVisible()) {
            await expect(img).toHaveAttribute('src', /.+/);
          }
        }
        
        const loadTime = Date.now() - startTime;
        
        // Images should load within reasonable time
        expect(loadTime).toBeLessThan(3000);
        
        console.log(`[DEBUG_LOG] Images load time: ${loadTime}ms for ${Math.min(imageCount, 10)} images`);
      }
    });

    test('JavaScript bundles are optimally sized', async ({ page }) => {
      const response = await page.goto('/');
      
      // Check main bundle size
      const resources = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter(entry => entry.name.includes('.js'))
          .map(entry => ({
            name: entry.name,
            size: entry.transferSize || entry.encodedBodySize,
            loadTime: entry.responseEnd - entry.requestStart
          }));
      });
      
      const totalJSSize = resources.reduce((sum, resource) => sum + (resource.size || 0), 0);
      
      // Total JS should be under 1MB for good performance
      expect(totalJSSize).toBeLessThan(1024 * 1024);
      
      console.log(`[DEBUG_LOG] Total JS bundle size: ${(totalJSSize / 1024).toFixed(2)}KB`);
      
      // Individual bundles shouldn't be too large
      resources.forEach(resource => {
        if (resource.size > 500 * 1024) { // 500KB threshold
          console.log(`[DEBUG_LOG] Large JS bundle detected: ${resource.name} - ${(resource.size / 1024).toFixed(2)}KB`);
        }
      });
    });

    test('CSS loads efficiently', async ({ page }) => {
      await page.goto('/');
      
      const cssResources = await page.evaluate(() => {
        return performance.getEntriesByType('resource')
          .filter(entry => entry.name.includes('.css'))
          .map(entry => ({
            name: entry.name,
            size: entry.transferSize || entry.encodedBodySize,
            loadTime: entry.responseEnd - entry.requestStart
          }));
      });
      
      const totalCSSSize = cssResources.reduce((sum, resource) => sum + (resource.size || 0), 0);
      
      // Total CSS should be under 200KB
      expect(totalCSSSize).toBeLessThan(200 * 1024);
      
      console.log(`[DEBUG_LOG] Total CSS size: ${(totalCSSSize / 1024).toFixed(2)}KB`);
    });
  });

  test.describe('API Performance', () => {
    test('API responses are fast', async ({ page }) => {
      // Mock API responses to test frontend performance
      await page.route('**/api/**', async route => {
        const startTime = Date.now();
        
        // Simulate API response
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: Array.from({ length: 50 }, (_, i) => ({
              id: i,
              name: `Item ${i}`,
              description: `Description for item ${i}`
            }))
          })
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`[DEBUG_LOG] API response time: ${responseTime}ms`);
      });
      
      await page.goto('/dashboard');
      
      // Trigger API call
      const refreshButton = page.locator('button:has-text("Refresh"), button:has-text("Load")').first();
      if (await refreshButton.isVisible()) {
        const startTime = Date.now();
        await refreshButton.click();
        
        // Wait for data to load
        await page.waitForTimeout(100);
        
        const totalTime = Date.now() - startTime;
        
        // Total time including rendering should be fast
        expect(totalTime).toBeLessThan(1000);
        
        console.log(`[DEBUG_LOG] Total API + render time: ${totalTime}ms`);
      }
    });

    test('handles large datasets efficiently', async ({ page }) => {
      // Mock large dataset
      await page.route('**/api/meals**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: Array.from({ length: 1000 }, (_, i) => ({
              id: i,
              name: `Meal ${i}`,
              calories: 300 + (i % 500),
              protein: 20 + (i % 30),
              restaurant: `Restaurant ${i % 50}`
            }))
          })
        });
      });
      
      const startTime = Date.now();
      
      await page.goto('/meals');
      
      // Wait for content to render
      await expect(page.locator('.meal-card, [data-testid*="meal"]').first()).toBeVisible();
      
      const renderTime = Date.now() - startTime;
      
      // Should handle large datasets within reasonable time
      expect(renderTime).toBeLessThan(5000);
      
      console.log(`[DEBUG_LOG] Large dataset render time: ${renderTime}ms`);
    });
  });

  test.describe('Memory Performance', () => {
    test('memory usage stays within bounds during navigation', async ({ page }) => {
      // Navigate through multiple pages to test memory leaks
      const pages = ['/', '/dashboard', '/meals', '/restaurants', '/profile'];
      
      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        // Get memory usage
        const memoryInfo = await page.evaluate(() => {
          if ('memory' in performance) {
            return {
              usedJSHeapSize: performance.memory.usedJSHeapSize,
              totalJSHeapSize: performance.memory.totalJSHeapSize,
              jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
          }
          return null;
        });
        
        if (memoryInfo) {
          console.log(`[DEBUG_LOG] Memory usage on ${pagePath}: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
          
          // Memory usage shouldn't exceed 100MB
          expect(memoryInfo.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
        }
      }
    });

    test('no memory leaks in dynamic content updates', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Get initial memory
      const initialMemory = await page.evaluate(() => {
        return 'memory' in performance ? performance.memory.usedJSHeapSize : 0;
      });
      
      // Simulate multiple content updates
      for (let i = 0; i < 10; i++) {
        // Trigger content updates
        const refreshButton = page.locator('button:has-text("Refresh")').first();
        if (await refreshButton.isVisible()) {
          await refreshButton.click();
          await page.waitForTimeout(100);
        }
      }
      
      // Force garbage collection if possible
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });
      
      const finalMemory = await page.evaluate(() => {
        return 'memory' in performance ? performance.memory.usedJSHeapSize : 0;
      });
      
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory;
        console.log(`[DEBUG_LOG] Memory increase after updates: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
        
        // Memory increase should be minimal (under 10MB)
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      }
    });
  });

  test.describe('Mobile Performance', () => {
    test('mobile page loads efficiently', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      
      await page.goto('/');
      
      // Wait for mobile-optimized content
      await expect(page.locator('main, .main-content')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Mobile should load within 4 seconds (accounting for slower connections)
      expect(loadTime).toBeLessThan(4000);
      
      console.log(`[DEBUG_LOG] Mobile page load time: ${loadTime}ms`);
    });

    test('touch interactions are responsive', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');
      
      // Test touch interaction responsiveness
      const button = page.locator('button').first();
      if (await button.isVisible()) {
        const startTime = Date.now();
        
        // Simulate touch
        await button.tap();
        
        const responseTime = Date.now() - startTime;
        
        // Touch response should be immediate
        expect(responseTime).toBeLessThan(50);
        
        console.log(`[DEBUG_LOG] Touch response time: ${responseTime}ms`);
      }
    });
  });

  test.describe('Network Performance', () => {
    test('performs well on slow networks', async ({ page, context }) => {
      // Simulate slow 3G connection
      await context.route('**/*', async route => {
        // Add delay to simulate slow network
        await new Promise(resolve => setTimeout(resolve, 100));
        await route.continue();
      });
      
      const startTime = Date.now();
      
      await page.goto('/');
      
      // Wait for critical content
      await expect(page.locator('h1, h2, .hero')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Should still be usable on slow networks (under 8 seconds)
      expect(loadTime).toBeLessThan(8000);
      
      console.log(`[DEBUG_LOG] Slow network load time: ${loadTime}ms`);
    });

    test('handles offline scenarios gracefully', async ({ page, context }) => {
      await page.goto('/dashboard');
      
      // Go offline
      await context.setOffline(true);
      
      // Try to navigate
      const link = page.locator('a').first();
      if (await link.isVisible()) {
        await link.click();
        
        // Should show offline message or cached content
        await expect(page.locator('text=/offline|no connection|cached/i')).toBeVisible();
      }
      
      // Go back online
      await context.setOffline(false);
    });
  });

  test.describe('Rendering Performance', () => {
    test('smooth scrolling performance', async ({ page }) => {
      await page.goto('/meals');
      
      // Wait for content to load
      await expect(page.locator('.meal-card').first()).toBeVisible();
      
      const startTime = Date.now();
      
      // Perform scrolling
      for (let i = 0; i < 5; i++) {
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(100);
      }
      
      const scrollTime = Date.now() - startTime;
      
      // Scrolling should be smooth and fast
      expect(scrollTime).toBeLessThan(1000);
      
      console.log(`[DEBUG_LOG] Scroll performance: ${scrollTime}ms for 5 scroll actions`);
    });

    test('animation performance', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for animated elements
      const animatedElement = page.locator('.animate, [data-testid*="animate"], .transition').first();
      
      if (await animatedElement.isVisible()) {
        const startTime = Date.now();
        
        // Trigger animation
        await animatedElement.hover();
        
        // Wait for animation to complete
        await page.waitForTimeout(500);
        
        const animationTime = Date.now() - startTime;
        
        // Animation should complete quickly
        expect(animationTime).toBeLessThan(1000);
        
        console.log(`[DEBUG_LOG] Animation time: ${animationTime}ms`);
      }
    });
  });
});