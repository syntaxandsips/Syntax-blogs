"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, Coffee, Code, Search } from 'lucide-react';
import Link from 'next/link';
import { GlobalSearch } from './GlobalSearch';
import { useClientPathname } from '@/hooks/useClientPathname';

export const NewNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = useClientPathname();

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
        <div className="flex items-center justify-between gap-4">
          <NavbarLogo />
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
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
            <div className="flex items-center gap-3">
              <Link
                href="/me?view=signup"
                className="inline-flex items-center justify-center rounded-md border-2 border-black bg-[#6C63FF] px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(108,99,255,0.45)]"
              >
                Sign up
              </Link>
              <Link
                href="/me"
                className="inline-flex items-center justify-center rounded-md border-2 border-black bg-[#FF5252] px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(255,82,82,0.45)]"
              >
                Sign in
              </Link>
            </div>
            <button
              type="button"
              className="bg-black text-white px-4 py-2 font-bold rounded-md transform transition hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(255,82,82)]"
            >
              Create account
            </Link>
          </nav>
          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new Event('global-search:open'));
              }}
              className="inline-flex items-center justify-center rounded-md border-2 border-black bg-white p-2 text-sm font-semibold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px]"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="p-2 rounded-md bg-black text-white"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
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
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/me?view=signup"
                  className="inline-flex items-center justify-center rounded-md border-2 border-black bg-[#6C63FF] px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(108,99,255,0.45)]"
                >
                  Sign up
                </Link>
                <Link
                  href="/me"
                  className="inline-flex items-center justify-center rounded-md border-2 border-black bg-[#FF5252] px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(255,82,82,0.45)]"
                >
                  Sign in
                </Link>
              </div>
              <button
                type="button"
                className="bg-black text-white px-4 py-2 font-bold rounded-md w-full"
              >
                Create account
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

const NavbarLogo = () => (
  <div className="flex items-center gap-2 flex-shrink-0">
    <Coffee className="h-8 w-8 text-[#FF5252]" />
    <Code className="h-8 w-8 text-[#6C63FF]" />
    <Link
      href="/"
      className="font-black text-2xl tracking-tighter whitespace-nowrap"
      aria-label="Syntax & Sips home"
    >
      <span className="bg-[#6C63FF] text-white px-2 py-1 mr-1 rotate-1 inline-block">
        Syntax
      </span>
      <span className="text-[#FF5252]">&</span>
      <span className="bg-[#FF5252] text-white px-2 py-1 ml-1 -rotate-1 inline-block">
        Sips
      </span>
    </Link>
  </div>
);

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
