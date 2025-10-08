"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type LoaderType = 'page' | 'summarize' | 'ai-generate' | 'none';

interface LoaderContextType {
  isLoading: boolean;
  loaderType: LoaderType;
  startLoading: (type: LoaderType) => void;
  stopLoading: () => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loaderType, setLoaderType] = useState<LoaderType>('none');
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Clear any existing timeout to prevent memory leaks
  const clearLoadingTimeout = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startLoading = React.useCallback((type: LoaderType) => {
    // Clear any existing timeout
    clearLoadingTimeout();

    setIsLoading(true);
    setLoaderType(type);

    // Set a safety timeout to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      if (process.env.NODE_ENV !== 'production') {
        console.info('LoaderContext safety timeout triggered');
      }
      setIsLoading(false);
      setLoaderType('none');
    }, 8000); // 8 seconds max loading time
  }, [clearLoadingTimeout]);

  const stopLoading = React.useCallback(() => {
    // Clear the safety timeout
    clearLoadingTimeout();

    setIsLoading(false);
    setLoaderType('none');
  }, [clearLoadingTimeout]);

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      clearLoadingTimeout();
    };
  }, [clearLoadingTimeout]);

  return (
    <LoaderContext.Provider value={{ isLoading, loaderType, startLoading, stopLoading }}>
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
}
