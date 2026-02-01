"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@bakery/backend";
import type { Id } from "@bakery/backend/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

function formatDateForInput(ts: number) {
  const d = new Date(ts);
  return d.toISOString().slice(0, 10);
}

export default function IterationEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const iterationId = params.iterationId as string;
  const iteration = useQuery(
    api.bakedGoods.getIteration,
    iterationId ? { id: iterationId as Id<"recipeIterations"> } : "skip"
  );
  const updateIteration = useMutation(api.bakedGoods.updateIteration);

  const [recipeContent, setRecipeContent] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [totalTime, setTotalTime] = useState("");
  const [bakeDate, setBakeDate] = useState("");
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (iteration && !initialized) {
      setRecipeContent(iteration.recipeContent ?? "");
      setDifficulty(iteration.difficulty ?? "Medium");
      setTotalTime(String(iteration.totalTime ?? ""));
      setBakeDate(formatDateForInput(iteration.bakeDate));
      setRating(iteration.rating != null ? String(iteration.rating) : "");
      setNotes(iteration.notes ?? "");
      setSourceUrl(iteration.sourceUrl ?? "");
      setInitialized(true);
    }
  }, [iteration, initialized]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!recipeContent.trim()) {
      setError("Recipe content is required.");
      return;
    }
    const totalTimeNum = parseInt(totalTime, 10);
    if (Number.isNaN(totalTimeNum) || totalTimeNum < 0) {
      setError("Total time must be a non-negative number (minutes).");
      return;
    }
    if (!bakeDate) {
      setError("Bake date is required.");
      return;
    }
    const bakeDateTs = new Date(bakeDate).getTime();
    if (Number.isNaN(bakeDateTs)) {
      setError("Invalid bake date.");
      return;
    }
    const ratingNum = rating ? parseInt(rating, 10) : undefined;
    if (rating !== "" && (Number.isNaN(ratingNum!) || ratingNum! < 1 || ratingNum! > 5)) {
      setError("Rating must be between 1 and 5.");
      return;
    }
    setIsSubmitting(true);
    try {
      await updateIteration({
        id: iterationId as Id<"recipeIterations">,
        recipeContent: recipeContent.trim(),
        difficulty: difficulty.trim(),
        totalTime: totalTimeNum,
        bakeDate: bakeDateTs,
        rating: ratingNum,
        notes: notes.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
      });
      router.push(`/baked-goods/${id}/iterations/${iterationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update iteration.");
      setIsSubmitting(false);
    }
  }

  if (iteration === undefined) {
    return (
      <div className="p-6 md:p-8 max-w-xl">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (iteration === null) {
    return (
      <div className="p-6 md:p-8 max-w-xl">
        <p className="text-muted-foreground">Iteration not found.</p>
        <Button variant="link" asChild>
          <Link href={id ? `/baked-goods/${id}` : "/my-bakery"}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to baked good
          </Link>
        </Button>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="p-6 md:p-8 max-w-xl">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href={`/baked-goods/${id}/iterations/${iterationId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to iteration
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Edit iteration</CardTitle>
          <CardDescription>
            Update recipe content, difficulty, timing, rating, and notes.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipeContent">Recipe content</Label>
              <textarea
                id="recipeContent"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={recipeContent}
                onChange={(e) => setRecipeContent(e.target.value)}
                placeholder="Ingredients, steps, etc."
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isSubmitting}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalTime">Total time (minutes)</Label>
              <Input
                id="totalTime"
                type="number"
                min={0}
                value={totalTime}
                onChange={(e) => setTotalTime(e.target.value)}
                placeholder="e.g. 45"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bakeDate">Bake date</Label>
              <Input
                id="bakeDate"
                type="date"
                value={bakeDate}
                onChange={(e) => setBakeDate(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (optional, 1–5)</Label>
              <Input
                id="rating"
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="1–5"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it turn out?"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceUrl">Source URL (optional)</Label>
              <Input
                id="sourceUrl"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                disabled={isSubmitting}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="outline" asChild disabled={isSubmitting}>
              <Link href={`/baked-goods/${id}/iterations/${iterationId}`}>
                Cancel
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
