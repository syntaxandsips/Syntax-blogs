"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, X, ArrowUpRight } from 'lucide-react';
import type { BlogListPost } from '@/lib/posts';

interface SearchResult extends BlogListPost {
  highlight: string | null;
}

type SearchStatus = 'idle' | 'loading' | 'error' | 'success';

export function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
    setStatus('idle');
    setError(null);
    abortController.current?.abort();
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen((previous) => {
          const next = !previous;
          if (!next) {
            close();
          }
          return next;
        });
      } else if (event.key === 'Escape') {
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [close]);

  useEffect(() => {
    if (isOpen) {
      const timeout = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 10);

      return () => window.clearTimeout(timeout);
    }

    return () => undefined;
  }, [isOpen]);

  const runSearch = useCallback(
    async (searchTerm: string) => {
      const trimmed = searchTerm.trim();
      if (trimmed.length < 2) {
        setResults([]);
        setStatus(trimmed.length === 0 ? 'idle' : 'success');
        setError(null);
        abortController.current?.abort();
        abortController.current = null;
        return;
      }

      abortController.current?.abort();
      const controller = new AbortController();
      abortController.current = controller;

      setStatus('loading');
      setError(null);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Unable to load search results.');
        }

        const payload = (await response.json()) as { results?: BlogListPost[] };
        const payloadResults = payload.results ?? [];

        const enriched = payloadResults.map((result) => ({
          ...result,
          highlight: deriveHighlight(trimmed, result),
        }));

        if (!controller.signal.aborted) {
          setResults(enriched);
          setStatus('success');
        }
      } catch (searchError) {
        if ((searchError as Error).name === 'AbortError') {
          return;
        }

        console.error(searchError);
        setError(
          searchError instanceof Error ? searchError.message : 'Unable to load search results.',
        );
        setStatus('error');
      }
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) {
      return () => undefined;
    }

    const timeout = window.setTimeout(() => {
      void runSearch(query);
    }, 200);

    return () => window.clearTimeout(timeout);
  }, [isOpen, query, runSearch]);

  const handleResultClick = useCallback(
    (slug: string) => {
      router.push(`/blogs/${slug}`);
      close();
    },
    [close, router],
  );

  const hasResults = results.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex items-center gap-2 rounded-md border-2 border-black bg-white px-3 py-2 text-sm font-semibold shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.12)]"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden items-center gap-1 rounded border bg-black/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white sm:flex">
          ⌘K
        </kbd>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 py-20 backdrop-blur-sm"
        >
          <div className="w-full max-w-2xl rounded-2xl border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.18)]">
            <div className="flex items-center gap-3 border-b-4 border-black bg-[#f7f7f7] px-5 py-4">
              <Search className="h-5 w-5 text-gray-500" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search posts, tags, or topics"
                className="flex-1 bg-transparent text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none"
                type="search"
                aria-label="Search posts"
              />
              <button
                type="button"
                onClick={close}
                className="rounded-md border-2 border-black bg-white p-1 text-gray-600 transition hover:bg-black hover:text-white"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
              {status === 'idle' && (
                <p className="text-sm text-gray-600">
                  Start typing to explore articles, or try keywords like “generative AI” or “roadmap”.
                </p>
              )}

              {status === 'loading' && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching the archive…</span>
                </div>
              )}

              {status === 'error' && error && (
                <div className="rounded-lg border-2 border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <p className="font-semibold">{error}</p>
                  <button
                    type="button"
                    className="mt-2 text-xs font-bold uppercase tracking-wide underline"
                    onClick={() => void runSearch(query)}
                  >
                    Try again
                  </button>
                </div>
              )}

              {status === 'success' && !hasResults && (
                <p className="text-sm text-gray-600">
                  No matches just yet. Try a different keyword or visit the{' '}
                  <button
                    type="button"
                    className="font-semibold text-[#6C63FF] underline"
                    onClick={() => {
                      router.push('/blogs');
                      close();
                    }}
                  >
                    blog archive
                  </button>
                  .
                </p>
              )}

              {hasResults && (
                <ul className="space-y-3" role="list">
                  {results.map((result) => (
                    <li key={result.id}>
                      <button
                        type="button"
                        onClick={() => handleResultClick(result.slug)}
                        className="group flex w-full flex-col gap-2 rounded-xl border-2 border-black bg-white px-4 py-3 text-left transition hover:-translate-y-[2px] hover:border-[#6C63FF] hover:shadow-[6px_6px_0px_0px_rgba(108,99,255,0.28)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-black uppercase tracking-wide text-[#6C63FF]">
                            {result.category?.name ?? 'Uncategorized'}
                          </span>
                          <ArrowUpRight
                            className="h-4 w-4 text-gray-400 transition group-hover:text-[#6C63FF]"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="text-lg font-bold text-gray-900">{result.title}</p>
                        {result.highlight && (
                          <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: result.highlight }} />
                        )}
                        <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {result.publishedAt && (
                            <span>{new Date(result.publishedAt).toLocaleDateString()}</span>
                          )}
                          <span>{result.views.toLocaleString()} views</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function deriveHighlight(term: string, result: BlogListPost) {
  const haystacks = [result.title, result.excerpt ?? ''];
  const matcher = term.toLowerCase();

  for (const haystack of haystacks) {
    const index = haystack.toLowerCase().indexOf(matcher);

    if (index >= 0) {
      const radius = 60;
      const start = Math.max(0, index - radius);
      const end = Math.min(haystack.length, index + matcher.length + radius);
      const snippet = haystack.slice(start, end);

      return highlightSnippet(snippet, term);
    }
  }

  return null;
}

function escapeRegExp(value: string) {
  const specialCharacters = /[.*+?^${}()|[\]\\]/g;
  return value.replace(specialCharacters, '\\$&');
}

function highlightSnippet(snippet: string, term: string) {
  const regex = new RegExp(escapeRegExp(term), 'gi');
  let lastIndex = 0;
  let result = '';
  let match: RegExpExecArray | null;

  while ((match = regex.exec(snippet)) !== null) {
    const [matched] = match;
    result += escapeHtml(snippet.slice(lastIndex, match.index));
    result += `<mark>${escapeHtml(matched)}</mark>`;
    lastIndex = match.index + matched.length;
  }

  result += escapeHtml(snippet.slice(lastIndex));

  return result;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
