import { Marked, Renderer } from 'marked';
import { publicEvidenceDocuments, type PublicEvidenceDocument } from './public-evidence';

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function localEvidenceTarget(href: string, current: PublicEvidenceDocument): string | undefined {
  if (href.startsWith('#')) return href;
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) return href;

  try {
    const resolved = new URL(href, `https://evidence.invalid/${current.sourcePath}`);
    if (resolved.origin !== 'https://evidence.invalid') return undefined;
    const sourcePath = decodeURIComponent(resolved.pathname.slice(1));
    const target = publicEvidenceDocuments.find((document) => document.sourcePath === sourcePath);
    return target ? `/evidence/${target.slug}${resolved.hash}` : undefined;
  } catch {
    return undefined;
  }
}

export function renderEvidenceMarkdown(source: string, current: PublicEvidenceDocument): string {
  const renderer = new Renderer();
  const headingCounts = new Map<string, number>();

  function headingId(text: string): string {
    const base = text.toLowerCase()
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[`*_~]/g, '')
      .replace(/&(?:amp|lt|gt|quot|#39);/g, '')
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .trim()
      .replace(/\s+/g, '-');
    const count = headingCounts.get(base) ?? 0;
    headingCounts.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  }

  // Source documents are trusted repository files, but raw HTML is not needed
  // for the evidence presentation and must never become executable markup.
  renderer.html = ({ text }) => escapeHtml(text);
  renderer.heading = function ({ tokens, depth, text }) {
    const level = Math.min(depth + 1, 6);
    const content = this.parser.parseInline(tokens);
    return `<h${level} id="${escapeHtml(headingId(text))}">${content}</h${level}>\n`;
  };
  renderer.link = function ({ href, title, tokens }) {
    const target = localEvidenceTarget(href, current);
    const content = this.parser.parseInline(tokens);
    if (!target) return content;
    const external = /^https?:\/\//i.test(target) || /^mailto:/i.test(target);
    const titleAttribute = title ? ` title="${escapeHtml(title)}"` : '';
    const externalAttributes = external ? ' target="_blank" rel="noreferrer"' : '';
    return `<a href="${escapeHtml(target)}"${titleAttribute}${externalAttributes}>${content}</a>`;
  };
  renderer.image = ({ text }) => escapeHtml(text);

  const parser = new Marked({ gfm: true, renderer });
  return parser.parse(source) as string;
}
