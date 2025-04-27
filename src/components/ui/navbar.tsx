"use client";

import { Menu, Search } from "lucide-react";
import Link from "next/link";
import '@/styles/neo-brutalism.css';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

interface NavbarProps {
  logo?: {
    url: string;
    title: string;
  };
}

export function Navbar({
  logo = {
    url: "/",
    title: "Syntax and Sips",
  }
}: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="py-4 neo-brutalism relative">
      <div className="container mx-auto px-4 relative z-10">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href={logo.url} className="flex items-center gap-2">
              <span className="text-2xl font-bold font-florisha text-fuchsia-600">
                {logo.title}
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/blogs"
              className="neo-link text-lg font-bold hover:underline"
            >
              Blogs
            </Link>

            <Link
              href="/changelog"
              className="neo-link text-lg font-bold hover:underline"
            >
              Changelog
            </Link>

            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="neo-button inline-block p-2"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="neo-button inline-block p-2"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="neo-button inline-block p-2"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                    <Link href={logo.url} className="flex items-center gap-2">
                      <span className="text-xl font-bold font-florisha text-fuchsia-600 transform -rotate-1">
                        {logo.title}
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <div className="my-6 flex flex-col gap-4">
                  <Link href="/blogs" className="neo-button inline-block py-2 px-4 text-center">
                    Blogs
                  </Link>
                  <Link href="/changelog" className="neo-button inline-block py-2 px-4 text-center">
                    Changelog
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>

        {/* Search Overlay */}
        {searchOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="neo-container max-w-2xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Search</h2>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="neo-button inline-block py-1 px-3 text-sm"
                >
                  Close
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for articles..."
                  className="w-full p-3 border-3 border-black bg-white"
                  autoFocus
                />
                <button
                  type="button"
                  className="neo-button absolute right-2 top-2 py-1 px-3 text-sm"
                >
                  <Search className="h-4 w-4 inline-block mr-1" />
                  Search
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
