# Technical SEO, Core Web Vitals, Sitemaps & `llmstxt.org` v2 (GEO/AEO 2026)

## 1. HTML `<head>`, Social Cards, `hreflang` & Spider-Trap-Safe Canonical Rules

1. **Title & Meta Description**:
   * `<title>`: Follow the project's existing branding pattern (`50`–`60` characters recommended, e.g., `{Page Title} | {Brand Name}` or `{Page Title} · {Brand Name}`).
   * `<meta name="description">`: Text processed through `normalizeDescription` (with HTML entity decoding) truncated to `120`–`155` characters.
   * `<meta name="robots">`: Default to `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1` on public indexable pages so Google Discover and AI Overviews can extract full previews.
2. **Clean Paginated Canonical URLs (Anti-Spider Trap)**:
   * Every indexable page must emit an absolute `<link rel="canonical" href="https://..." />`.
   * On paginated listing pages, `<link rel="canonical">`, `<link rel="prev">`, and `<link rel="next">` **must only retain the base path and the pagination parameter** (e.g., `?page={page}`, omitting `?page=1` on page 1).
   * **MUST strip** all secondary filter, sort, or tracking query parameters (`sort`, `order`, `filter`, `color`, `utm_*`, `fbclid`, `gclid`, `ref`, `_ga`...) from the Canonical URL.
3. **Open Graph (`og:*`) & Twitter/X Card Metadata**:
   * Keep `og:url` identical to the sanitized `<link rel="canonical">` URL.
   * Provide absolute `https://` image URLs (`1200×630` recommended for `summary_large_image`):
   ```html
   <meta property="og:type" content="website" /> <!-- or "article", "product" -->
   <meta property="og:site_name" content="Brand Name" />
   <meta property="og:title" content="Normalized Page Title" />
   <meta property="og:description" content="Normalized 120-155 char summary" />
   <meta property="og:url" content="https://example.com/canonical-path" />
   <meta property="og:image" content="https://example.com/og-cover-1200x630.jpg" />
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="630" />
   <meta property="og:image:alt" content="Descriptive alt text of the cover image" />
   <meta property="og:locale" content="en_US" />
   <meta name="twitter:card" content="summary_large_image" />
   <meta name="twitter:title" content="Normalized Page Title" />
   <meta name="twitter:description" content="Normalized 120-155 char summary" />
   <meta name="twitter:image" content="https://example.com/og-cover-1200x630.jpg" />
   ```
4. **International & Multi-Language SEO (`hreflang`)** *(When site serves multiple locales)*:
   * Include self-referencing `hreflang`, all translated equivalents, and a mandatory `x-default` fallback:
   ```html
   <link rel="alternate" hreflang="en-US" href="https://example.com/en/pricing" />
   <link rel="alternate" hreflang="vi-VN" href="https://example.com/vi/pricing" />
   <link rel="alternate" hreflang="x-default" href="https://example.com/en/pricing" />
   ```
5. **Smart `noindex` Rules**:
   * Emit `<meta name="robots" content="noindex, nofollow">` when a listing or search page has `0` items (prevents Soft 404 penalties), or on private user routes (`/account`, `/wallet`, `/checkout`, `/admin`, `/login`).
   * **Never** emit `noindex` on temporarily out-of-stock product/service pages (instead, set `availability` in JSON-LD to `https://schema.org/OutOfStock`).

---

## 2. Crawlability, SSR Hydration & Core Web Vitals (CWV) Guardrails

1. **Non-JS AI Crawler Compatibility (SSR / SSG / Dynamic Rendering)**:
   * Major AI search & citation crawlers (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-SearchBot`, `ClaudeBot`) **do not execute client-side JavaScript**.
   * Ensure `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph tags, `<script type="application/ld+json">`, and primary `<main>` text are present in the initial server HTTP response (SSR, SSG, or edge HTML injection)—never rely solely on client-side `useEffect`/`onMounted` DOM mutation.
2. **Core Web Vitals Thresholds (Google Search Ranking Signals)**:
   * **LCP (Largest Contentful Paint $\le 2500\text{ms}$)**: Add `fetchpriority="high" loading="eager" decoding="async"` to the primary above-the-fold hero `<img>` (never `loading="lazy"` on LCP images). Preconnect critical asset origins (`<link rel="preconnect" href="..." crossorigin />`).
   * **CLS (Cumulative Layout Shift $\le 0.1$)**: Always set explicit `width` and `height` attributes (or CSS `aspect-ratio`) on `<img>`, `<svg>`, `<video>`, and dynamic widget containers. Use `font-display: swap` or `optional`.
   * **INP (Interaction to Next Paint $\le 200\text{ms}$)**: Load non-essential third-party analytics/widgets with `defer` or `async`.

---

## 3. XML Sitemaps (Single or Tiered Index)

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
     * Paginate 1,000–5,000 public items per file. Return `404 Not Found` if `{page}` exceeds the total page count or is `< 1`.
     * Only include canonical `200 OK` indexable URLs (never include `noindex`, redirected, or filter-parameter URLs).
     * Include `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"` and `<image:image><image:loc>...</image:loc></image:image>` when entity images exist.

---

## 4. `llmstxt.org` v2 (August 2026): `/llms.txt`, `/llms-full.txt`, `.md` Shadow Corpus & GEO/AEO

### 4.1. Auto-Discovery via HTTP Header & HTML `<link>`
On HTML responses, include the standard IANA `rel="describedby"` relation (and/or `rel="llms-txt"` ecosystem relation) so AI crawlers discover `/llms.txt` from any deep URL:
* HTTP Header:
  ```http
  Link: <https://example.com/llms.txt>; rel="describedby"; type="text/markdown"
  ```
* HTML `<head>`:
  ```html
  <link rel="describedby" type="text/markdown" href="https://example.com/llms.txt" />
  ```

### 4.2. `GET /llms.txt` Structure (`Content-Type: text/markdown; charset=utf-8`)
```markdown
# {Brand / Web Service Name}

> {2-3 sentence summary of the service, target audience, and core value proposition}

## Overview & Core Features
- [Feature / Category A](https://example.com/features/a): Brief factual description
- [Feature / Category B](https://example.com/features/b): Brief factual description

## Pricing & Plans
- [Pricing Overview](https://example.com/pricing): Summary of tiers, currencies, and limits

## Documentation & AI Endpoints
- [Full Documentation Corpus](https://example.com/llms-full.txt): Complete Markdown documentation for RAG/LLM context ingestion
- [Sitemap XML](https://example.com/sitemap.xml): Full canonical URL index

## Case Studies & Resources
- [Customer Case Studies](https://example.com/customers)
- [Frequently Asked Questions](https://example.com/faq)

## Support & Contact
- [Contact Support](https://example.com/contact)
```
*(When Agentic Commerce is enabled, add links to `/.well-known/ucp` and catalog endpoints under AI Endpoints).*

### 4.3. `GET /llms-full.txt` (For `SAAS_PLATFORM` and `CONTENT_PUBLISHING`)
Concatenate all public documentation/knowledge-base pages in clean Markdown into a single response (separated by `---` and `# Source: https://...`) for one-shot context window ingestion. Protect heavy generation with caching or singleflight deduplication.

### 4.4. "Shadow Corpus" — Per-Page `.md` Routes (`llmstxt.org` v2)
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

### 4.5. GEO / AEO (Generative & Answer Engine Optimization) On-Page Rules
To maximize citation frequency in **Google AI Overviews, ChatGPT Search, Perplexity, and Claude**:
1. **Answer-First Formatting**: Place a direct, self-contained `40`–`60` word factual summary immediately after the primary `<h1>` or question-based `<h2>` heading before diving into details.
2. **Semantic HTML Structure**: Use `<main>`, `<article>`, `<section aria-labelledby="...">`, `<dl>/<dt>/<dd>` for key-value definitions, and semantic `<table>` (`<thead>`/`<tbody>`) for comparisons instead of nested `<div>` soup.
3. **Explicit Freshness Signals**: Render visible publication/update timestamps using `<time datetime="2026-10-27T00:00:00Z">` matching `datePublished` and `dateModified` in JSON-LD.

---

## 5. `/robots.txt` Policy Templates

* **Policy A — Allow AI Search/Citation Bots, Block AI Training Crawlers (Recommended for `CONTENT_PUBLISHING` / `SAAS_PLATFORM` / `GENERIC_WEB`)**:
  ```text
  User-agent: OAI-SearchBot
  User-agent: ChatGPT-User
  User-agent: PerplexityBot
  User-agent: Claude-SearchBot
  User-agent: Applebot
  User-agent: Googlebot
  User-agent: Bingbot
  Allow: /

  User-agent: GPTBot
  User-agent: CCBot
  User-agent: ClaudeBot
  User-agent: Google-Extended
  User-agent: Applebot-Extended
  User-agent: Meta-ExternalAgent
  User-agent: Bytespider
  Disallow: /

  User-agent: *
  Disallow: /admin/
  Disallow: /account/
  Disallow: /api/private/
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
  Allow: /llms-full.txt
  Sitemap: https://example.com/sitemap.xml
  ```
