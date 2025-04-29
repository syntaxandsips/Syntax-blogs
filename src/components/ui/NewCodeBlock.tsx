"use client";

import React, { useState } from 'react';
import { Check, Copy, Code } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function NewCodeBlock({ code, language = 'javascript' }: CodeBlockProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [copied, setCopied] = useState(false);
  
  const languages = [
    { name: 'JavaScript', value: 'javascript' },
    { name: 'TypeScript', value: 'typescript' },
    { name: 'Python', value: 'python' },
    { name: 'HTML', value: 'html' },
    { name: 'CSS', value: 'css' },
    { name: 'Java', value: 'java' },
    { name: 'C++', value: 'cpp' },
    { name: 'Go', value: 'go' },
    { name: 'Rust', value: 'rust' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 border-4 border-black rounded-lg overflow-hidden bg-[#282c34]">
      <div className="bg-[#1e1e1e] border-b-4 border-black px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Code className="text-[#6C63FF]" />
          <select
            aria-label="Select programming language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-black text-white px-3 py-1 rounded-md text-sm font-mono"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCopy}
          className="bg-[#6C63FF] hover:bg-[#5A53D5] text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 transition"
        >
          {copied ? (
            <>
              <Check size={14} /> Copied!
            </>
          ) : (
            <>
              <Copy size={14} /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-white font-mono text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}
