/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    USE_GPU: process.env.USE_GPU || '',
    DISABLE_GPU: process.env.DISABLE_GPU || ''
  },
};

export default nextConfig;
