'use client';

import { useState } from 'react';

const DEFAULT_OUTLINE = ['Introduction', 'Key Insights', 'Actionable Steps', 'Conclusion'];

export function WorkflowLauncher() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, outline: DEFAULT_OUTLINE }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? 'Failed to start workflow');
      }

      setTopic('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="topic" className="text-sm font-semibold uppercase">
          Topic
        </label>
        <input
          id="topic"
          value={topic}
          onChange={event => setTopic(event.target.value)}
          className="mt-2 w-full rounded-md border-2 border-black bg-white p-3 text-base shadow-inner focus:outline-none focus:ring-4 focus:ring-black"
          placeholder="e.g., Building resilient MCP servers"
          required
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center rounded-md border-2 border-black bg-yellow-300 px-4 py-2 font-semibold shadow-neobrutalist transition hover:-translate-y-1 hover:shadow-neobrutalist-lg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Launching…' : 'Launch Workflow'}
      </button>
    </form>
  );
}
