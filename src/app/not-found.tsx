"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotFound() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F5F0E1]">
      <div className="grid-background absolute inset-0 z-0 opacity-30"></div>

      <div className="neo-container max-w-2xl w-full text-center relative z-10">
        <div className="loader-animation mx-auto">
          {isMounted ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            >
              <source src="/assets/404.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
            </div>
          )}
        </div>

        <h1 className="text-4xl font-bold mt-6 mb-2">Page Not Found</h1>
        <p className="text-lg mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>

        <Link href="/" className="neo-button bg-yellow-400 py-3 px-8 text-lg hover:-translate-y-1 transition-transform">
          Return Home
        </Link>
      </div>
    </div>
  );
}
