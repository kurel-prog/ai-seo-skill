# Streamable HTTP MCP Server Specification (`2026-07-28`)

## 1. Protocol Transport & Security (`POST /mcp`)

Expose the **Model Context Protocol (MCP)** endpoint over **Streamable HTTP** (`2026-07-28` specification) with the following 3 mandatory security controls:

### 1.1. DNS Rebinding Protection (`Origin` & Header Validation)
* Inspect the `Origin` HTTP header on every incoming request to `/mcp`:
  * If `Origin == "null"` or `Origin` is not in the server's `ALLOWED_ORIGINS` allowlist -> **immediately reject with HTTP `403 Forbidden`**.
  * When running locally in development, bind strictly to `127.0.0.1` rather than `0.0.0.0`.
* Enforce `Content-Type: application/json` on `POST` requests (return `415 Unsupported Media Type` otherwise).
* Require the client's `Accept` header to include both `application/json` and `text/event-stream` (`Accept: application/json, text/event-stream`).

### 1.2. Protocol Metadata Synchronization (`_meta`) & Session Header
* Read and propagate protocol metadata inside `_meta["io.modelcontextprotocol/..."]` in the JSON-RPC 2.0 `params` and `result` objects.
* When stateful sessions are used, propagate the `Mcp-Session-Id` HTTP header according to the Streamable HTTP transport spec.

### 1.3. Authentication & Authorization (OAuth 2.1 / Bearer Token)
* Tools accessing non-public data (orders, customers, private workspaces) or mutating state must validate `Authorization: Bearer <token>` and enforce appropriate scope/permission checks (e.g., `mcp:read`).
* Public catalog/documentation lookup tools may allow unauthenticated read access protected by rate limiting (e.g., 60 req/min/IP).

---

## 2. Reference Tool Signatures by Domain Profile

Design MCP tools around the target project's actual domain entities and services. Follow the project's existing pagination conventions, or default to clamping `limit` within `[1, 200]` (default `10`), enforcing `offset >= 0` (or cursor-based pagination), and returning a structured envelope such as `{total, limit, offset, items[]}`.

### A. `COMMERCE` (Examples)
1. `search_products(keyword?: string, categoryId?: string | int, stockMin?: int, stockMax?: int, limit: int = 10, offset: int = 0)`
2. `get_product(id?: string | int, sku?: string)`
3. `get_product_stock(productId: string | int)`

### B. `RESERVATION` (Lodging / Dining / Events / Appointments — Examples)
1. `search_services(keyword?: string, location?: string, date?: string, guests?: int, limit: int = 10, offset: int = 0)`
2. `check_slot_availability(serviceId: string, startDate: string, endDate?: string, partySize: int = 1)`
3. `get_cancellation_policy(serviceId: string)`

### C. `SAAS_PLATFORM` (SaaS / DevTools / APIs / Portals — Examples)
1. `search_documentation(query: string, section?: string, limit: int = 10, offset: int = 0)`
2. `get_api_schema(endpointPath: string, method: string = "GET")`
3. `calculate_pricing(planId: string, seats: int = 1, billingCycle: "monthly" | "annual" = "monthly")`
4. `check_system_status()`

### D. `CONTENT_PUBLISHING` (Publishing / Blogs / Knowledge Bases / Wikis — Examples)
1. `search_articles(query: string, topic?: string, limit: int = 10, offset: int = 0)`
2. `get_article_content(slugOrId: string, format: "markdown" | "plain" = "markdown")`
3. `list_related_topics(slugOrId: string)`
