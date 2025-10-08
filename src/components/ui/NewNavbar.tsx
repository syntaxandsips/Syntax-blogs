"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Menu, X, Coffee, Code, Search, UserRound, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { GlobalSearch } from './GlobalSearch';
import { useClientPathname } from '@/hooks/useClientPathname';
import { useAuthenticatedProfile } from '@/hooks/useAuthenticatedProfile';
import type { AuthenticatedProfileSummary } from '@/utils/types';
import {
  navigationCategories,
  topLevelNavigation,
  type NavigationCategory,
  type NavigationItem,
} from '@/lib/navigation';

export const NewNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const pathname = useClientPathname();
  const { profile, isLoading } = useAuthenticatedProfile();
  const needsOnboarding = Boolean(profile && profile.onboarding?.status !== 'completed');
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isPathActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const isCategoryActive = (category: NavigationCategory) =>
    category.sections.some((section) => section.items.some((item) => isPathActive(item.href)));

  useEffect(() => {
    if (!openCategory) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const container = dropdownRefs.current[openCategory];
      if (container && !container.contains(event.target as Node)) {
        setOpenCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openCategory]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenCategory(null);
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  // Close menus when navigating
  useEffect(() => {
    setIsOpen(false);
    setOpenCategory(null);
    setExpandedSection(null);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-[#f0f0f0] border-b-4 border-black">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <NavbarLogo />
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 xl:gap-6">
            {topLevelNavigation.map((item) => (
              <NavLink key={item.href} href={item.href} isActive={isPathActive(item.href)}>
                {item.label}
              </NavLink>
            ))}
            {navigationCategories.map((category) => (
              <DesktopNavDropdown
                key={category.label}
                category={category}
                isActive={isCategoryActive(category)}
                isOpen={openCategory === category.label}
                onToggle={(label) =>
                  setOpenCategory((previous) => (previous === label ? null : label))
                }
                registerNode={(node) => {
                  dropdownRefs.current[category.label] = node;
                }}
                isPathActive={isPathActive}
              />
            ))}
            <GlobalSearch />
            <div className="flex items-center gap-3">
              {isLoading ? (
                <span className="h-10 w-10 rounded-full border-2 border-dashed border-black/40 bg-white animate-pulse" aria-hidden />
              ) : profile ? (
                <ProfileShortcut profile={profile} />
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-md border-2 border-black bg-[#6C63FF] px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(108,99,255,0.45)]"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-md border-2 border-black bg-[#FF5252] px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(255,82,82,0.45)]"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
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
              {topLevelNavigation.map((item) => (
                <MobileNavLink
                  key={item.href}
                  href={item.href}
                  isActive={isPathActive(item.href)}
                  description={item.description}
                >
                  {item.label}
                </MobileNavLink>
              ))}
              {navigationCategories.map((category) => (
                <MobileNavSection
                  key={category.label}
                  category={category}
                  isExpanded={expandedSection === category.label}
                  onToggle={() =>
                    setExpandedSection((previous) =>
                      previous === category.label ? null : category.label,
                    )
                  }
                  isActive={isCategoryActive(category)}
                  isPathActive={isPathActive}
                />
              ))}
              {isLoading ? (
                <div className="grid grid-cols-1">
                  <span className="h-10 rounded-lg border-2 border-dashed border-black/40 bg-white animate-pulse" aria-hidden />
                </div>
              ) : profile ? (
                <div className="flex flex-col space-y-3">
                  <Link
                    href="/account"
                    className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-black bg-[#FFD66B] px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.25)]"
                  >
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                    My profile
                  </Link>
                  {needsOnboarding ? (
                    <Link
                      href="/onboarding?redirect=/account"
                      className="inline-flex items-center justify-center rounded-md border-2 border-black bg-[#FF5252] px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(255,82,82,0.35)]"
                    >
                      Finish onboarding
                    </Link>
                  ) : null}
                  <Link
                    href="/account#contributions"
                    className="inline-flex items-center justify-center rounded-md border-2 border-dashed border-black/50 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-black/70"
                  >
                    View contributions
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-md border-2 border-black bg-[#6C63FF] px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(108,99,255,0.45)]"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-md border-2 border-black bg-[#FF5252] px-4 py-2 text-sm font-extrabold uppercase tracking-wide text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(255,82,82,0.45)]"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

interface ProfileShortcutProps {
  profile: AuthenticatedProfileSummary;
}

const ProfileShortcut = ({ profile }: ProfileShortcutProps) => {
  const onboardingStatus = profile.onboarding?.status ?? 'pending';
  const helperLabel = onboardingStatus === 'completed' ? 'Open dashboard' : 'Finish onboarding';
  const helperTone = onboardingStatus === 'completed' ? 'text-[#6C63FF]' : 'text-[#FF5252]';
  const hoverBadgeLabel = onboardingStatus === 'completed' ? 'View' : 'Resume';

  return (
    <Link
      href="/account"
      className="group relative inline-flex items-center gap-3 rounded-full border-2 border-black bg-white px-2 py-1 pr-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)] transition hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)]"
    >
      <span className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-black bg-[#F6EDE3] text-sm font-black uppercase text-black">
        {profile.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt={`${profile.displayName}'s avatar`}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <UserRound className="h-5 w-5" aria-hidden="true" />
        )}
        {onboardingStatus !== 'completed' ? (
          <span className="absolute -top-1 -right-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-black bg-[#FF5252] text-[10px] font-black text-white">
            !
          </span>
        ) : null}
      </span>
      <span className="hidden flex-col text-left xl:flex">
        <span className="text-sm font-extrabold leading-tight text-black">
          {profile.displayName}
        </span>
        <span className={`text-xs font-semibold uppercase tracking-wide ${helperTone}`}>
          {helperLabel}
        </span>
      </span>
      <span className="absolute -bottom-2 right-3 hidden rounded-full bg-[#6C63FF] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] group-hover:block">
        {hoverBadgeLabel}
      </span>
      <span className="sr-only">Go to your profile</span>
    </Link>
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
    className={`relative rounded-full px-4 py-2 text-lg font-extrabold transition-colors hover:text-[#6C63FF] ${
      isActive ? 'text-[#6C63FF]' : 'text-black'
    }`}
  >
    {children}
    {isActive && (
      <span className="absolute -bottom-1 left-4 right-4 h-1 rounded-full bg-[#6C63FF]"></span>
    )}
  </Link>
);

interface MobileNavLinkProps extends NavLinkProps {
  description?: string;
}

const MobileNavLink = ({ href, children, isActive, description }: MobileNavLinkProps) => (
  <Link
    href={href}
    className={`block rounded-2xl border-2 border-black px-4 py-3 text-left shadow-[4px_4px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px] ${
      isActive
        ? 'bg-[#6C63FF] text-white shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)]'
        : 'bg-white text-black'
    }`}
  >
    <span className="text-base font-extrabold uppercase tracking-wide">{children}</span>
    {description ? (
      <span
        className={`mt-2 block text-sm font-semibold leading-snug ${
          isActive ? 'text-white/80' : 'text-gray-600'
        }`}
      >
        {description}
      </span>
    ) : null}
  </Link>
);

interface DesktopNavDropdownProps {
  category: NavigationCategory;
  isOpen: boolean;
  isActive: boolean;
  onToggle: (label: string) => void;
  registerNode: (node: HTMLDivElement | null) => void;
  isPathActive: (path: string) => boolean;
}

const DesktopNavDropdown = ({
  category,
  isOpen,
  isActive,
  onToggle,
  registerNode,
  isPathActive,
}: DesktopNavDropdownProps) => (
  <div
    ref={registerNode}
    className="relative"
  >
    <button
      type="button"
      onClick={() => onToggle(category.label)}
      className={`group inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-lg font-extrabold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px] ${
        isActive ? 'text-[#6C63FF]' : 'text-black'
      }`}
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      {category.label}
      <ChevronDown
        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        aria-hidden="true"
      />
      <span className="sr-only">Toggle {category.label} menu</span>
    </button>
    {isOpen ? (
      <div
        role="menu"
        className="absolute left-1/2 top-full z-40 mt-3 w-[min(680px,90vw)] -translate-x-1/2 rounded-3xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
      >
        {category.description ? (
          <p className="text-sm font-semibold leading-snug text-gray-700">
            {category.description}
          </p>
        ) : null}
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {category.sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                {section.title}
              </p>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <DesktopDropdownLink item={item} isActive={isPathActive(item.href)} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ) : null}
  </div>
);

const DesktopDropdownLink = ({
  item,
  isActive,
}: {
  item: NavigationItem;
  isActive: boolean;
}) => (
  <Link
    href={item.href}
    className={`group block rounded-2xl border-2 border-black px-4 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px] ${
      isActive
        ? 'bg-[#6C63FF] text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]'
        : 'bg-[#f9f9f9] text-black hover:bg-white'
    }`}
  >
    <span className="text-base font-extrabold leading-snug">{item.label}</span>
    {item.description ? (
      <span
        className={`mt-2 block text-sm font-semibold leading-snug ${
          isActive ? 'text-white/80' : 'text-gray-600'
        }`}
      >
        {item.description}
      </span>
    ) : null}
  </Link>
);

interface MobileNavSectionProps {
  category: NavigationCategory;
  isExpanded: boolean;
  onToggle: () => void;
  isActive: boolean;
  isPathActive: (path: string) => boolean;
}

const MobileNavSection = ({
  category,
  isExpanded,
  onToggle,
  isActive,
  isPathActive,
}: MobileNavSectionProps) => (
  <div className="rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.12)]">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between px-4 py-3 text-left"
      aria-expanded={isExpanded}
    >
      <span
        className={`text-base font-extrabold uppercase tracking-wide ${
          isActive ? 'text-[#6C63FF]' : 'text-black'
        }`}
      >
        {category.label}
      </span>
      <ChevronDown
        className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        aria-hidden="true"
      />
    </button>
    {isExpanded ? (
      <div className="border-t-2 border-black bg-[#f7f7f7] px-4 py-4">
        {category.description ? (
          <p className="text-sm font-semibold text-gray-700">{category.description}</p>
        ) : null}
        <div className="mt-4 space-y-4">
          {category.sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                {section.title}
              </p>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <MobileNavDetailLink
                    key={item.href}
                    item={item}
                    isActive={isPathActive(item.href)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null}
  </div>
);

const MobileNavDetailLink = ({
  item,
  isActive,
}: {
  item: NavigationItem;
  isActive: boolean;
}) => (
  <Link
    href={item.href}
    className={`block rounded-2xl border-2 border-black px-3 py-2 text-left text-sm font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px] ${
      isActive
        ? 'bg-[#6C63FF] text-white shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)]'
        : 'bg-white text-black'
    }`}
  >
    <span>{item.label}</span>
    {item.description ? (
      <span
        className={`mt-1 block text-xs font-semibold leading-snug ${
          isActive ? 'text-white/80' : 'text-gray-600'
        }`}
      >
        {item.description}
      </span>
    ) : null}
  </Link>
);
