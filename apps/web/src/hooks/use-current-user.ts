"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@bakery/backend";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

/**
 * Hook to get the current user from Convex, syncing from Clerk on first access.
 * Automatically creates/updates the user in Convex when they sign in.
 */
export function useCurrentUser() {
  const { isSignedIn, isLoaded } = useAuth();
  const user = useQuery(api.users.getCurrentUser);
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    // Sync user to Convex when signed in but not yet in database
    if (isLoaded && isSignedIn && user === null) {
      syncUser();
    }
  }, [isLoaded, isSignedIn, user, syncUser]);

  return {
    user,
    isLoading: !isLoaded || (isSignedIn && user === undefined),
    isSignedIn,
  };
}
