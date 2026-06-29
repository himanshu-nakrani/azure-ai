"use client";

import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

function highlightPython(code: string): string {
  return code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(#.*)$/gm, '<span class="comment">$1</span>')
    .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="string">$1</span>')
    .replace(/\b(from|import|def|return|async|await|for|in|if|else|elif|class|with|as|try|except|yield|True|False|None)\b/g, '<span class="keyword">$1</span>')
    .replace(/@(\w+)/g, '<span class="decorator">@$1</span>')
    .replace(/\b(\w+)\s*\(/g, '<span class="function">$1</span>(');
}

function highlightJson(code: string): string {
  return code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span class="keyword">$1</span>:')
    .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="string">$1</span>');
}

export default function CodeBlock({ code, language = "python" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const highlighted = language === "json" ? highlightJson(code) : highlightPython(code);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group relative">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 z-10 font-[family-name:var(--font-ibm-mono)] text-[0.625rem] text-[var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100 hover:text-[var(--text)]"
      >
        {copied ? "copied" : "copy"}
      </button>
      <pre className="code-block p-4">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}