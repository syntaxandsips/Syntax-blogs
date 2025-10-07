"use client";

import { useSyncExternalStore } from "react";

type PathListener = () => void;

const listeners = new Set<PathListener>();

let cleanupHandlers: (() => void) | null = null;

function notifyAll() {
  listeners.forEach((listener) => listener());
}

function ensureHistoryPatched() {
  if (cleanupHandlers || typeof window === "undefined") {
    return;
  }

  const handleNavigation = () => {
    notifyAll();
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

function subscribe(listener: PathListener) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  ensureHistoryPatched();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && cleanupHandlers) {
      cleanupHandlers();
    }
  };
}

const getSnapshot = () =>
  typeof window === "undefined" ? "/" : window.location.pathname;

export function useClientPathname(initialPathname = "/") {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => initialPathname,
  );
}
