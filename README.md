# AI SEO & Agentic Commerce Skill (`ai-seo-skill`)

[![Agent Skill Standard](https://img.shields.io/badge/Agent_Skill-Progressive_Disclosure-blue)](#architecture--progressive-disclosure)
[![Standards](https://img.shields.io/badge/Standards-2026_Ready-success)](#why-this-skill-exists)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

An open, language- and framework-agnostic **Agent Skill** that equips AI Coding Agents (**Google Antigravity**, **Claude Code**, **Cursor**, **OpenAI Codex**, **Windsurf**, and local models) to audit and implement **Technical SEO**, **Schema.org JSON-LD (2026 standard)**, **GEO/AEO (`llmstxt.org` v2 & Markdown Shadow Corpus)**, **Streamable HTTP MCP Servers**, and **Agentic Commerce protocols (UCP & OpenAI ACP)**.

Built with **Progressive Disclosure**: the agent loads a lightweight `<500-word` router ([`SKILL.md`](./SKILL.md)) and reads only the domain-specific specifications needed for your project—whether it is a simple blog, a SaaS documentation portal, a booking platform, or a full-scale e-commerce storefront.

---

## Why This Skill Exists

Most LLM coding assistants rely on pre-2025 training data when generating SEO, structured data, or AI discovery endpoints—leading to deprecated schemas, subtle XSS bugs, and broken agent integrations. `ai-seo-skill` eliminates those pitfalls:

| Common LLM Mistake | What `ai-seo-skill` Enforces (2026 Standard) |
| :--- | :--- |
| Uses deprecated `AggregateOffer` for multi-variant products (disqualifies Google Merchant Listings & price-drop badges) | Uses `@type: "ProductGroup"` with `variesBy` + `hasVariant`, includes `brand`, and places `validFrom` / `validThrough` directly on `Offer` alongside `StrikethroughPrice` |
| Strips HTML tags naively (`<p>A</p><p>B</p>` → `"AB"`) or double-encodes entities (`&amp;` → `\u0026amp;`) | 5-step `normalizeDescription` pipeline: block-tag spacing → tag strip → UTF-8 HTML entity decode → whitespace collapse → code-point truncation |
| Embeds raw `JSON.stringify()` inside `<script type="application/ld+json">` (vulnerable to `</script>` XSS injection) | Hex-escapes `<`, `>`, `&`, `'` via `encodeJsonLd` (`\u003C`, `\u003E`, `\u0026`, `\u0027`) with safe `{}` fallback |
| Mixes float prices (`45.00`) and minor-unit integers (`4500`) across Schema.org and commerce APIs | Strictly separates `price_major` (Schema.org / OGP) from ISO 4217 `price_minor` (UCP / ACP) via `toMinorUnits` (`ROUND_HALF_UP`) |
| Generates basic `/llms.txt` without auto-discovery or clean Markdown twins | Full **`llmstxt.org` v2**: HTTP `Link: rel="describedby"` header, `/llms-full.txt`, per-page `.md` **Shadow Corpus** (`rel="alternate"; type="text/markdown"`), and split AI Search vs. AI Training `robots.txt` policies |
| Exposes unguarded `/mcp` endpoints vulnerable to browser DNS Rebinding | Enforces **MCP Streamable HTTP (`2026-07-28`)** security: `Origin` validation (rejects `Origin: null` with `403`), `127.0.0.1` local binding, `Accept` check, `_meta` & `Mcp-Session-Id` propagation, and OAuth 2.1 / Bearer auth |

---

## Modular Capabilities

The skill automatically detects your project's **Domain Profile** and runs **only** the layers you request:

### 1. Supported Domain Profiles (`DOMAIN_PROFILE`)
* **`COMMERCE`** — E-commerce storefronts, retail catalogs, digital goods, marketplaces
* **`RESERVATION`** — Hotels, flights, dining, events, appointment booking systems
* **`SAAS_PLATFORM`** — SaaS apps, B2B portals, developer documentation, API platforms
* **`CONTENT_PUBLISHING`** — Blogs, news sites, wikis, editorial & review publications
* **`GENERIC_WEB`** — Corporate websites, landing pages, portfolios, custom web apps

### 2. Composable Implementation Layers (`LAYERS_TO_IMPLEMENT`)
* **`CORE_SEO`** *(Steps 1–3)*: XSS-safe JSON-LD (`@graph` `WebSite` + `Organization`, `BreadcrumbList`, `FAQPage`, plus domain entity), spider-trap-safe paginated canonical URLs, and single or tiered XML Sitemaps.
* **`AI_DISCOVERY`** *(Step 3)*: `llmstxt.org` v2 (`/llms.txt`, `/llms-full.txt`), HTTP `Link` auto-discovery headers (`rel="describedby"`), `.md` Shadow Corpus routes (`rel="alternate"; type="text/markdown"`), and AI crawler `robots.txt` rules (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot` vs. `GPTBot`, `CCBot`).
* **`MCP_SERVER`** *(Step 4 — Optional)*: Streamable HTTP MCP server (`POST /mcp`) exposing domain-specific search and lookup tools with DNS Rebinding protection.
* **`AGENTIC_COMMERCE`** *(Step 5 — Optional)*: Universal Commerce Protocol (`/.well-known/ucp` with RFC 9421 JWK `signing_keys`, `/catalog/search`, `/lookup`, `/product`) and OpenAI ACP (`/.well-known/acp.json` & validated `products.jsonl` feed).

---

## Installation

Choose either **Global Installation** (available across all projects on your machine) or **Workspace Installation** (checked into your project repository).

| AI Coding Agent | Global Skill Path | Workspace Skill Path |
| :--- | :--- | :--- |
| **Google Antigravity** | `~/.gemini/config/skills/ai-seo-skill` | `.agents/skills/ai-seo-skill` |
| **Claude Code** | `~/.claude/skills/ai-seo-skill` | `.claude/skills/ai-seo-skill` |
| **OpenAI Codex / Cursor / Windsurf** | `~/.agents/skills/ai-seo-skill` | `.agents/skills/ai-seo-skill` |

### 1. Google Antigravity

**Global install (macOS / Linux / Git Bash):**
```bash
git clone https://github.com/kurel-prog/ai-seo-skill.git ~/.gemini/config/skills/ai-seo-skill
```

**Global install (Windows PowerShell):**
```powershell
git clone https://github.com/kurel-prog/ai-seo-skill.git "$HOME\.gemini\config\skills\ai-seo-skill"
```

**Workspace install (current project):**
```bash
mkdir -p .agents/skills
git clone https://github.com/kurel-prog/ai-seo-skill.git .agents/skills/ai-seo-skill
```

### 2. Claude Code

**Global install:**
```bash
git clone https://github.com/kurel-prog/ai-seo-skill.git ~/.claude/skills/ai-seo-skill
```

**Workspace install:**
```bash
mkdir -p .claude/skills
git clone https://github.com/kurel-prog/ai-seo-skill.git .claude/skills/ai-seo-skill
```

### 3. OpenAI Codex / Cursor / Windsurf (or via `npx skills`)

```bash
# Via skills CLI
npx skills add kurel-prog/ai-seo-skill

# Or via git clone into workspace
mkdir -p .agents/skills
git clone https://github.com/kurel-prog/ai-seo-skill.git .agents/skills/ai-seo-skill
```

---

## Usage & Prompt Examples

Once installed, your coding agent will automatically activate `ai-seo-skill` when you ask for SEO, JSON-LD, `llms.txt`, sitemaps, MCP endpoints, or UCP/ACP commerce feeds—or you can invoke it explicitly by name.

### 1. Audit an Existing Codebase
> *"Use `ai-seo-skill` to audit our current SEO, JSON-LD structured data, canonical tags, and AI discoverability, and list any gaps against the 2026 spec."*

### 2. Blog / Documentation / SaaS Website (`CORE_SEO` + `AI_DISCOVERY`)
> *"Use `ai-seo-skill` to implement JSON-LD (`SoftwareApplication`, `Article`, `FAQPage`), XML sitemaps, and `llmstxt.org` v2 (`/llms.txt`, `/llms-full.txt`, and `.md` Shadow Corpus routes) for this Next.js app."*

### 3. E-Commerce Storefront (`CORE_SEO` + `AI_DISCOVERY` + `AGENTIC_COMMERCE`)
> *"Use `ai-seo-skill` to implement `ProductGroup` JSON-LD with strikethrough sale pricing, tiered XML sitemaps, `/llms.txt`, and UCP/ACP agentic commerce endpoints for our store."*

### 4. Add a Streamable HTTP MCP Endpoint (`MCP_SERVER`)
> *"Use `ai-seo-skill` Step 4 to expose a Streamable HTTP `/mcp` endpoint for our catalog and documentation with Origin validation and Bearer auth."*

---

## Architecture & Progressive Disclosure

To keep context window usage minimal, `ai-seo-skill` separates routing instructions from deep protocol references and copy-ready templates:

```text
ai-seo-skill/
├── SKILL.md                                     # Entry point & modular router (<500 words)
├── README.md                                    # Documentation, installation & prompt guide
├── references/                                  # Loaded on-demand per active implementation step
│   ├── 00-core-utilities-and-dto.md             # Step 1: normalizeDescription, encodeJsonLd, toMinorUnits
│   ├── 01-json-ld-schemas.md                    # Step 2: ProductGroup, SoftwareApplication, Article, @graph, FAQPage
│   ├── 02-technical-seo-llms-v2.md              # Step 3: Canonical URLs, XML Sitemaps, llmstxt.org v2, Shadow Corpus
│   ├── 03-mcp-streamable-http.md                # Step 4: Streamable HTTP MCP (2026-07-28) & security controls
│   ├── 04-agentic-commerce-ucp-acp.md           # Step 5: UCP (2026-08-25 / RFC 9421) & OpenAI ACP (2026-04-17)
│   └── 05-verification-guide.md                 # Step 6: Unit & HTTP assertion matrix for native test runners
└── resources/
    ├── acp-schema.feed.json                     # Official OpenAI ACP Product Feed JSON Schema (Draft 2020-12)
    └── templates/                               # Drop-in reference utilities & JSON payload templates
        ├── core_utils.py                        # Python 3.10+ reference implementation
        ├── core_utils.ts                        # TypeScript / Node.js reference implementation
        ├── jsonld_templates.json                # Ready-to-adapt Schema.org JSON-LD payloads
        └── ucp_acp_templates.json               # Ready-to-adapt UCP & ACP discovery payloads
```

---

## Verification & Quality Assurance

Every implementation guided by `ai-seo-skill` includes a built-in verification phase ([`references/05-verification-guide.md`](./references/05-verification-guide.md)) that instructs the agent to write or run native tests (`pytest`, `vitest`, `jest`, `phpunit`, `go test`) covering:
1. **Core Utility Unit Tests**: HTML block spacing, entity decoding without `\u0026amp;` double-encoding, `<script>` XSS hex-escaping, and ISO 4217 minor-unit rounding (`0`, `2`, and `3` decimal currencies).
2. **JSON-LD Schema Compliance**: No `null`/`""`/`[]` properties, strict absolute URLs, `ProductGroup` instead of `AggregateOffer`, and proper `validFrom`/`validThrough` placement.
3. **HTTP & Discovery Checks**: Spider-trap-safe canonical URLs, `/llms.txt` `Link` headers (`rel="describedby"`), `.md` Shadow Corpus frontmatter, MCP `Origin: null` rejection (`403`), and UCP/ACP JSON schema validation.

---

## License

Released under the **MIT License** (with [`resources/acp-schema.feed.json`](./resources/acp-schema.feed.json) governed by the Apache 2.0 Agentic Commerce Protocol specification). Free for personal and commercial use.
