import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { buildSiteUrl } from "@/lib/site-url";

const staticPaths = [
  "/",
  "/blogs",
  "/podcasts",
  "/videos",
  "/tutorials",
  "/resources",
  "/roadmap",
  "/topics",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: buildSiteUrl(path),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 0.9 : 0.6,
  }));

  const posts = await getPublishedPosts();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: buildSiteUrl(`/blogs/${post.slug}`),
    lastModified: post.publishedAt ?? undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...baseEntries, ...postEntries];
}
