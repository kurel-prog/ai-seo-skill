---
name: ai-seo-skill
description: >-
  Modular workflow for implementing Technical SEO, Schema.org JSON-LD (2026 standard),
  AI/LLM Search Optimization (GEO/AEO, llmstxt.org v2, .md Shadow Corpus),
  Streamable HTTP MCP Servers, and Agentic Commerce protocols (UCP & OpenAI ACP).
  Use when asked to implement or audit SEO, JSON-LD structured data, XML sitemaps,
  llms.txt, Markdown twins, MCP endpoints, or UCP/ACP commerce feeds for any web service.
---

# AI SEO & Agentic Commerce Architect

## 1. Scope & Configuration Discovery
Infer target scope from the user request and codebase (only ask if ambiguous):

* **`DOMAIN_PROFILE`**:
  * `COMMERCE` (E-commerce, retail, digital goods, marketplaces)
  * `RESERVATION` (Hotels, flights, events, dining, appointments)
  * `SAAS_PLATFORM` (SaaS, B2B portals, APIs, developer tools)
  * `CONTENT_PUBLISHING` (Blogs, news, documentation, wikis, media)
  * `GENERIC_WEB` (Corporate sites, portfolios, landing pages, web apps)
* **`LAYERS_TO_IMPLEMENT`** *(run **only** requested/required steps)*:
  * `CORE_SEO`: Steps 1, 2, 3 (Meta/Canonical, JSON-LD, XML Sitemaps)
  * `AI_DISCOVERY`: Step 3 (`llmstxt.org` v2: `/llms.txt`, `/llms-full.txt`, `.md` Shadow Corpus, AI `robots.txt`)
  * `MCP_SERVER`: Step 4 (Streamable HTTP MCP endpoint — *optional*)
  * `AGENTIC_COMMERCE`: Step 5 (`ENABLE_UCP` / `ENABLE_ACP` — *optional, for `COMMERCE` / `RESERVATION`*)

> **Progressive Disclosure**: Only read `references/` and `resources/` files needed for active step(s). Adapt all patterns to the project's existing stack, routing, and models.

## 2. Modular Implementation Workflow

### Step 1: Core Text, JSON-LD & Currency Utilities
* Read [`references/00-core-utilities-and-dto.md`](./references/00-core-utilities-and-dto.md) and adapt [`resources/templates/core_utils.py`](./resources/templates/core_utils.py) or [`resources/templates/core_utils.ts`](./resources/templates/core_utils.ts):
  1. `normalizeDescription`: Replace HTML block tags with `' '`, strip tags, decode UTF-8 HTML entities (prevents `\u0026amp;` double-encoding), and truncate cleanly.
  2. `encodeJsonLd`: Hex-escape `<`, `>`, `&`, `'` to prevent XSS inside `<script type="application/ld+json">`.
  3. `toMinorUnits` *(commerce/pricing only)*: Separate `price_major` (Schema.org/OGP decimal) from `price_minor` (ISO 4217 integer for UCP/ACP).

### Step 2: Schema.org JSON-LD (2026 Standard)
* Read [`references/01-json-ld-schemas.md`](./references/01-json-ld-schemas.md) and [`resources/templates/jsonld_templates.json`](./resources/templates/jsonld_templates.json).
* Emit site-wide `@graph` (`WebSite` + `Organization`), `BreadcrumbList`, optional `FAQPage`, and primary entity:
  * `COMMERCE` / `RESERVATION`: `Product` (single price) or `ProductGroup` (`variesBy` + `hasVariant` for multi-variant pricing — **never use `AggregateOffer`**). Include `brand` and place `validFrom`/`validThrough` directly on `Offer`.
  * `SAAS_PLATFORM`: `SoftwareApplication`, `WebApplication`, or `Service`.
  * `CONTENT_PUBLISHING`: `Article` / `TechArticle` + `Person` (+ `positiveNotes`/`negativeNotes` `ItemList` for reviews).
  * `GENERIC_WEB`: `WebPage`, `Organization`, or `LocalBusiness`.

### Step 3: Technical SEO, Sitemaps & `llmstxt.org` v2
* Read [`references/02-technical-seo-llms-v2.md`](./references/02-technical-seo-llms-v2.md):
  * `<head>`: Meta description, Open Graph, and spider-trap-safe `<link rel="canonical">` (strip filter/sort/tracking query params; keep only pagination parameter).
  * XML Sitemaps: Single `/sitemap.xml` (<10,000 URLs) or dynamic Sitemap Index + paginated child sitemaps.
  * `llmstxt.org` v2: Serve `/llms.txt` (and `/llms-full.txt`), advertise via `Link: <.../llms.txt>; rel="describedby"` (or `rel="llms-txt"`), expose `.md` Shadow Corpus routes (`Link: rel="alternate"; type="text/markdown"`), and configure `/robots.txt` for AI Search vs. Training bots.

### Step 4: Streamable HTTP MCP Server *(Optional)*
* Read [`references/03-mcp-streamable-http.md`](./references/03-mcp-streamable-http.md): Enforce `Origin` validation against DNS Rebinding (`403` on `Origin: null`), check `Accept: application/json, text/event-stream`, propagate `_meta.io.modelcontextprotocol/*`, and protect private/mutating tools with OAuth 2.1 / Bearer auth.

### Step 5: Agentic Commerce — UCP & ACP *(Optional)*
* Read [`references/04-agentic-commerce-ucp-acp.md`](./references/04-agentic-commerce-ucp-acp.md), [`resources/templates/ucp_acp_templates.json`](./resources/templates/ucp_acp_templates.json), and [`resources/acp-schema.feed.json`](./resources/acp-schema.feed.json).

### Step 6: Verification
* Read [`references/05-verification-guide.md`](./references/05-verification-guide.md) and verify only implemented layers using the project's native test runner.
