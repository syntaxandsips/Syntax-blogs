import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Set the base path if your site will be deployed to a subdirectory
  // basePath: '/syntaxblogs',
  // Disable image optimization since GitHub Pages doesn't support it
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes for consistent routing
  trailingSlash: true,
};

export default nextConfig;
