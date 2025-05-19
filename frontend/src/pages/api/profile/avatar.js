import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  const ext = (req.headers['content-type'] || 'image/png').split('/')[1];
  const fileName = `${Date.now()}.${ext}`;
  const dir = path.join(process.cwd(), 'frontend', 'public', 'avatars');
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  await fs.writeFile(filePath, buffer);
  const url = `/avatars/${fileName}`;
  res.status(200).json({ url });
}
