"use client";

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';

interface RandomTopicButtonProps {
  topics: { slug: string; label: string }[];
}

export const RandomTopicButton = ({ topics }: RandomTopicButtonProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const topicPool = useMemo(() => {
    if (topics.length === 0) {
      return [];
    }

    return topics;
  }, [topics]);

  const handleClick = useCallback(() => {
    if (topicPool.length === 0) {
      return;
    }

    const currentTopic = searchParams.get('topic');
    const pool = topicPool.filter((topic) => topic.slug !== currentTopic);
    const selectionPool = pool.length > 0 ? pool : topicPool;
    const randomIndex = Math.floor(Math.random() * selectionPool.length);
    const nextTopic = selectionPool[randomIndex];

    router.push(`/topics?topic=${encodeURIComponent(nextTopic.slug)}`);
  }, [router, searchParams, topicPool]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-gradient-to-r from-[#FF8A00] via-[#FF3D81] to-[#7048FF] px-5 py-2.5 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/60"
      aria-label="Pick a random topic"
    >
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      Superime me
    </button>
  );
};
