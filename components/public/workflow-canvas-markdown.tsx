/**
 * A deliberately tiny markdown renderer for n8n sticky-note content.
 *
 * Sticky text is author-controlled but arrives through pasted workflow JSON, so
 * it is treated as untrusted: this builds React elements only and never touches
 * `dangerouslySetInnerHTML`, which means every character that is not part of the
 * four constructs below is escaped by React on the way out.
 *
 * Supported, and nothing else: ATX headings (`#`..`######`), `**bold**`,
 * `- ` / `* ` bullet lists, and `[text](url)` links.
 */

import { Fragment, type ReactNode } from "react";

/** Only these schemes survive; anything else renders as plain text. */
const SAFE_LINK = /^(https?:\/\/|mailto:)/i;

const HEADING = /^(#{1,6})\s+(.*)$/;
const BULLET = /^\s*[-*]\s+(.*)$/;
const INLINE = /\*\*([^*]+)\*\*|\[([^\]\n]+)\]\(([^)\s]+)\)/g;

/** Splits one line into text, `**bold**` and `[link](url)` runs. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let cursor = 0;
  let index = 0;

  // `INLINE` is a module-level global regex — reset before each line.
  INLINE.lastIndex = 0;
  let match = INLINE.exec(text);

  while (match) {
    if (match.index > cursor) {
      out.push(
        <Fragment key={`${keyPrefix}-t${index}`}>
          {text.slice(cursor, match.index)}
        </Fragment>,
      );
      index++;
    }

    const [raw, bold, linkText, linkHref] = match;

    if (bold !== undefined) {
      out.push(
        <strong key={`${keyPrefix}-b${index}`} className="font-semibold">
          {bold}
        </strong>,
      );
    } else if (linkText !== undefined && linkHref !== undefined) {
      out.push(
        SAFE_LINK.test(linkHref) ? (
          <a
            key={`${keyPrefix}-a${index}`}
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-current/40 underline-offset-2 hover:decoration-current"
          >
            {linkText}
          </a>
        ) : (
          // Unsafe scheme (javascript:, data:, …): keep the words, drop the link.
          <Fragment key={`${keyPrefix}-a${index}`}>{linkText}</Fragment>
        ),
      );
    }

    index++;
    cursor = match.index + raw.length;
    match = INLINE.exec(text);
  }

  if (cursor < text.length) {
    out.push(
      <Fragment key={`${keyPrefix}-t${index}`}>{text.slice(cursor)}</Fragment>,
    );
  }

  return out;
}

const HEADING_CLASS: Readonly<Record<number, string>> = {
  1: "text-[1.05em] font-semibold",
  2: "text-[1em] font-semibold",
  3: "text-[0.95em] font-semibold",
  4: "text-[0.92em] font-semibold",
  5: "text-[0.9em] font-semibold",
  6: "text-[0.9em] font-semibold",
};

export function StickyMarkdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];

  // Buffers for the two multi-line blocks: bullet lists and paragraphs.
  let bullets: string[] = [];
  let paragraph: string[] = [];

  function flushBullets() {
    if (bullets.length === 0) return;
    const items = bullets;
    bullets = [];
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="ml-4 list-disc space-y-0.5">
        {items.map((item, i) => (
          <li key={i}>{renderInline(item, `ul${blocks.length}-${i}`)}</li>
        ))}
      </ul>,
    );
  }

  function flushParagraph() {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ");
    paragraph = [];
    blocks.push(
      <p key={`p-${blocks.length}`}>{renderInline(text, `p${blocks.length}`)}</p>,
    );
  }

  for (const line of lines) {
    const heading = HEADING.exec(line);
    if (heading) {
      flushBullets();
      flushParagraph();
      const level = heading[1].length;
      blocks.push(
        <p
          key={`h-${blocks.length}`}
          className={HEADING_CLASS[level] ?? HEADING_CLASS[6]}
        >
          {renderInline(heading[2], `h${blocks.length}`)}
        </p>,
      );
      continue;
    }

    const bullet = BULLET.exec(line);
    if (bullet) {
      flushParagraph();
      bullets.push(bullet[1]);
      continue;
    }

    if (line.trim() === "") {
      flushBullets();
      flushParagraph();
      continue;
    }

    flushBullets();
    paragraph.push(line.trim());
  }

  flushBullets();
  flushParagraph();

  return <div className="space-y-2">{blocks}</div>;
}
