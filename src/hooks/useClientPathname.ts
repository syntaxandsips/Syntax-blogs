"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useClientPathname(initialPathname = "/") {
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState(initialPathname);

  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname);
    }
  }, [pathname]);

  return currentPath;
}
