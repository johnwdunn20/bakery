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
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  useEffect(() => {
    // Wait for Clerk to load and confirm user is signed in
    // Sync to Convex if user doesn't exist in database yet
    if (isLoaded && isSignedIn && user === null) {
      getOrCreateUser();
    }
  }, [isLoaded, isSignedIn, user, getOrCreateUser]);

  return {
    user,
    isLoading: !isLoaded || (isSignedIn && user === undefined),
    isSignedIn,
  };
}
