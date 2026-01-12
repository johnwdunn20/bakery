"use client";

import { useCurrentUser } from "@/hooks/use-current-user";

/**
 * Component that syncs the authenticated user to Convex.
 * Place this in your layout to automatically sync users on sign-in.
 * Renders nothing - just handles the sync logic.
 */
export function UserSync() {
  // This hook handles syncing the user to Convex
  useCurrentUser();
  return null;
}
