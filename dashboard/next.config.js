/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: To use --target bundler option in wasm-pack,
  // use the following setting to customize webpack.
  //
  // webpack: (config, { isServer }) => {
  //   config.experiments = {
  //     asyncWebAssembly: true,
  //     layers: true,
  //   };
  //   config.output.webassemblyModuleFilename =
  //     (isServer ? "../" : "") + "static/wasm/[modulehash].wasm";
  //   return config;
  // },
  experimental: {
    serverComponentsExternalPackages: ["@tremor/react"],
    serverActions: true,
  },
};

module.exports = nextConfig;
