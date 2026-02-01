---
name: UX Improvements for Baked Goods
overview: Address multiple UX issues across the baked goods feature including date selection, accidental duplicates, missing delete functionality, button spacing, and several additional improvements for a better user experience.
todos:
  - id: button-spacing
    content: Fix button spacing in CardFooter components across all form pages (new iteration, edit iteration, new baked good)
    status: pending
  - id: today-button
    content: Add "Today" button next to bake date input and default new iterations to today's date
    status: pending
  - id: delete-iteration
    content: Add delete button with confirmation dialog on iteration view page
    status: pending
  - id: duplicate-confirm
    content: Add confirmation dialog before duplicating an iteration
    status: pending
  - id: photo-delete-confirm
    content: Add confirmation dialog before deleting iteration photos
    status: pending
  - id: edit-baked-good
    content: Add ability to edit baked good name and description
    status: pending
  - id: star-rating
    content: Replace number input with star-based rating component
    status: pending
  - id: delete-baked-good
    content: Add delete baked good functionality with confirmation
    status: pending
  - id: time-input
    content: Improve total time input with hours/minutes or presets
    status: pending
  - id: breadcrumbs
    content: Add breadcrumb navigation to deep pages
    status: pending
isProject: false
---

# UX Improvements for Baked Goods

This plan addresses the issues you identified plus additional UX improvements found during review.

## Issues You Identified

### 1. Bake Date Selection - Add "Today" Button

**Problem:** The bake date field is a plain `<input type="date">` with no convenient shortcut to select today's date. Since most users are logging a bake they just did, this is a common action that should be one click.

**Files:**

- `[apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx)` (lines 179-189)
- `[apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx)` (lines 233-243)

**Solution:**

- Add a "Today" button next to the date input that sets `bakeDate` to today's date
- Default the bake date to today when creating a new iteration (currently blank)

### 2. Duplicate Creates Immediately Without Confirmation

**Problem:** Clicking "Duplicate" on an iteration immediately creates a new record in the database and navigates to edit. If clicked accidentally, the user now has an unwanted iteration saved.

**Files:**

- `[apps/web/src/app/baked-goods/[id]/page.tsx](apps/web/src/app/baked-goods/[id]/page.tsx)` (lines 161-170) - IterationCard duplicate button
- `[apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx)` (lines 125-147)

**Solution:**

- Add a confirmation dialog before duplicating (using an AlertDialog component)
- Explain what duplication does: "This will create a new iteration with today's date, copying the recipe content, difficulty, and time. You can edit it before saving."

### 3. No Way to Delete an Iteration

**Problem:** The `deleteIteration` mutation exists in `[packages/backend/convex/bakedGoods.ts](packages/backend/convex/bakedGoods.ts)` (lines 383-401), but there's no UI to trigger it.

**Files:**

- `[apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx)` - iteration view page
- `[apps/web/src/app/baked-goods/[id]/page.tsx](apps/web/src/app/baked-goods/[id]/page.tsx)` - iteration cards

**Solution:**

- Add a "Delete" button with destructive styling on the iteration view page
- Include a confirmation dialog: "Delete this iteration? This action cannot be undone."
- Optionally add delete to the iteration card dropdown/menu on the list page

### 4. Button Spacing Issues

**Problem:** In form footers, buttons are placed without gaps between them.

**Files:**

- `[apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx)` (lines 239-246)

```typescript
<CardFooter>
  <Button type="submit" disabled={isSubmitting}>
    {isSubmitting ? "Creating…" : "Add iteration"}
  </Button>
  <Button type="button" variant="outline" asChild disabled={isSubmitting}>
    <Link href={`/baked-goods/${bakedGoodId}`}>Cancel</Link>
  </Button>
</CardFooter>
```

- `[apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx)` (lines 281-290)
- `[apps/web/src/app/baked-goods/new/page.tsx](apps/web/src/app/baked-goods/new/page.tsx)` (lines 81-85) - missing Cancel button entirely

**Solution:**

- Add `gap-2` or `gap-3` class to all `CardFooter` elements containing multiple buttons
- Add a Cancel button to the new baked good page

---

## Additional UX Improvements Identified

### 5. Photo Delete Has No Confirmation

**Problem:** Clicking the trash icon on a photo immediately deletes it with no confirmation.

**Files:**

- `[apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx)` (lines 207-223)
- `[apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx)` (lines 318-335)

**Solution:**

- Add confirmation dialog before deleting photos

### 6. No Way to Edit Baked Good Name/Description

**Problem:** After creating a baked good, there's no way to edit its name or description.

**Files:**

- `[apps/web/src/app/baked-goods/[id]/page.tsx](apps/web/src/app/baked-goods/[id]/page.tsx)` - detail page shows name/description but no edit action
- Backend: `updateBakedGood` mutation exists (lines 48-77)

**Solution:**

- Add an "Edit" button/icon next to the baked good title
- Either inline edit or modal/sheet for editing name and description

### 7. No Way to Delete a Baked Good

**Problem:** The `deleteBakedGood` mutation exists but there's no UI to use it.

**Solution:**

- Add a "Delete Baked Good" option (in settings dropdown or at bottom of page)
- Requires confirmation with warning about deleting all iterations

### 8. Rating Input Could Use Stars

**Problem:** The rating field is a plain number input (1-5). A star-based rating UI would be more intuitive.

**Files:**

- `[apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx)` (lines 190-202)
- `[apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx)` (lines 244-256)

**Solution:**

- Create a `StarRating` component with clickable stars (1-5)
- Allow clicking a selected star to clear rating (optional rating)

### 9. Total Time Input Could Be More Intuitive

**Problem:** Users must enter total time in minutes as a raw number.

**Solution:**

- Add helper inputs for hours and minutes that calculate total
- Or add common presets: "30 min", "1 hr", "2 hr", "3 hr"

### 10. Missing Breadcrumb Navigation

**Problem:** Deep pages (iteration view, iteration edit) only have a "Back" button. Users can get lost in the hierarchy.

**Solution:**

- Add breadcrumbs: My Bakery > Sourdough > Jan 15, 2026 Bake
- Could use shadcn breadcrumb component

---

## Implementation Priority

**High Priority (your identified issues):**

1. Button spacing fix - quick win
2. "Today" button for bake date
3. Delete iteration functionality
4. Duplicate confirmation dialog

**Medium Priority:** 5. Photo delete confirmation 6. Edit baked good name/description 7. Star rating component

**Lower Priority (nice to have):** 8. Delete baked good functionality 9. Time input improvements 10. Breadcrumb navigation
