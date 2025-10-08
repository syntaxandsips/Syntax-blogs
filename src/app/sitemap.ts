import path from "path";
import { promises as fs } from "fs";
import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { buildSiteUrl } from "@/lib/site-url";
import { navigationSupportingPaths, siteNavigationItems } from "@/lib/navigation";

const docExtensions = new Set([".md", ".mdx"]);

const loadDocumentationPaths = async () => {
  try {
    const docsDirectory = path.join(process.cwd(), "src", "docs");
    const entries = await fs.readdir(docsDirectory, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile() && docExtensions.has(path.extname(entry.name)))
      .map((entry) => `/docs/${entry.name.replace(/\.(md|mdx)$/i, "")}`);
  } catch (error) {
    console.error("Unable to load documentation paths for sitemap", error);
    return [];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const navPaths = siteNavigationItems.map((item) => item.href);
  const docsPaths = await loadDocumentationPaths();

  const uniqueStaticPaths = Array.from(
    new Set([...navPaths, ...navigationSupportingPaths, ...docsPaths]),
  );

  const baseEntries: MetadataRoute.Sitemap = uniqueStaticPaths.map((routePath) => ({
    url: buildSiteUrl(routePath),
    changeFrequency: routePath === "/" ? "weekly" : "monthly",
    priority: routePath === "/" ? 0.9 : 0.6,
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
