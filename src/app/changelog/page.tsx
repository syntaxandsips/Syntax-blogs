import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import '@/styles/changelog.css';
import ClientPage from './ClientPage';

export const metadata: Metadata = {
  title: 'Changelog | Syntax and Sips',
  description: 'Track all changes and updates to the Syntax and Sips blog platform',
};

export default async function ChangelogPage() {
  try {
    // Read the CHANGELOG.md file
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const changelogContent = fs.readFileSync(changelogPath, 'utf8');

    if (process.env.NODE_ENV !== 'production') {
      // Log the first 100 characters to verify content is being read during development
      console.info('Changelog content (first 100 chars):', changelogContent.substring(0, 100));
    }

    // Ensure the content is a string and not empty
    if (!changelogContent || typeof changelogContent !== 'string') {
      console.error('Invalid changelog content:', changelogContent);
      return <ClientPage content="# Error loading changelog\n\nThe changelog content is invalid or empty." />;
    }

    return <ClientPage content={changelogContent} />;
  } catch (error) {
    console.error('Error reading CHANGELOG.md:', error);
    return <ClientPage content="# Error loading changelog\n\nThere was an error loading the changelog content." />;
  }
}
