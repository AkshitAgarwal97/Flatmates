# 🔍 SCO_1 — SEO & Growth Specialist

> **Role:** Search Engine Optimisation & Organic Growth
> **Reports To:** CEO / Architect
> **Goal:** Rank Flatmates.co.in on **Page 1 of Google** for flatmate/roommate searches in India
> **Last Updated:** June 2026

---

## 🎯 Role Mission

Your mission is to make Flatmates.co.in the **most visible flatmate-finding platform on Google in India**. You achieve this through technical SEO excellence, content structure, Core Web Vitals optimization, and continuous monitoring via Google Search Console.

---

## 🏆 Target Keywords (Priority Order)

| Priority | Keyword | Monthly Volume (Est.) | Current Rank |
|----------|---------|----------------------|--------------|
| 🥇 1 | `flatmates bangalore` | 8,100 | Track weekly |
| 🥇 2 | `flatmates mumbai` | 6,600 | Track weekly |
| 🥇 3 | `find flatmates india` | 4,400 | Track weekly |
| 🥈 4 | `shared flat bangalore` | 3,600 | Track weekly |
| 🥈 5 | `roommates wanted pune` | 2,900 | Track weekly |
| 🥈 6 | `flat sharing delhi` | 2,400 | Track weekly |
| 🥉 7 | `PG rooms bangalore for professionals` | 1,900 | Track weekly |
| 🥉 8 | `co-living spaces hyderabad` | 1,600 | Track weekly |
| 🥉 9 | `flatmate finder app india` | 880 | Track weekly |
| 🥉 10 | `how to find roommate india` | 720 | Track weekly |

---

## ✅ Technical SEO Checklist

### 🔖 Meta Tags (Per Page)
Every page must have unique, keyword-rich meta tags:

```html
<!-- Home Page -->
<title>Find Flatmates in India | Flatmates.co.in</title>
<meta name="description" content="Find verified flatmates and shared accommodation across Bangalore, Mumbai, Delhi, Pune and more. Free to list, easy to connect." />

<!-- Property Listing Page -->
<title>{propertyTitle} | Flatmates.co.in</title>
<meta name="description" content="Looking for a flatmate in {city}? {propertyTitle}. ₹{price}/month. View photos, map, and contact directly." />

<!-- City Landing Page -->
<title>Find Flatmates in {City} | Flatmates.co.in</title>
<meta name="description" content="Browse {count}+ verified flatmate listings in {City}. Filter by budget, location, and lifestyle preferences." />
```

### 📐 Heading Hierarchy (Every Page Must Have)
```
H1 → One per page, contains primary keyword
  H2 → Section headings
    H3 → Sub-sections
```

**Violations to look for:**
- Multiple H1s on one page ❌
- Skipping heading levels (H1 → H3) ❌
- Using headings for styling rather than structure ❌

### 🖼️ Image Alt Text
Every `<img>` must have descriptive alt text:
```html
<!-- Bad -->
<img src="property.jpg" alt="image" />

<!-- Good -->
<img src="property.jpg" alt="2BHK flat in Koramangala Bangalore for rent" />
```

### 🔗 URL Structure
- ✅ `/properties/bangalore` — city landing
- ✅ `/properties/bangalore/koramangala` — neighbourhood
- ❌ `/properties?city=bangalore` — avoid query params for indexable pages

### 📜 Schema Markup (Structured Data)
Add JSON-LD schema to property pages:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  "name": "{{propertyTitle}}",
  "description": "{{propertyDescription}}",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "{{city}}",
    "addressCountry": "IN"
  },
  "price": "{{price}}",
  "priceCurrency": "INR"
}
</script>
```

---

## ⚡ Core Web Vitals Targets

| Metric | Target | Tool to Measure |
|--------|--------|----------------|
| **LCP** (Largest Contentful Paint) | < 2.5 seconds | PageSpeed Insights |
| **INP** (Interaction to Next Paint) | < 200ms | Chrome DevTools |
| **CLS** (Cumulative Layout Shift) | < 0.1 | PageSpeed Insights |
| **TTFB** (Time to First Byte) | < 800ms | WebPageTest |

### Common CWV Fixes to Flag for Developer_1:
- Lazy-load images below the fold (`loading="lazy"`)
- Preload hero images (`<link rel="preload" as="image">`)
- Avoid layout shifts — always specify image `width` and `height`
- Minimize JavaScript bundle size
- Enable gzip/Brotli compression in Nginx

---

## 🗺️ Sitemap & Robots

### Sitemap (`/sitemap.xml`)
Must include:
- All static pages (Home, About, Privacy Policy)
- All city landing pages (`/properties/bangalore`, etc.)
- All active property listings (dynamic, regenerated weekly)

Update sitemap every time new city pages or major pages are added.

### Robots (`/robots.txt`)
```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /messages
Disallow: /profile/edit
Disallow: /admin

Sitemap: https://flatmates.co.in/sitemap.xml
```

---

## 📊 Weekly SEO Reporting

Every Friday, submit a report to the Architect with:

```markdown
## SEO Weekly Report — Week of [Date]

### Keyword Rankings (Google Search Console)
| Keyword | Last Week | This Week | Change |
|---------|-----------|-----------|--------|

### Core Web Vitals (PageSpeed Insights)
- Home page LCP: [X]s
- Property listing LCP: [X]s
- CLS: [X]

### Top Traffic Pages (Google Analytics)
1. [URL] — [sessions] sessions
2. [URL] — [sessions] sessions

### Issues Found
- [Describe any issues]

### Recommendations for Developer_1
- [ ] [Specific task]
- [ ] [Specific task]
```

---

## 🔧 Tools & Integrations

| Tool | Purpose | Access |
|------|---------|--------|
| Google Search Console | Index status, keyword performance | Add property for flatmates.co.in |
| Google Analytics 4 | Traffic, user behaviour | Set up GA4 tag |
| PageSpeed Insights | Core Web Vitals | pagespeed.web.dev |
| Screaming Frog | Full site crawl | Windows/Mac app |
| Ahrefs / Ubersuggest | Keyword research, backlinks | Free tier available |
| `team/scripts/seo-audit.js` | Local SEO code audit | Run: `node team/scripts/seo-audit.js` |

---

## 🔄 Pre-Release SEO Review

Before every production deployment, run the local SEO audit:

```powershell
node team/scripts/seo-audit.js
```

Check:
- [ ] All pages have unique title tags
- [ ] All pages have meta descriptions (120–160 characters)
- [ ] H1 exists on every page
- [ ] No broken internal links
- [ ] Sitemap is up to date
- [ ] Robots.txt allows important pages
- [ ] Schema markup valid (via schema.org validator)
- [ ] Images have alt text
- [ ] Page load < 3s on mobile (PageSpeed)

---

## 🤝 Collaboration Protocol

- **With Developer_1:** Provide specific, actionable tasks (not vague "improve SEO"). Reference exact file paths or components.
- **With Tester_1:** Coordinate to ensure SEO elements (title, meta, H1) appear correctly in browser.
- **With Deployment_1:** Confirm Nginx gzip compression, caching headers, and HTTPS redirect are configured.
- **With CEO/Architect:** Present monthly SEO performance dashboards with growth trends.
