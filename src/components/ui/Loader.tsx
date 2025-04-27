"use client";

import React, { useEffect, useState } from 'react';
import { useLoader } from '@/context/LoaderContext';

export function Loader() {
  const { isLoading, loaderType } = useLoader();
  const [isMounted, setIsMounted] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Add a safety timeout to hide the loader if it gets stuck
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('Loader safety timeout triggered');
        setFadeOut(true);

        // Give time for fade out animation before completely removing
        setTimeout(() => {
          setIsMounted(false);
        }, 500);
      }
    }, 10000);

    return () => clearTimeout(safetyTimeout);
  }, [isLoading]);

  // Handle changes to isLoading state
  useEffect(() => {
    let fadeOutTimer: NodeJS.Timeout | null = null;

    if (!isLoading && isMounted) {
      // Add fade out effect before removing the loader
      setFadeOut(true);
      fadeOutTimer = setTimeout(() => {
        setFadeOut(false);
      }, 500);
    } else if (isLoading && isMounted) {
      setFadeOut(false);
    }

    return () => {
      if (fadeOutTimer) clearTimeout(fadeOutTimer);
    };
  }, [isLoading, isMounted]);

  // Don't render if not mounted or not loading and fade out is complete
  if (!isMounted || (!isLoading && !fadeOut)) return null;

  // Determine which video file to use based on loader type
  let videoSrc = '';
  let loadingText = '';

  switch (loaderType) {
    case 'page':
      videoSrc = '/assets/loding.webm';
      loadingText = 'Loading...';
      break;
    case 'summarize':
      videoSrc = '/assets/loding.webm';
      loadingText = 'Summarizing with AI...';
      break;
    case 'ai-generate':
      videoSrc = '/assets/ailoader.webm';
      loadingText = 'Generating content...';
      break;
    default:
      videoSrc = '/assets/loding.webm';
      loadingText = 'Loading...';
  }

  return (
    <div className={`loader-overlay ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loader-container">
        <div className="loader-animation">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
            onLoadedData={() => setVideoLoaded(true)}
          >
            <source src={videoSrc} type="video/webm" />
            Your browser does not support the video tag.
          </video>
          {!videoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black"></div>
            </div>
          )}
        </div>
        <p className="loader-text">
          {loadingText}
        </p>
      </div>
    </div>
  );
}
