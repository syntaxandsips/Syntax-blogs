'use client';

import { useState } from 'react';

interface SeoResult {
  result?: { score?: number; recommendations?: string[] };
  error?: string;
}

export function SeoInsights() {
  const [focusKeyword, setFocusKeyword] = useState('');
  const [draft, setDraft] = useState('');
  const [result, setResult] = useState<SeoResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai/tools/seo:analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft, focusKeyword }),
      });

      const payload = (await response.json()) as SeoResult;
      if (!response.ok) {
        throw new Error(payload.error ?? 'Failed to analyze SEO');
      }

      setResult(payload);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unexpected error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border-4 border-black bg-white p-4 shadow-neobrutalist">
      <h2 className="text-lg font-bold uppercase">SEO Insights</h2>
      <div className="mt-3 space-y-2">
        <label className="text-xs font-semibold uppercase">Focus Keyword</label>
        <input
          value={focusKeyword}
          onChange={event => setFocusKeyword(event.target.value)}
          className="w-full rounded-md border-2 border-black p-2"
        />
        <label className="text-xs font-semibold uppercase">Draft Content</label>
        <textarea
          value={draft}
          onChange={event => setDraft(event.target.value)}
          className="h-32 w-full rounded-md border-2 border-black p-2"
        />
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isLoading || !draft || !focusKeyword}
          className="rounded-md border-2 border-black bg-sky-300 px-3 py-2 font-semibold shadow-neobrutalist disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>
      {result ? (
        <div className="mt-4 space-y-2">
          {result.error ? (
            <p className="text-sm text-red-600">{result.error}</p>
          ) : (
            <>
              <p className="text-sm font-semibold">Score: {result.result?.score ?? '—'}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {(result.result?.recommendations ?? []).map(recommendation => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
