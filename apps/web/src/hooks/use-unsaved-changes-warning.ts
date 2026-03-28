import { useEffect, useRef } from "react";

const MESSAGE = "You have unsaved changes. Are you sure you want to leave?";

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
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = function (...args: Parameters<typeof history.pushState>) {
      if (isDirtyRef.current && !window.confirm(MESSAGE)) return;
      originalPushState(...args);
    };

    history.replaceState = function (...args: Parameters<typeof history.replaceState>) {
      if (isDirtyRef.current && !window.confirm(MESSAGE)) return;
      originalReplaceState(...args);
    };

    function handlePopState() {
      if (isDirtyRef.current) {
        if (!window.confirm(MESSAGE)) {
          // Push current state back to undo the back/forward navigation
          originalPushState(null, "", window.location.href);
        }
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
}
