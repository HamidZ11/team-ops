import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The floating dev badge sits over the sidebar footer in screenshots; errors still show as an overlay.
  devIndicators: false,
  cacheComponents: true,
  // Unified became the application at "/"; keep old links (and their ?scope/?r state) working.
  redirects() {
    return [{ source: "/prototypes/unified", destination: "/", permanent: false }];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
