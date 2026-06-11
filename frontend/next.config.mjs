import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSecurityHeaders } from './src/utils/headers.ts';

const frontendDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(frontendDir, '..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,

  // The optimizer imports code and native packages from the repo root.
  outputFileTracingRoot: repoRoot,

  compress: true,
  poweredByHeader: false,

  serverExternalPackages: ['highs-addon', 'bcrypt'],

  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@highs': path.resolve(repoRoot, 'highs-pipeline'),
    };
    return config;
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  async headers() {
    const securityHeaders = buildSecurityHeaders();

    return [
      {
        source: '/(.*)',
        headers: Object.entries(securityHeaders).map(([key, value]) => ({
          key,
          value,
        })),
      },
    ];
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/admin/crawler',
          destination: '/admin-crawler',
        },
      ],
    };
  },
};

export default nextConfig;
