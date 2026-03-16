---
name: Static Site Configuration
description: Guidelines and requirements for maintaining the project's static export configuration, specifically for Cloudflare Pages.
---

# Static Site Configuration Guide

This project is built as a **Fully Static Website**. It uses Next.js Static Export to generate a `out/` directory that can be deployed to static hosting providers like Cloudflare Pages.

## Core Requirements

To maintain compatibility with static export, the following configurations must remain in place:

### 1. Next.js Config (`next.config.ts`)
The `output` must be set to `export`:
```typescript
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // ... other configs
};
```

### 2. Image Optimization
Next.js built-in image optimization requires a Node.js server to run at runtime. Since this is a static export, we must disable it:
- **`unoptimized: true`**: This tells Next.js to serve images as-is without trying to optimize them on the fly.
- This is mandatory for `output: 'export'`.

### 3. Server-Side Features
Avoid using features that require a Node.js runtime:
- **No `getServerSideProps`**: Use `getStaticProps` or fetch data on the client.
- **No `headers` or `redirects` in `next.config.ts`**: These are server-level features. For Cloudflare Pages, use a `_headers` or `_redirects` file in the `public/` folder instead.
- **No Dynamic Routing with Server-Side Logic**: Use `generateStaticParams` for dynamic routes to ensure they are pre-rendered at build time.

## Deployment to Cloudflare Pages
- The build command should be `npm run build`.
- The output directory is `out`.
- Ensure no Cloudflare-specific code is added to the application logic; keep it platform-agnostic where possible.
