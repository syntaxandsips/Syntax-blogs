'use client';

import { useState } from 'react';

interface DraftPayload {
  draft?: { content?: string };
}

export function DraftPreview() {
  const [postId, setPostId] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = async () => {
    if (!postId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai/drafts/${postId}`);
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? 'Failed to load draft');
      }

      const payload = (await response.json()) as DraftPayload;
      setContent(payload.draft?.content ?? '');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl border-4 border-black bg-white p-4 shadow-neobrutalist">
      <h2 className="text-lg font-bold uppercase">Draft Preview</h2>
      <div className="mt-3 flex gap-2">
        <input
          value={postId}
          onChange={event => setPostId(event.target.value)}
          placeholder="Post ID"
          className="flex-1 rounded-md border-2 border-black p-2"
        />
        <button
          type="button"
          onClick={handleLoad}
          disabled={isLoading || !postId}
          className="rounded-md border-2 border-black bg-lime-300 px-3 py-2 font-semibold shadow-neobrutalist disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Loading…' : 'Load'}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <pre className="mt-4 h-48 overflow-y-auto rounded-md border-2 border-dashed border-black bg-gray-50 p-3 text-sm">
        {content || 'Select a post to view its draft.'}
      </pre>
    </div>
  );
}
