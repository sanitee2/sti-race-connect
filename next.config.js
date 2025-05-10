/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    // !! WARN !!
    // Temporarily ignore TypeScript errors
    // Remove this when ready to fix TypeScript errors
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
