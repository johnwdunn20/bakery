"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@bakery/backend";
import { useRouter } from "next/navigation";
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

export default function NewBakedGoodPage() {
  const router = useRouter();
  const createBakedGood = useMutation(api.bakedGoods.createBakedGood);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setIsSubmitting(true);
    try {
      const id = await createBakedGood({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      router.push(`/baked-goods/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create baked good.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>New Baked Good</CardTitle>
          <CardDescription>
            Add a new baked good to your journal. You can add recipe iterations later.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Classic Sourdough"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short description"
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create Baked Good"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
