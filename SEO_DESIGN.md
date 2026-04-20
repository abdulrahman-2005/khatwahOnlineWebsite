This is the authoritative, structured directive you need. You can copy and paste the markdown block below directly into Cursor, Zed, or your AI assistant's context. 

I have structured this as a strict set of operating procedures based on the latest Google Search Central documentation, Bing Webmaster Guidelines, and Next.js App Router best practices. It addresses your specific issues with Messenger OpenGraph encoding (Mojibake), Bing's H1 and crawl errors, and Google's strict favicon requirements.

***

```markdown
# 🤖 MASTER SEO & INDEXING DIRECTIVE FOR AI CODER

## Context & Objective
You are tasked with executing a comprehensive SEO, OpenGraph (OG), and indexing overhaul on the `khatwah` Next.js (App Router) codebase. The current implementation has inconsistencies causing missing favicons in Google Search, mangled Arabic text in Facebook Messenger (`Ø®Ù...`), duplicate H1 tags flagging Bing Webmaster errors, and inconsistent sharing cards across social platforms. 

You must strictly execute the following structured phases across the entire repository. Do not skip any steps.

---

## PHASE 1: Global Layout & Metadata Standardization
**Target Files:** `src/app/layout.js`, `src/lib/seo.js`

1. **Purge Ghost Alternates:** The site currently uses client-side `LocaleContext` for translation and does **not** have `/en` or `/ar` URL routing. 
   * **Action:** Open `src/app/layout.js`. Remove the `alternates: { languages: ... }` block entirely. You cannot declare `hreflang` alternates to search engines for URLs that do not exist. This is causing Bing/Google crawl errors.
2. **Standardize the `metadataBase`:** Ensure `metadataBase: new URL(seoConfig.baseUrl)` is present at the absolute top of the metadata object in `layout.js`. This is mandatory for Next.js to resolve relative image paths into the absolute URLs that Messenger and WhatsApp require.
3. **Fix the Favicon Declaration:** Google strictly requires favicons to be multiples of 48px (48x48, 96x96, 144x144). 
   * **Action:** In `layout.js`, explicitly define the icons object to point to the correct sizes in the `public` folder. 
   ```javascript
   icons: {
     icon: [
       { url: '/favicon.ico' },
       { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
       { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
       { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
       { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
       { url: '/favicon.svg', type: 'image/svg+xml' },
     ],
     apple: [
       { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
     ],
   }
   ```
4. **Enforce UTF-8 for Messenger:** To fix the Arabic text mangling on strict platforms like Messenger, ensure the OpenGraph configuration in `layout.js` includes `locale: 'ar_EG'`, `type: 'website'`, and verify that Next.js is injecting `<meta charSet="utf-8" />` at the very top of the `<head>`.

---

## PHASE 2: The H1 Tag Audit (Fixing Bing Errors)
**Target Files:** `src/components/layout/NavBar.jsx`, `src/components/sections/Hero.jsx`, all dynamic pages.

Bing specifically flagged: *Error: More than one h1 tag. 2 instances found.*
1. **Logo H1 Removal:** Check `NavBar.jsx` and `Footer.jsx`. If the Khatwah Online logo is wrapped in an `<h1>`, change it to a `<div>` or `<p>` with a semantic `<span className="sr-only">Khatwah Online</span>`. The `<h1>` tag must be reserved **strictly** for the main title of the specific page content.
2. **Page-Level Audit:** Iterate through all route entry points (`page.js` / `page.jsx`). Ensure that each page renders exactly one `<h1>`. If a Hero component renders an `<h1>`, the subsequent sections must use `<h2>` and below.

---

## PHASE 3: Dynamic Page SEO & OpenGraph Image Injection
**Target Files:** `src/app/projects/[slug]/page.js`, `src/app/blog/[slug]/page.jsx`, `src/app/products/[slug]/page.jsx`

Every single page must have unique metadata. If a specific page lacks data, it must gracefully fall back to the root metadata.
1. **Implement `generateMetadata`:** In every dynamic `page.js/jsx` file, implement the Next.js `generateMetadata({ params })` function.
2. **Absolute Image URLs:** Extract the specific image for the project/blog post from the fetched data (e.g., from `projects.json` or Sanity). Ensure the `og:image` URL is **absolute** (e.g., `https://www.khatwah.online/projects/2nice-store/main-page-hero.webp`).
3. **Structured OpenGraph Object:** Inject the localized metadata.
   ```javascript
   export async function generateMetadata({ params }) {
     const project = await getProjectBySlug(params.slug); // Replace with actual fetch logic
     if (!project) return {};

     const ogImageUrl = project.image ? `https://www.khatwah.online${project.image}` : '[https://www.khatwah.online/og-image.png](https://www.khatwah.online/og-image.png)';

     return {
       title: `${project.name} | مشاريع خُطوة اونلاين`,
       description: project.excerpt,
       openGraph: {
         title: project.name,
         description: project.excerpt,
         url: `https://www.khatwah.online/projects/${params.slug}`,
         images: [
           {
             url: ogImageUrl,
             width: 1200,
             height: 630,
             alt: project.name,
           },
         ],
       },
       twitter: {
         card: 'summary_large_image',
         title: project.name,
         description: project.excerpt,
         images: [ogImageUrl],
       },
     };
   }
   ```
4. **Messenger Compatibility Rule:** You MUST include `width: 1200` and `height: 630` inside the `images` array for OpenGraph. Messenger will often reject images if the dimensions are not explicitly stated in the metadata payload.

---

## PHASE 4: Sitemap and Robots Standardization
**Target Files:** `src/app/sitemap.js`, `src/app/robots.js`

To fix Bing's "Discovered but not crawled" error, the XML sitemap must be pristine.
1. **Audit `sitemap.js`:** Ensure the script dynamically maps over `projects.json`, `products.json`, `services.json`, and your blog data to generate valid URLs.
2. **Strip Localization from URLs:** Because the site uses `LocaleContext` and not URL routing, ensure the sitemap **only** outputs the base URLs (e.g., `https://www.khatwah.online/about`). Do not output `/en/about` or `/ar/about`.
3. **Audit `robots.js`:** Ensure it explicitly points to the dynamic sitemap route:
   ```javascript
   export default function robots() {
     return {
       rules: {
         userAgent: '*',
         allow: '/',
       },
       sitemap: '[https://www.khatwah.online/sitemap.xml](https://www.khatwah.online/sitemap.xml)',
     }
   }
   ```

---

## PHASE 5: JSON-LD Structured Data Cleanup
**Target Files:** `src/components/seo/StructuredData.jsx`

1. **Validate URLs:** In the `LocalBusiness` and `WebSite` schemas, ensure all URLs (including the `logo` and `image` properties) are absolute (`https://www.khatwah.online/...`). 
2. **Review Validation Errors:** The current JSON-LD has an array of languages `"inLanguage": ["ar", "en"]`. Ensure that this matches the current client-side implementation reality.

**Execution Command:** "Begin Phase 1. Confirm once complete and provide the git diff for `layout.js` before moving to Phase 2."
```