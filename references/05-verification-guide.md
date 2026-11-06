# Verification & Acceptance Testing Guide

Write native unit/integration tests using the target project's test runner (e.g., `pytest`, `vitest`, `jest`, `phpunit`, `go test`) or run HTTP assertions against the local dev server. **Only run the test sections corresponding to the layers implemented in the current task.**

---

## 1. Unit Test Matrix for Core Utilities (Mandatory)

Verify the utility functions directly in code without needing a running HTTP server:

| Function | Input Case | Expected Output / Assertion |
| :--- | :--- | :--- |
| `normalizeDescription` | `"<p>Line 1</p><div>Line 2 &amp; <b>Bold</b></div>"` | `"Line 1 Line 2 & Bold"` (block boundaries become spaces; `&amp;` is decoded to `&`) |
| `normalizeDescription` + `encodeJsonLd` | `{"description": normalizeDescription("<p>A &amp; B</p>")}` | Contains `"A \u0026 B"`, **must NOT** contain `\u0026amp;` (no double-encoding) |
| `encodeJsonLd` (XSS Prevention) | `{"name": "</script><script>alert('xss')</script>"}` | Output **must NOT** contain raw `<`, `>`, `&`, or `'` (escaped as `\u003C`, `\u003E`, `\u0026`, `\u0027`) |
| `toMinorUnits` (Zero-decimal currency) | `("1000", "JPY")` or `("250,000", "VND")` | Integer `1000` / `250000` (`× 10^0`, strips thousand-separator commas) |
| `toMinorUnits` (Two-decimal currency) | `("12.345", "USD")` | Integer `1235` (`× 10^2` with `ROUND_HALF_UP`) |

---

## 2. Schema.org JSON-LD Assertions

Parse the `<script type="application/ld+json">` payload emitted by the application and assert:

1. **No Null/Empty Values**: Recursively assert no key has value `null`, `""`, or `[]`.
2. **Absolute URLs Only**: Every `url`, `image`, `contentUrl`, and `@id` starts with `https://` or `http://`.
3. **Entity-Specific Rules**:
   * **Multi-variant pricing (`COMMERCE` / `RESERVATION`)**: Assert `@type` is `"ProductGroup"` with `variesBy` and `hasVariant` (assert `"AggregateOffer"` is **absent**).
   * **Sale / Strikethrough price**: When `priceSpecification.priceType` is `"https://schema.org/StrikethroughPrice"`, assert `validFrom` / `validThrough` (or `priceValidUntil`) is on the parent `Offer` object, not inside `priceSpecification`.
   * **Site Identity**: Assert `@graph` contains both `WebSite` (with `potentialAction.@type == "SearchAction"`) and `Organization` linked via `@id`.

---

## 3. Technical SEO, Sitemaps & `llmstxt.org` v2 Assertions

1. **Spider-Trap-Safe Canonical**:
   * Request a paginated listing URL with noisy query params (e.g., `?page=2&sort=asc&utm_source=test`).
   * Assert `<link rel="canonical">` contains **only** the base path and `?page=2` (all filter/sort/tracking params stripped).
   * Request page 1 (`?page=1&sort=asc`) and assert `<link rel="canonical">` contains only the base path without `?page=1`.
2. **XML Sitemaps**:
   * Assert the sitemap index and child sitemaps return `200 OK`, `Content-Type: application/xml`, and valid `<loc>` / `<lastmod>` tags.
   * Request an out-of-range sitemap page (e.g., `page=999999`) and assert it returns `404 Not Found`.
3. **`llmstxt.org` v2 & Shadow Corpus (`.md`)**:
   * Assert HTML responses include HTTP Header `Link: <.../llms.txt>; rel="describedby"` (or `rel="llms-txt"`, or matching `<link>` tag in `<head>`).
   * Assert `/llms.txt` returns `200 OK` with `Content-Type: text/markdown`.
   * If Shadow Corpus is enabled: request `{content_url}.md`, assert `Content-Type: text/markdown`, YAML frontmatter (`title`, `canonical_url`), and absence of layout HTML tags (`<nav>`, `<script>`, `<footer>`).

---

## 4. Streamable HTTP MCP Server Assertions (`2026-07-28`)

Test the project's MCP route using the framework's HTTP test client:

1. **DNS Rebinding Protection**:
   * Send `POST` with header `Origin: null` (or an untrusted origin `Origin: https://evil.example`) -> Assert HTTP `403 Forbidden`.
2. **Content-Type & Accept Enforcement**:
   * Send `POST` with `Content-Type: text/plain` -> Assert HTTP `415` or `400`.
3. **Authentication**:
   * Invoke a protected tool without `Authorization: Bearer <token>` -> Assert HTTP `401` / `403`.

---

## 5. UCP (`2026-08-25`) & ACP (`2026-04-17`) Assertions *(Only when enabled)*

1. **UCP Discovery (`GET /.well-known/ucp`)**:
   * Assert HTTP `200 OK` (no `3xx` redirects) and `Cache-Control` includes `public` and `max-age>=60` (never `private` or `no-store`).
   * Assert `ucp.services`, `ucp.payment_handlers`, and `ucp.capabilities` serialize as JSON objects `{}` (never arrays `[]`).
   * If `signing_keys` is present, assert each JWK has `kty: "EC"`, `crv: "P-256"`, and **does not** contain the private key parameter `"d"`.
2. **UCP Catalog (`POST /catalog/search`, `/lookup`, `/product`)**:
   * Assert all monetary amounts are integers in ISO 4217 minor units (`price_minor`).
   * Assert `product.description` and `variant.description` have at least 1 property (`{"plain": ""}` minimum).
3. **ACP Feed (`products.jsonl`)**:
   * Validate generated JSON lines against [`../resources/acp-schema.feed.json`](../resources/acp-schema.feed.json).
   * Assert `GET /.well-known/acp.json` does **not** expose `merchant_id`.
