---
name: ai-seo-skill
description: Modular workflow for implementing and auditing Technical SEO, Schema.org JSON-LD (2026 standard), GEO/AEO AI Search Optimization (llmstxt.org v2, llms.txt, llms-full.txt, .md Shadow Corpus), Cloudflare 21-Point Agent Readiness (Content-Signal, Markdown Negotiation, RFC 9727 api-catalog, Auth.md, OAuth 2.0 Discovery, A2A Agent Card, Skills Index, SEP-1649 MCP Server Card, RFC 9421 Web Bot Auth, WebMCP, DNS-AID), Open Graph, hreflang, Core Web Vitals, XML Sitemaps, Streamable HTTP MCP Servers, and Agentic Commerce protocols (UCP, OpenAI ACP, AP2, MPP, x402). Use when asked to optimize SEO ("tối ưu SEO"), pass isitagentready.com, audit SEO, or add structured data, sitemaps, robots.txt, llms.txt, MCP endpoints, or commerce feeds.
---

# AI SEO, GEO/AEO & Agentic Commerce Architect (2026 Standard)

## 1. Scope & Configuration Discovery
Infer target scope from the user request and codebase (only ask if ambiguous):

* **`DOMAIN_PROFILE`**:
  * `COMMERCE` (E-commerce, retail, digital goods, marketplaces, paid packages)
  * `RESERVATION` (Hotels, flights, events, dining, appointments)
  * `SAAS_PLATFORM` (SaaS, B2B portals, APIs, developer tools, web apps)
  * `CONTENT_PUBLISHING` (Blogs, news, documentation, wikis, dictionaries, media)
  * `GENERIC_WEB` (Corporate sites, portfolios, landing pages)
* **`LAYERS_TO_IMPLEMENT`** *(run **only** requested/required steps)*:
  * `CORE_SEO`: Steps 1, 2, 3 (Meta/Canonical/OG/hreflang, Core Web Vitals & SSR, JSON-LD, XML Sitemaps)
  * `AI_DISCOVERY`: Step 3 (`llmstxt.org` v2: `/llms.txt`, `/llms-full.txt`, `.md` Shadow Corpus, AI `robots.txt`, GEO/AEO Answer-First structure)
  * `MCP_SERVER`: Step 4 (Streamable HTTP MCP endpoint — *optional*)
  * `AGENTIC_COMMERCE`: Step 5 (`ENABLE_UCP` / `ENABLE_ACP` — *optional, for `COMMERCE` / `RESERVATION`*)

> **Progressive Disclosure**: Only read `references/` and `resources/` files needed for active step(s). Adapt all patterns to the project's existing stack, routing, and models.

## 2. Modular Implementation Workflow

### Step 1: Core Text, JSON-LD & Currency Utilities
* Read [`references/00-core-utilities-and-dto.md`](./references/00-core-utilities-and-dto.md) and adapt [`resources/templates/core_utils.py`](./resources/templates/core_utils.py) or [`resources/templates/core_utils.ts`](./resources/templates/core_utils.ts):
  1. `normalizeDescription`: Replace HTML block tags with `' '`, strip tags, decode UTF-8 HTML entities (prevents `\u0026amp;` double-encoding), collapse whitespace, and truncate by code points (`120`–`155` chars for meta description, `300` for JSON-LD).
  2. `encodeJsonLd`: Hex-escape `<`, `>`, `&`, `'` (`\u003C`, `\u003E`, `\u0026`, `\u0027`) to prevent `</script>` XSS inside `<script type="application/ld+json">`, returning `'{}'` on failure.
  3. `toMinorUnits` *(commerce/pricing only)*: Strictly separate `price_major` (Schema.org/OGP decimal) from `price_minor` (ISO 4217 integer for UCP/ACP using `ROUND_HALF_UP`).

### Step 2: Schema.org JSON-LD (2026 Standard)
* Read [`references/01-json-ld-schemas.md`](./references/01-json-ld-schemas.md) and [`resources/templates/jsonld_templates.json`](./resources/templates/jsonld_templates.json).
* Omit `null`/`""`/`[]` keys, enforce absolute `https://` URLs, and emit site-wide `@graph` (`WebSite` + `Organization`), `BreadcrumbList`, optional `FAQPage`, and primary entity:
  * `COMMERCE` / `RESERVATION`: `Product` (single price) or `ProductGroup` (`variesBy` + `hasVariant` for multi-variant pricing — **never use `AggregateOffer`**). Include `brand` and place `validFrom`/`validThrough` directly on `Offer` alongside `StrikethroughPrice`.
  * `SAAS_PLATFORM`: `SoftwareApplication`, `WebApplication`, or `Service`.
  * `CONTENT_PUBLISHING`: `Article` / `TechArticle` + `Person` (+ `positiveNotes`/`negativeNotes` `ItemList` for reviews).
  * `GENERIC_WEB`: `WebPage`, `Organization`, or `LocalBusiness`.

### Step 3: Technical SEO, Core Web Vitals, Sitemaps & `llmstxt.org` v2 (GEO/AEO)
* Read [`references/02-technical-seo-llms-v2.md`](./references/02-technical-seo-llms-v2.md):
  * `<head>`: Title, normalized meta description, Open Graph (`og:*`), Twitter Cards (`twitter:*`), `hreflang` (`+ x-default`), and spider-trap-safe `<link rel="canonical">` (strip filter/sort/tracking query params; retain only pagination parameter; omit `?page=1`).
  * Crawlability & Core Web Vitals: Server-render (`SSR`/`SSG`) critical metadata and JSON-LD for non-JS AI crawlers; enforce `fetchpriority="high"` on LCP image and explicit dimensions for CLS $\le 0.1$.
  * XML Sitemaps: Single `/sitemap.xml` (<10,000 URLs) or dynamic Sitemap Index + paginated child sitemaps (`404` on out-of-range pages).
  * `llmstxt.org` v2, GEO & Cloudflare Agent Readiness (`isitagentready.com`): Serve `/llms.txt` (and `/llms-full.txt`), support `Accept: text/markdown` content negotiation (`Vary: Accept`), emit `Content-Signal: search=yes, ai-input=yes, ai-train=no` and RFC 8288 `Link` headers (`rel="api-catalog"`, `rel="service-doc"`, `rel="describedby"`, `rel="agent-card"`, `rel="mcp-server-card"`), expose `/.well-known/api-catalog` (RFC 9727), `/auth.md`, `/.well-known/oauth-authorization-server` (RFC 8414), `/.well-known/oauth-protected-resource` (RFC 9728), `/.well-known/agent-card.json` (A2A), `/.well-known/agent-skills/index.json`, `/.well-known/mcp/server-card.json` (SEP-1649), `/.well-known/http-message-signatures-directory` (RFC 9421), `/.well-known/webmcp.json`, and `/.well-known/dns-aid`.

### Step 4: Streamable HTTP MCP Server *(Optional)*
* Read [`references/03-mcp-streamable-http.md`](./references/03-mcp-streamable-http.md): Enforce `Origin` validation against DNS Rebinding (`403` on `Origin: null`), check `Accept: application/json, text/event-stream`, propagate `_meta.io.modelcontextprotocol/*`, and protect private/mutating tools with OAuth 2.1 / Bearer auth.

### Step 5: Agentic Commerce — UCP & ACP *(Optional)*
* Read [`references/04-agentic-commerce-ucp-acp.md`](./references/04-agentic-commerce-ucp-acp.md), [`resources/templates/ucp_acp_templates.json`](./resources/templates/ucp_acp_templates.json), and [`resources/acp-schema.feed.json`](./resources/acp-schema.feed.json).

### Step 6: Verification
* Read [`references/05-verification-guide.md`](./references/05-verification-guide.md) and verify only implemented layers using the project's native test runner.
