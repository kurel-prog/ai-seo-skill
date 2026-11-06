# Core Utilities & Domain Normalization Guide

## 1. `normalizeDescription(htmlText, maxLength = 300)`
Prevents concatenated words across HTML blocks and prevents double-encoding of HTML entities in JSON-LD and meta tags.

### Required 5-Step Pipeline
1. **Replace block-level & line-break tags with a single space `' '`**:
   Pattern: `<(?:br\s*/?|/?(?:p|div|li|ul|ol|tr|td|th|table|h[1-6]|section|article|header|footer|blockquote|pre|dl|dt|dd))\b[^>]*>` (case-insensitive) -> `' '`.
2. **Strip remaining HTML tags** (`<[^>]+>` -> `''`).
3. **Decode HTML Entities to raw UTF-8 characters** (e.g., Python `html.unescape`, Node.js `he.decode` or built-in entity decoder, PHP `html_entity_decode(..., ENT_QUOTES | ENT_HTML5, 'UTF-8')`).
   *Critical*: Without this step, `&amp;` or `&nbsp;` becomes `\u0026amp;` after `encodeJsonLd`.
4. **Collapse whitespace** (`\s+` -> `' '`) and `trim()`.
5. **Truncate by Unicode code points**:
   * Default `300` chars for JSON-LD `description` (or preserve full summary if appropriate).
   * `120`–`155` chars for HTML `<meta name="description">` and `og:description`.

---

## 2. `encodeJsonLd(data)` (XSS-Safe JSON-LD Serializer)
When embedding JSON inside `<script type="application/ld+json">...</script>`, raw `</script>` or `<!--` in user/content text causes XSS or broken DOM parsing.

### Rules
* Serialize the object to JSON first (preserving unescaped Unicode characters and forward slashes `/`).
* **Hex-escape the HTML-sensitive characters in the serialized JSON string**:
  * `&` -> `\u0026`
  * `<` -> `\u003C`
  * `>` -> `\u003E`
  * `'` -> `\u0027`
  * *(Optional)* Escape internal quotes `\"` -> `\u0022` (do **not** replace structural JSON quotes `"`).
* On encoding failure (e.g., unserializable value or malformed UTF-8), log the error and return `'{}'` (never return empty string `""`).

---

## 3. `toMinorUnits` & Currency Separation (`price_major` vs `price_minor`)
*(Only required when the project involves pricing, e-commerce, bookings, or paid plans)*

Never mix monetary representations between Schema.org and Agentic Commerce protocols:
* **`price_major`**: Natural decimal number/string (e.g., `"12.34"` USD, `1500` JPY) -> Used in **JSON-LD Schema.org** and **Open Graph (`product:price:amount`)**.
* **`price_minor`**: Integer in smallest ISO 4217 currency unit (e.g., `1234` for `"12.34"` USD, `1500` for `1500` JPY) -> Used in **UCP** and **ACP**.

```python
from decimal import Decimal, ROUND_HALF_UP

ISO4217_FRACTION_DIGITS = {
    # 0-decimal currencies
    "JPY": 0, "KRW": 0, "VND": 0, "CLP": 0, "ISK": 0,
    # 2-decimal currencies (default)
    "USD": 2, "EUR": 2, "GBP": 2, "SGD": 2, "AUD": 2, "CAD": 2,
    # 3-decimal currencies
    "BHD": 3, "KWD": 3, "OMR": 3, "JOD": 3, "TND": 3,
}

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
```

---

## 4. Recommended Domain Mapping Patterns (Adapt to Project Models)
When a project serves multiple output channels (JSON-LD, Sitemaps, `.md` Shadow Corpus, MCP, or UCP/ACP), map database/ORM entities through a clean normalization helper or view-model rather than duplicating formatting logic in each controller:

| `DOMAIN_PROFILE` | Core Normalized Attributes | Key Normalization Rules |
| :--- | :--- | :--- |
| `COMMERCE` | `id`, `title`, `url`, `description`, `media[]`, `categories[]`, `variants[]` (`id`, `sku`, `price_major`, `price_minor`, `list_price_major?`, `list_price_minor?`, `sale_valid_from?`, `sale_valid_through?`, `currency`, `available`, `availability_status`, `options[]`) | Only expose published items & active variants. Include `list_price` (strikethrough) **only** when `list_price > price`. |
| `RESERVATION` | Parent = Venue / Hotel / Service / Event. `variants[]` = Room Type / Tier / Time Slot with `price_major`, `price_minor`, `available`, `availability_status`. | Map remaining capacity > 0 to `in_stock` (`https://schema.org/InStock`), 0 to `out_of_stock` (`https://schema.org/OutOfStock`). |
| `SAAS_PLATFORM` | `id`, `name`, `url`, `description`, `application_category`, `operating_system`, `plans[]` (`name`, `price_major`, `currency`, `billing_cycle`, `features[]`) | Omit physical inventory/SKU fields. |
| `CONTENT_PUBLISHING` | `id`, `title`, `slug`, `url`, `summary`, `markdown_body`, `images[]`, `author` (`name`, `url`), `published_at`, `updated_at`, `pros[]?`, `cons[]?` | Maintain clean Markdown body (without layout chrome) if `.md` Shadow Corpus or `llms-full.txt` is enabled. |
| `GENERIC_WEB` | `title`, `url`, `description`, `images[]`, `organization` (`name`, `logo`, `contact`, `address`), `breadcrumbs[]`, `faqs[]?` | Focus on `WebSite`, `Organization` / `LocalBusiness`, `WebPage`, and `BreadcrumbList`. |
