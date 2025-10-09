import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Compass, Search } from 'lucide-react';
import { getPublishedPosts } from '@/lib/posts';
import {
  allTopicLeaves,
  getDescendantTopicSlugs,
  getFallbackMessage,
  navigationLinks,
  recommendedTopics,
  topicIndex,
  topicSections,
} from '@/data/topic-catalog';
import { RandomTopicButton } from './RandomTopicButton';

export const metadata: Metadata = {
  title: 'Explore Topics | Syntax & Sips',
  description:
    'Browse every Syntax & Sips topic from software craft and AI breakthroughs to culture and self-improvement. Pick a lane, search, or let us Superime you.',
};

type SearchParamsShape = Record<string, string | string[] | undefined>;

type TopicsPageProps = {
  searchParams?: SearchParamsShape | Promise<SearchParamsShape>;
};

const footerLinks = [
  'Help',
  'Status',
  'About',
  'Careers',
  'Press',
  'Blog',
  'Privacy',
  'Rules',
  'Terms',
  'Text to speech',
];

const findSectionSlug = (slug: string | null): string | null => {
  if (!slug) {
    return null;
  }

  let current = topicIndex.get(slug) ?? null;

  while (current) {
    if (current.type === 'section') {
      return current.slug;
    }

    if (!current.parentSlug) {
      return null;
    }

    current = topicIndex.get(current.parentSlug) ?? null;
  }

  return null;
};

const defaultRandomTopics = allTopicLeaves.map((topic) => ({ slug: topic.slug, label: topic.label }));

const srgbChannelToLinear = (channel: number) =>
  channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);

const getContrastingTextColor = (hexColor: string | null | undefined) => {
  if (!hexColor) {
    return '#111827';
  }

  const normalized = hexColor.trim().replace(/^#/, '');

  if (normalized.length !== 3 && normalized.length !== 6) {
    return '#111827';
  }

  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  const red = parseInt(expanded.slice(0, 2), 16);
  const green = parseInt(expanded.slice(2, 4), 16);
  const blue = parseInt(expanded.slice(4, 6), 16);

  if (Number.isNaN(red) || Number.isNaN(green) || Number.isNaN(blue)) {
    return '#111827';
  }

  const r = srgbChannelToLinear(red / 255);
  const g = srgbChannelToLinear(green / 255);
  const b = srgbChannelToLinear(blue / 255);

  const relativeLuminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return relativeLuminance > 0.45 ? '#111827' : '#F8FAFC';
};

const groupPostsBySlug = (posts: Awaited<ReturnType<typeof getPublishedPosts>>) => {
  const map = new Map<string, typeof posts>();

  for (const post of posts) {
    const slug = post.category?.slug;

    if (!slug) {
      continue;
    }

    const entry = map.get(slug) ?? [];
    entry.push(post);
    map.set(slug, entry);
  }

  return map;
};

const ActiveTopicPanel = ({
  activeSlug,
  posts,
}: {
  activeSlug: string | null;
  posts: Awaited<ReturnType<typeof getPublishedPosts>>;
}) => {
  if (!activeSlug) {
    return (
      <section className="mt-12">
        <div className="rounded-3xl border-2 border-black bg-white p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.15)]">
          <div className="flex flex-col gap-3 text-center">
            <span className="inline-flex items-center justify-center gap-2 self-center rounded-full border-2 border-black bg-[#F1F5F9] px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#0F172A]">
              <Compass className="h-4 w-4" aria-hidden="true" />
              Topic spotlight
            </span>
            <h2 className="text-2xl font-black">Choose a topic to start exploring</h2>
            <p className="text-sm text-black/70">
              Use the filters below or smash the Superime button to let fate pick your next deep dive.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const entry = topicIndex.get(activeSlug);
  const label = entry?.label ?? activeSlug.replace(/-/g, ' ');
  const fallback = getFallbackMessage(activeSlug);

  return (
    <section className="mt-12" aria-live="polite">
      <div className="rounded-3xl border-2 border-black bg-[#FFF7ED] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.15)]">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-1 text-xs font-black uppercase tracking-[0.2em] text-[#9A3412]">
              <Compass className="h-4 w-4" aria-hidden="true" />
              Spotlight
            </span>
            <h2 className="mt-4 text-3xl font-black text-[#9A3412]">{label}</h2>
            <p className="mt-2 max-w-2xl text-sm text-black/70">
              Handpicked Syntax &amp; Sips pieces tagged under <strong>{label}</strong>.
            </p>
          </div>
          <Link
            href={`/topics?topic=${encodeURIComponent(activeSlug)}`}
            className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/60"
          >
            View all
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {posts.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#9A3412] bg-white/60 p-8 text-center text-sm font-medium text-[#9A3412]">
            {fallback}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.slice(0, 4).map((post) => (
              <article
                key={post.id}
                className="flex h-full flex-col justify-between gap-4 rounded-2xl border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">
                    {post.category?.name ?? 'Uncategorised'}
                  </p>
                  <h3 className="mt-2 text-xl font-black text-black">
                    <Link
                      href={`/blogs/${post.slug}`}
                      className="hover:underline focus:outline-none focus-visible:ring-4 focus-visible:ring-black/60"
                    >
                      {post.title}
                    </Link>
                  </h3>
                </div>
                <div className="text-sm text-black/70">
                  {post.excerpt ?? 'Tap in to read the full story.'}
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex items-center rounded-full border-2 border-black px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                    style={{
                      backgroundColor: post.accentColor ?? '#FCD34D',
                      color: getContrastingTextColor(post.accentColor ?? '#FCD34D'),
                    }}
                  >
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Unscheduled'}
                  </span>
                  <Link
                    href={`/blogs/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#9A3412] hover:underline"
                  >
                    Read
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const normalizeParam = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? null;

export default async function TopicsPage({ searchParams }: TopicsPageProps) {
  const resolvedSearchParams: SearchParamsShape =
    searchParams && typeof (searchParams as Promise<unknown>).then === 'function'
      ? await (searchParams as Promise<SearchParamsShape>)
      : (searchParams ?? {});

  const rawTopic = normalizeParam(resolvedSearchParams.topic);
  const rawQuery = normalizeParam(resolvedSearchParams.q);

  const activeTopicSlug = rawTopic?.toLowerCase() ?? null;
  const searchQuery = rawQuery?.trim() ?? '';
  const normalizedQuery = searchQuery.toLowerCase();

  const posts = await getPublishedPosts();
  const postsBySlug = groupPostsBySlug(posts);

  const descendantSlugs = activeTopicSlug ? getDescendantTopicSlugs(activeTopicSlug) : [];
  const activePosts = descendantSlugs.flatMap((slug) => postsBySlug.get(slug) ?? []);

  const searchMatches = normalizedQuery
    ? defaultRandomTopics.filter((topic) => topic.label.toLowerCase().includes(normalizedQuery)).slice(0, 12)
    : [];

  const activeSectionSlug = findSectionSlug(activeTopicSlug);

  return (
    <div className="bg-[#FAFAFA] pb-24">
      <section id="top" className="border-b-4 border-black bg-[#F5F3FF] pb-12 pt-8 shadow-[0px_8px_0px_0px_rgba(0,0,0,0.08)]">
        <div className="container mx-auto flex flex-col gap-8 px-4">
          <nav className="flex flex-wrap gap-3">
            {navigationLinks.map((link) => {
              const isActive = link.topicSlug
                ? activeTopicSlug === link.topicSlug
                : activeSectionSlug
                  ? link.anchor === `#${activeSectionSlug}`
                  : false;

              const href = link.topicSlug ? `/topics?topic=${encodeURIComponent(link.topicSlug)}` : link.anchor ?? '#top';

              return (
                <Link
                  key={link.label}
                  href={href}
                  className={`inline-flex items-center rounded-full border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/60 ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-white text-black'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl space-y-3">
              <span className="inline-block rounded-full border-2 border-black bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#4338CA]">
                Explore topics
              </span>
              <h1 className="text-4xl font-black text-[#1E1E2F] md:text-5xl">
                Every theme we obsess over — now in one ultra-neobrutalist index
              </h1>
              <p className="text-base text-black/70">
                Browse by category, search for something oddly specific, or let the Superime button deliver a serendipitous rabbit hole.
              </p>
            </div>
            <RandomTopicButton topics={defaultRandomTopics} />
          </div>
          <form className="relative" action="/topics" method="get">
            {activeTopicSlug ? (
              <input type="hidden" name="topic" value={activeTopicSlug} />
            ) : null}
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/60" />
            <input
              type="search"
              name="q"
              placeholder="Search all topics"
              defaultValue={searchQuery}
              className="w-full rounded-full border-2 border-black bg-white px-12 py-3 text-base font-medium text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] focus:outline-none focus-visible:ring-4 focus-visible:ring-black/60"
            />
          </form>
          {normalizedQuery ? (
            <div className="rounded-3xl border-2 border-black bg-white/80 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-black/70">Search results</h2>
              {searchMatches.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  {searchMatches.map((topic) => (
                    <Link
                      key={`${topic.slug}-search`}
                      href={`/topics?topic=${encodeURIComponent(topic.slug)}`}
                      className="inline-flex items-center rounded-full border-2 border-black bg-[#F5F3FF] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#1E1E2F] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/60"
                    >
                      {topic.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-black/70">
                  Nothing matched that vibe. Try another keyword or let Superime spin up a surprise.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-black/60">Recommended:</span>
              {recommendedTopics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/topics?topic=${encodeURIComponent(topic.slug)}`}
                  className={`inline-flex items-center rounded-full border-2 border-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/60 ${
                    activeTopicSlug === topic.slug ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  {topic.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4">
        <ActiveTopicPanel activeSlug={activeTopicSlug} posts={activePosts} />

        {topicSections.map((section) => (
          <section key={section.slug} id={section.slug} className="pt-16">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-3">
                <span
                  className="inline-flex items-center gap-2 rounded-full border-2 border-black px-4 py-1 text-xs font-bold uppercase tracking-[0.2em]"
                  style={{
                    backgroundColor: section.accentColor,
                    color: section.textColor,
                  }}
                >
                  {section.title}
                </span>
                <p className="text-lg font-semibold text-[#111827]">{section.description}</p>
              </div>
              <Link
                href={`/topics?topic=${encodeURIComponent(section.slug)}`}
                className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/60"
              >
                {section.showAllLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {section.clusters.map((cluster) => (
                <article
                  key={cluster.slug}
                  className="flex h-full flex-col gap-4 rounded-3xl border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)]"
                >
                  <div
                    className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-black px-4 py-1 text-xs font-bold uppercase tracking-[0.18em]"
                    style={{
                      backgroundColor: cluster.accentColor,
                      color: getContrastingTextColor(cluster.accentColor),
                    }}
                  >
                    {cluster.label}
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {cluster.topics.map((topic) => {
                      const isActive = activeTopicSlug === topic.slug;

                      return (
                        <li key={topic.slug}>
                          <Link
                            href={`/topics?topic=${encodeURIComponent(topic.slug)}`}
                            className={`inline-flex items-center rounded-full border-2 border-black px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/60 ${
                              isActive
                                ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                                : 'bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]'
                            }`}
                          >
                            {topic.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-20 rounded-3xl border-2 border-black bg-[#E0F2FE] p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.12)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#0C4A6E]">
                See a topic you think should be added or removed here?
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[#075985]">
                We iterate on this directory constantly. Flag a missing obsession or retire something past its prime.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-black/60"
            >
              Suggest an edit
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="mt-12 flex flex-wrap gap-4 border-t-4 border-dashed border-black/40 pt-8 text-xs font-semibold uppercase tracking-[0.18em] text-black/60">
          {footerLinks.map((link) => (
            <Link
              key={link}
              href={`/${link.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="hover:text-black focus:outline-none focus-visible:ring-4 focus-visible:ring-black/60"
            >
              {link}
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
