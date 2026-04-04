"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@bakery/backend";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

/**
 * Hook to get the current user from Convex, syncing from Clerk on first access.
 * Automatically creates/updates the user in Convex when they sign in.
 */
export function useCurrentUser() {
  const { isSignedIn, isLoaded } = useAuth();
  const user = useQuery(api.users.getCurrentUser);
  const syncUser = useMutation(api.users.syncUser);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (isLoaded && isSignedIn && user === null && !hasSynced.current) {
      hasSynced.current = true;
      syncUser().catch((err) => {
        console.error("Failed to sync user:", err);
      });
    }
  }, [isLoaded, isSignedIn, user, syncUser]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      hasSynced.current = false;
    }
  }, [isLoaded, isSignedIn]);

  return {
    user,
    isLoading: !isLoaded || (isSignedIn && user === undefined),
    isSignedIn,
  };
}
