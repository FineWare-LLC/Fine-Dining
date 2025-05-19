import { test, expect } from '@playwright/experimental-ct-react';
import ProfileDetails from '../../components/Profile/ProfileDetails';

test('renders basic user info', async ({ mount }) => {
  const user = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'USER',
    accountStatus: 'ACTIVE',
    weight: 65,
    height: 170,
    gender: 'FEMALE',
    measurementSystem: 'METRIC',
    dailyCalories: 2000,
    createdAt: new Date().toISOString(),
    avatarUrl: ''
  };
  const component = await mount(<ProfileDetails user={user} />);
  await expect(component.getByText('Jane Doe')).toBeVisible();
  await expect(component.getByText('jane@example.com')).toBeVisible();

  const dts = component.locator('dl dt');
  const dds = component.locator('dl dd');
  await expect(dts).toHaveCount(7);
  await expect(dds).toHaveCount(7);
  await expect(component.locator('dl dt + dd')).toHaveCount(7);
});

test('renders role and status chips with aria labels', async ({ mount }) => {
  const user = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'ADMIN',
    accountStatus: 'PENDING',
    weight: 65,
    height: 170,
    gender: 'FEMALE',
    measurementSystem: 'METRIC',
    dailyCalories: 2000,
    createdAt: new Date().toISOString(),
    avatarUrl: ''
  };
  const component = await mount(<ProfileDetails user={user} />);
  await expect(component.getByLabelText('User role: ADMIN')).toBeVisible();
  await expect(component.getByLabelText('User status: PENDING')).toBeVisible();
});
