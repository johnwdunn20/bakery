"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn } from "lucide-react";
import Link from "next/link";

export function SplashHeroCTA() {
  return (
    <div className="flex flex-col items-center gap-6 pt-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
      <Button
        asChild
        size="lg"
        className="h-14 sm:h-16 px-8 sm:px-10 text-lg sm:text-xl rounded-full shadow-lg shadow-primary/20"
      >
        <Link href="/">
          Go to My Bakery <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </Button>
      <div className="flex items-center gap-3">
        <SignInButton forceRedirectUrl="/">
          <Button variant="outline" className="rounded-full">
            <LogIn className="h-4 w-4 mr-1.5" />
            Sign In
          </Button>
        </SignInButton>
        <span className="text-muted-foreground text-sm">or</span>
        <SignUpButton forceRedirectUrl="/">
          <Button variant="secondary" className="rounded-full">
            Create Account
          </Button>
        </SignUpButton>
      </div>
    </div>
  );
}
