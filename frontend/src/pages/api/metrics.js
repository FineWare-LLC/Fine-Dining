import { register } from '@/lib/metrics.js';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
}
