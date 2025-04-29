"use client";

import React from 'react';

export const NewsletterSection = () => {
  return (
    <section className="py-16 bg-[#6C63FF]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border-4 border-black p-8 rounded-lg relative transform rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0)]">
            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-[#FFD166] border-4 border-black rounded-full"></div>
            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-[#FF5252] border-4 border-black"></div>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black mb-2">Stay in the Loop</h2>
              <p className="text-lg">
                Get the latest articles, tutorials, and updates delivered
                straight to your inbox.
              </p>
            </div>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-3 border-4 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
                required
              />
              <button
                type="submit"
                className="bg-black text-white px-6 py-3 font-bold rounded-md transform transition hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(255,82,82)]"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-4 text-sm text-gray-600 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
