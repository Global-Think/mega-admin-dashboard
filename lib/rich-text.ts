import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote'];

const BLOCK_TAG_BREAKS = /<\/(p|li|blockquote|pre|ul|ol)>/gi;
const TAGS = /<[^>]+>/g;

export function sanitizeRichTextHtml(value: string): string {
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: [],
  });
}

export function toRichTextHtml(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const source = looksLikeHtml(trimmed) ? trimmed : plainTextToHtml(trimmed);
  return sanitizeRichTextHtml(source);
}

export function normalizeOptionalRichText(value?: string | null): string | null {
  if (value == null) {
    return null;
  }

  const html = toRichTextHtml(value);
  return getRichTextPlainText(html) ? html : null;
}

export function getRichTextPlainText(value?: string | null): string {
  if (!value) {
    return '';
  }

  return value
    .replace(BLOCK_TAG_BREAKS, ' ')
    .replace(TAGS, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function plainTextToHtml(value: string): string {
  const paragraphs = value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) =>
      `<p>${escapeHtml(paragraph).replace(/\n/g, '<br />')}</p>`
    );

  return paragraphs.join('');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
