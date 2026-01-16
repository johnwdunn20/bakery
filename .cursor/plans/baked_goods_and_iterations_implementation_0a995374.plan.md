---
name: Baked Goods and Iterations Implementation
overview: Implement the baked goods and recipe iterations system with ratings, photos, duplication, and hybrid list/timeline views. Replace the existing recipes/variants schema with the new bakedGoods/recipeIterations structure.
todos:
  - id: schema-backend
    content: Update schema.ts with new bakedGoods, recipeIterations, iterationPhotos tables and remove old tables
    status: pending
  - id: backend-functions
    content: Create bakedGoods.ts with all mutations, queries, and photo handling functions
    status: pending
    dependencies:
      - schema-backend
  - id: remove-old-backend
    content: Delete recipes.ts file
    status: pending
    dependencies:
      - backend-functions
  - id: update-dashboard
    content: Update dashboard.tsx to use new bakedGoods API and display new card format
    status: pending
    dependencies:
      - backend-functions
  - id: update-sidebar
    content: Update app-sidebar.tsx to use new bakedGoods API and update navigation links
    status: pending
    dependencies:
      - backend-functions
  - id: update-splash
    content: Update splash-page.tsx to use new schema or remove community recipes section
    status: pending
    dependencies:
      - backend-functions
  - id: create-baked-good-form
    content: Create /baked-goods/new page with name and description form
    status: pending
    dependencies:
      - backend-functions
  - id: create-detail-page
    content: Create /baked-goods/[id] page with stats bar, list/timeline toggle, and iteration cards
    status: pending
    dependencies:
      - backend-functions
  - id: create-iteration-form
    content: Create /baked-goods/[id]/iterations/new page with all form fields and photo upload
    status: pending
    dependencies:
      - backend-functions
  - id: create-iteration-edit
    content: Create /baked-goods/[id]/iterations/[iterationId]/edit page with pre-filled form
    status: pending
    dependencies:
      - create-iteration-form
  - id: duplication-feature
    content: Implement duplicateIteration mutation and add duplicate buttons to UI
    status: pending
    dependencies:
      - create-iteration-form
  - id: photo-management
    content: Implement photo upload, display, and deletion functionality
    status: pending
    dependencies:
      - create-iteration-form
  - id: rating-system
    content: Create rating input component and display ratings with color coding
    status: pending
    dependencies:
      - backend-functions
  - id: markdown-rendering
    content: Add markdown rendering for recipe content display
    status: pending
    dependencies:
      - create-iteration-form
  - id: migrate-seed-data
    content: Update seed.ts to use new schema and migrate existing 3 recipes
    status: pending
    dependencies:
      - backend-functions
  - id: cleanup-testing
    content: Remove old schema references, test all features, and verify functionality
    status: pending
    dependencies:
      - migrate-seed-data
      - duplication-feature
      - photo-management
      - rating-system
---

# Baked Goods and Recipe Iterations Implementation Plan

## Overview

Replace the current `recipes`/`variants`/`ingredients` schema with a new `bakedGoods`/`recipeIterations`/`iterationPhotos` structure that supports:

- Multiple recipe iterations per baked good
- 1-10 rating system (recipe and baked good level)
- Multiple photos per iteration
- Recipe duplication (copy recipe content, not results)
- Hybrid list/timeline view
- Markdown recipe content
- Difficulty, time, and date tracking

## Architecture

```
BakedGood (e.g., "Chocolate Chip Cookies")
  └─> RecipeIteration[] (multiple attempts/versions)
       ├─> Recipe content (markdown)
       ├─> Difficulty (1-10)
       ├─> Total time (minutes)
       ├─> Bake date (timestamp, allows backdating)
       ├─> Rating (1-10, optional)
       ├─> Notes (optional)
       ├─> Source URL (optional)
       └─> IterationPhoto[] (multiple photos)
```

## Phase 1: Schema and Backend Foundation

### 1.1 Update Schema

**File:** `packages/backend/convex/schema.ts`

- Remove: `recipes`, `variants`, `ingredients` tables
- Add: `bakedGoods`, `recipeIterations`, `iterationPhotos` tables
- Add indexes for efficient queries

**Schema structure:**

```typescript
bakedGoods: {
  authorId: Id<"users">,
  name: string,
  description?: string,
  createdAt: number,
  updatedAt: number
}
// Indexes: by_author, by_updated

recipeIterations: {
  bakedGoodId: Id<"bakedGoods">,
  recipeContent: string, // Markdown
  difficulty: number, // 1-10
  totalTime: number, // Minutes
  bakeDate: number, // Timestamp
  rating?: number, // 1-10, optional
  notes?: string,
  sourceUrl?: string,
  createdAt: number,
  updatedAt: number
}
// Indexes: by_baked_good, by_bake_date, by_rating

iterationPhotos: {
  iterationId: Id<"recipeIterations">,
  storageId: string,
  order: number,
  createdAt: number
}
// Index: by_iteration
```

### 1.2 Create Backend Functions

**File:** `packages/backend/convex/bakedGoods.ts` (new file)

**Mutations:**

- `createBakedGood` - Create new baked good
- `updateBakedGood` - Update name/description
- `deleteBakedGood` - Delete baked good (and all iterations)
- `createIteration` - Create new recipe iteration
- `updateIteration` - Update iteration fields
- `deleteIteration` - Delete iteration
- `duplicateIteration` - Copy recipe content (not rating/photos)

**Queries:**

- `listMyBakedGoods` - Get all baked goods for current user with computed stats
- `getBakedGood` - Get single baked good with stats
- `getBakedGoodWithIterations` - Get baked good with all iterations (for detail page)
- `getIteration` - Get single iteration with photos

**Photo mutations:**

- `uploadIterationPhoto` - Upload and store photo
- `deleteIterationPhoto` - Delete photo

**Rating calculations:**

- Compute average rating from all iterations
- Compute top (max) rating
- Handle cases with no ratings gracefully

### 1.3 Remove Old Backend

**File:** `packages/backend/convex/recipes.ts`

- Delete entire file (replaced by `bakedGoods.ts`)

## Phase 2: Update Existing Components

### 2.1 Update Dashboard

**File:** `apps/web/src/components/dashboard.tsx`

- Replace `api.recipes.listMyRecipes` with `api.bakedGoods.listMyBakedGoods`
- Update card display:
  - Show baked good name
  - Display "Avg: X | Best: Y" rating format
  - Show iteration count badge
  - Show last baked date
  - Show thumbnail from most recent iteration
- Update "New Recipe" link to `/baked-goods/new`
- Update empty state messaging

### 2.2 Update Sidebar

**File:** `apps/web/src/components/app-sidebar.tsx`

- Replace `api.recipes.listMyRecipes` with `api.bakedGoods.listMyBakedGoods`
- Update links from `/recipes/${id}` to `/baked-goods/${id}`
- Update "New Recipe" link to `/baked-goods/new`
- Update empty state link

### 2.3 Update Splash Page

**File:** `apps/web/src/components/splash-page.tsx`

- Replace `api.recipes.listCommunityRecipes` with new query (or remove if not needed for MVP)
- Update community showcase section to use new schema
- Or temporarily remove community recipes section if not critical

## Phase 3: Create New Routes and Pages

### 3.1 Create Baked Good Form

**File:** `apps/web/src/app/baked-goods/new/page.tsx` (new)

- Simple form with:
  - Name (required)
  - Description (optional textarea)
- Submit creates baked good and redirects to detail page
- Use Convex mutation hook

### 3.2 Create Baked Good Detail Page

**File:** `apps/web/src/app/baked-goods/[id]/page.tsx` (new)

**Layout:**

- Header: Name, description (if exists)
- Stats bar:
  - Average rating (computed)
  - Top rating (computed)
  - Total iterations count
  - Last baked date
- View toggle: List view (default) / Timeline view
- Sort dropdown: Date (newest/oldest), Rating (highest/lowest), Difficulty
- "Add Iteration" button

**List View (default):**

- Grid/list of iteration cards
- Each card shows:
  - Bake date (formatted)
  - Rating badge (if set, with color coding)
  - Difficulty indicator
  - Total time
  - Photo thumbnail(s) - first photo, indicator if more exist
  - Notes preview (truncated)
  - Actions: View, Edit, Duplicate buttons

**Timeline View (toggle):**

- Vertical timeline layout
- Iterations connected chronologically
- Same card info, different visual layout
- Can be simpler initially (just vertical list with connecting lines)

**Empty state:**

- "Add your first iteration" button
- Helpful messaging

### 3.3 Create Iteration Form

**File:** `apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx` (new)

**Form fields:**

- Recipe content: Large textarea (markdown, simple - no fancy editor)
- Difficulty: Number input or slider (1-10)
- Total time: Two inputs (hours + minutes), convert to minutes
- Bake date: Date picker (defaults to today, allows past dates)
- Rating: Optional number input (1-10)
- Notes: Optional textarea
- Source URL: Optional URL input
- Photos: Multiple file upload (drag & drop or file picker)

**Validation:**

- Recipe content required
- Difficulty 1-10
- Total time > 0
- Bake date valid
- Rating 1-10 if provided

**Submit:**

- Create iteration
- Upload photos
- Redirect to baked good detail page

### 3.4 Create Iteration Edit Page

**File:** `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx` (new)

- Same form as create, pre-filled with existing data
- Load existing photos
- Allow adding/removing photos
- Update mutation on submit

### 3.5 Create Iteration View Page (optional)

**File:** `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx` (new)

- Full iteration details
- Markdown-rendered recipe content
- All metadata displayed
- Photo gallery
- Edit and Duplicate buttons

## Phase 4: Duplication Feature

### 4.1 Duplicate Button

- Add "Duplicate" button to:
  - Iteration cards (in list view)
  - Iteration detail page (if created)

### 4.2 Duplicate Logic

**In:** `packages/backend/convex/bakedGoods.ts` - `duplicateIteration` mutation

**Copy:**

- Recipe content
- Difficulty
- Total time
- Source URL

**Don't copy:**

- Rating (cleared)
- Photos (not copied)
- Notes (cleared)

**Default:**

- Bake date: Today
- User can edit before saving

### 4.3 Duplicate Form Flow

- Click "Duplicate" → Navigate to create form with pre-filled data
- Or: Create mutation that duplicates, then redirect to edit form
- User can modify before saving

## Phase 5: Photo Management

### 5.1 Photo Upload

**In:** Iteration create/edit forms

- Multiple file upload component
- Drag & drop support
- Preview thumbnails before upload
- Upload to Convex storage
- Store in `iterationPhotos` table with order

### 5.2 Photo Display

- Gallery view on iteration detail/edit pages
- Thumbnail grid on iteration cards (first photo + count indicator)
- Lightbox for full-size viewing (optional, can use simple modal)

### 5.3 Photo Deletion

- Delete button on each photo
- Remove from storage and database

## Phase 6: Rating System

### 6.1 Rating Input Component

**File:** `apps/web/src/components/ui/rating-input.tsx` (new, optional)

- Simple 1-10 number input
- Or: Visual slider/selector
- Optional field (can be added later)

### 6.2 Rating Display

- Individual iteration: Numeric + visual indicator (color-coded)
- Baked good stats: Average and top rating prominently displayed
- Color coding: Green (8-10), Yellow (5-7), Red (1-4)

### 6.3 Rating Calculations

- Already handled in backend queries (Phase 1.2)
- Display in stats bar and cards

## Phase 7: Markdown Rendering

### 7.1 Simple Markdown Support

- Use a lightweight markdown library (e.g., `react-markdown`)
- Render in iteration view/edit pages
- Basic formatting: headers, lists, bold, italic, links
- No fancy editor - just textarea with preview toggle

## Phase 8: Migration and Cleanup

### 8.1 Migrate Seed Data

**File:** `packages/backend/convex/seed.ts`

- Update seed script to use new schema
- Convert existing 3 recipes to baked goods
- Create initial iterations for each
- Migrate photos if possible

### 8.2 Remove Old Schema References

- Ensure no remaining references to old `recipes` API
- Update any TypeScript types
- Clean up unused imports

### 8.3 Testing

- Test all CRUD operations
- Test rating calculations
- Test duplication
- Test photo upload/display
- Test date backdating
- Test empty states

## Implementation Order

1. **Phase 1** - Schema and backend (foundation)
2. **Phase 2** - Update existing components (maintain functionality)
3. **Phase 3** - Create new pages (core features)
4. **Phase 4** - Duplication (enhancement)
5. **Phase 5** - Photo management (enhancement)
6. **Phase 6** - Rating system (enhancement)
7. **Phase 7** - Markdown rendering (polish)
8. **Phase 8** - Migration and cleanup (finalize)

## Key Decisions

- **Duplication:** Copy recipe content, difficulty, time, source URL. Clear rating, notes, photos.
- **Markdown:** Simple textarea, no fancy editor initially
- **Photos:** Multiple per iteration, stored with order
- **Ratings:** 1-10 scale, optional, computed at baked good level
- **Views:** Hybrid - list default, timeline toggle
- **Old schema:** Remove entirely, migrate seed data

## Files to Create

- `packages/backend/convex/bakedGoods.ts`
- `apps/web/src/app/baked-goods/new/page.tsx`
- `apps/web/src/app/baked-goods/[id]/page.tsx`
- `apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx`
- `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx`
- `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx` (optional)
- `apps/web/src/components/ui/rating-input.tsx` (optional)

## Files to Modify

- `packages/backend/convex/schema.ts`
- `packages/backend/convex/seed.ts`
- `apps/web/src/components/dashboard.tsx`
- `apps/web/src/components/app-sidebar.tsx`
- `apps/web/src/components/splash-page.tsx`

## Files to Delete

- `packages/backend/convex/recipes.ts`
