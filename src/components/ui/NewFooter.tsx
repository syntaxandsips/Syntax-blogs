"use client";

import React from 'react';
import { Coffee, Code, Youtube, Twitter, Github, Rss } from 'lucide-react';
import Link from 'next/link';

export const NewFooter = () => {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-2 mb-6 md:mb-0">
            <Coffee className="h-8 w-8 text-[#FF5252]" />
            <Code className="h-8 w-8 text-[#6C63FF]" />
            <span className="font-black text-2xl tracking-tighter">
              <span className="bg-[#6C63FF] text-white px-2 py-1 mr-1 rotate-1 inline-block">
                Syntax
              </span>
              <span className="text-[#FF5252]">&</span>
              <span className="bg-[#FF5252] text-white px-2 py-1 ml-1 -rotate-1 inline-block">
                Sips
              </span>
            </span>
          </div>
          <div className="flex gap-4">
            <SocialLink icon={<Youtube />} href="https://youtube.com" />
            <SocialLink icon={<Twitter />} href="https://twitter.com" />
            <SocialLink icon={<Github />} href="https://github.com" />
            <SocialLink icon={<Rss />} href="/rss" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 border-t border-b border-white/20">
          <div>
            <h3 className="font-bold text-xl mb-4">About</h3>
            <p className="text-gray-300">
              Syntax & Sips is a blog and YouTube channel dedicated to making
              tech topics accessible and enjoyable.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-4">Content</h3>
            <ul className="space-y-2">
              <li><FooterLink href="/blogs">Blogs</FooterLink></li>
              <li><FooterLink href="/tutorials">Tutorials</FooterLink></li>
              <li><FooterLink href="/podcasts">Podcasts</FooterLink></li>
              <li><FooterLink href="/videos">Videos</FooterLink></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><FooterLink href="/resources">Resource Library</FooterLink></li>
              <li><FooterLink href="/newsletter">Newsletter</FooterLink></li>
              <li><FooterLink href="/changelog">Changelogs</FooterLink></li>
              <li><FooterLink href="/roadmap">Roadmap</FooterLink></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
              <li><FooterLink href="/cookies">Cookie Policy</FooterLink></li>
              <li><FooterLink href="/disclaimer">Disclaimer</FooterLink></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 text-center text-gray-400 text-sm">
          <p>
            © {new Date().getFullYear()} Syntax & Sips. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

interface SocialLinkProps {
  icon: React.ReactNode;
  href: string;
}

const SocialLink = ({ icon, href }: SocialLinkProps) => {
  return (
    <a
      href={href}
      className="bg-white text-black w-10 h-10 flex items-center justify-center rounded-full transform transition hover:scale-110 hover:bg-[#6C63FF] hover:text-white"
      target="_blank"
      rel="noopener noreferrer"
    >
      {icon}
    </a>
  );
};

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, children }) => {
  return (
    <li>
      <Link
        href={href}
        className="text-gray-300 hover:text-white hover:underline transition"
      >
        {children}
      </Link>
    </li>
  );
};
