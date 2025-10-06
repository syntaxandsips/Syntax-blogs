import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === 'true'

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: 'export',
        // Ensure trailing slashes for consistent routing during static export
        trailingSlash: true,
      }
    : {}),
  // Set the base path if your site will be deployed to a subdirectory
  // basePath: '/syntaxblogs',
  // Disable image optimization since GitHub Pages doesn't support it
  images: {
    unoptimized: true,
  },
}

export default nextConfig;
