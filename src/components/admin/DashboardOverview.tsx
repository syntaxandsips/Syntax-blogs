"use client";

import { useMemo } from "react";
import {
  Activity,
  BarChart2,
  Clock,
  Cpu,
  Layers,
  MessageSquare,
  PenTool,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { AdminCommentSummary, AdminPost } from "@/utils/types";
import { StatsSection } from "./StatsSection";

interface DashboardOverviewProps {
  posts: AdminPost[];
  recentComments: AdminCommentSummary[];
  onNavigateToPosts: () => void;
  onNavigateToComments: () => void;
  onNavigateToModels: () => void;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function DashboardOverview({
  posts,
  recentComments,
  onNavigateToPosts,
  onNavigateToComments,
  onNavigateToModels,
}: DashboardOverviewProps) {
  const [recentPosts, monthlyPublishing, categoryBreakdown, pipeline] = useMemo(() => {
    const sortedPosts = [...posts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const lastSixMonths = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString(undefined, { month: "short" }),
        published: 0,
        views: 0,
      };
    });

    const categories: Record<string, { count: number; views: number }> = {};
    const statusCounts: Record<string, number> = { draft: 0, scheduled: 0, published: 0 };

    posts.forEach((post) => {
      statusCounts[post.status] = (statusCounts[post.status] ?? 0) + 1;

      if (post.categoryName) {
        const key = post.categoryName;
        if (!categories[key]) {
          categories[key] = { count: 0, views: 0 };
        }
        categories[key].count += 1;
        categories[key].views += post.views ?? 0;
      }

      if (post.status === "published" && post.publishedAt) {
        const publishedDate = new Date(post.publishedAt);
        const bucketKey = `${publishedDate.getFullYear()}-${publishedDate.getMonth()}`;
        const bucket = lastSixMonths.find((item) => item.key === bucketKey);
        if (bucket) {
          bucket.published += 1;
          bucket.views += post.views ?? 0;
        }
      }
    });

    const pipelineData = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    const categoryData = Object.entries(categories)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return [
      sortedPosts.slice(0, 5),
      lastSixMonths,
      categoryData,
      pipelineData,
    ] as const;
  }, [posts]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-[#2A2A2A]">Dashboard Overview</h1>
        <p className="text-sm text-[#2A2A2A]/70">
          Monitor publishing cadence, engagement, and moderation at a glance.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-[32px] border-[3px] border-black bg-white p-6 shadow-[12px_12px_0_rgba(0,0,0,0.08)]">
          <header className="flex items-center gap-3">
            <Cpu className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
            <h2 className="text-xl font-bold text-[#2A2A2A]">Connect your AI model catalog</h2>
          </header>
          <p className="mt-3 text-sm text-[#2A2A2A]/80">
            Unlock richer prompt submissions by curating providers, families, and categories in the model manager.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#2A2A2A]">
            <li className="flex items-start gap-2">
              <Layers className="mt-0.5 h-4 w-4 text-[#FF5252]" aria-hidden="true" />
              Organize models into themed categories so creators can browse the right tooling.
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 text-[#6C63FF]" aria-hidden="true" />
              Capture provider and family metadata so the upload wizard stays accurate.
            </li>
          </ul>
          <button
            type="button"
            onClick={onNavigateToModels}
            className="mt-5 inline-flex items-center gap-2 rounded-[28px] border-[3px] border-black bg-[#6C63FF] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[6px_6px_0_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-0.5 hover:shadow-[9px_9px_0_rgba(0,0,0,0.26)]"
          >
            Manage models
          </button>
        </article>
      </div>

      <StatsSection posts={posts} />

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="lg:col-span-2 rounded-xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
          <header className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
              <h2 className="text-xl font-bold text-[#2A2A2A]">Recent publishing</h2>
            </div>
            <button
              type="button"
              onClick={onNavigateToPosts}
              className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-3 py-1 text-xs font-bold uppercase tracking-wide text-white transition hover:-translate-y-[1px]"
            >
              Manage posts
              <PenTool className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          {recentPosts.length === 0 ? (
            <p className="text-sm text-gray-600">No posts yet. Start drafting your first story.</p>
          ) : (
            <ul className="space-y-3">
              {recentPosts.map((post) => (
                <li
                  key={post.id}
                  className="rounded-lg border-2 border-black/10 bg-[#f8f9ff] px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#2A2A2A]">{post.title}</p>
                      <p className="text-xs uppercase tracking-wide text-[#2A2A2A]/60">
                        {STATUS_LABELS[post.status] ?? post.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <BarChart2 className="h-4 w-4" aria-hidden="true" />
                        {post.views} views
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
          <header className="mb-4 flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-[#FF5252]" aria-hidden="true" />
            <h2 className="text-xl font-bold text-[#2A2A2A]">Latest moderation</h2>
          </header>
          {recentComments.length === 0 ? (
            <p className="text-sm text-gray-600">
              No reader comments yet. Encourage discussion by sharing posts.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentComments.slice(0, 5).map((comment) => (
                <li key={comment.id} className="rounded-lg border-2 border-black/10 bg-[#fff9f9] p-3">
                  <p className="text-xs uppercase tracking-wide text-[#2A2A2A]/60">
                    {STATUS_LABELS[comment.status] ?? comment.status}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-[#2A2A2A]">{comment.content}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {comment.authorDisplayName ?? "Community member"} on {comment.postTitle}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={onNavigateToComments}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border-2 border-black bg-black px-3 py-2 text-sm font-bold uppercase tracking-wide text-white transition hover:-translate-y-[1px]"
          >
            Review comments
          </button>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3 rounded-xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
          <header className="mb-4 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
            <h2 className="text-xl font-bold text-[#2A2A2A]">Publishing cadence</h2>
          </header>
          <div className="flex items-end gap-4">
            {monthlyPublishing.map((month) => {
              const height = month.published === 0 ? 4 : Math.min(96, month.published * 22);
              return (
                <div key={month.key} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="flex h-24 w-full items-end justify-center rounded-md border-2 border-black bg-[#e7e7ff]"
                    style={{ height: `${Math.max(height, 6)}px` }}
                  >
                    <span className="text-xs font-bold text-[#2A2A2A]">{month.published}</span>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#2A2A2A]/60">
                    {month.label}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Shows the number of published posts per month across the last six months.
          </p>
        </section>

        <section className="lg:col-span-2 rounded-xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
          <header className="mb-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-[#FF5252]" aria-hidden="true" />
            <h2 className="text-xl font-bold text-[#2A2A2A]">Content pipeline</h2>
          </header>
          <ul className="space-y-3">
            {pipeline.map((item) => (
              <li key={item.status}>
                <div className="flex items-center justify-between text-sm font-semibold text-[#2A2A2A]">
                  <span>{STATUS_LABELS[item.status] ?? item.status}</span>
                  <span>{item.count}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-[#f3f4f6]">
                  <div
                    className="h-full rounded-full bg-[#6C63FF]"
                    style={{ width: `${posts.length === 0 ? 0 : (item.count / posts.length) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.08)]">
        <header className="mb-4 flex items-center gap-3">
          <BarChart2 className="h-5 w-5 text-[#6C63FF]" aria-hidden="true" />
          <h2 className="text-xl font-bold text-[#2A2A2A]">Top performing categories</h2>
        </header>
        {categoryBreakdown.length === 0 ? (
          <p className="text-sm text-gray-600">No categories assigned yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categoryBreakdown.map((category) => (
              <article
                key={category.name}
                className="rounded-lg border-2 border-black/10 bg-[#f8f9ff] p-4"
              >
                <p className="text-sm font-bold text-[#2A2A2A]">{category.name}</p>
                <p className="text-xs text-gray-500">{category.count} posts</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#6C63FF]">
                  {category.views.toLocaleString()} views collected
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
