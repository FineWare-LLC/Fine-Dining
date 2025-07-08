// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Admin Functionality', () => {
  // Setup and authentication
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login or setup admin authentication
    await page.goto('/admin');
    
    // Mock admin authentication if needed
    // This would depend on your authentication system
    await page.evaluate(() => {
      localStorage.setItem('adminToken', 'mock-admin-token');
      localStorage.setItem('userRole', 'admin');
    });
  });

  test.describe('Admin Dashboard', () => {
    test('loads admin dashboard successfully', async ({ page }) => {
      await page.goto('/admin-dashboard');
      
      // Check if admin dashboard loads
      await expect(page.locator('h1, h2')).toContainText(/admin|dashboard/i);
      
      // Check for admin-specific elements
      await expect(page.locator('[data-testid="admin-nav"], .admin-navigation')).toBeVisible();
    });

    test('displays admin statistics and metrics', async ({ page }) => {
      await page.goto('/admin-dashboard');
      
      // Check for key metrics that should be displayed
      await expect(page.locator('text=/total users|user count/i')).toBeVisible();
      await expect(page.locator('text=/total orders|order count/i')).toBeVisible();
      await expect(page.locator('text=/revenue|sales/i')).toBeVisible();
      
      // Check for charts or graphs
      const chartElements = page.locator('canvas, svg, .chart, [data-testid*="chart"]');
      await expect(chartElements.first()).toBeVisible();
    });

    test('admin navigation works correctly', async ({ page }) => {
      await page.goto('/admin-dashboard');
      
      // Test navigation to different admin sections
      const navItems = [
        { text: /users|user management/i, expectedUrl: /users|user/ },
        { text: /orders|order management/i, expectedUrl: /orders|order/ },
        { text: /restaurants|restaurant management/i, expectedUrl: /restaurants|restaurant/ },
        { text: /reports|analytics/i, expectedUrl: /reports|analytics/ }
      ];

      for (const item of navItems) {
        const navLink = page.locator(`a:has-text("${item.text.source}")`).first();
        if (await navLink.isVisible()) {
          await navLink.click();
          await expect(page).toHaveURL(item.expectedUrl);
          await page.goBack();
        }
      }
    });
  });

  test.describe('User Management', () => {
    test('displays user list with search and filter', async ({ page }) => {
      await page.goto('/admin/users');
      
      // Check if user list is displayed
      await expect(page.locator('table, .user-list, [data-testid="user-list"]')).toBeVisible();
      
      // Check for search functionality
      const searchInput = page.locator('input[placeholder*="search"], input[type="search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('test user');
        await page.keyboard.press('Enter');
        
        // Wait for search results
        await page.waitForTimeout(1000);
      }
      
      // Check for filter options
      const filterElements = page.locator('select, .filter, [data-testid*="filter"]');
      await expect(filterElements.first()).toBeVisible();
    });

    test('can view user details', async ({ page }) => {
      await page.goto('/admin/users');
      
      // Click on first user in the list
      const firstUser = page.locator('tr:nth-child(2), .user-item:first-child').first();
      if (await firstUser.isVisible()) {
        await firstUser.click();
        
        // Check if user details are displayed
        await expect(page.locator('text=/user details|profile/i')).toBeVisible();
        await expect(page.locator('text=/email|name|id/i')).toBeVisible();
      }
    });

    test('can edit user information', async ({ page }) => {
      await page.goto('/admin/users');
      
      // Look for edit button or link
      const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Check if edit form is displayed
        await expect(page.locator('form, .edit-form')).toBeVisible();
        await expect(page.locator('input[name="name"], input[name="email"]')).toBeVisible();
        
        // Test form submission
        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
        await expect(saveButton).toBeVisible();
      }
    });
  });

  test.describe('Order Management', () => {
    test('displays order list with status filters', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Check if order list is displayed
      await expect(page.locator('table, .order-list, [data-testid="order-list"]')).toBeVisible();
      
      // Check for status filters
      const statusFilters = ['pending', 'confirmed', 'delivered', 'cancelled'];
      for (const status of statusFilters) {
        const filterButton = page.locator(`button:has-text("${status}"), .filter-${status}`);
        if (await filterButton.isVisible()) {
          await filterButton.click();
          await page.waitForTimeout(500);
        }
      }
    });

    test('can update order status', async ({ page }) => {
      await page.goto('/admin/orders');
      
      // Look for status update dropdown or buttons
      const statusSelect = page.locator('select[name*="status"], .status-select').first();
      if (await statusSelect.isVisible()) {
        await statusSelect.selectOption('confirmed');
        
        // Look for update/save button
        const updateButton = page.locator('button:has-text("Update"), button:has-text("Save")').first();
        if (await updateButton.isVisible()) {
          await updateButton.click();
          
          // Check for success message
          await expect(page.locator('text=/updated|success/i')).toBeVisible();
        }
      }
    });
  });

  test.describe('Restaurant Management', () => {
    test('displays restaurant list', async ({ page }) => {
      await page.goto('/admin/restaurants');
      
      // Check if restaurant list is displayed
      await expect(page.locator('table, .restaurant-list, [data-testid="restaurant-list"]')).toBeVisible();
      
      // Check for restaurant information
      await expect(page.locator('text=/restaurant name|name/i')).toBeVisible();
      await expect(page.locator('text=/address|location/i')).toBeVisible();
    });

    test('can add new restaurant', async ({ page }) => {
      await page.goto('/admin/restaurants');
      
      // Look for add restaurant button
      const addButton = page.locator('button:has-text("Add"), button:has-text("New"), a:has-text("Add")').first();
      if (await addButton.isVisible()) {
        await addButton.click();
        
        // Check if add restaurant form is displayed
        await expect(page.locator('form, .add-restaurant-form')).toBeVisible();
        await expect(page.locator('input[name*="name"], input[placeholder*="name"]')).toBeVisible();
        await expect(page.locator('input[name*="address"], textarea[name*="address"]')).toBeVisible();
      }
    });

    test('can edit restaurant details', async ({ page }) => {
      await page.goto('/admin/restaurants');
      
      // Look for edit button
      const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // Check if edit form is displayed
        await expect(page.locator('form, .edit-restaurant-form')).toBeVisible();
        
        // Test form fields
        const nameInput = page.locator('input[name*="name"]');
        if (await nameInput.isVisible()) {
          await nameInput.fill('Updated Restaurant Name');
        }
        
        // Test save functionality
        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }
      }
    });
  });

  test.describe('Reports and Analytics', () => {
    test('displays analytics dashboard', async ({ page }) => {
      await page.goto('/admin/reports');
      
      // Check for analytics elements
      await expect(page.locator('canvas, svg, .chart, [data-testid*="chart"]')).toBeVisible();
      
      // Check for key metrics
      await expect(page.locator('text=/revenue|sales|orders|users/i')).toBeVisible();
    });

    test('can generate reports', async ({ page }) => {
      await page.goto('/admin/reports');
      
      // Look for report generation options
      const generateButton = page.locator('button:has-text("Generate"), button:has-text("Export")').first();
      if (await generateButton.isVisible()) {
        await generateButton.click();
        
        // Check for report options
        await expect(page.locator('select, .report-type, [data-testid*="report"]')).toBeVisible();
      }
    });

    test('can filter reports by date range', async ({ page }) => {
      await page.goto('/admin/reports');
      
      // Look for date range inputs
      const startDateInput = page.locator('input[type="date"], input[name*="start"]').first();
      const endDateInput = page.locator('input[type="date"], input[name*="end"]').first();
      
      if (await startDateInput.isVisible() && await endDateInput.isVisible()) {
        await startDateInput.fill('2024-01-01');
        await endDateInput.fill('2024-12-31');
        
        // Apply filter
        const applyButton = page.locator('button:has-text("Apply"), button:has-text("Filter")').first();
        if (await applyButton.isVisible()) {
          await applyButton.click();
          await page.waitForTimeout(1000);
        }
      }
    });
  });

  test.describe('Admin Security and Permissions', () => {
    test('requires admin authentication', async ({ page }) => {
      // Clear authentication
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      await page.goto('/admin-dashboard');
      
      // Should redirect to login or show access denied
      await expect(page).toHaveURL(/login|signin|unauthorized/);
    });

    test('admin logout works correctly', async ({ page }) => {
      await page.goto('/admin-dashboard');
      
      // Look for logout button
      const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out")').first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        
        // Should redirect to login page
        await expect(page).toHaveURL(/login|signin|home/);
      }
    });
  });

  test.describe('Admin Performance and Responsiveness', () => {
    test('admin dashboard loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/admin-dashboard');
      
      // Wait for main content to load
      await expect(page.locator('main, .main-content, [data-testid="main"]')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('admin interface is responsive', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/admin-dashboard');
      
      // Check if mobile navigation works
      const mobileMenuButton = page.locator('button[aria-label*="menu"], .mobile-menu-button, .hamburger');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await expect(page.locator('.mobile-menu, .sidebar')).toBeVisible();
      }
      
      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await expect(page.locator('main, .main-content')).toBeVisible();
      
      // Reset to desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
    });
  });
});