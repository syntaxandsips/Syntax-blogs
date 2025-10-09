import path from 'path';
import fs from 'fs';
import Link from 'next/link';
import type { Metadata } from 'next';

const allowedExtensions = new Set(['.md', '.mdx']);

const docsMetadata: Record<string, { title: string; summary: string }> = {
  'markdown-guide': {
    title: 'Markdown Playbook',
    summary: 'Formatting conventions, code block styles, and media tips for Syntax & Sips posts.',
  },
  'admin-code-guide': {
    title: 'Admin & Code Standards',
    summary: 'Reference for platform maintainers covering code quality, tooling, and release rituals.',
  },
  'author-guidelines': {
    title: 'Author Guidelines',
    summary: 'Expectations and best practices for contributors collaborating with the editorial team.',
  },
  'open-source-launch-checklist': {
    title: 'Open Source Launch Checklist',
    summary: 'Step-by-step prep to make a GitHub repository legally safe, documented, and welcoming for contributors.',
  },
};

const toTitleCase = (value: string) =>
  value
    .split(/[-_\s]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const loadDocumentationIndex = () => {
  const docsDirectory = path.join(process.cwd(), 'src', 'docs');

  try {
    const entries = fs.readdirSync(docsDirectory, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile() && allowedExtensions.has(path.extname(entry.name)))
      .map((entry) => {
        const slug = entry.name.replace(/\.(md|mdx)$/i, '');
        const metadata = docsMetadata[slug] ?? {
          title: toTitleCase(slug),
          summary: 'Dive into this reference to learn more about the Syntax & Sips platform.',
        };

        return {
          slug,
          ...metadata,
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    console.error('Unable to build documentation index', error);
    return [];
  }
};

export const metadata: Metadata = {
  title: 'Documentation | Syntax & Sips',
  description: 'Explore contributor guides, platform standards, and publishing references.',
};

export default function DocumentationIndexPage() {
  const documents = loadDocumentationIndex();

  return (
    <section className="container mx-auto px-6 py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="inline-flex items-center rounded-full border-4 border-black bg-[#FFEB99] px-4 py-1 text-xs font-black uppercase tracking-[0.35em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
          Documentation Hub
        </p>
        <h1 className="mt-6 text-4xl font-black uppercase leading-tight tracking-tight text-[#121212] sm:text-5xl">
          Ship with Confidence
        </h1>
        <p className="mt-4 text-base font-semibold text-[#363636] sm:text-lg">
          Browse official Syntax &amp; Sips resources covering author workflows, editorial expectations, and platform operations.
        </p>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {documents.length === 0 ? (
          <div className="rounded-3xl border-4 border-dashed border-black bg-white p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)]">
            <p className="text-base font-semibold text-[#555]">
              Documentation is being brewed. Check back soon for fresh guides and references.
            </p>
          </div>
        ) : (
          documents.map((doc) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className="group flex flex-col gap-4 rounded-3xl border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)] transition hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]"
            >
              <span className="inline-flex w-fit items-center rounded-full border-2 border-black bg-[#D4F1F4] px-3 py-1 text-[11px] font-black uppercase tracking-[0.3em] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)]">
                Guide
              </span>
              <h2 className="text-2xl font-black uppercase text-[#121212]">{doc.title}</h2>
              <p className="text-sm font-semibold leading-relaxed text-[#3F3F3F]">{doc.summary}</p>
              <span className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#6C63FF]">
                Read guide
                <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
