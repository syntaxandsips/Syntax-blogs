"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#f0f0f0] py-16 md:py-24">
      {/* Background Elements */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-[#FFD166] rounded-full opacity-70"></div>
      <div className="absolute bottom-10 left-20 w-32 h-32 bg-[#06D6A0] rounded-full opacity-50"></div>
      <div className="absolute top-40 left-[10%] w-16 h-16 bg-[#118AB2] rounded-md rotate-12 opacity-60"></div>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="inline-block bg-[#FF5252] text-white px-4 py-1 text-sm font-bold mb-6 transform -rotate-2">
              Welcome to the digital brew
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              Where{' '}
              <span className="bg-[#6C63FF] text-white px-2 py-1 inline-block transform rotate-1">
                Code
              </span>{' '}
              Meets{' '}
              <span className="bg-[#FF5252] text-white px-2 py-1 inline-block transform -rotate-1">
                Conversation
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-2xl">
              From coding tutorials to tech reviews, gaming sessions to casual
              chit-chat — we brew content that&apos;s both educational and
              entertaining.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Link
                href="/blogs"
                className="bg-black text-white px-6 py-3 text-lg font-bold rounded-md transform transition hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(108,99,255)] text-center"
              >
                Read Latest Blog
              </Link>
              <Link
                href="https://youtube.com/@syntaxandsips"
                target="_blank"
                rel="noopener noreferrer"
                className="border-4 border-black bg-white px-6 py-3 text-lg font-bold rounded-md flex items-center justify-center gap-2 transform transition hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(255,82,82)]"
              >
                Watch on YouTube <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div className="relative mx-auto max-w-3xl">
            <div className="relative aspect-video bg-black rounded-lg border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0)]">
              <Image
                src="https://images.unsplash.com/photo-1522542550221-31fd19575a2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                alt="Coding setup with coffee"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 p-4 rounded-full">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#FFD166] border-4 border-black"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#6C63FF] border-4 border-black rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
