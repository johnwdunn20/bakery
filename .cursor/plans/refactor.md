# Bakery — Bug & Improvement Backlog

Issues ordered by priority. Each item includes the relevant file(s) and a brief description.

---

## Medium (Logic Bugs, UX)

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
