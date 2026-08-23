# Search and Discovery Publication Guide

Student Productivity Hub publishes first-party discovery assets from its canonical origin:

- `https://sph.ai-aarti.com/robots.txt`
- `https://sph.ai-aarti.com/sitemap.xml`
- `https://sph.ai-aarti.com/llms.txt`
- `https://sph.ai-aarti.com/llms-full.txt`
- `https://sph.ai-aarti.com/3450b713-fc17-4791-b160-f2c11b46f896.txt`

## Publish Checklist

1. Deploy the current branch to the canonical `https://sph.ai-aarti.com` origin.
2. Confirm every sitemap URL returns `200` and a self-referencing canonical URL.
3. Add the site to Google Search Console and Bing Webmaster Tools, then submit `https://sph.ai-aarti.com/sitemap.xml` to each service.
4. Use `npm run indexnow:submit -- --submit` after a material change to a canonical URL.
5. Add the canonical website URL to the GitHub repository About section, project profile, educator resource listings, and relevant open-source directories.
6. Publish substantive guides, classroom examples, or release notes on the canonical domain and earn links by offering genuinely useful references for students and educators.

## Backlink Standard

Seek editorial links that name the product, explain why it is useful, and point to the most relevant canonical topic page. Do not buy links, use automated link schemes, or submit the site to low-quality directories. Those tactics can create manual-action risk and do not establish credible authority.

## Verification

Use the Google Rich Results Test to validate structured data on the home page and the three topic pages. Review Google Search Console for indexing and enhancement reports, then correct crawl, canonical, or structured-data issues at their source before requesting reindexing.