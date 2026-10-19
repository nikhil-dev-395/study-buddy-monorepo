import type { ReactNode } from "react";

/** Inline: **bold**, *italic*, `code`. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="text-zinc-100 font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code key={i} className="px-1 py-0.5 rounded bg-black/50 text-emerald-300 font-mono text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

/** Tiny Markdown renderer for AI replies: paragraphs, headings, lists, code blocks. */
export default function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.replace(/\r/g, "").split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push(
        <pre key={blocks.length} className="bg-black/60 border border-zinc-800 rounded-lg p-3 overflow-x-auto text-[11px] font-mono text-zinc-200">
          {code.join("\n")}
        </pre>,
      );
      continue;
    }

    if (/^\s*([-*•]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*•]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*•]|\d+\.)\s+/, ""));
        i++;
      }
      const Tag = ordered ? "ol" : "ul";
      blocks.push(
        <Tag key={blocks.length} className={`${ordered ? "list-decimal" : "list-disc"} pl-5 space-y-1 marker:text-emerald-400`}>
          {items.map((it, j) => (
            <li key={j}>{inline(it)}</li>
          ))}
        </Tag>,
      );
      continue;
    }

    const heading = line.match(/^#{1,4}\s+(.*)/);
    if (heading) {
      blocks.push(
        <p key={blocks.length} className="font-semibold text-zinc-100">
          {inline(heading[1])}
        </p>,
      );
      i++;
      continue;
    }

    if (line.trim()) blocks.push(<p key={blocks.length}>{inline(line)}</p>);
    i++;
  }

  return <div className="space-y-2 leading-relaxed">{blocks}</div>;
}
