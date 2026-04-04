"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function SplashSignInButton({
  variant = "default",
  className,
  children,
}: {
  variant?: "default" | "secondary";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <SignInButton forceRedirectUrl="/">
      <Button asChild={false} size="lg" variant={variant} className={className}>
        {children ?? (
          <>
            Go to My Bakery <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </SignInButton>
  );
}
