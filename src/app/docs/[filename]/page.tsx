import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { FileText } from 'lucide-react';
import { CopyButtonScript } from '@/components/docs/copy-button-script';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { PageShell } from '@/components/ui/PageLayout';

export const runtime = 'nodejs';

type RemarkModules = [
  typeof import('remark'),
  typeof import('remark-gfm'),
  typeof import('remark-rehype'),
  typeof import('rehype-raw'),
  typeof import('rehype-highlight'),
  typeof import('rehype-stringify'),
];

const remarkModulesPromise: Promise<RemarkModules> = Promise.all([
  import('remark'),
  import('remark-gfm'),
  import('remark-rehype'),
  import('rehype-raw'),
  import('rehype-highlight'),
  import('rehype-stringify'),
]);

// Define the metadata for the page
export const metadata: Metadata = {
  title: 'Documentation | Syntax and Sips',
  description: 'Documentation and guides for Syntax and Sips blog platform',
};

const allowedExtensions = new Set(['.md', '.mdx']);

const docsDirectory = path.join(process.cwd(), 'src', 'docs');

const stripExtension = (filename: string): string => {
  for (const extension of allowedExtensions) {
    if (filename.endsWith(extension)) {
      return filename.slice(0, -extension.length);
    }
  }

  return filename;
};

const formatDocTitle = (slug: string): string =>
  slug
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const resolveDocumentFilename = (rawFilename: string): string | null => {
  const sanitized = path.basename(rawFilename);
  const baseName = stripExtension(sanitized);

  if (!baseName) {
    return null;
  }

  for (const extension of allowedExtensions) {
    const candidate = `${baseName}${extension}`;
    const candidatePath = path.join(docsDirectory, candidate);

    if (fs.existsSync(candidatePath)) {
      return candidate;
    }
  }

  return null;
};

// Generate static params for known documentation files
export function generateStaticParams() {
  try {
    const entries = fs.readdirSync(docsDirectory, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile() && allowedExtensions.has(path.extname(entry.name)))
      .map((entry) => ({ filename: stripExtension(entry.name) }));
  } catch (error) {
    console.error('Unable to build static params for documentation pages', error);
    return [];
  }
}

type DocsPageParams = { filename: string };

type DocPageProps = {
  params: Promise<DocsPageParams>;
};

export default async function DocPage({ params }: DocPageProps) {
  const { filename: rawFilename } = await params;

  try {
    const resolvedFilename = resolveDocumentFilename(rawFilename);

    if (!resolvedFilename) {
      return notFound();
    }

    const docSlug = stripExtension(resolvedFilename);
    const docTitle = formatDocTitle(docSlug);
    const filePath = path.join(docsDirectory, resolvedFilename);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const html = await renderMarkdown(fileContent);
    const fileStats = fs.statSync(filePath);
    const lastUpdated = new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(fileStats.mtime);

    const allDocs = fs
      .readdirSync(docsDirectory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && allowedExtensions.has(path.extname(entry.name)))
      .map((entry) => {
        const slug = stripExtension(entry.name);
        return { slug, title: formatDocTitle(slug) };
      });

    const relatedDocs = allDocs.filter((doc) => doc.slug !== docSlug).slice(0, 3);
    const breadcrumbs = [
      { label: 'Docs', href: '/docs' },
      { label: docTitle },
    ];

    return (
      <PageShell
        backgroundClassName="bg-gradient-to-br from-[#F7F3FF] via-[#FFF6ED] to-[#E9FBFF]"
        hero={
          <section className="border-b-4 border-black bg-[#F5F2FF] py-12">
            <div className="container mx-auto space-y-6 px-4">
              <Breadcrumbs items={breadcrumbs} />
              <div className="flex flex-col gap-4">
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-1 text-xs font-black uppercase tracking-[0.25em] text-black">
                  Knowledge base
                </span>
                <h1 className="text-4xl font-black text-black sm:text-5xl">{docTitle}</h1>
                <p className="max-w-3xl text-base font-semibold text-black/70">
                  Explore the latest Syntax &amp; Sips guidance on {docTitle.toLowerCase()} to keep your contributions polished and on-brand.
                </p>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-black/50">Last updated {lastUpdated}</p>
              </div>
            </div>
          </section>
        }
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)]">
          <article className="prose prose-lg max-w-none rounded-[32px] border-4 border-black bg-white/95 p-8 shadow-[16px_16px_0_rgba(0,0,0,0.12)] prose-headings:font-black prose-headings:text-black prose-p:text-black/80 prose-a:text-[#6C63FF] prose-strong:text-black">
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </article>
          <aside className="flex flex-col gap-6 rounded-[28px] border-4 border-dashed border-black/40 bg-white/85 p-6 shadow-[12px_12px_0_rgba(0,0,0,0.08)]">
            <div>
              <h2 className="text-lg font-black text-black">How to use this doc</h2>
              <p className="mt-2 text-sm font-medium text-black/70 leading-relaxed">
                Apply these recommendations to deliver consistent, community-ready work across the Syntax &amp; Sips platform.
              </p>
            </div>
            <ul className="space-y-2 text-sm font-semibold text-black/70 leading-relaxed">
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 text-[#6C63FF]" aria-hidden="true" />
                Review the essentials before you plan your next contribution.
              </li>
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 text-[#6C63FF]" aria-hidden="true" />
                Share important callouts with collaborators and editors.
              </li>
              <li className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 text-[#6C63FF]" aria-hidden="true" />
                Pair this guide with our community discussions for deeper context.
              </li>
            </ul>
            {relatedDocs.length ? (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-black/50">Related reading</h3>
                <ul className="space-y-2 text-sm font-semibold text-[#6C63FF]">
                  {relatedDocs.map((doc) => (
                    <li key={doc.slug}>
                      <Link
                        href={`/docs/${doc.slug}`}
                        className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-1 shadow-[3px_3px_0_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5"
                      >
                        {doc.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
        <CopyButtonScript />
      </PageShell>
    );
  } catch (error) {
    console.error('Error reading documentation file:', error);
    return notFound();
  }
}

async function renderMarkdown(markdown: string): Promise<string> {
  const [
    { remark },
    { default: remarkGfm },
    { default: remarkRehype },
    { default: rehypeRaw },
    { default: rehypeHighlight },
    { default: rehypeStringify },
  ] = await remarkModulesPromise;

  const processed = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return processed.toString();
}

