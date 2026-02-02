---
name: atomic_baked_goods_phases_greenfield
overview: "Atomic vertical-slice plan for baked goods + recipe iterations in a greenfield setup: we can delete old recipes schema/API immediately, and each phase leaves the app fully functional with the new feature shipped."
todos:
  - id: phase-1-schema-core-baked-good-crud
    content: Delete old recipes schema/API and ship baked good CRUD with dashboard/sidebar navigation on new schema.
    status: pending
  - id: phase-2-iterations-create-list-stats
    content: Ship iteration create + list on baked good detail, including computed stats (avg/best/last baked).
    status: pending
  - id: phase-3-iteration-view-edit-markdown
    content: Ship iteration view/edit pages and markdown rendering for recipe content.
    status: pending
  - id: phase-4-duplicate-iteration
    content: Ship duplicate iteration workflow (copy recipe fields, clear results fields).
    status: pending
  - id: phase-5-photos
    content: Ship photo upload/display/delete for iterations using Convex storage + iterationPhotos.
    status: pending
  - id: phase-6-timeline-sorting
    content: Ship list/timeline toggle and sorting on baked good detail page.
    status: pending
isProject: false
---

# Baked Goods + Recipe Iterations

## Goal

Replace the existing `recipes`/`variants` schema with `bakedGoods`/`recipeIterations`/`iterationPhotos` and implement the baked-goods/iterations product in **atomic vertical slices**. Because this is **greenfield**, we can **delete old data and old APIs immediately** (no migration/switch-over strategy needed).

## Repo conventions to follow

- Convex schema: `[packages/backend/convex/schema.ts](packages/backend/convex/schema.ts)`
- Convex functions: `[packages/backend/convex/*.ts](packages/backend/convex/)`
- Web imports:
- Convex API: `import { api } from "@bakery/backend"`
- Shadcn UI: `@/components/ui/*`

---

## Phase 1 — New schema + core navigation + baked good CRUD (minimal but real)

**User-visible feature:** The app’s main “My bakery” experience lets you create baked goods and view their (empty) detail page.

- **Backend (Convex)**
- Update `[packages/backend/convex/schema.ts](packages/backend/convex/schema.ts)`
- Remove old tables: `recipes`, `variants`, `ingredients` (and any related indexes)
- Add new tables:
- `bakedGoods` (authorId, name, description?, createdAt, updatedAt)
- `recipeIterations` (bakedGoodId, recipeContent, difficulty, totalTime, bakeDate, rating?, notes?, sourceUrl?, createdAt, updatedAt)
- `iterationPhotos` (iterationId, storageId, order, createdAt)
- Add `[packages/backend/convex/bakedGoods.ts](packages/backend/convex/bakedGoods.ts)`
- Mutations: `createBakedGood`, `updateBakedGood`, `deleteBakedGood`
- Queries: `listMyBakedGoods`, `getBakedGood` (or `getBakedGoodWithIterations` returning empty iterations initially)
- Delete old functions file: `[packages/backend/convex/recipes.ts](packages/backend/convex/recipes.ts)`
- **Web (Next.js)**
- Update existing entrypoints to use baked goods:
- `[apps/web/src/components/dashboard.tsx](apps/web/src/components/dashboard.tsx)`
- `[apps/web/src/components/app-sidebar.tsx](apps/web/src/components/app-sidebar.tsx)`
- Add pages:
- `[apps/web/src/app/baked-goods/new/page.tsx](apps/web/src/app/baked-goods/new/page.tsx)` (name/description form)
- `[apps/web/src/app/baked-goods/[id]/page.tsx](apps/web/src/app/baked-goods/[id]/page.tsx)` (shows name/description + “Add iteration” CTA, but can be empty)

**Definition of done / smoke test**

- Dashboard lists baked goods (or a clean empty state).
- Create baked good → redirects to detail page.
- Sidebar links work; no runtime references to `api.recipes.*` remain.

---

## Phase 2 — Iterations: create + list on baked good detail (core workflow)

**User-visible feature:** Users can add recipe iterations (with bake date/time/difficulty/rating) and see them on the baked good page.

- **Backend**
- In `[packages/backend/convex/bakedGoods.ts](packages/backend/convex/bakedGoods.ts)`
- Mutations: `createIteration`, `updateIteration` (optional), `deleteIteration`
- Query: `getBakedGoodWithIterations`
- Compute baked good stats in the query response (iteration count, avg rating, best rating, last baked date) — handle “no ratings” cleanly.
- **Web**
- Add page:
- `[apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx)`
- Update baked good detail page to:
- Show stats bar (avg/best/iteration count/last baked)
- Show iteration cards (date, rating badge if present, difficulty, total time)

**Definition of done / smoke test**

- Add iteration → appears immediately on baked good detail page.
- Stats update correctly as iterations are added.

---

## Phase 3 — Iteration view/edit + markdown rendering (make recipe content readable)

**User-visible feature:** Users can open an iteration to see full details (recipe rendered as markdown) and edit it.

- **Backend**
- Add queries: `getIteration` (include photos list even if unused yet)
- Ensure `updateIteration` supports all iteration fields.
- **Web**
- Add pages:
- `[apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx)`
- `[apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx](apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx)`
- Add markdown rendering for `recipeContent` (e.g. `react-markdown`).

**Definition of done / smoke test**

- View iteration renders markdown content.
- Edit iteration saves and updates view + baked-good stats.

---

## Phase 4 — Duplicate iteration (fast workflow)

**User-visible feature:** Duplicate an iteration into a new iteration draft with fields pre-filled.

- **Backend**
- Add mutation: `duplicateIteration` (copy recipeContent, difficulty, totalTime, sourceUrl; clear rating/notes/photos; bakeDate defaults to today).
- **Web**
- Add “Duplicate” action on iteration cards and/or iteration view.
- Duplicate → navigates to create form prefilled OR creates immediately and routes to edit.

**Definition of done / smoke test**

- Duplicate produces a new iteration with the correct copied/cleared fields.

---

## Phase 5 — Photos: upload + display + delete

**User-visible feature:** Attach multiple photos to an iteration and manage them.

- **Backend**
- Implement storage + `iterationPhotos` mutations/queries:
- upload/add photo (store storageId + order)
- delete photo (remove record + storage)
- **Web**
- Add multi-upload UI to iteration create/edit.
- Show gallery on iteration view; show thumbnail indicator on iteration cards.

**Definition of done / smoke test**

- Upload photos and see them on the iteration view.
- Delete photo removes it everywhere.

---

## Phase 6 — Hybrid list/timeline + sorting (polish)

**User-visible feature:** Users can switch list vs timeline view and sort iterations.

- **Web**
- On `[apps/web/src/app/baked-goods/[id]/page.tsx](apps/web/src/app/baked-goods/[id]/page.tsx)`
- Toggle list/timeline
- Sort by date and rating at minimum

**Definition of done / smoke test**

- Toggle works, sorting works, and actions (view/edit/duplicate) still work in both modes.
