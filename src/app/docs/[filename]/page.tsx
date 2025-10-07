import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CopyButtonScript } from '@/components/docs/copy-button-script';

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

// Generate static params for known documentation files
export function generateStaticParams() {
  return [
    { filename: 'markdown-guide.md' },
    { filename: 'admin-code-guide.md' },
  ];
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ filename: string }>;
}) {
  const { filename } = await params;

  try {
    const safeFilename = path.basename(filename);
    if (!safeFilename || path.extname(safeFilename) !== '.md') {
      return notFound();
    }
    const docsDirectory = path.join(process.cwd(), 'src', 'docs');
    const filePath = path.join(docsDirectory, safeFilename);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return notFound();
    }
    
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const html = await renderMarkdown(fileContent);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white border-4 border-black rounded-lg p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0)]">
          <article className="doc-content prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        </div>
        <CopyButtonScript />
      </div>
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

