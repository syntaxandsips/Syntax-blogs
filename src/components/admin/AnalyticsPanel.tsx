"use client";

import { useMemo } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart4,
  Flame,
  MessageSquare,
  PieChart,
  Sparkles,
} from "lucide-react";
import type { AdminCommentSummary, AdminPost } from "@/utils/types";

interface AnalyticsPanelProps {
  posts: AdminPost[];
  recentComments: AdminCommentSummary[];
}

const getMonthlyBuckets = (months = 6) => {
  return Array.from({ length: months }).map((_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (months - 1 - index));
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString(undefined, { month: "short" }),
      views: 0,
      published: 0,
    };
  });
};

export function AnalyticsPanel({ posts, recentComments }: AnalyticsPanelProps) {
  const {
    headline,
    monthlyPerformance,
    topCategories,
    pipeline,
    engagement,
  } = useMemo(() => {
    const published = posts.filter((post) => post.status === "published");
    const totalViews = published.reduce((sum, post) => sum + (post.views ?? 0), 0);
    const averageViews = published.length > 0 ? totalViews / published.length : 0;
    const topPost = [...published].sort((a, b) => b.views - a.views)[0] ?? null;

    const monthly = getMonthlyBuckets();
    const categories: Record<string, { views: number; published: number }> = {};
    const pipelineCounts: Record<string, number> = { draft: 0, scheduled: 0, published: 0 };

    posts.forEach((post) => {
      pipelineCounts[post.status] = (pipelineCounts[post.status] ?? 0) + 1;

      if (post.status === "published" && post.publishedAt) {
        const publishedDate = new Date(post.publishedAt);
        const bucketKey = `${publishedDate.getFullYear()}-${publishedDate.getMonth()}`;
        const bucket = monthly.find((entry) => entry.key === bucketKey);
        if (bucket) {
          bucket.views += post.views ?? 0;
          bucket.published += 1;
        }
      }

      if (post.categoryName) {
        const key = post.categoryName;
        if (!categories[key]) {
          categories[key] = { views: 0, published: 0 };
        }
        categories[key].views += post.views ?? 0;
        if (post.status === "published") {
          categories[key].published += 1;
        }
      }
    });

    const categoryList = Object.entries(categories)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);

    const engagementSnapshot = recentComments.reduce(
      (acc, comment) => {
        acc.total += 1;
        acc.byStatus[comment.status] = (acc.byStatus[comment.status] ?? 0) + 1;
        return acc;
      },
      { total: 0, byStatus: {} as Record<string, number> },
    );

    return {
      headline: {
        totalViews,
        averageViews,
        publishedCount: published.length,
        topPost,
      },
      monthlyPerformance: monthly,
      topCategories: categoryList,
      pipeline: pipelineCounts,
      engagement: engagementSnapshot,
    };
  }, [posts, recentComments]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#2A2A2A]">Analytics</h1>
        <p className="text-sm text-[#2A2A2A]/70">
          Track performance across reach, publishing cadence, and reader engagement.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <BarChart4 className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#2A2A2A]/70">
              Total views
            </h2>
          </div>
          <p className="mt-3 text-3xl font-black text-[#2A2A2A]">
            {headline.totalViews.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">Across {headline.publishedCount} published posts</p>
        </article>

        <article className="rounded-xl border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#FFD166]" aria-hidden="true" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#2A2A2A]/70">
              Avg. views per article
            </h2>
          </div>
          <p className="mt-3 text-3xl font-black text-[#2A2A2A]">
            {Math.round(headline.averageViews).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">Median reach for published posts</p>
        </article>

        <article className="rounded-xl border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <Flame className="h-5 w-5 text-[#FF5252]" aria-hidden="true" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#2A2A2A]/70">
              Top performer
            </h2>
          </div>
          {headline.topPost ? (
            <div className="mt-3 space-y-1">
              <p className="text-base font-semibold text-[#2A2A2A] line-clamp-2">
                {headline.topPost.title}
              </p>
              <p className="text-xs text-gray-500">
                {headline.topPost.views.toLocaleString()} total views
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">Publish a post to start gathering insights.</p>
          )}
        </article>

        <article className="rounded-xl border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-[#2A2A2A]/70">
              Moderation queue
            </h2>
          </div>
          <p className="mt-3 text-3xl font-black text-[#2A2A2A]">
            {engagement.total}
          </p>
          <p className="text-xs text-gray-500">Total comments captured recently</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <article className="rounded-xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
              <h2 className="text-xl font-bold text-[#2A2A2A]">Monthly performance</h2>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#6C63FF]">
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              Last 6 months
            </span>
          </header>
          <div className="grid grid-cols-6 gap-4">
            {monthlyPerformance.map((month) => {
              const height = month.views === 0 ? 6 : Math.min(110, Math.round(month.views / 20));
              return (
                <div key={month.key} className="flex flex-col items-center gap-2">
                  <div className="flex h-28 w-full items-end justify-center rounded-md border-2 border-black bg-[#e7e7ff]">
                    <div
                      className="flex h-full w-full items-end justify-center rounded-md bg-[#6C63FF]"
                      style={{ height: `${Math.max(height, 6)}px` }}
                    >
                      <span className="text-[10px] font-bold text-white">
                        {month.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#2A2A2A]/60">
                    {month.label}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Each bar represents total views earned during the month. Lighter bars indicate fewer than 50 views.
          </p>
        </article>

        <article className="rounded-xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
          <header className="mb-4 flex items-center gap-3">
            <PieChart className="h-5 w-5 text-[#FF5252]" aria-hidden="true" />
            <h2 className="text-xl font-bold text-[#2A2A2A]">Status distribution</h2>
          </header>
          <ul className="space-y-3">
            {Object.entries(pipeline).map(([status, count]) => (
              <li key={status}>
                <div className="flex items-center justify-between text-sm font-semibold text-[#2A2A2A]">
                  <span className="capitalize">{status}</span>
                  <span>{count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-[#f3f4f6]">
                  <div
                    className="h-full rounded-full bg-[#FF5252]"
                    style={{ width: `${posts.length === 0 ? 0 : (count / posts.length) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
        <header className="mb-4 flex items-center gap-3">
          <Flame className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
          <h2 className="text-xl font-bold text-[#2A2A2A]">Top categories by reach</h2>
        </header>
        {topCategories.length === 0 ? (
          <p className="text-sm text-gray-600">Assign categories to your posts to view category performance.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topCategories.map((category) => (
              <article key={category.name} className="rounded-lg border-2 border-black/10 bg-[#f8f9ff] p-4">
                <p className="text-sm font-bold text-[#2A2A2A]">{category.name}</p>
                <p className="text-xs text-gray-500">{category.published} published posts</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#6C63FF]">
                  {category.views.toLocaleString()} total views
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
