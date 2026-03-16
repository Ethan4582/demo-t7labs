---
name: Add New Component
description: Instructions on how to add a new component to the Next.js gallery while ensuring isolation and high-quality refactoring.
---

# Add New Component Guide

When adding a new component to this project, follow this exact workflow to ensure it is properly registered in the dynamic gallery and its styles/scripts are isolated from the rest of the application.

## 1. Create the Component Folder
Create a new folder for your component inside `src/components/` using PascalCase or an underscore-separated name (e.g., `src/components/MyNewComponent` or `src/components/My_New_Component`).

## 2. Isolate Styles using CSS Modules
To ensure the component's styles do not affect the global layout or other components, **always use CSS Modules**.
- Create a `style.module.scss` or `style.module.css` in the component folder.
- Avoid using global selectors like `body`, `html`, or `*` within the module unless strictly scoped.
- Ensure `z-index` values are managed to prevent overlapping with the navigation overlay (nav is $z-50$).
- Background images for reveal effects should be absolute and covers (`object-fit: cover`).

## 3. Build the Component (Structure & Refactoring)
Create an `index.jsx` or `index.tsx` inside the component folder.

### **Coding Standards:**
- **NO COMMENTS**: Do not add comments to the code (no Jira links, no "todo", no "logic starts here"). The code should be self-documenting.
- **Clean Structure**: 
  - Define static constants (like digit arrays) and helper functions (like animation wrappers) **outside** the component function.
  - Use `useMemo` for complex data generation.
  - Use `useCallback` for stable ref handlers or event listeners.
- **GSAP Context**: Always use `gsap.context()` within `useEffect` to scope animations to the component's container. This handles proper cleanup during route transitions.
- **Cleanup**: Ensure all GSAP animations, event listeners, and timers are reverted/removed in the cleanup function.

## 4. Register in Component Data
Add the component metadata to the `components` array in `src/data/components.ts`:
```typescript
{
  id: "my-new-component",
  name: "My New Component",
  shortDescription: "Interactive WebGL ripples with real-time physics.",
  instruction: "Move your cursor to create ripples.",
  image: "https://url-to-placeholder.png",
  category: "SHADER", // Options: "GSAP", "SHADER", "PAGE REVEAL", "LANDING PAGE"
  date: "Month Day, Year",
}
```

## 5. Add to Dynamic Registry
Open `src/app/gallery/[id]/page.tsx` and add your component to the `ComponentRegistry` object:
```tsx
const ComponentRegistry: Record<string, any> = {
   "water-ripple": dynamic(() => import("@/src/components/Water_Ripple")),
   "my-new-component": dynamic(() => import("@/src/components/MyNewComponent")),
};
```

## 6. Image Optimization & Hostnames
Because this project is configured for **Static Site Export**, all images must be handled correctly:
- **Local Images**: Import images directly and use them with the Next.js `<Image />` component.
- **External Images**: Ensure the hostname is added to `next.config.ts` under `remotePatterns`.
- **Image Optimization**: The project uses `images: { unoptimized: true }` in `next.config.ts` to support static export on platforms like Cloudflare Pages. Do not change this unless requested.

## Summary of File Changes Required
- `src/components/Your_Component/index.tsx`
- `src/components/Your_Component/style.module.scss`
- `src/data/components.ts` (Update `components` array)
- `src/app/gallery/[id]/page.tsx` (Update `ComponentRegistry`)
- `next.config.ts` (If adding new image hosts)
