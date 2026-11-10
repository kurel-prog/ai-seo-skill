# Agentic Commerce Specification: UCP (`2026-08-25`) & OpenAI ACP (`2026-04-17`)

> **Scope**: Only implement this specification when `AGENTIC_COMMERCE` (`ENABLE_UCP` or `ENABLE_ACP`) is requested (typically for `COMMERCE` and `RESERVATION` domains).

---

## Part A: Universal Commerce Protocol — UCP (`2026-08-25`)

### 1. Discovery Endpoint: `GET /.well-known/ucp`
* **HTTP Requirements**:
  * Publicly accessible without authentication; return `200 OK` directly (3xx redirects are prohibited).
  * Required Headers: `Content-Type: application/json`, `Cache-Control: public, max-age=300` (ensure framework session middleware does not override `Cache-Control` to `private` or `no-cache`).
* **RFC 9421 HTTP Message Signatures (`signing_keys`)**:
  * Publish EC P-256 (`ES256`) public JWKs in `signing_keys[]` to verify HTTP Message Signatures (`Signature`, `Signature-Input`, `Content-Digest`) per RFC 9421. Never include the private parameter `d`.
* **JSON Serialization Rule**: `services`, `payment_handlers`, and `capabilities` must serialize as JSON Objects `{}` even when empty (never `[]`, which can happen with empty associative arrays in languages like PHP).
* **Response Example (`200 OK`)**:
```json
{
  "ucp": {
    "version": "2026-08-25",
    "services": {
      "dev.ucp.shopping.catalog": [
        {
          "version": "2026-08-25",
          "transport": "rest",
          "endpoint": "https://example.com/catalog"
        }
      ]
    },
    "payment_handlers": {},
    "capabilities": {
      "dev.ucp.shopping.catalog.search": [
        {
          "version": "2026-08-25",
          "schema": "https://ucp.dev/schemas/shopping/catalog_search.json"
        }
      ],
      "dev.ucp.shopping.catalog.lookup": [
        {
          "version": "2026-08-25",
          "schema": "https://ucp.dev/schemas/shopping/catalog_lookup.json"
        }
      ]
    }
  },
  "signing_keys": [
    {
      "kty": "EC",
      "crv": "P-256",
      "x": "f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU",
      "y": "x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0",
      "kid": "ucp-key-2026",
      "use": "sig",
      "alg": "ES256"
    }
  ]
}
```
*(When `DOMAIN_PROFILE == "RESERVATION"`, switch or extend capabilities to `dev.ucp.booking.*`).*

---

### 2. Catalog Search API: `POST /catalog/search`
* **Request Body**:
  ```json
  {
    "query": "jacket",
    "pagination": {
      "limit": 10,
      "cursor": "eyJvZmZzZXQiOjEwfQ"
    }
  }
  ```
* **Processing Rules**:
  * `limit`: Default `10`, clamped to `[1, 100]`.
  * `cursor`: Opaque pagination token (e.g., a keyset cursor or `base64url`-encoded `{"offset": <int>}` with bounds checking).
  * Determine `has_next_page` accurately (e.g., via keyset lookahead or fetching `limit + 1` records).
  * Optional: Cache frequent search responses using the project's cache layer (e.g., keyed by a hash of the normalized request payload).
* **Response Body (`200 OK`)**:
  * All prices use **`price_minor`** (ISO 4217 smallest currency unit integer).
  * `description` on both `product` and `variant` is required and must have `minProperties: 1` (if empty, output `{"plain": ""}`).
  * In `variant.options`, use `{"name": "...", "label": "..."}`.
  ```json
  {
    "ucp": {
      "version": "2026-08-25",
      "status": "success"
    },
    "products": [
      {
        "id": "101",
        "title": "Waterproof Windbreaker Jacket",
        "description": {
          "plain": "Two-layer waterproof and windproof jacket"
        },
        "price_range": {
          "min": { "amount": 4500, "currency": "USD" },
          "max": { "amount": 5500, "currency": "USD" }
        },
        "url": "https://example.com/products/101",
        "categories": [
          { "value": "Outerwear" }
        ],
        "media": [
          {
            "type": "image",
            "url": "https://example.com/uploads/coat-1.jpg",
            "alt_text": "Waterproof Windbreaker Jacket"
          }
        ],
        "variants": [
          {
            "id": "501",
            "title": "Waterproof Windbreaker Jacket",
            "description": {
              "plain": "Two-layer waterproof and windproof jacket"
            },
            "price": { "amount": 4500, "currency": "USD" },
            "list_price": { "amount": 5900, "currency": "USD" },
            "availability": {
              "available": true,
              "status": "in_stock"
            },
            "sku": "COAT-BLK-M",
            "url": "https://example.com/products/101",
            "options": [
              { "name": "Color", "label": "Black" },
              { "name": "Size", "label": "M" }
            ]
          }
        ]
      }
    ],
    "pagination": {
      "has_next_page": false
    },
    "messages": []
  }
  ```

---

### 3. Catalog Lookup & Product API: `POST /catalog/lookup` & `POST /catalog/product`
* **`POST /catalog/lookup`**:
  * Accepts `{"ids": ["101", "COAT-BLK-M"]}` (clamp batch size to a safe limit, e.g., max 100 IDs; resolve by Product ID, Variant ID, or SKU as supported by the domain model, and deduplicate by parent Product ID).
  * Returns `{ "ucp": { "version": "2026-08-25", "status": "success" }, "products": [...], "messages": [] }`.
* **`POST /catalog/product`**:
  * Accepts `{"id": "101"}`.
  * Returns HTTP `404` if not found: `{"ucp": {"version": "2026-08-25", "status": "error"}, "error": {"code": "not_found", "message": "product not found"}}`.
  * Returns HTTP `200` if found: `{"ucp": {"version": "2026-08-25", "status": "success"}, "product": {...}, "messages": []}`.

---

## Part B: OpenAI Agentic Commerce Protocol — ACP (`2026-04-17`)

### 1. Discovery Endpoint: `GET /.well-known/acp.json`
* Serve only when ACP Checkout is enabled (return `404` when disabled).
* Header: `Cache-Control: public, max-age=3600`.
* **Security Rule**: Never include `merchant_id` in this public document.
```json
{
  "protocol": {
    "name": "acp",
    "version": "2026-04-17",
    "supported_versions": ["2026-04-17"],
    "documentation_url": "https://agenticcommerce.dev"
  },
  "api_base_url": "https://example.com/acp",
  "transports": ["rest"],
  "capabilities": {
    "services": ["checkout"]
  }
}
```

### 2. Generating `products.jsonl` & Feed Push Integration
* Validate each product line against [`../resources/acp-schema.feed.json`](../resources/acp-schema.feed.json).
* **Key Differences from UCP**:
  * Variant options use `"variant_options": [{"name": "...", "value": "..."}]` (`value` instead of `label`).
  * No `price_range` or `categories` at the top-level Product object.
  * Omit `description` completely if empty.
```json
{
  "id": "101",
  "title": "Waterproof Windbreaker Jacket",
  "description": {
    "plain": "Two-layer waterproof and windproof jacket"
  },
  "url": "https://example.com/products/101",
  "media": [
    {
      "type": "image",
      "url": "https://example.com/uploads/coat-1.jpg",
      "alt_text": "Waterproof Windbreaker Jacket"
    }
  ],
  "variants": [
    {
      "id": "501",
      "title": "Waterproof Windbreaker Jacket",
      "price": { "amount": 4500, "currency": "USD" },
      "list_price": { "amount": 5900, "currency": "USD" },
      "availability": {
        "available": true,
        "status": "in_stock"
      },
      "url": "https://example.com/products/101",
      "variant_options": [
        { "name": "Color", "value": "Black" },
        { "name": "Size", "value": "M" }
      ]
    }
  ]
}
```
* **Outbound Push Client (when syncing via API)**:
  * Configure base URL and API key via the project's environment/config system (e.g., `ACP_FEED_BASE_URL` and `ACP_FEED_API_KEY`).
  * Send `Authorization: Bearer <API_KEY>`, `Accept: application/json`.
  * Standard ACP Feed endpoints: `POST /feeds`, `GET /feeds/{id}`, `GET /feeds/{id}/products`, `PATCH /feeds/{id}/products` (`{"products": [...]}`).

---

## Part C: Agentic Commerce Payment & Paywall Extensions (`AP2 Protocol`, `MPP`, `x402 Protocol`)

To pass all 5 Commerce checks on Cloudflare's Agent Readiness Audit (`isitagentready.com` — **ACP**, **AP2 Protocol**, **MPP**, **UCP**, **x402 Protocol**):

### 1. AP2 Protocol (`GET /.well-known/ap2.json` & `GET /.well-known/ap2`)
* Declares **Agent Payments Protocol (AP2)** support for cryptographic checkout mandates (`intentMandateSupported`, `cartMandateSupported`, `paymentMandateSupported`, `signingAlgorithms: ["ES256"]`), catalog/checkout endpoints, ISO 4217 `minorUnitDecimals`, and RFC 9421 `signingKeys`.

### 2. MPP (`GET /.well-known/mpp.json` & `GET /.well-known/mpp`)
* Declares **Machine Payments Protocol (MPP)** settlement rails (e.g., prepaid integer credit ledger or instant QR rails), currency minor-unit rules (`integerOnly: true`), and quote/status endpoints.

### 3. x402 Protocol (`GET /.well-known/x402.json` & `GET /.well-known/x402`)
* Declares **HTTP `402 Payment Required` (`x402`)** machine payment rules:
  * Standard headers: `X-Payment-Required`, `X-Payment`, `X-Payment-Response`.
  * `freeRoutes[]`: Public zero-cost endpoints (`/llms.txt`, `/llms-full.txt`, `/mcp`, `/*.md`).
  * `payableRoutes[]`: Protected routes with integer `priceMinor`, `currency`, `featureKey`, and description.
