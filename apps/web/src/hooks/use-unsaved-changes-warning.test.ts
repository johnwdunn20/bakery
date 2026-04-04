import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useUnsavedChangesWarning } from "./use-unsaved-changes-warning";

let confirmMock: ReturnType<typeof vi.fn<(message?: string) => boolean>>;

beforeEach(() => {
  vi.restoreAllMocks();
  confirmMock = vi.fn<(message?: string) => boolean>();
  window.confirm = confirmMock;
});

afterEach(() => {
  document.body.innerHTML = "";
});

function dispatchLinkClick(href: string, eventInit?: MouseEventInit) {
  const anchor = document.createElement("a");
  anchor.href = href;
  document.body.appendChild(anchor);
  const event = new MouseEvent("click", { bubbles: true, cancelable: true, ...eventInit });
  anchor.dispatchEvent(event);
  return event;
}

describe("useUnsavedChangesWarning", () => {
  describe("beforeunload", () => {
    it("adds a beforeunload listener when isDirty is true", () => {
      const addSpy = vi.spyOn(window, "addEventListener");

      const { unmount } = renderHook(() => useUnsavedChangesWarning(true));

      const beforeUnloadCalls = addSpy.mock.calls.filter(([e]) => e === "beforeunload");
      expect(beforeUnloadCalls.length).toBeGreaterThanOrEqual(1);

      unmount();
    });

    it("does not add a beforeunload listener when isDirty is false", () => {
      const addSpy = vi.spyOn(window, "addEventListener");

      const { unmount } = renderHook(() => useUnsavedChangesWarning(false));

      const beforeUnloadCalls = addSpy.mock.calls.filter(([e]) => e === "beforeunload");
      expect(beforeUnloadCalls).toHaveLength(0);

      unmount();
    });

    it("removes beforeunload listener on unmount", () => {
      const removeSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useUnsavedChangesWarning(true));
      unmount();

      const beforeUnloadCalls = removeSpy.mock.calls.filter(([e]) => e === "beforeunload");
      expect(beforeUnloadCalls.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("link click interception", () => {
    it("shows confirm dialog and prevents navigation when dirty and user cancels", () => {
      confirmMock.mockReturnValue(false);

      const { unmount } = renderHook(() => useUnsavedChangesWarning(true));

      const event = dispatchLinkClick("/other-page");

      expect(confirmMock).toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);

      unmount();
    });

    it("allows navigation when dirty and user confirms", () => {
      confirmMock.mockReturnValue(true);

      const { unmount } = renderHook(() => useUnsavedChangesWarning(true));

      const event = dispatchLinkClick("/other-page");

      expect(confirmMock).toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);

      unmount();
    });

    it("does not intercept when not dirty", () => {
      confirmMock.mockReturnValue(false);

      const { unmount } = renderHook(() => useUnsavedChangesWarning(false));

      const event = dispatchLinkClick("/other-page");

      expect(confirmMock).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);

      unmount();
    });

    it("ignores clicks on same-page links", () => {
      confirmMock.mockReturnValue(false);

      const { unmount } = renderHook(() => useUnsavedChangesWarning(true));

      const event = dispatchLinkClick(window.location.pathname + window.location.search);

      expect(confirmMock).not.toHaveBeenCalled();

      unmount();
    });

    it("ignores clicks with modifier keys", () => {
      confirmMock.mockReturnValue(false);

      const { unmount } = renderHook(() => useUnsavedChangesWarning(true));

      const event = dispatchLinkClick("/other-page", { metaKey: true });

      expect(confirmMock).not.toHaveBeenCalled();

      unmount();
    });
  });

  describe("multiple instances", () => {
    it("intercepts when at least one instance is dirty", () => {
      confirmMock.mockReturnValue(false);

      const { rerender, unmount } = renderHook(
        ({ d1, d2 }: { d1: boolean; d2: boolean }) => {
          useUnsavedChangesWarning(d1);
          useUnsavedChangesWarning(d2);
        },
        { initialProps: { d1: false, d2: false } }
      );

      let event = dispatchLinkClick("/page-a");
      expect(confirmMock).not.toHaveBeenCalled();

      rerender({ d1: false, d2: true });

      event = dispatchLinkClick("/page-b");
      expect(confirmMock).toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);

      unmount();
    });

    it("stops intercepting after all instances become clean", () => {
      confirmMock.mockReturnValue(false);

      const { rerender, unmount } = renderHook(
        ({ d1, d2 }: { d1: boolean; d2: boolean }) => {
          useUnsavedChangesWarning(d1);
          useUnsavedChangesWarning(d2);
        },
        { initialProps: { d1: false, d2: true } }
      );

      rerender({ d1: false, d2: false });

      const event = dispatchLinkClick("/another-page");

      expect(confirmMock).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);

      unmount();
    });
  });

  describe("cleanup", () => {
    it("removes all listeners after unmount", () => {
      const removeSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useUnsavedChangesWarning(true));
      unmount();

      const clickRemovals = removeSpy.mock.calls.filter(([e]) => e === "click");
      const popstateRemovals = removeSpy.mock.calls.filter(([e]) => e === "popstate");
      expect(clickRemovals.length).toBeGreaterThanOrEqual(1);
      expect(popstateRemovals.length).toBeGreaterThanOrEqual(1);
    });

    it("re-registers listeners on fresh mount after full teardown", () => {
      const addSpy = vi.spyOn(window, "addEventListener");

      const hook1 = renderHook(() => useUnsavedChangesWarning(true));
      hook1.unmount();

      addSpy.mockClear();

      const hook2 = renderHook(() => useUnsavedChangesWarning(true));
      const clickAdds = addSpy.mock.calls.filter(([e]) => e === "click");
      expect(clickAdds.length).toBeGreaterThanOrEqual(1);

      hook2.unmount();
    });

    it("responds to isDirty changing from false to true", () => {
      confirmMock.mockReturnValue(false);

      const { rerender, unmount } = renderHook(
        ({ dirty }: { dirty: boolean }) => useUnsavedChangesWarning(dirty),
        { initialProps: { dirty: false } }
      );

      let event = dispatchLinkClick("/test-page");
      expect(confirmMock).not.toHaveBeenCalled();

      rerender({ dirty: true });

      event = dispatchLinkClick("/test-page-2");
      expect(confirmMock).toHaveBeenCalled();

      unmount();
    });
  });
});
