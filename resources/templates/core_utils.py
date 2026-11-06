"""
Reference Implementation (Python): Core AI SEO Utilities (2026 Standard)
- normalize_description: Block-tag spacing + strip_tags + html.unescape (anti-double-encoding)
- encode_json_ld: Hex-escaped HTML characters (anti-XSS in <script type="application/ld+json">)
- to_minor_units: ISO 4217 currency minor unit converter (ROUND_HALF_UP)
"""

import html
import json
import re
from decimal import Decimal, ROUND_HALF_UP
from typing import Any

BLOCK_TAG_RE = re.compile(
    r"<(?:br\s*/?|/?(?:p|div|li|ul|ol|tr|td|th|table|h[1-6]|section|article|header|footer|blockquote|pre|dl|dt|dd))\b[^>]*>",
    re.IGNORECASE,
)
ANY_TAG_RE = re.compile(r"<[^>]+>")
WHITESPACE_RE = re.compile(r"\s+", re.UNICODE)

ISO4217_FRACTION_DIGITS: dict[str, int] = {
    # 0-decimal currencies
    "JPY": 0, "KRW": 0, "VND": 0, "CLP": 0, "ISK": 0,
    # 2-decimal currencies (default)
    "USD": 2, "EUR": 2, "GBP": 2, "SGD": 2, "AUD": 2, "CAD": 2,
    # 3-decimal currencies
    "BHD": 3, "KWD": 3, "OMR": 3, "JOD": 3, "TND": 3,
}


def normalize_description(raw_html: str | None, max_length: int = 300) -> str:
    if not raw_html:
        return ""
    text = BLOCK_TAG_RE.sub(" ", raw_html)
    text = ANY_TAG_RE.sub("", text)
    text = html.unescape(text)
    text = WHITESPACE_RE.sub(" ", text).strip()
    return text[:max_length]


def encode_json_ld(data: dict[str, Any] | list[Any]) -> str:
    try:
        raw = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    except (TypeError, ValueError):
        return "{}"
    return (
        raw.replace("&", "\\u0026")
        .replace("<", "\\u003C")
        .replace(">", "\\u003E")
        .replace("'", "\\u0027")
    )


def normalize_major_price(amount_raw: str | int | float) -> Decimal:
    clean_str = str(amount_raw).strip().replace(",", "")
    return Decimal(clean_str)


def to_minor_units(amount_raw: str | int | float, currency: str) -> int:
    digits = ISO4217_FRACTION_DIGITS.get(currency.upper(), 2)
    major_val = normalize_major_price(amount_raw)
    scaled = major_val * (Decimal(10) ** digits)
    sign = -1 if scaled < 0 else 1
    rounded = int(abs(scaled).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
    return sign * rounded
