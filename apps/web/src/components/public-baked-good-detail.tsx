"use client";

import { useQuery } from "convex/react";
import { api } from "@bakery/backend";
import type { Id } from "@bakery/backend/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export function PublicBakedGoodDetail({ id }: { id: Id<"bakedGoods"> }) {
  const bakedGood = useQuery(api.bakedGoods.getPublicBakedGood, { id });

  if (bakedGood === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="space-y-6">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          <div className="h-64 bg-muted animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (bakedGood === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This recipe may have been made private or removed.
        </p>
        <Button asChild variant="outline">
          <Link href="/community">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Link>
        </Button>
      </div>
    );
  }

  const createdDate = new Date(bakedGood.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/community">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Community Bakes
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl sm:text-3xl font-bold">{bakedGood.name}</CardTitle>
              {bakedGood.description && (
                <p className="text-muted-foreground text-lg">{bakedGood.description}</p>
              )}
            </div>
            <Button variant="outline" size="sm" className="shrink-0">
              <ChefHat className="mr-2 h-4 w-4" />
              Fork Recipe
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                {bakedGood.authorName.charAt(0)}
              </div>
              <span className="font-medium">{bakedGood.authorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{createdDate}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl bg-muted/50 p-8 text-center text-muted-foreground">
            <p className="text-lg">Sign in to fork this recipe and start your own experiments.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
