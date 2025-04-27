"use client";

import { useState, useEffect } from 'react';

interface FollowButtonProps {
  href: string;
}

export function FollowButton({ href }: FollowButtonProps) {
  // Add state to control rendering
  const [mounted, setMounted] = useState(false);

  // Only render after component has mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // If not mounted yet, return a placeholder with the same dimensions
  if (!mounted) {
    return (
      <span className="inline-block py-1 px-4 text-sm font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-white">
        FOLLOW
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block py-1 px-4 text-sm font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-white hover:bg-[#fff0e6] hover:text-orange-600"
    >
      FOLLOW
    </a>
  );
}
