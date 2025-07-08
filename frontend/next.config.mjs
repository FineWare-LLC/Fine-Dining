/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Bundle optimization
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    USE_GPU: process.env.USE_GPU || '',
    DISABLE_GPU: process.env.DISABLE_GPU || '',
    OVERPASS_URL: process.env.OVERPASS_URL || 'https://overpass-api.de/api/interpreter',
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY || ''
  },
};

export default nextConfig;
