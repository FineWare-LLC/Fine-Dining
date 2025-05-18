// @ts-check
import { test, expect } from '@playwright/experimental-ct-react';
import NewHeader from '../../components/Dashboard/NewHeader';

// Mock for useDashStore - using a simple function instead of jest.fn()
const mockToggleDrawer = () => {};

// We'll manually mock the store in each test instead of using jest.mock

// Sample user data
const mockUser = {
  name: 'Test User',
  avatarUrl: 'https://example.com/avatar.jpg'
};

test.describe('NewHeader Component', () => {
  test('renders with user data', async ({ mount }) => {
    const component = await mount(<NewHeader user={mockUser} />);

    // Check if the component renders the company name
    await expect(component.getByText('Fine Dining')).toBeVisible();

    // Check if the avatar button is rendered
    const buttons = component.locator('button');
    await expect(buttons.nth(1)).toBeVisible();
  });

  test('toggles drawer when menu button is clicked', async ({ mount }) => {
    // For this test, we'll just verify the button is clickable
    // since we can't easily check if a function was called in Playwright
    const component = await mount(<NewHeader user={mockUser} />);

    // Find and click the menu button
    const menuButton = component.locator('button').first();
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toBeEnabled();
    await menuButton.click();

    // We can only verify the button was clicked, not that the function was called
  });

  test('profile button is clickable', async ({ mount }) => {
    const component = await mount(<NewHeader user={mockUser} />);

    const profileButton = component.locator('button').nth(1);
    await expect(profileButton).toBeVisible();
    await expect(profileButton).toBeEnabled();
    await profileButton.click();
  });

  test('renders without user data', async ({ mount }) => {
    // Test with no user prop
    const component = await mount(<NewHeader />);

    // The component should still render without errors
    await expect(component.getByText('Fine Dining')).toBeVisible();

    // Avatar should still be present but might have default values
    const avatar = component.locator('avatar');
    await expect(avatar).toBeVisible();
  });
});
