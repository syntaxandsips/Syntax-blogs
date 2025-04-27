"use client";

import { RecommendedTopics } from './RecommendedTopics';
import { WhereToFollow } from './WhereToFollow';

export function Sidebar() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <RecommendedTopics />
      </div>
      <div>
        <WhereToFollow />
      </div>
    </div>
  );
}
