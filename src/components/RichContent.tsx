"use client";

import { useState } from "react";

function inlineHtml(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function TableBlock({ raw }: { raw: string }) {
  const rows = raw.split("\n").filter((r) => !r.match(/^\|[-| :]+\|$/));
  const headers = rows[0]?.split("|").filter(Boolean).map((h) => h.trim());
  const body = rows.slice(1);
  const [active, setActive] = useState(0);

  return (
    <div className="compare-table">
      <div className="compare-scroll">
        <table>
          <thead>
            <tr>
              {headers?.map((h) => (
                <th key={h} dangerouslySetInnerHTML={{ __html: inlineHtml(h) }} />
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr
                key={ri}
                className={active === ri ? "compare-row-active" : ""}
                onMouseEnter={() => setActive(ri)}
              >
                {row
                  .split("|")
                  .filter(Boolean)
                  .map((c, ci) => (
                    <td
                      key={ci}
                      dangerouslySetInnerHTML={{ __html: inlineHtml(c.trim()) }}
                    />
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="compare-hint meta-mono">Hover rows to highlight comparisons</p>
    </div>
  );
}

function NumberedSteps({ lines }: { lines: string[] }) {
  return (
    <ol className="step-track">
      {lines.map((line, i) => (
        <li key={i} className="step-item">
          <span className="step-num">{i + 1}</span>
          <span
            className="step-text"
            dangerouslySetInnerHTML={{ __html: inlineHtml(line.replace(/^\d+\.\s*/, "")) }}
          />
        </li>
      ))}
    </ol>
  );
}

function BulletList({ lines }: { lines: string[] }) {
  return (
    <ul className="beat-list">
      {lines.map((line, i) => (
        <li
          key={i}
          dangerouslySetInnerHTML={{ __html: inlineHtml(line.replace(/^[-*]\s*/, "")) }}
        />
      ))}
    </ul>
  );
}

function CalloutBlock({ type, body }: { type: "scenario" | "tip" | "pitfall"; body: string }) {
  const labels = { scenario: "Scenario", tip: "Pro move", pitfall: "Watch out" };
  return (
    <div className={`content-callout content-callout-${type}`}>
      <span className="content-callout-label">{labels[type]}</span>
      <div dangerouslySetInnerHTML={{ __html: inlineHtml(body) }} />
    </div>
  );
}

function parseBlocks(content: string) {
  const blocks: { kind: string; raw: string; type?: string }[] = [];
  const parts = content.split(/\n(?=:::)/);

  for (const part of parts) {
    const callout = part.match(/^:::(scenario|tip|pitfall)\n([\s\S]*?)\n:::/);
    if (callout) {
      blocks.push({ kind: "callout", type: callout[1], raw: callout[2].trim() });
      const rest = part.slice(callout[0].length).trim();
      if (rest) blocks.push(...splitParagraphs(rest));
      continue;
    }
    blocks.push(...splitParagraphs(part));
  }
  return blocks;
}

function splitParagraphs(text: string) {
  return text
    .split("\n\n")
    .filter(Boolean)
    .map((raw) => {
      if (raw.startsWith("|")) return { kind: "table", raw };
      const numbered = raw.split("\n").filter((l) => /^\d+\.\s/.test(l));
      if (numbered.length >= 2 && numbered.length === raw.split("\n").length) {
        return { kind: "steps", raw: numbered.join("\n") };
      }
      const bullets = raw.split("\n").filter((l) => /^[-*]\s/.test(l));
      if (bullets.length >= 2 && bullets.length === raw.split("\n").length) {
        return { kind: "bullets", raw: bullets.join("\n") };
      }
      if (raw.startsWith(">")) {
        return { kind: "callout", type: "scenario", raw: raw.replace(/^>\s*/, "") };
      }
      return { kind: "para", raw };
    });
}

interface RichContentProps {
  content: string;
  collapsedAfter?: number;
}

export default function RichContent({ content, collapsedAfter = 3 }: RichContentProps) {
  const [expanded, setExpanded] = useState(false);
  const blocks = parseBlocks(content);
  const visible = expanded ? blocks : blocks.slice(0, collapsedAfter);
  const hidden = blocks.length - collapsedAfter;

  return (
    <div className="rich-content">
      {visible.map((block, i) => {
        if (block.kind === "table") {
          return <TableBlock key={i} raw={block.raw} />;
        }
        if (block.kind === "steps") {
          return (
            <NumberedSteps
              key={i}
              lines={block.raw.split("\n")}
            />
          );
        }
        if (block.kind === "bullets") {
          return (
            <BulletList
              key={i}
              lines={block.raw.split("\n")}
            />
          );
        }
        if (block.kind === "callout" && block.type) {
          return (
            <CalloutBlock
              key={i}
              type={block.type as "scenario" | "tip" | "pitfall"}
              body={block.raw}
            />
          );
        }
        return (
          <p
            key={i}
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: inlineHtml(block.raw) }}
          />
        );
      })}
      {!expanded && hidden > 0 && (
        <button
          type="button"
          className="expand-beats"
          onClick={() => setExpanded(true)}
        >
          + {hidden} more {hidden === 1 ? "beat" : "beats"} — keep going
        </button>
      )}
    </div>
  );
}