/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    config.output.webassemblyModuleFilename =
      (isServer ? "../" : "") + "static/wasm/[modulehash].wasm";
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["@tremor/react"],
    serverActions: true,
  },
};

module.exports = nextConfig;
