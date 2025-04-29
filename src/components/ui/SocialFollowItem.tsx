"use client";

import React from 'react';

interface SocialFollowItemProps {
  platform: string;
  handle: string;
  icon: React.ReactNode;
}

export function SocialFollowItem({ platform, handle, icon }: SocialFollowItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="font-bold">{handle}</div>
          <div className="text-sm text-gray-600">{platform}</div>
        </div>
      </div>
      <button className="border-2 border-black px-3 py-1 font-bold hover:bg-black hover:text-white transition">
        FOLLOW
      </button>
    </div>
  );
}
