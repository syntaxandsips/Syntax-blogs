"use client";

import { useEffect } from "react";

function createCopyButton(language: string) {
  const button = document.createElement("button");
  button.className =
    "copy-code-button text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors";
  button.type = "button";
  button.textContent = "Copy";
  button.setAttribute("aria-label", `Copy ${language} code to clipboard`);
  button.addEventListener("click", async () => {
    const pre = button.parentElement?.nextElementSibling as HTMLPreElement | null;
    const code = pre?.querySelector("code")?.textContent;
    if (!code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      const originalLabel = button.textContent;
      button.textContent = "Copied!";
      button.classList.add("copied");
      window.setTimeout(() => {
        button.textContent = originalLabel ?? "Copy";
        button.classList.remove("copied");
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code", error);
    }
  });

  return button;
}

function wrapCodeBlock(pre: HTMLPreElement) {
  if (pre.dataset.codeEnhancement === "true") {
    return;
  }

  const code = pre.querySelector("code");
  if (!code) {
    return;
  }

  const languageClass = Array.from(code.classList).find((className) =>
    className.startsWith("language-")
  );
  const language = languageClass?.replace("language-", "") || "code";
  const normalizedLanguage = language.toLowerCase();
  const friendlyNames: Record<string, string> = {
    js: "JavaScript",
    javascript: "JavaScript",
    ts: "TypeScript",
    typescript: "TypeScript",
    py: "Python",
    python: "Python",
    sh: "Shell",
    bash: "Shell",
    shell: "Shell",
    csharp: "C#",
    "c#": "C#",
    cpp: "C++",
    "c++": "C++",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    sql: "SQL",
    txt: "Text",
    plaintext: "Text",
  };
  const displayLanguage =
    friendlyNames[normalizedLanguage] ||
    normalizedLanguage.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const wrapper = document.createElement("div");
  wrapper.className = "code-block-wrapper mb-6";

  const header = document.createElement("div");
  header.className =
    "code-block-header flex items-center justify-between rounded-t-md border border-neutral-200 bg-neutral-100 px-3 py-2 text-neutral-600";

  const languageLabel = document.createElement("span");
  languageLabel.className = "text-xs font-semibold uppercase tracking-wide";
  languageLabel.textContent = displayLanguage;

  const copyButton = createCopyButton(language);

  header.appendChild(languageLabel);
  header.appendChild(copyButton);

  const parent = pre.parentElement;
  if (!parent) {
    return;
  }

  parent.insertBefore(wrapper, pre);
  wrapper.appendChild(header);
  wrapper.appendChild(pre);

  pre.classList.add("rounded-b-md", "border", "border-t-0", "border-neutral-200", "bg-neutral-950", "p-4", "text-sm", "text-neutral-100", "overflow-x-auto");
  code.classList.add("block");

  pre.dataset.codeEnhancement = "true";
}

export function CopyButtonScript() {
  useEffect(() => {
    const codeBlocks = Array.from(
      document.querySelectorAll<HTMLPreElement>(".doc-content pre")
    );
    codeBlocks.forEach((block) => wrapCodeBlock(block));
  }, []);

  return null;
}
