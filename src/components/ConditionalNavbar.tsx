"use client";

import { useClientPathname } from "@/hooks/useClientPathname";
import { NewNavbar } from "@/components/ui/NewNavbar";

export default function ConditionalNavbar() {
  const pathname = useClientPathname();

  if (pathname === "/" || pathname.startsWith("/admin")) {
    return null;
  }

  return <NewNavbar />;
}
