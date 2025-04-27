"use client";

import React, { useState } from 'react';
import { Clipboard, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  availableLanguages?: string[];
}

export default function CodeBlock({ code, language, availableLanguages = [] }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasLanguageOptions = availableLanguages.length > 1;

  return (
    <div className="neo-container my-6 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b border-black">
        {hasLanguageOptions ? (
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-transparent border border-black px-2 py-1 text-sm"
          >
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm font-mono">{language}</span>
        )}
        
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-1 text-sm px-2 py-1 border border-black hover:bg-gray-200 transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Clipboard size={14} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      
      <pre className="p-4 overflow-x-auto bg-gray-50">
        <code className={`language-${selectedLanguage}`}>{code}</code>
      </pre>
    </div>
  );
}
