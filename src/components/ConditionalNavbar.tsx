"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't render navbar on the home page or admin page
  if (pathname === "/" || pathname.startsWith("/admin")) {
    return null;
  }

  return <Navbar />;
}
