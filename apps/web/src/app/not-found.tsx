"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-lg font-bold mb-8">
        B
      </div>

      <h1 className="text-8xl sm:text-9xl font-extrabold tracking-tighter text-primary/15 select-none">
        404
      </h1>

      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">Page not found</h2>

      <p className="text-muted-foreground mt-3 max-w-md text-base sm:text-lg">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Head back home to get
        back on track.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="rounded-full px-8"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
