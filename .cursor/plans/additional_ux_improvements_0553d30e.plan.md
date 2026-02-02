---
name: Additional UX Improvements
overview: Address layout, visual design, navigation, and consistency issues to make the bakery app look professional and polished.
todos:
  - id: wider-layouts
    content: Increase max-width constraints on baked goods pages and standardize layout patterns
    status: completed
  - id: link-components
    content: Replace <a> tags with Next.js <Link> for client-side navigation
    status: completed
  - id: photo-placeholders
    content: Show actual photos on dashboard cards, add firstPhotoUrl to listMyBakedGoods query
    status: completed
  - id: stats-display
    content: Redesign stats section with icons and better visual hierarchy
    status: completed
  - id: styled-dropzone
    content: Create styled file upload dropzone component
    status: completed
  - id: photo-lightbox
    content: Add click-to-expand photo gallery with lightbox modal
    status: completed
  - id: upload-progress
    content: Add progress indicator for photo uploads
    status: completed
  - id: typography-consistency
    content: Standardize heading sizes and text hierarchy across pages
    status: completed
  - id: accessibility-fixes
    content: Add proper alt text, ARIA labels, and focus states
    status: completed
  - id: layout-consistency
    content: Align tools pages with rest of app layout patterns
    status: completed
isProject: false
---

# Additional UX Improvements

This plan covers issues **not already in** [ux_improvements_for_baked_goods_e876e5ba.plan.md](.cursor/plans/ux_improvements_for_baked_goods_e876e5ba.plan.md). Focus is on layout, visual polish, consistency, and navigation.

---

## 1. Layout: Pages Don't Use Available Space

**Problem:** Content is constrained to narrow widths (`max-w-2xl` = 672px) leaving large empty areas on desktop screens.

**Files:**

- [apps/web/src/app/baked-goods/[id]/page.tsx](apps/web/src/app/baked-goods/[id]/page.tsx) line 278: `max-w-2xl`
- [apps/web/src/app/baked-goods/new/page.tsx](apps/web/src/app/baked-goods/new/page.tsx) line 49: `max-w-xl`
- Loading/error states also use these narrow widths

**Solution:**

- Use responsive max-widths: `max-w-3xl lg:max-w-4xl xl:max-w-5xl`
- Or use a two-column layout on larger screens (main content + sidebar for stats/actions)
- Apply consistently across all baked goods pages

---

## 2. Inconsistent Layout Patterns

**Problem:** Tools pages use completely different spacing, backgrounds, and structure than the rest of the app.

| Area       | Tools Pages           | Other Pages  |
| ---------- | --------------------- | ------------ |
| Padding    | `py-12 md:py-24 px-6` | `p-6 md:p-8` |
| Width      | `max-w-7xl`           | `max-w-2xl`  |
| Background | `bg-muted/30`         | none         |
| Wrapper    | `<section>`           | `<div>`      |

**Files:**

- [apps/web/src/app/tools/calculator/page.tsx](apps/web/src/app/tools/calculator/page.tsx)
- [apps/web/src/app/tools/substitutions/page.tsx](apps/web/src/app/tools/substitutions/page.tsx)

**Solution:**

- Standardize on a single layout pattern across all authenticated pages
- Create a shared content wrapper component with consistent padding/max-width

---

## 3. Full Page Reloads from `<a>` Tags

**Problem:** Many components use raw `<a>` tags instead of Next.js `<Link>`, causing full page reloads and losing client-side navigation benefits.

**Files:**

- [apps/web/src/components/dashboard.tsx](apps/web/src/components/dashboard.tsx) lines 31, 65, 75, 102
- [apps/web/src/components/app-sidebar.tsx](apps/web/src/components/app-sidebar.tsx) lines 90, 100, 117, 138, 146

**Solution:**

- Replace all internal navigation `<a>` tags with Next.js `<Link>` component

---

## 4. Emoji Placeholders Instead of Images

**Problem:** Dashboard cards show a hardcoded 🍞 emoji instead of the actual iteration photos. This looks unprofessional.

**File:** [apps/web/src/components/dashboard.tsx](apps/web/src/components/dashboard.tsx) lines 77-80

```tsx
<div className="w-full h-full flex items-center justify-center text-5xl ...">🍞</div>
```

**Solution:**

- Display the first photo from the most recent iteration if available
- Fall back to a proper placeholder icon (Image from lucide-react) with muted styling
- Add `firstPhotoUrl` to the `listMyBakedGoods` query response

---

## 5. Stats Display Lacks Visual Hierarchy

**Problem:** On the baked good detail page, stats (iteration count, avg rating, best rating, last baked) are plain inline text with no visual structure.

**File:** [apps/web/src/app/baked-goods/[id]/page.tsx](apps/web/src/app/baked-goods/[id]/page.tsx) lines 381-391

```tsx
<div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
  <span>{iterationCount} iterations</span>
  <span>Avg {avgRating.toFixed(1)}</span>
  ...
</div>
```

**Solution:**

- Use stat cards or badges with icons
- Example: Clock icon + "Last baked Jan 15", Star icon + "Best 5/5"
- Consider a horizontal stat bar with visual separation

---

## 6. Missing Photo Gallery on Detail Pages

**Problem:** Iteration photos are shown in a basic grid. There's no lightbox or gallery view to see full-size photos.

**File:** [apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx)

**Solution:**

- Add click-to-expand functionality for photos
- Use a dialog/modal to show full-size image
- Add prev/next navigation for multiple photos

---

## 7. Poor File Input Styling

**Problem:** File inputs use browser defaults which look inconsistent and unprofessional.

**Files:**

- [apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx)
- [apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx)

**Solution:**

- Create a styled dropzone component with:
  - Dashed border area
  - Icon and "Click or drag to upload" text
  - Hidden file input triggered by the styled area
  - Multiple file selection support

---

## 8. No Upload Progress Indicator

**Problem:** When uploading photos, users only see "Uploading..." text with no progress feedback.

**Solution:**

- Add a progress bar or spinner for each uploading file
- Show file name and size
- Allow cancellation of in-progress uploads

---

## 9. Plain Text Error Messages

**Problem:** Errors display as simple red text. This lacks visibility and doesn't follow the design system.

**Solution:**

- Use shadcn Alert component with destructive variant
- Include an icon (AlertCircle) for visual emphasis
- Position errors prominently (top of form or inline with the field)

---

## 10. Missing Empty States & Onboarding

**Problem:** Empty states are functional but don't guide users effectively. No first-time user experience.

**Current:** "No iterations yet" with a button

**Solution:**

- Add contextual tips: "Log your first bake to start tracking improvements"
- Show example cards or templates for new users
- Add a "Quick start" or "Import recipe" option

---

## 11. Timeline View Issues

**Problem:** The timeline view uses hardcoded negative margins (`left-[-29px]`) that can break on mobile.

**File:** [apps/web/src/app/baked-goods/[id]/page.tsx](apps/web/src/app/baked-goods/[id]/page.tsx) line 493

**Solution:**

- Use relative positioning or CSS that doesn't rely on magic numbers
- Test timeline rendering on mobile viewports

---

## 12. Non-Functional Splash Page Buttons

**Problem:** Several buttons on the splash page have no handlers or destinations.

**File:** [apps/web/src/components/splash-page.tsx](apps/web/src/components/splash-page.tsx)

- Line 98: "Explore Community Bakes" button
- Line 194: Fork button
- Line 208: "View All Community Bakes" button

**Solution:**

- Either implement the community features or remove/hide these buttons
- If keeping as placeholders, show "Coming Soon" state

---

## 13. Accessibility Issues

**Problems found:**

- Empty alt text on images: `alt=""` in iteration cards
- Missing ARIA labels on icon-only buttons
- No visible focus states on some interactive elements

**Files:**

- [apps/web/src/app/baked-goods/[id]/page.tsx](apps/web/src/app/baked-goods/[id]/page.tsx) line 207: `alt=""`
- Various icon buttons throughout

**Solution:**

- Add descriptive alt text: "Photo of {bakedGoodName} from {date}"
- Add `aria-label` to all icon-only buttons
- Ensure `focus-visible` rings on all interactive elements

---

## 14. Date Formatting Lacks Year in Dashboard

**Problem:** Dashboard shows "Updated Jan 15" without year, which is unclear for older items.

**File:** [apps/web/src/components/dashboard.tsx](apps/web/src/components/dashboard.tsx) lines 93-96

**Solution:**

- Include year if the date is not in the current year
- Example: "Jan 15" for 2026 dates, "Jan 15, 2025" for older

---

## 15. Typography Inconsistencies

**Problem:** Heading sizes vary without clear hierarchy.

| Page      | Element | Classes                          |
| --------- | ------- | -------------------------------- |
| Tools     | h2      | `text-4xl font-bold`             |
| Detail    | h1      | `text-3xl font-bold`             |
| Dashboard | h1      | `text-3xl md:text-4xl font-bold` |

**Solution:**

- Define a consistent typography scale
- Page titles should all use the same size/weight
- Consider adding a heading component with size variants

---

## Implementation Priority

**High (visual impact, quick wins):**

1. Wider page layouts
2. Replace `<a>` with `<Link>`
3. Fix emoji placeholders
4. Stats visual hierarchy

**Medium (polish):** 5. Styled file input / dropzone 6. Photo lightbox gallery 7. Upload progress indicator 8. Typography consistency

**Lower (nice to have):** 9. Alert component for errors 10. Accessibility fixes 11. Empty state improvements 12. Remove/fix non-functional buttons
