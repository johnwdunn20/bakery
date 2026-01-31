"use client";

import { useCurrentUser } from "@/hooks";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserButton } from "@clerk/nextjs";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function BakedGoodsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isSignedIn } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      redirect("/");
    }
  }, [isLoading, isSignedIn]);

  if (isLoading || !isSignedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/20 animate-pulse" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1">
            <h1 className="font-semibold">My Bakery</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserButton />
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
