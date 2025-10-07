"use client";

import { useEffect, useState } from "react";

type PathListener = (pathname: string) => void;

const listeners = new Set<PathListener>();

let cleanupHandlers: (() => void) | null = null;

function notifyAll(pathname: string) {
  listeners.forEach((listener) => listener(pathname));
}

function ensureHistoryPatched() {
  if (cleanupHandlers || typeof window === "undefined") {
    return;
  }

  const handleNavigation = () => {
    notifyAll(window.location.pathname);
  };

  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  const wrapHistoryMethod = <TArgs extends unknown[]>(
    original: (...args: TArgs) => void,
  ) => {
    return function patched(this: History, ...args: TArgs) {
      original.apply(this, args);
      handleNavigation();
    };
  };

  window.history.pushState = wrapHistoryMethod(originalPushState);
  window.history.replaceState = wrapHistoryMethod(originalReplaceState);
  window.addEventListener("popstate", handleNavigation);

  cleanupHandlers = () => {
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    window.removeEventListener("popstate", handleNavigation);
    cleanupHandlers = null;
  };
}

export function useClientPathname() {
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window === "undefined") {
      return "/";
    }

    return window.location.pathname;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return () => undefined;
    }

    ensureHistoryPatched();

    const listener: PathListener = (nextPathname) => {
      setPathname(nextPathname);
    };

    listeners.add(listener);

    // Ensure the initial path is in sync when the hook mounts.
    listener(window.location.pathname);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && cleanupHandlers) {
        cleanupHandlers();
      }
    };
  }, []);

  return pathname;
}
