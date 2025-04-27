"use client";

import React from 'react';
import { Calendar, GitCommit, Plus, Wrench, RefreshCw } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  sections: {
    title: string;
    items: string[];
  }[];
}

interface ChangelogTimelineProps {
  content: string;
}

export default function ChangelogTimeline({ content }: ChangelogTimelineProps) {
  // Log content length to verify it's being passed correctly
  console.log('ChangelogTimeline received content length:', content.length);
  console.log('ChangelogTimeline content first 100 chars:', content.substring(0, 100));

  // Parse the markdown content to extract changelog entries
  const entries = parseChangelogContent(content);

  // Log parsed entries
  console.log('Parsed entries count:', entries.length);

  if (entries.length === 0) {
    return (
      <div className="changelog-timeline p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-500">No changelog entries found. Please check the format of your CHANGELOG.md file.</p>
        <p className="text-sm text-gray-600 mt-2">Expected format: <code>## [version] - date</code> followed by sections with <code>### Section Title</code> and list items.</p>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre className="text-xs overflow-auto">{content.substring(0, 500)}...</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="changelog-timeline">
      {entries.map((entry, index) => (
        <div key={index} className="timeline-entry">
          <div className="timeline-connector">
            <div className="timeline-line"></div>
            <div className="timeline-dot">
              <GitCommit className="timeline-icon" size={24} />
            </div>
          </div>

          <div className="timeline-content neo-container">
            <div className="version-header">
              <h2>
                <span className="version-tag">{entry.version}</span>
                <span className="version-date">
                  <Calendar className="inline-block mr-1" size={16} />
                  {entry.date}
                </span>
              </h2>
            </div>

            {entry.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="changelog-section">
                <h3 className="section-title">
                  {getSectionIcon(section.title)}
                  {section.title}
                </h3>
                <ul className="section-items">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function to get the appropriate icon for each section
function getSectionIcon(title: string) {
  if (title.toLowerCase().includes('added')) {
    return <Plus className="inline-block mr-2 section-icon section-icon-added" size={18} />;
  } else if (title.toLowerCase().includes('fixed')) {
    return <Wrench className="inline-block mr-2 section-icon section-icon-fixed" size={18} />;
  } else if (title.toLowerCase().includes('changed')) {
    return <RefreshCw className="inline-block mr-2 section-icon section-icon-changed" size={18} />;
  }
  return null;
}

// Parse the markdown content to extract changelog entries
function parseChangelogContent(content: string): ChangelogEntry[] {
  if (!content || typeof content !== 'string') {
    console.error('Invalid content passed to parseChangelogContent:', content);
    return [];
  }

  try {
    const entries: ChangelogEntry[] = [];

    // Normalize line endings to ensure consistent regex matching
    const normalizedContent = content.replace(/\r\n/g, '\n');

    // Log the raw content for debugging
    console.log('Content starts with:', normalizedContent.substring(0, 50).replace(/\n/g, '\\n'));
    console.log('Content includes version headers:', normalizedContent.includes('## ['));

    // Find all version blocks using regex
    // This pattern matches "## [version] - date" and captures everything until the next version header
    const versionRegex = new RegExp('## \\[(.*?)\\] - ([^\\n]+)', 'g');
    const versionMatches = [...normalizedContent.matchAll(versionRegex)];

    console.log('Found version matches:', versionMatches.length);

    if (versionMatches.length === 0) {
      console.error('No version matches found in content. Content sample:', normalizedContent.substring(0, 200));
      throw new Error('No version matches found in changelog content');
    }

    for (const match of versionMatches) {
      const version = match[1];
      const date = match[2].trim();

      // Get the full content for this version by finding the start and end positions
      const versionHeaderPos = normalizedContent.indexOf(`## [${version}] - ${date}`);
      let nextVersionHeaderPos = normalizedContent.indexOf('## [', versionHeaderPos + 1);
      if (nextVersionHeaderPos === -1) nextVersionHeaderPos = normalizedContent.length;

      const fullBlock = normalizedContent.substring(versionHeaderPos, nextVersionHeaderPos);

      console.log(`Processing version ${version} from ${date}`);
      console.log(`Full block length: ${fullBlock.length} characters`);

      // Find all sections within this version block
      const sections: { title: string; items: string[] }[] = [];

      // Extract sections using regex
      // This pattern matches "### SectionTitle" and captures all list items that follow
      const sectionRegex = new RegExp('### ([^\\n]+)\\n\\n([\\s\\S]*?)(?=\\n### |$)', 'g');
      const sectionMatches = [...fullBlock.matchAll(sectionRegex)];

      console.log(`Found ${sectionMatches.length} sections in version ${version}`);

      for (const sectionMatch of sectionMatches) {
        const title = sectionMatch[1].trim();
        const itemsText = sectionMatch[2];

        console.log(`  Found section: ${title}`);

        // Extract list items - be more precise with the regex to handle various formats
        const items = itemsText
          .split('\n')
          .filter(line => line.trim().startsWith('- '))
          .map(line => {
            // Remove the leading dash and any whitespace
            const cleanedItem = line.replace(/^-\s*/, '').trim();

            // Process any markdown links or formatting in the item
            return cleanedItem;
          });

        console.log(`  Section "${title}" has ${items.length} items`);

        if (items.length > 0) {
          console.log(`    Found ${items.length} items`);
          sections.push({
            title,
            items
          });
        }
      }

      if (sections.length > 0) {
        entries.push({
          version,
          date,
          sections
        });
      } else {
        console.log(`  No sections found for version ${version}`);
      }
    }

    return entries;
  } catch (error) {
    console.error('Error parsing changelog content:', error);
    console.error('Content sample for debugging:', content.substring(0, 500));
    return [];
  }
}
