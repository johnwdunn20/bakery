"use client";

import { useRef, useState } from "react";
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

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function NewIterationPage() {
  const params = useParams();
  const router = useRouter();
  const bakedGoodId = params.id as string;
  const bakedGood = useQuery(
    api.bakedGoods.getBakedGoodWithIterations,
    bakedGoodId ? { id: bakedGoodId as Id<"bakedGoods"> } : "skip"
  );
  const createIteration = useMutation(api.bakedGoods.createIteration);
  const generateUploadUrl = useMutation(api.bakedGoods.generateUploadUrl);
  const addIterationPhoto = useMutation(api.bakedGoods.addIterationPhoto);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [recipeContent, setRecipeContent] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [totalTime, setTotalTime] = useState("");
  const [bakeDate, setBakeDate] = useState(new Date().toISOString().slice(0, 10));
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const files = photoInputRef.current?.files;
    try {
      const newId = await createIteration({
        bakedGoodId: bakedGoodId as Id<"bakedGoods">,
        recipeContent: recipeContent.trim(),
        difficulty: difficulty.trim(),
        totalTime: totalTimeNum,
        bakeDate: bakeDateTs,
        rating: ratingNum,
        notes: notes.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
      });
      if (files?.length) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const uploadUrl = await generateUploadUrl();
          const response = await fetch(uploadUrl, { method: "POST", body: file });
          if (!response.ok) throw new Error("Upload failed");
          const { storageId } = (await response.json()) as { storageId: string };
          await addIterationPhoto({
            iterationId: newId,
            storageId: storageId as Id<"_storage">,
            order: i,
          });
        }
      }
      router.push(`/baked-goods/${bakedGoodId}/iterations/${newId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create iteration.");
      setIsSubmitting(false);
    }
  }

  if (bakedGood === undefined) {
    return (
      <div className="p-6 md:p-8 max-w-xl">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (bakedGood === null) {
    return (
      <div className="p-6 md:p-8 max-w-xl">
        <p className="text-muted-foreground">Baked good not found.</p>
        <Button variant="link" asChild>
          <Link href="/my-bakery">Back to My Bakery</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Add iteration</CardTitle>
          <CardDescription>
            Record a bake of <strong>{bakedGood.name}</strong>. Recipe content, difficulty, total time, and bake date are required.
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
              <div className="flex gap-2">
                <Input
                  id="bakeDate"
                  type="date"
                  value={bakeDate}
                  onChange={(e) => setBakeDate(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => setBakeDate(new Date().toISOString().slice(0, 10))}
                >
                  Today
                </Button>
              </div>
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
            <div className="space-y-2">
              <Label htmlFor="photo-upload">Photos (optional)</Label>
              <input
                ref={photoInputRef}
                id="photo-upload"
                type="file"
                accept="image/*"
                multiple
                disabled={isSubmitting}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:text-sm file:font-medium"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Add iteration"}
            </Button>
            <Button type="button" variant="outline" asChild disabled={isSubmitting}>
              <Link href={`/baked-goods/${bakedGoodId}`}>Cancel</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
