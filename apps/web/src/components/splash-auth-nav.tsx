"use client";

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogIn } from "lucide-react";

export function SplashAuthNav() {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <ThemeToggle />
      <SignedOut>
        <SignInButton forceRedirectUrl="/">
          <Button variant="outline" size="sm" className="sm:size-default">
            <LogIn className="h-4 w-4 mr-1.5" />
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton forceRedirectUrl="/">
          <Button size="sm" className="sm:size-default">
            Get Started
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
