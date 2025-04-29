"use client";

import { usePathname } from "next/navigation";
import { NewNavbar } from "@/components/ui/NewNavbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't render navbar on the home page or admin page
  // We now include the navbar directly in the home page component
  if (pathname === "/" || pathname.startsWith("/admin")) {
    return null;
  }

  return <NewNavbar />;
}
