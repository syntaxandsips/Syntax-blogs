"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, Coffee, Code } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlobalSearch } from './GlobalSearch';

export const NewNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Function to check if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  // Close mobile menu when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-[#f0f0f0] border-b-4 border-black">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="h-8 w-8 text-[#FF5252]" />
            <Code className="h-8 w-8 text-[#6C63FF]" />
            <Link href="/" className="font-black text-2xl tracking-tighter">
              <span className="bg-[#6C63FF] text-white px-2 py-1 mr-1 rotate-1 inline-block">
                Syntax
              </span>
              <span className="text-[#FF5252]">&</span>
              <span className="bg-[#FF5252] text-white px-2 py-1 ml-1 -rotate-1 inline-block">
                Sips
              </span>
            </Link>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink href="/" isActive={isActive('/')}>
              Home
            </NavLink>
            <NavLink href="/blogs" isActive={isActive('/blogs')}>
              Blogs
            </NavLink>
            <NavLink href="/podcasts" isActive={isActive('/podcasts')}>
              Podcasts
            </NavLink>
            <NavLink href="/changelog" isActive={isActive('/changelog')}>
              Changelogs
            </NavLink>
            <GlobalSearch />
            <button
              type="button"
              className="bg-black text-white px-4 py-2 font-bold rounded-md transform transition hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(255,82,82)]"
            >
              Subscribe
            </button>
          </nav>
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md bg-black text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <MobileNavLink href="/" isActive={isActive('/')}>
                Home
              </MobileNavLink>
              <MobileNavLink href="/blogs" isActive={isActive('/blogs')}>
                Blogs
              </MobileNavLink>
              <MobileNavLink href="/podcasts" isActive={isActive('/podcasts')}>
                Podcasts
              </MobileNavLink>
              <MobileNavLink href="/changelog" isActive={isActive('/changelog')}>
                Changelogs
              </MobileNavLink>
              <div className="md:hidden">
                <GlobalSearch />
              </div>
              <button
                type="button"
                className="bg-black text-white px-4 py-2 font-bold rounded-md w-full"
              >
                Subscribe
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavLink = ({ href, children, isActive }: NavLinkProps) => (
  <Link
    href={href}
    className={`font-bold text-lg relative hover:text-[#6C63FF] transition-colors ${isActive ? 'text-[#6C63FF]' : 'text-black'}`}
  >
    {children}
    {isActive && (
      <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#6C63FF]"></span>
    )}
  </Link>
);

const MobileNavLink = ({ href, children, isActive }: NavLinkProps) => (
  <Link
    href={href}
    className={`block py-2 px-4 font-bold text-lg border-l-4 ${isActive ? 'border-[#6C63FF] bg-[#6C63FF]/10 text-[#6C63FF]' : 'border-transparent hover:border-[#6C63FF] hover:bg-[#6C63FF]/5 hover:text-[#6C63FF]'}`}
  >
    {children}
  </Link>
);
