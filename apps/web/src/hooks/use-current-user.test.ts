import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockSyncUser = vi.fn().mockResolvedValue(undefined);

vi.mock("@clerk/nextjs", () => ({
  useAuth: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: () => mockSyncUser,
}));

vi.mock("@bakery/backend", () => ({
  api: { users: { getCurrentUser: "getCurrentUser", syncUser: "syncUser" } },
}));

import { useCurrentUser } from "./use-current-user";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";

const mockUseAuth = vi.mocked(useAuth);
const mockUseQuery = vi.mocked(useQuery);

beforeEach(() => {
  vi.clearAllMocks();
  mockSyncUser.mockResolvedValue(undefined);
});

describe("useCurrentUser", () => {
  it("reports loading when auth has not loaded", () => {
    mockUseAuth.mockReturnValue({ isLoaded: false, isSignedIn: undefined } as never);
    mockUseQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSignedIn).toBeUndefined();
  });

  it("reports not loading when signed out", () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
    mockUseQuery.mockReturnValue(undefined);

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.user).toBeUndefined();
  });

  it("returns user when signed in and user exists in DB", () => {
    const fakeUser = { _id: "u1", username: "baker" };
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
    mockUseQuery.mockReturnValue(fakeUser);

    const { result } = renderHook(() => useCurrentUser());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.user).toEqual(fakeUser);
    expect(mockSyncUser).not.toHaveBeenCalled();
  });

  it("triggers syncUser when signed in but user is null", () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
    mockUseQuery.mockReturnValue(null);

    renderHook(() => useCurrentUser());

    expect(mockSyncUser).toHaveBeenCalledOnce();
  });

  it("re-triggers syncUser after sign-out and sign-in", () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
    mockUseQuery.mockReturnValue(null);

    const { rerender } = renderHook(() => useCurrentUser());
    expect(mockSyncUser).toHaveBeenCalledOnce();

    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: false } as never);
    mockUseQuery.mockReturnValue(undefined);
    rerender();

    mockSyncUser.mockClear();

    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: true } as never);
    mockUseQuery.mockReturnValue(null);
    rerender();

    expect(mockSyncUser).toHaveBeenCalledOnce();
  });
});
