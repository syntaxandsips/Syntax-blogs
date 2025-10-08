"use client";

import React, { FormEvent, useMemo, useState } from 'react';

type SubmissionState = 'idle' | 'loading' | 'success' | 'error';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SubmissionState>('idle');
  const [message, setMessage] = useState<string>('');

  const isSubmitDisabled = useMemo(
    () => state === 'loading' || email.trim().length === 0,
    [state, email],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (state === 'loading') {
      return;
    }

    setState('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to subscribe right now.');
      }

      setState('success');
      setMessage(payload.message ?? 'Thanks for subscribing!');
      setEmail('');
    } catch (error) {
      setState('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to subscribe right now. Please try again later.',
      );
    }
  };

  return (
    <section className="py-16 bg-[#6C63FF]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border-4 border-black p-8 rounded-lg relative transform rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0)]">
            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-[#FFD166] border-4 border-black rounded-full" aria-hidden="true"></div>
            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-[#FF5252] border-4 border-black" aria-hidden="true"></div>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black mb-2">Stay in the Loop</h2>
              <p className="text-lg">
                Get the latest articles, tutorials, and updates delivered
                straight to your inbox.
              </p>
            </div>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-3 border-4 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-describedby="newsletter-feedback"
              />
              <button
                type="submit"
                className="bg-black text-white px-6 py-3 font-bold rounded-md transform transition hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(255,82,82)] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isSubmitDisabled}
              >
                {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
            <p
              id="newsletter-feedback"
              className={`mt-4 text-sm text-center ${
                state === 'error'
                  ? 'text-red-600'
                  : state === 'success'
                    ? 'text-green-600'
                    : 'text-gray-600'
              }`}
              role={state === 'error' || state === 'success' ? 'status' : undefined}
              aria-live={state === 'error' || state === 'success' ? 'polite' : undefined}
            >
              {message || 'We respect your privacy. Unsubscribe at any time.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
