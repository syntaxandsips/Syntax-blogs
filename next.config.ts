import type { NextConfig } from "next";
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

const isStaticExport = process.env.STATIC_EXPORT === 'true'

const remotePatterns: RemotePattern[] = [
  { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
  { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
  { protocol: 'https', hostname: 'img.youtube.com', pathname: '/**' },
  { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
  { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
]

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

if (supabaseUrl) {
  try {
    const { hostname } = new URL(supabaseUrl)

    if (hostname) {
      remotePatterns.push({ protocol: 'https', hostname, pathname: '/**' })
    }
  } catch {
    // ignore invalid Supabase URL and fall back to the default remote patterns
  }
}

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
