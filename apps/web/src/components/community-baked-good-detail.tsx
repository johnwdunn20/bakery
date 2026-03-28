"use client";

import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@bakery/backend";
import type { Id } from "@bakery/backend/dataModel";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChefHat, ArrowLeft, Clock, Star, Calendar } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatMinutes } from "@/lib/format";

const markdownComponents: Components = {
  h1: ({ children }) => <h1 className="mt-6 mb-3 text-2xl font-bold first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-5 mb-2 text-xl font-bold">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-4 mb-2 text-lg font-semibold">{children}</h3>,
  p: ({ children }) => <p className="mb-3 leading-relaxed last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 list-disc pl-6 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal pl-6 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  code: ({ className, children, ...props }) => (
    <code className={className ?? "rounded bg-muted px-1.5 py-0.5 font-mono text-sm"} {...props}>
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[difficulty] ?? "bg-muted text-muted-foreground"}`}
    >
      {difficulty}
    </span>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export function CommunityBakedGoodDetail({ id }: { id: string }) {
  const { isSignedIn } = useAuth();
  const bakedGood = useQuery(api.bakedGoods.getCommunityBakedGoodWithIterations, {
    id: id as Id<"bakedGoods">,
  });
  const forkBakedGood = useMutation(api.bakedGoods.forkBakedGood);
  const router = useRouter();

  async function handleFork() {
    if (!isSignedIn) {
      toast.error("Sign in to fork recipes to your bakery");
      return;
    }
    try {
      const newId = await forkBakedGood({ id: id as Id<"bakedGoods"> });
      toast.success(`Forked "${bakedGood?.name}" to your bakery!`);
      router.push(`/baked-goods/${newId}`);
    } catch {
      toast.error("Failed to fork recipe. Please try again.");
    }
  }

  if (bakedGood === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-6 w-96 mb-8" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (bakedGood === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="text-4xl mb-4">🍞</div>
        <h1 className="text-2xl font-bold mb-2">Recipe not found</h1>
        <p className="text-muted-foreground mb-6">
          This recipe may have been removed or made private.
        </p>
        <Button asChild variant="outline">
          <Link href="/community">Back to Community</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/community">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Community Bakes
          </Link>
        </Button>
      </div>

      <header className="mb-8 space-y-4">
        {bakedGood.coverPhotoUrl && (
          <div className="relative h-48 sm:h-72 rounded-2xl overflow-hidden bg-muted">
            <Image
              src={bakedGood.coverPhotoUrl}
              alt={bakedGood.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{bakedGood.name}</h1>
            {bakedGood.description && (
              <p className="text-lg text-muted-foreground mt-2">{bakedGood.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                {bakedGood.authorName.charAt(0)}
              </div>
              <span className="text-sm font-medium">{bakedGood.authorName}</span>
            </div>
          </div>
          <Button onClick={handleFork} size="lg" className="shrink-0">
            <ChefHat className="mr-2 h-5 w-5" />
            Fork to My Bakery
          </Button>
        </div>

        {(bakedGood.avgRating != null || bakedGood.iterationCount > 0) && (
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {bakedGood.avgRating != null && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{bakedGood.avgRating.toFixed(1)} avg rating</span>
              </div>
            )}
            <span>
              {bakedGood.iterationCount}{" "}
              {bakedGood.iterationCount === 1 ? "iteration" : "iterations"}
            </span>
          </div>
        )}
      </header>

      {bakedGood.iterations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No recipe iterations have been shared yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {bakedGood.iterations.map((iteration, index) => (
            <Card key={iteration._id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-lg">
                    {bakedGood.iterations.length > 1
                      ? `Iteration ${bakedGood.iterations.length - index}`
                      : "Recipe"}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <DifficultyBadge difficulty={iteration.difficulty} />
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatMinutes(iteration.totalTime)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDate(iteration.bakeDate)}</span>
                    </div>
                    {iteration.rating != null && <RatingStars rating={iteration.rating} />}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {iteration.firstPhotoUrl && (
                  <div className="relative h-48 rounded-xl overflow-hidden bg-muted">
                    <Image
                      src={iteration.firstPhotoUrl}
                      alt="Bake result"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 768px"
                    />
                  </div>
                )}
                <div className="prose-recipe min-w-0">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {iteration.recipeContent}
                  </ReactMarkdown>
                </div>
                {iteration.notes && (
                  <div className="rounded-lg bg-muted/50 border p-4">
                    <p className="text-sm font-medium mb-1">Baker&apos;s Notes</p>
                    <p className="text-sm text-muted-foreground">{iteration.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
