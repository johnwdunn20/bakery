# Bakery — Bug & Improvement Backlog

Issues ordered by priority. Each item includes the relevant file(s) and a brief description.

---

## Critical (Security / Data Loss)

- [x] **`getBakedGoodWithIterations` has no authorization check**
      `packages/backend/convex/bakedGoods.ts`
      Returns any user's full recipe history to anyone with a valid document ID. Add an ownership check (compare `userId` to `identity.subject`) matching the pattern already used in `getIteration`.

- [x] **`deleteBakedGood` has no cascade delete**
      `packages/backend/convex/bakedGoods.ts`
      Deletes only the parent document. Child `recipeIterations`, `iterationPhotos` records, and Convex storage blobs are permanently orphaned. Delete all children before deleting the parent.

- [x] **`deleteIteration` has no cascade delete**
      `packages/backend/convex/bakedGoods.ts`
      Iteration photos are never removed from `iterationPhotos` or Convex storage. Call `ctx.storage.delete` and `ctx.db.delete` on all associated photos first.

- [x] **`getOrCreateSystemUser` is a public mutation**
      `packages/backend/convex/users.ts`
      Any unauthenticated caller can invoke this to create records in the database. Change to `internalMutation`.

- [x] **Clerk middleware file naming**
      `apps/web/src/proxy.ts`
      Next.js now supports `proxy.ts` as the middleware filename (in addition to `middleware.ts`). The file correctly exports `clerkMiddleware()` and the `config` matcher, so edge-level auth protection is active.

---

## High (Auth, Data Integrity, Performance)

- [x] **Route protection is client-side only, and `redirect()` is misused in client components**
      `apps/web/src/app/my-bakery/page.tsx`
      `apps/web/src/app/baked-goods/layout.tsx`
      `apps/web/src/app/tools/layout.tsx`
      All three use `redirect()` from `next/navigation` inside `useEffect`. That function is designed to be called during rendering, not in a post-render side effect; use `router.replace('/')` instead. The layout files are higher impact since they gate entire route subtrees. Longer-term, move auth enforcement into middleware so it runs at the edge before any page renders.

- [x] **`syncUser` errors silently swallowed and trigger an infinite loop**
      `apps/web/src/hooks/use-current-user.ts`
      `syncUser()` is called with no `.catch()`. If it throws, the user exists in Clerk but not Convex, breaking all queries silently. The `useEffect` dependency also causes the sync to re-trigger on every render when it fails. Add error handling and a ref guard.

- [x] **No backend validation for `difficulty`, `rating`, `totalTime`, or `name`**
      `packages/backend/convex/bakedGoods.ts`
      `difficulty` is a free-form string, `rating` accepts any number (including -1 or 999), `totalTime` accepts negatives, and `name: ""` is valid. The UI constrains these but a direct API call bypasses all of it. Add `v.union` / range checks on the backend.

- [x] **`listCommunityBakedGoods` does a full table scan**
      `packages/backend/convex/bakedGoods.ts`
      `ctx.db.query("bakedGoods").collect()` loads the entire table into memory then slices to 12. Will time out as data grows. Use `.order("desc").take(12)` with an appropriate index instead.

- [x] **N+1 query patterns in `listMyBakedGoods` and `getBakedGoodWithIterations`**
      `packages/backend/convex/bakedGoods.ts`
      For every baked good, separate queries fetch all its iterations and then all photos for the most recent one. With 20 baked goods this is ~42 queries per page load (2 fixed + 2 per baked good), and `getBakedGoodWithIterations` adds another N queries for photo lookups (1 per iteration). Denormalize a `coverPhotoUrl` field or batch lookups.

- [x] **`bakeDate` timezone bug — two distinct failure modes**
      `apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx`
      `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx`
      Two separate issues: (1) **Default date initialization** — `new Date().toISOString().slice(0, 10)` uses UTC, so a US user at 9 PM PST on the 10th sees the 11th pre-filled in the form. Use local date formatting instead (e.g. `date.toLocaleDateString('en-CA')`). (2) **Stored date parsing** — `new Date("2024-01-15").getTime()` parses as UTC midnight; when displayed with `toLocaleDateString()` west of UTC the date appears one day earlier. Use `new Date(bakeDate + "T12:00:00")` to anchor to local noon.

- [x] **Iteration/edit pages fetch full `getBakedGoodWithIterations` just for the breadcrumb name**
      `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx`
      `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx`
      Loads all iterations and all their photos just to get the baked good name. Add a lightweight `getBakedGood` query instead.

- [x] **Unoptimized images throughout the app**
      `apps/web/src/components/dashboard.tsx`, iteration pages, `photo-dropzone.tsx`
      Plain `<img>` tags are used instead of Next.js `<Image>`. For a photo-heavy app this means no automatic resizing, no WebP/AVIF conversion, and no lazy loading. Swap to `<Image>` from `next/image`.

- [x] **No form validation library — manual checks only**
      All form pages (`new/page.tsx`, `edit/page.tsx`, `baked-goods/new/page.tsx`)
      Forms rely on ad-hoc `if (!field.trim())` guards. Zod schemas already exist in `packages/shared/src/validation.ts` but are unused. Integrate `react-hook-form` with `@hookform/resolvers/zod` and add domain schemas for `bakedGood` and `recipeIteration`.

- [x] **No optimistic updates on mutations**
      All components triggering `deleteBakedGood`, `updateBakedGood`, `updateIteration`, etc.
      The UI sets a loading state and waits for the server round-trip before reflecting changes. Convex supports optimistic updates in `useMutation`; adding them would make the UI feel instant and reduce perceived latency.

- [x] **Search input not debounced**
      `apps/web/src/components/dashboard.tsx`
      The search filter re-runs on every keystroke. As the baked goods list grows this will cause UI jank. Wrap the search value in a `useDebounce` hook.

---

## Medium (Logic Bugs, UX)

- [x] **`IterationCard` defined inside the render function**
      `apps/web/src/app/baked-goods/[id]/page.tsx`
      A component function defined inside another component is treated as a new type on every render, causing full unmount/remount of every card on any state change. Move to module scope.

- [x] **Lightbox `lightboxIndex` and filtered photo array are misaligned**
      `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx`
      The lightbox receives `photos.filter(p => p.url)` but `lightboxIndex` is set from the unfiltered grid index. If any photos have `url: null`, the wrong photo opens.

- [x] **`hasPrev` / `hasNext` in photo lightbox are identical**
      `apps/web/src/components/ui/photo-lightbox.tsx`
      Both variables are `photos.length > 1`, so Prev/Next always appear or disappear together regardless of current position.

- [x] **`addIterationPhoto` can create duplicate `order` values**
      `packages/backend/convex/bakedGoods.ts`
      When an explicit `order` is provided it is used without checking for conflicts with existing photo orders.

- [x] **`syncUser` stores `""` for missing emails, bypassing uniqueness checks**
      `packages/backend/convex/users.ts`
      `email ?? ""` stores an empty string when Clerk has no email. The uniqueness guard is skipped for `""`, so multiple accounts can share a blank email in the index.

- [x] **`URL.createObjectURL` never revoked after form submission**
      `apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx`
      Blob URLs are revoked on `removeSelectedFile` but not after a successful submission, leaking memory for the lifetime of the tab. Revoke all URLs on cleanup.

- [x] **Delete error in `handleDeleteBakedGood` shown in wrong place**
      `apps/web/src/app/baked-goods/[id]/page.tsx`
      Errors are written to `updateError` which only renders inside the edit Sheet. Delete errors need their own state and display location.

- [ ] **Stale `photoCount` closure in edit page photo upload**
      `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx`
      Multiple rapid uploads read a stale `photoCount` before Convex reflects the new count, potentially creating duplicate `order` values. Use a ref or re-fetch count inside the handler.

- [ ] **No error handling for photo deletion**
      `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx`
      If `deleteIterationPhoto` throws, the dialog closes silently. Show a toast or error message on failure.

- [ ] **Silent photo upload failure on new iteration form**
      `apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx`
      If a photo upload fails inside `handleSubmit`, the `catch` block marks the file as `"error"` but execution continues and `router.push(...)` is called immediately. The user is redirected away before seeing that their photo failed. Block navigation and surface the error instead.

- [ ] **Markdown XSS risk in recipe content rendering**
      `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx`
      `ReactMarkdown` renders user-supplied recipe content without `rehype-sanitize`. Add the plugin to guard against XSS, especially if HTML rendering is ever enabled.

- [ ] **Splash page has dead-end UI elements**
      `apps/web/src/components/splash-page.tsx`
      "Explore Community Bakes", all "Fork" buttons, and "View All Community Bakes" have no `onClick` or routing. The string `"Our signature **Bake Mode**..."` renders raw Markdown asterisks. Community cards show a hardcoded 🍞 emoji instead of real photos.

- [ ] **"Settings" sidebar item does nothing**
      `apps/web/src/components/app-sidebar.tsx`
      No `onClick`, no link, no route. Either wire it up or remove it.

- [ ] **Empty community baked goods list shows no message**
      `apps/web/src/components/splash-page.tsx`
      If `listCommunityBakedGoods` returns `[]`, the grid renders with zero cards and no empty state. Only the `undefined` (loading) case shows skeletons.

- [ ] **No automated tests**
      Entire codebase
      No test files exist and no test script is configured in `package.json`. The highest-risk paths — auth guards, cascade deletes, date conversion, and privacy enforcement — have zero coverage and are the most likely sources of production incidents. Add a test runner (e.g. Vitest) and start with unit tests for Convex mutations and date utilities, and integration tests for the auth/ownership checks.

---

## Low (Code Quality, Type Safety)

- [x] **`formatDate` and `formatMinutes` duplicated across three files**
      `apps/web/src/app/baked-goods/[id]/page.tsx`
      `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx`
      `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx`
      Extract to `apps/web/src/lib/format.ts`.

- [x] **`DIFFICULTIES` and `TIME_PRESETS` constants duplicated**
      `apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx`
      `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx`
      Move to `packages/shared/src/constants.ts`.

- [x] **`validation.ts` Zod schemas are dead code**
      `packages/shared/src/validation.ts`
      `emailSchema` and `paginationSchema` are never imported. No domain-level validation schemas exist for `bakedGood` or `recipeIteration`.

- [x] **`getUserByClerkId` is functionally identical to `getCurrentUser`**
      `packages/backend/convex/users.ts`
      One is dead code. Remove the duplicate.

- [x] **Raw `<textarea>` used instead of Shadcn `<Textarea>`**
      `apps/web/src/app/baked-goods/[id]/page.tsx`
      `apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx`
      `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx`
      Swap to the design-system component to avoid styling drift.

- [x] **`params.id` cast without runtime validation**
      `apps/web/src/app/baked-goods/[id]/page.tsx`
      `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx`
      `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx`
      `params.id as string` / cast to `Id<"bakedGoods">` with no null/undefined guard.

- [x] **`index` used as React `key` for file preview list**
      `apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx`
      `key={index}` causes incorrect diffing when a file is removed from the middle. Use `file.name + file.size` or a stable generated ID.

- [x] **`NEXT_PUBLIC_CONVEX_URL!` gives cryptic error if missing**
      `apps/web/src/app/providers.tsx`
      Replace the non-null assertion with an explicit guard and a helpful error message.

- [x] **`auth.config.ts` gives no guidance if `CLERK_JWT_ISSUER_DOMAIN` is undefined**
      `packages/backend/convex/auth.config.ts`
      If the env var is missing, JWT validation fails with a confusing error. Add a startup guard.

- [x] **`BakersMathCalculator` allows zero/negative flour values**
      `apps/web/src/components/bakers-math-calculator.tsx`
      No `min` constraint on the flour input; results become zero or negative. Add `min="1"` and a guard.

- [x] **`group-hover` used without a `group` parent class**
      `apps/web/src/components/dashboard.tsx`
      The hover color on the "Add new" icon circle never triggers because no ancestor has the `group` Tailwind class.

- [x] **No unsaved changes warning on edit/new forms**
      `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/edit/page.tsx`
      `apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx`
      Navigating away loses all progress with no confirmation prompt.

- [x] **Sidebar baked goods list has no pagination**
      `apps/web/src/components/app-sidebar.tsx`
      All baked goods render simultaneously. With 100+ items the list becomes unwieldy. Add pagination or a search/filter.
