# Bakery — Bug & Improvement Backlog

Issues ordered by priority. Each item includes the relevant file(s) and a brief description.

---

## New Regressions Introduced in This Branch

- [x] **`IterationCard` uses raw `<img>` instead of `next/image`**
      `apps/web/src/app/baked-goods/[id]/page.tsx` (line 93)
      The branch moved `IterationCard` to module scope (good), but the thumbnail still uses a raw `<img>` tag. This was already flagged as an issue — the fix was applied elsewhere (community detail, cover photos) but missed here. The new iteration page photo preview (`iterations/new/page.tsx` line 408) has the same issue.

- [x] **`PublicBakedGoodDetail` is dead code with a broken fork button**
      `apps/web/src/components/public-baked-good-detail.tsx`
      This component is never imported anywhere. Its "Fork Recipe" button has no `onClick` handler — clicking it does nothing. Either wire it into a route or delete it. The community detail page uses `CommunityBakedGoodDetail` instead, making this file orphaned.

- [x] **`useCurrentUser` `hasSynced` ref is never reset on sign-out**
      `apps/web/src/hooks/use-current-user.ts`
      If user A signs in, `hasSynced.current` becomes `true`. If A signs out and user B signs in, `hasSynced` is still `true`, so `syncUser()` never runs for B. The Convex user record for B may never be created. Reset the ref when `isSignedIn` transitions to `false`.

- [ ] **`useUnsavedChangesWarning` monkey-patches `history.pushState`/`replaceState` globally**
      `apps/web/src/hooks/use-unsaved-changes-warning.ts`
      The hook globally overrides `history.pushState` and `history.replaceState` in its effect. If multiple forms mount simultaneously, the patches stack and are restored incorrectly on unmount (LIFO vs actual teardown order). More critically, this interacts poorly with Next.js App Router's internal use of the History API — potential for double prompts, swallowed navigations, or infinite loops. Consider a router-aware approach (e.g. `router.events` / `onBeforeRouteChange`) or a context-based solution instead.

- [x] **`listCommunityBakedGoods` fallback photo uses document order, not `bakeDate`**
      `packages/backend/convex/bakedGoods.ts`
      When a baked good has no `coverPhotoStorageId`, the query fetches the "latest" iteration via `.order("desc").first()` on the `by_baked_good` index, which orders by Convex internal document ID (insertion order), not `bakeDate`. Elsewhere (e.g. `listMyBakedGoods`, `getCommunityBakedGoodWithIterations`), iterations are sorted by `bakeDate`. The community grid thumbnail may show a photo from the wrong iteration.

- [ ] **`forkBakedGood` copies iterations without photos or `firstPhotoStorageId`**
      `packages/backend/convex/bakedGoods.ts`
      Forked iterations omit `firstPhotoStorageId` and don't copy `iterationPhotos` rows or storage blobs. The forked baked good will have no cover photo and no iteration thumbnails, even if the source had them. This may be intentional (storage cost), but should be documented or the user should be told photos won't be copied.

- [ ] **Unused `ChefHat` import in info layout**
      `apps/web/src/app/(info)/layout.tsx`
      `ChefHat` is imported from `lucide-react` but never used — dead import.

- [ ] **Splash hero CTA has redundant sign-in buttons for signed-out users**
      `apps/web/src/components/splash-hero-cta.tsx`
      When signed out, users see both a large "Go to My Bakery" `SignInButton` _and_ a separate "Sign In" / "Create Account" row — three sign-in triggers at once. The "Go to My Bakery" label is misleading for unauthenticated users (it triggers sign-in, not navigation). Simplify to one clear CTA for signed-out state.

- [ ] **Retrying new iteration after photo upload failure can create duplicate iterations**
      `apps/web/src/app/baked-goods/[id]/iterations/new/page.tsx`
      `createIteration` runs before photo uploads. If any upload fails, the form stays on page and retrying submit creates another iteration record. Move iteration creation after successful uploads, or add a retry flow that reuses the created iteration.

---

## Medium (Logic Bugs, UX)

- [ ] **Markdown rendering lacks explicit sanitization hardening**
      `apps/web/src/app/baked-goods/[id]/iterations/[iterationId]/page.tsx`
      `apps/web/src/components/community-baked-good-detail.tsx`
      Current `react-markdown` usage is generally safe without `rehype-raw`, but add an explicit sanitization policy as defense-in-depth (especially before any future raw HTML support).

- [ ] **Splash page `**Bake Mode**` renders raw Markdown asterisks**
      `apps/web/src/components/splash-page.tsx` (line 131)
      The string `"Our signature **Bake Mode** is designed for..."` is in JSX, not a Markdown renderer — the asterisks render literally. Wrap "Bake Mode" in `<strong>` instead.

- [ ] **Splash page `aspect-9/16` is not a default Tailwind class**
      `apps/web/src/components/splash-page.tsx` (line 149)
      Tailwind CSS does not include `aspect-9/16` by default. This should be `aspect-[9/16]` (arbitrary value syntax) or defined in the Tailwind config. The Bake Mode phone mockup may not have the intended aspect ratio.

- [ ] **Splash community CTA still shows when there are no community bakes**
      `apps/web/src/components/splash-community-showcase.tsx`
      The empty state message now exists, but "View All Community Bakes" still renders when the list is empty. Hide that CTA unless `communityBakedGoods.length > 0`.

- [ ] **Community detail page has no per-page metadata / OG tags**
      `apps/web/src/app/(info)/community/[id]/page.tsx`
      No `generateMetadata` export — every community recipe shares the same generic title/description. For SEO and link previews, generate metadata from the baked good name/description.

- [ ] **Test coverage is minimal**
      Tests were added for `format.ts`, `sort-iterations.ts`, `use-current-user.ts`, `constants.ts`, `bakedGoods.ts` (backend), and `seed.ts`. However, there's no coverage for the new `searchMyBakedGoods`, `listMyBakedGoodsPaginated`, `getPublicBakedGood`, `addIterationPhoto` order collision, or the `useUnsavedChangesWarning` hook. Auth guards, cascade deletes, and privacy enforcement still have minimal coverage.

---

## Low (Code Quality, Type Safety)

- [ ] **`BakersMathCalculator` allows `NaN` from cleared flour input**
      `apps/web/src/components/bakers-math-calculator.tsx`
      `min={1}` was added to the input, but `Number(e.target.value)` can still produce `NaN` (when the field is cleared). `NaN` propagates into `factor` and breaks all percentage calculations. Add a guard: `setTotalFlour(Math.max(1, n || 1))` or similar.

- [ ] **`formatMinutes` does not guard against negative or `NaN` input**
      `apps/web/src/lib/format.ts`
      If bad data reaches the formatter (e.g. `-30` or `NaN`), the output is nonsensical (`"-30 min"` or `"NaN min"`). Add a floor/clamp.
