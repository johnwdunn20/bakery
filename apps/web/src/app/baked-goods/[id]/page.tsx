"use client";

import { useQuery } from "convex/react";
import { api } from "@bakery/backend";
import type { Id } from "@bakery/backend/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMinutes(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export default function BakedGoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const bakedGood = useQuery(
    api.bakedGoods.getBakedGoodWithIterations,
    id ? { id: id as Id<"bakedGoods"> } : "skip"
  );

  if (bakedGood === undefined) {
    return (
      <div className="p-6 md:p-8 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (bakedGood === null) {
    return (
      <div className="p-6 md:p-8 max-w-2xl">
        <p className="text-muted-foreground">Baked good not found.</p>
        <Button variant="link" onClick={() => router.push("/my-bakery")}>
          Back to My Bakery
        </Button>
      </div>
    );
  }

  const iterations = bakedGood.iterations ?? [];
  const iterationCount = bakedGood.iterationCount ?? 0;
  const avgRating = bakedGood.avgRating ?? null;
  const bestRating = bakedGood.bestRating ?? null;
  const lastBakedDate = bakedGood.lastBakedDate ?? null;

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{bakedGood.name}</h1>
        {bakedGood.description && (
          <p className="text-muted-foreground mt-1">{bakedGood.description}</p>
        )}
      </div>

      {iterationCount > 0 && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>{iterationCount} {iterationCount === 1 ? "iteration" : "iterations"}</span>
          {avgRating != null && <span>Avg {avgRating.toFixed(1)}</span>}
          {bestRating != null && <span>Best {bestRating}</span>}
          <span>
            {lastBakedDate != null
              ? `Last baked ${formatDate(lastBakedDate)}`
              : "Never baked"}
          </span>
        </div>
      )}

      <Card>
        <CardHeader className={iterations.length > 0 ? "flex flex-row items-start justify-between space-y-0" : undefined}>
          <div>
            <CardTitle>Iterations</CardTitle>
            <CardDescription>
              Recipe iterations track each time you bake this good—ingredients, timing, and notes.
            </CardDescription>
          </div>
          {iterations.length > 0 && (
            <Button asChild size="sm">
              <Link href={`/baked-goods/${id}/iterations/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add iteration
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {iterations.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground mb-4">No iterations yet.</p>
              <Button asChild>
                <Link href={`/baked-goods/${id}/iterations/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add iteration
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {iterations.map((it) => (
                <li key={it._id}>
                  <Card className="border bg-card">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">{formatDate(it.bakeDate)}</span>
                        {it.rating != null && (
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary font-medium">
                            {it.rating}/5
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          {it.difficulty} · {formatMinutes(it.totalTime)}
                        </span>
                      </div>
                      {(it.recipeContent || it.notes) && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {it.notes?.trim() || it.recipeContent?.trim().split("\n")[0] || ""}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
