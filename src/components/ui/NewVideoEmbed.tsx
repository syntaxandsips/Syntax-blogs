"use client";

import React from 'react';

interface VideoEmbedProps {
  videoId: string;
  title?: string;
}

export function NewVideoEmbed({ videoId, title = 'Embedded video' }: VideoEmbedProps) {
  return (
    <div className="my-6 border-4 border-black rounded-lg overflow-hidden">
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        ></iframe>
      </div>
    </div>
  );
}
