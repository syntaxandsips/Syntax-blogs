import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === 'true'

const remotePatterns = [
  { protocol: 'https', hostname: 'images.unsplash.com' },
  { protocol: 'https', hostname: 'i.ytimg.com' },
  { protocol: 'https', hostname: 'img.youtube.com' },
  { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
  { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
]

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
  images: isStaticExport
    ? {
        unoptimized: true,
      }
    : {
        remotePatterns,
        formats: ['image/avif', 'image/webp'],
      },
}

export default nextConfig;
