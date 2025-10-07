"use client";

import { useClientPathname } from "@/hooks/useClientPathname";
import { NewNavbar } from "@/components/ui/NewNavbar";

type ConditionalNavbarProps = {
  initialPathname?: string;
};

export default function ConditionalNavbar({
  initialPathname,
}: ConditionalNavbarProps) {
  const pathname = useClientPathname(initialPathname);

  if (pathname === "/" || pathname.startsWith("/admin")) {
    return null;
  }

  return <NewNavbar />;
}
