import { test, expect } from '@playwright/experimental-ct-react';
import AvatarUpload from '../../components/Profile/AvatarUpload';

const user = { name: 'John Doe', avatarUrl: '' };

function imageFile() {
  return {
    name: 'test.png',
    mimeType: 'image/png',
    buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/xcAAn8B9YxVigAAAABJRU5ErkJggg==', 'base64')
  };
}

test('drag and drop updates preview', async ({ mount }) => {
  const component = await mount(<AvatarUpload user={user} onUpload={() => {}} />);
  const input = component.locator('input[type="file"]');
  await input.setInputFiles(imageFile());
  const img = component.locator('img');
  await expect(img).toHaveAttribute('src', /blob:/);
});

test('fallback initials when no avatar', async ({ mount }) => {
  const component = await mount(<AvatarUpload user={user} onUpload={() => {}} />);
  const img = component.locator('img');
  await expect(img).toHaveAttribute('src', /data:image\/svg\+xml/);
});
