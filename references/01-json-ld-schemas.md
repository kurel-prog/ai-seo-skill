# Schema.org JSON-LD Specification (2026 Google Search Central Standard)

## Mandatory Global Rules
1. **Omit Empty Properties**: Any optional field with `null`, `""`, or `[]` **must be omitted** from the JSON object.
2. **Absolute URLs**: Every URL (`url`, `image`, `contentUrl`, `@id`, `item`) must be an absolute URL starting with `https://` (or `http://`). If an asset URL is relative or protocol-relative (`//cdn...`), resolve it against the site's base URL.
3. **Currency Units**: Always use `price_major` (natural decimal representation, e.g., `"49.00"` USD or `1500` JPY). Never use `price_minor` in JSON-LD.
4. **XSS Escaping**: Always serialize JSON-LD using `encodeJsonLd` (hex-escaping `<`, `>`, `&`, `'`) before embedding inside `<script type="application/ld+json">`.

---

## 1. Primary Entity JSON-LD by Domain Profile (`DOMAIN_PROFILE`)

### 1.1. `COMMERCE` & `RESERVATION`: `Product` (Single Price) vs `ProductGroup` (Multi-Variant Prices)

> **2026 Google Search Central Merchant Listing Rules**:
> * **NEVER use `AggregateOffer`** for multi-variant products with different prices; it disqualifies pages from Merchant Listings and automatic price-drop / strikethrough badges. Use `@type: "ProductGroup"` with `variesBy` and `hasVariant` instead.
> * **Include `brand`**: Provide `"brand": {"@type": "Brand", "name": "..."}` on `Product` or `ProductGroup` to avoid Merchant Listing validation warnings.
> * **Placement of `validFrom` / `validThrough` / `priceValidUntil`**: When providing a strikethrough list price (`"priceType": "https://schema.org/StrikethroughPrice"`), place `validFrom` and `validThrough` (or `priceValidUntil`) **directly on the `Offer` node**, never inside `priceSpecification`, and do not set a `priceType` on the active sale price.
> * Only emit `priceSpecification` (`StrikethroughPrice`) when `list_price_major > price_major`.

#### Pattern A: Single-Price Product with Sale Strikethrough Price
```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Waterproof Windbreaker Jacket",
  "image": [
    "https://example.com/uploads/coat-1.jpg",
    "https://example.com/uploads/coat-2.jpg"
  ],
  "description": "Two-layer waterproof and windproof breathable jacket...",
  "sku": "COAT-001",
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
  "category": "Apparel > Outerwear",
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/products/coat-001",
    "priceCurrency": "USD",
    "price": "45.00",
    "validFrom": "2026-10-01T00:00:00Z",
    "validThrough": "2026-11-30T23:59:59Z",
    "priceValidUntil": "2026-11-30",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "priceType": "https://schema.org/StrikethroughPrice",
      "price": "59.00",
      "priceCurrency": "USD"
    }
  }
}
```

#### Pattern B: Multi-Variant Product / Service with Different Prices (`ProductGroup`)
```json
{
  "@context": "https://schema.org/",
  "@type": "ProductGroup",
  "name": "Waterproof Windbreaker Jacket",
  "description": "Two-layer waterproof and windproof breathable jacket...",
  "url": "https://example.com/products/coat-001",
  "productGroupID": "101",
  "brand": {
    "@type": "Brand",
    "name": "Brand Name"
  },
  "variesBy": [
    "https://schema.org/color",
    "https://schema.org/size"
  ],
  "hasVariant": [
    {
      "@type": "Product",
      "sku": "COAT-BLK-M",
      "name": "Waterproof Windbreaker Jacket - Black / M",
      "color": "Black",
      "size": "M",
      "image": "https://example.com/uploads/coat-1.jpg",
      "offers": {
        "@type": "Offer",
        "url": "https://example.com/products/coat-001?variant=501",
        "priceCurrency": "USD",
        "price": "45.00",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    },
    {
      "@type": "Product",
      "sku": "COAT-BLK-XL",
      "name": "Waterproof Windbreaker Jacket - Black / XL",
      "color": "Black",
      "size": "XL",
      "image": "https://example.com/uploads/coat-1.jpg",
      "offers": {
        "@type": "Offer",
        "url": "https://example.com/products/coat-001?variant=502",
        "priceCurrency": "USD",
        "price": "55.00",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    }
  ]
}
```

---

### 1.2. `SAAS_PLATFORM`: `SoftwareApplication`, `WebApplication`, or `Service`
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Acme Cloud Platform",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "description": "Normalized description of the SaaS platform",
  "offers": [
    {
      "@type": "Offer",
      "name": "Free Tier",
      "price": "0",
      "priceCurrency": "USD"
    },
    {
      "@type": "Offer",
      "name": "Pro Plan",
      "price": "49.00",
      "priceCurrency": "USD"
    }
  ]
}
```

---

### 1.3. `CONTENT_PUBLISHING`: `Article` / `TechArticle` + `Person` + `ItemList` (`positiveNotes` / `negativeNotes`)
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Headline (max 110 characters)",
  "description": "Normalized summary of the article",
  "image": ["https://example.com/uploads/cover.jpg"],
  "datePublished": "2026-10-27T01:00:00Z",
  "dateModified": "2026-10-27T02:00:00Z",
  "author": [{
    "@type": "Person",
    "name": "Author Name",
    "url": "https://example.com/authors/author-slug"
  }],
  "publisher": {
    "@id": "https://example.com/#organization"
  }
}
```
*For product/service review articles, include `review` with `positiveNotes` and `negativeNotes`:*
```json
{
  "review": {
    "@type": "Review",
    "author": { "@type": "Person", "name": "Author Name" },
    "positiveNotes": {
      "@type": "ItemList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Low-latency execution" },
        { "@type": "ListItem", "position": 2, "name": "Native 2026 MCP support" }
      ]
    },
    "negativeNotes": {
      "@type": "ItemList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Requires OAuth 2.1 setup" }
      ]
    }
  }
}
```

---

## 2. Site-Wide Identity JSON-LD (`@graph`: `WebSite` + `Organization`)

Emit on the homepage (or global layout) for all web services:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "name": "Brand Name",
      "alternateName": "Brand Alternate Name",
      "url": "https://example.com/",
      "description": "Normalized overview of the web service",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://example.com/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@id": "https://example.com/#organization"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "url": "https://example.com/",
      "name": "Brand Name",
      "logo": {
        "@type": "ImageObject",
        "contentUrl": "https://example.com/logo.png"
      },
      "legalName": "Example Inc.",
      "email": "support@example.com",
      "telephone": "+1-800-555-0199",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Market St",
        "addressLocality": "San Francisco",
        "addressRegion": "CA",
        "postalCode": "94103",
        "addressCountry": "US"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "telephone": "+1-800-555-0199",
        "email": "support@example.com",
        "url": "https://example.com/contact"
      }
    }
  ]
}
```

---

## 3. `BreadcrumbList` & `FAQPage` JSON-LD (Hierarchy & RAG Ingestion)

### 3.1. `BreadcrumbList` (For Detail & Category Pages)
Emit on any nested page so search engines and AI agents understand site hierarchy:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Category",
      "item": "https://example.com/category"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Current Page"
    }
  ]
}
```

### 3.2. `FAQPage` (RAG & AI Overviews Ingestion)
> **2026 Context**: Google removed visual FAQ accordions from traditional SERPs, but `FAQPage` remains a top-priority structured source for **RAG pipelines, Google AI Overviews, Perplexity, and ChatGPT Search** citations.
* Render only when at least 1 valid `question` and `answer` pair exists on the page:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Frequently asked question?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Direct, factual answer."
      }
    }
  ]
}
```
