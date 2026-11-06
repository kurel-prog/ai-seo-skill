/**
 * Reference Implementation (TypeScript / Node.js): Core AI SEO Utilities (2026 Standard)
 * - normalizeDescription: Block-tag spacing + strip tags + HTML entity decode (anti-double-encoding)
 * - encodeJsonLd: Hex-escaped HTML characters (anti-XSS in <script type="application/ld+json">)
 * - toMinorUnits: ISO 4217 currency minor unit converter (Half-Up rounding)
 */

const BLOCK_TAG_RE = /<(?:br\s*\/?|\/?(?:p|div|li|ul|ol|tr|td|th|table|h[1-6]|section|article|header|footer|blockquote|pre|dl|dt|dd))\b[^>]*>/gi;
const ANY_TAG_RE = /<[^>]+>/g;
const WHITESPACE_RE = /\s+/gu;

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&ndash;': '\u2013',
  '&mdash;': '\u2014',
  '&hellip;': '\u2026',
  '&copy;': '\u00A9',
  '&reg;': '\u00AE',
  '&trade;': '\u2122',
  '&euro;': '\u20AC',
  '&pound;': '\u00A3',
  '&yen;': '\u00A5',
  '&cent;': '\u00A2',
  '&ldquo;': '\u201C',
  '&rdquo;': '\u201D',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&bull;': '\u2022',
  '&middot;': '\u00B7',
  '&deg;': '\u00B0',
  '&plusmn;': '\u00B1',
  '&times;': '\u00D7',
  '&divide;': '\u00F7',
};

const ISO4217_FRACTION_DIGITS: Record<string, number> = {
  // 0-decimal currencies
  JPY: 0, KRW: 0, VND: 0, CLP: 0, ISK: 0,
  // 2-decimal currencies (default)
  USD: 2, EUR: 2, GBP: 2, SGD: 2, AUD: 2, CAD: 2,
  // 3-decimal currencies
  BHD: 3, KWD: 3, OMR: 3, JOD: 3, TND: 3,
};

export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&([a-z0-9]+);/gi, (match) => HTML_ENTITIES[match.toLowerCase()] ?? match);
}

export function normalizeDescription(rawHtml: string | null | undefined, maxLength = 300): string {
  if (!rawHtml) return '';
  const text = decodeHtmlEntities(
    rawHtml.replace(BLOCK_TAG_RE, ' ').replace(ANY_TAG_RE, '')
  )
    .replace(WHITESPACE_RE, ' ')
    .trim();
  return Array.from(text).slice(0, maxLength).join('');
}

export function encodeJsonLd(data: unknown): string {
  try {
    const raw = JSON.stringify(data);
    if (!raw) return '{}';
    return raw
      .replace(/&/g, '\\u0026')
      .replace(/</g, '\\u003C')
      .replace(/>/g, '\\u003E')
      .replace(/'/g, '\\u0027');
  } catch {
    return '{}';
  }
}

export function toMinorUnits(amountRaw: string | number, currency: string): number {
  const digits = ISO4217_FRACTION_DIGITS[currency.toUpperCase()] ?? 2;
  const cleanStr = String(amountRaw).trim().replace(/,/g, '');
  const match = cleanStr.match(/^([+-])?(\d+)(?:\.(\d+))?$/);
  if (!match) {
    const num = Number(cleanStr);
    if (!Number.isFinite(num)) return 0;
    const sign = num < 0 ? -1 : 1;
    return sign * Math.round(Math.abs(num) * Math.pow(10, digits));
  }
  const sign = match[1] === '-' ? -1 : 1;
  const intPart = BigInt(match[2]);
  const fracRaw = (match[3] ?? '').padEnd(digits + 1, '0');
  const mainFrac = digits > 0 ? BigInt(fracRaw.slice(0, digits)) : 0n;
  const roundDigit = Number(fracRaw[digits] ?? '0');
  const scale = BigInt(10 ** digits);
  const rounded = intPart * scale + mainFrac + (roundDigit >= 5 ? 1n : 0n);
  return sign * Number(rounded);
}
