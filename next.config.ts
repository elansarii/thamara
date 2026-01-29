import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration for sql.js browser compatibility
  turbopack: {
    resolveAlias: {
      // Polyfill Node.js modules that sql.js tries to require
      fs: { browser: './src/lib/empty-module.js' },
      path: { browser: './src/lib/empty-module.js' },
      crypto: { browser: './src/lib/empty-module.js' },
    },
  },
};

export default nextConfig;
