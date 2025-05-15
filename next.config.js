/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {},
  images: {
    domains: ["sti-race-connect.sgp1.digitaloceanspaces.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sti-race-connect.sgp1.digitaloceanspaces.com",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
};

module.exports = nextConfig;
