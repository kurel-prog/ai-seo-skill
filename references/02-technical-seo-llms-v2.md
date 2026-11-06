# Technical SEO, Sitemaps & `llmstxt.org` v2 (08/2026)

## 1. HTML `<head>` & Spider-Trap-Safe Canonical Rules

1. **Title & Meta Description**:
   * `<title>`: Follow the project's existing branding pattern (e.g., `{Page Title} | {Brand Name}` or `{Brand Name} / {Page Title}`).
   * `<meta name="description">`: Text processed through `normalizeDescription` (with HTML entity decoding) truncated to `120`–`155` characters.
2. **Clean Paginated Canonical URLs (Anti-Spider Trap)**:
   * On paginated listing pages, `<link rel="canonical">`, `<link rel="prev">`, and `<link rel="next">` **must only retain the base path and the pagination parameter** (e.g., `?page={page}`, omitting `?page=1` on page 1).
   * **MUST strip** all secondary filter, sort, or tracking query parameters (`sort`, `order`, `filter`, `color`, `utm_*`, `fbclid`, `gclid`...) from the Canonical URL.
3. **Smart `noindex` Rules**:
   * Emit `<meta name="robots" content="noindex">` when a listing or search page has `0` items (prevents Soft 404 penalties).
   * **Never** emit `noindex` on temporarily out-of-stock product/service pages (instead, set `availability` in JSON-LD to `OutOfStock`).

---

## 2. XML Sitemaps (Single or Tiered Index)

Serve with HTTP Header `Content-Type: application/xml; charset=utf-8` and adapt the URL structure to the project's existing routing conventions:

* **Option A — Single Sitemap (`GET /sitemap.xml`)**: Suitable for small-to-medium sites (< 10,000 URLs).
* **Option B — Dynamic Tiered Sitemap Index (`GET /sitemap.xml` + child sitemaps)**: Recommended for multi-entity or large catalogs:
  1. **`GET /sitemap.xml` (Sitemap Index)**:
     ```xml
     <?xml version="1.0" encoding="UTF-8"?>
     <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
         <sitemap>
             <loc>https://example.com/sitemap-pages.xml</loc>
             <lastmod>2026-10-27T00:00:00+00:00</lastmod>
         </sitemap>
         <sitemap>
             <loc>https://example.com/sitemap-categories.xml</loc>
             <lastmod>2026-10-27T00:00:00+00:00</lastmod>
         </sitemap>
         <sitemap>
             <loc>https://example.com/sitemap-items-1.xml</loc>
             <lastmod>2026-10-27T00:00:00+00:00</lastmod>
         </sitemap>
     </sitemapindex>
     ```
  2. **Child Sitemaps** (adapt filenames to the project's routing style, e.g., `/sitemap-pages.xml`, `/sitemap-categories.xml`, and paginated entities such as `/sitemap-items-{page}.xml`, `/sitemap-products-{page}.xml`, or `/sitemaps/articles-{page}.xml`):
     * Paginate 1,000–5,000 public items per file. Return `404 Not Found` if `{page}` exceeds the total page count.
     * Include `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"` and `<image:image><image:loc>...</image:loc></image:image>` when entity images exist.

---

## 3. `llmstxt.org` v2 (August 2026): `/llms.txt`, `/llms-full.txt` & `.md` Shadow Corpus

### 3.1. Auto-Discovery via HTTP Header & HTML `<link>`
On HTML responses, include the standard IANA `rel="describedby"` relation (and/or `rel="llms-txt"` ecosystem relation) so AI crawlers discover `/llms.txt` from any deep URL:
* HTTP Header:
  ```http
  Link: <https://example.com/llms.txt>; rel="describedby"; type="text/markdown"
  ```
* HTML `<head>`:
  ```html
  <link rel="describedby" type="text/markdown" href="https://example.com/llms.txt" />
  ```

### 3.2. `GET /llms.txt` Structure (`Content-Type: text/markdown; charset=utf-8`)
```markdown
# {Brand / Web Service Name}

> {2-3 sentence summary of the service, target audience, and core value proposition}

## Overview & Core Features
- [Feature / Category A](https://example.com/features/a): Brief description
- [Feature / Category B](https://example.com/features/b): Brief description

## Pricing & Plans
- [Pricing Overview](https://example.com/pricing): Summary of tiers and limits

## Documentation & AI Endpoints
- [Full Documentation Corpus](https://example.com/llms-full.txt): Complete Markdown documentation
- [Sitemap XML](https://example.com/sitemap.xml): Full URL index

## Case Studies & Resources
- [Customer Case Studies](https://example.com/customers)
- [Frequently Asked Questions](https://example.com/faq)

## Support & Contact
- [Contact Support](https://example.com/contact)
```
*(When Agentic Commerce is enabled, add links to `/.well-known/ucp` and catalog endpoints under AI Endpoints).*

### 3.3. `GET /llms-full.txt` (For `SAAS_PLATFORM` and `CONTENT_PUBLISHING`)
Concatenate all public documentation/knowledge-base pages in clean Markdown into a single response (separated by `---` and `# Source: https://...`) for one-shot context window ingestion.

### 3.4. "Shadow Corpus" — Per-Page `.md` Routes (`llmstxt.org` v2)
Allow AI Agents to fetch a clean Markdown version of any content/product/doc page (either by appending `.md` to the URL such as `GET /articles/post-slug.md` or via content negotiation `Accept: text/markdown`):
* Serve with `Content-Type: text/markdown; charset=utf-8`.
* Advertise the Markdown twin on the original HTML page (`GET /articles/post-slug`) via HTTP Header and `<head>`:
  ```http
  Link: <https://example.com/articles/post-slug.md>; rel="alternate"; type="text/markdown"
  ```
  ```html
  <link rel="alternate" type="text/markdown" href="https://example.com/articles/post-slug.md" title="Markdown version" />
  ```
* `.md` response format (reduces LLM token consumption by ~95% compared to raw HTML):
  ```markdown
  ---
  title: "Page Title"
  author: "Author Name"
  published_at: "2026-10-27T01:00:00Z"
  updated_at: "2026-10-27T02:00:00Z"
  canonical_url: "https://example.com/articles/post-slug"
  ---

  # Page Title

  Clean Markdown body without navigation, sidebars, ads, or scripts...
  ```

---

## 4. `/robots.txt` Policy Templates

* **Policy A — Allow AI Search/Citation Bots, Block AI Training Crawlers (Recommended for `CONTENT_PUBLISHING` / `SAAS_PLATFORM` / `GENERIC_WEB`)**:
  ```text
  User-agent: OAI-SearchBot
  User-agent: ChatGPT-User
  User-agent: PerplexityBot
  User-agent: Claude-SearchBot
  User-agent: Googlebot
  User-agent: Bingbot
  Allow: /

  User-agent: GPTBot
  User-agent: CCBot
  User-agent: ClaudeBot
  User-agent: Google-Extended
  User-agent: Meta-ExternalAgent
  Disallow: /

  User-agent: *
  Disallow: /admin/
  Allow: /llms.txt
  Allow: /llms-full.txt
  Sitemap: https://example.com/sitemap.xml
  ```
* **Policy B — Open to All AI Bots & Commerce Agents (Recommended for `COMMERCE` / `RESERVATION`)**:
  ```text
  User-agent: *
  Disallow: /admin/
  Disallow: /cart/
  Disallow: /checkout/
  Allow: /.well-known/ucp
  Allow: /.well-known/acp.json
  Allow: /catalog/
  Allow: /llms.txt
  Sitemap: https://example.com/sitemap.xml
  ```
