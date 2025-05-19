/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    USE_GPU: process.env.USE_GPU || ''
  },
};

export default nextConfig;
