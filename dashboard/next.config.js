/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@tremor/react"],
    serverActions: true,
  },
};

module.exports = nextConfig;
