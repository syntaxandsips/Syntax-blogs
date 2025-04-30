import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

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

export default async function DocPage({ params }: { params: { filename: string } }) {
  const { filename } = params;
  
  try {
    // Construct the file path
    const filePath = path.join(process.cwd(), 'src', 'docs', filename);
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return notFound();
    }
    
    // Read the file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white border-4 border-black rounded-lg p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0)]">
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: markdownToHtml(fileContent) }} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error reading documentation file:', error);
    return notFound();
  }
}

// Simple markdown to HTML converter
function markdownToHtml(markdown: string): string {
  // Convert headings
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
    .replace(/^###### (.*$)/gm, '<h6>$1</h6>');

  // Convert bold and italic
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Convert links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');

  // Convert lists
  html = html
    .replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>')
    .replace(/^\s*-\s+(.*$)/gm, '<li>$1</li>');
  
  // Wrap lists
  html = html.replace(/<li>.*?<\/li>(\n<li>.*?<\/li>)+/gs, (match) => {
    if (match.includes('1.')) {
      return `<ol class="list-decimal pl-6 my-4">${match}</ol>`;
    }
    return `<ul class="list-disc pl-6 my-4">${match}</ul>`;
  });

  // Convert code blocks
  html = html.replace(/```(.*?)\n([\s\S]*?)```/g, (match, language, code) => {
    return `<div class="bg-gray-100 p-4 rounded-md my-4 overflow-x-auto">
      <pre><code class="language-${language || 'plaintext'}">${code.trim()}</code></pre>
    </div>`;
  });

  // Convert inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded">$1</code>');

  // Convert blockquotes
  html = html.replace(/^>\s+(.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>');

  // Convert paragraphs (must be done last)
  html = html.replace(/^(?!<[a-z])(.*$)/gm, (match) => {
    if (match.trim() === '') return '';
    return `<p>${match}</p>`;
  });

  // Convert tables
  const tableRegex = /\|(.+)\|\n\|(?:[-:]+\|)+\n((?:\|.+\|\n)+)/g;
  html = html.replace(tableRegex, (match, headers, rows) => {
    const headerCells = headers.split('|').filter(cell => cell.trim() !== '').map(cell => `<th class="border px-4 py-2">${cell.trim()}</th>`).join('');
    
    const rowsHtml = rows.split('\n').filter(row => row.trim() !== '').map(row => {
      const cells = row.split('|').filter(cell => cell.trim() !== '').map(cell => `<td class="border px-4 py-2">${cell.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    
    return `<div class="overflow-x-auto my-4">
      <table class="min-w-full border-collapse border border-gray-300">
        <thead class="bg-gray-100">
          <tr>${headerCells}</tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>`;
  });

  // Add horizontal rules
  html = html.replace(/^---$/gm, '<hr class="my-6 border-t-2 border-gray-300">');

  return html;
}
