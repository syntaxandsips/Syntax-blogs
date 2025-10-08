"use client";

import dynamic from 'next/dynamic';

// Dynamically import the ChangelogView component with no SSR
const ChangelogView = dynamic(() => import('@/components/ui/ChangelogView'), { ssr: false });

interface ClientPageProps {
  content: string;
}

export default function ClientPage({ content }: ClientPageProps) {
  // Make sure content is properly passed
  const processedContent = content || '';

  if (process.env.NODE_ENV !== 'production') {
    // Log content length to verify it's being passed correctly during development
    console.info('ClientPage received content length:', processedContent.length);
    console.info('ClientPage content preview:', processedContent.substring(0, 100));
  }

  return (
    <div className="container mx-auto px-6 py-8 min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Changelog</h1>
        <p className="text-lg max-w-2xl mx-auto">
          Track all changes and updates to the Syntax and Sips blog platform.
        </p>
      </div>

      {/* Decorative elements */}
      <div className="relative">
        <div className="decorative-element decorative-cross absolute -top-10 left-10 w-8 h-8 text-[#FF69B4] decorative-element-1"></div>
        <div className="decorative-element absolute top-20 right-10 w-12 h-12 rounded-full border-4 border-[#87CEEB] decorative-element-2"></div>
        <div className="decorative-element absolute bottom-10 left-20 w-10 h-10 bg-[#F4D738] decorative-element-3"></div>
      </div>

      <div className="neo-container bg-white p-8 border-4 border-black shadow-[8px_8px_0_0_#000000] max-w-5xl mx-auto relative overflow-hidden">
        {/* Grid background for neo-brutalism style */}
        <div className="grid-background absolute inset-0 z-0"></div>

        {/* Changelog view with toggle functionality */}
        <ChangelogView content={processedContent} />
      </div>
    </div>
  );
}
