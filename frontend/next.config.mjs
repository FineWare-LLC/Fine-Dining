/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    USE_GPU: process.env.USE_GPU || '',
    DISABLE_GPU: process.env.DISABLE_GPU || '',
    OVERPASS_URL: process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter',
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY || ''
  },
};

export default nextConfig;
