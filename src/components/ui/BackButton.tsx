"use client";

import Link from 'next/link';

export function BackButton() {
  return (
    <Link href="/blogs" className="neo-button inline-block mb-8 py-2 px-4">
      ← Back to Blogs
    </Link>
  );
}
