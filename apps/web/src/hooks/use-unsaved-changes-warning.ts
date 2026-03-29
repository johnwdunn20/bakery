import { useEffect, useRef } from "react";

const MESSAGE = "You have unsaved changes. Are you sure you want to leave?";

const dirtyCheckers = new Set<() => boolean>();
let listenerCount = 0;
let savedHref = "";
let suppressPopState = false;

function isAnyDirty(): boolean {
  for (const check of dirtyCheckers) {
    if (check()) return true;
  }
  return false;
}

function handleLinkClick(e: MouseEvent) {
  if (!isAnyDirty()) return;

  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  const anchor = (e.target as HTMLElement).closest?.("a");
  if (!anchor) return;

  const href = anchor.getAttribute("href");
  if (!href) return;
  if (anchor.getAttribute("target") === "_blank") return;

  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return;
  } catch {
    return;
  }

  if (!window.confirm(MESSAGE)) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function handlePopState() {
  if (suppressPopState) {
    suppressPopState = false;
    return;
  }

  if (!isAnyDirty()) {
    savedHref = window.location.href;
    return;
  }

  if (window.confirm(MESSAGE)) {
    savedHref = window.location.href;
    return;
  }

  // User cancelled — restore the URL and ask Next.js App Router to re-render.
  history.pushState(null, "", savedHref);
  suppressPopState = true;
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function attachListeners() {
  if (listenerCount === 0) {
    savedHref = window.location.href;
    window.addEventListener("click", handleLinkClick, { capture: true });
    window.addEventListener("popstate", handlePopState);
  }
  listenerCount++;
}

function detachListeners() {
  listenerCount--;
  if (listenerCount === 0) {
    window.removeEventListener("click", handleLinkClick, { capture: true });
    window.removeEventListener("popstate", handlePopState);
  }
}

export function useUnsavedChangesWarning(isDirty: boolean) {
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const checker = () => isDirtyRef.current;
    dirtyCheckers.add(checker);
    attachListeners();

    return () => {
      dirtyCheckers.delete(checker);
      detachListeners();
    };
  }, []);
}
