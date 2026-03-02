"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { bakedGoodSchema } from "@bakery/shared/validation";
import { useMutation } from "convex/react";
import { api } from "@bakery/backend";
import { useRouter } from "next/navigation";
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

type BakedGoodFormData = z.infer<typeof bakedGoodSchema>;

export default function NewBakedGoodPage() {
  const router = useRouter();
  const createBakedGood = useMutation(api.bakedGoods.createBakedGood);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BakedGoodFormData>({
    resolver: zodResolver(bakedGoodSchema),
    defaultValues: { name: "", description: "" },
  });

  async function onSubmit(data: BakedGoodFormData) {
    setServerError(null);
    try {
      const id = await createBakedGood({
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
      });
      router.push(`/baked-goods/${id}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to create baked good.");
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>New Baked Good</CardTitle>
          <CardDescription>
            Add a new baked good to your journal. You can add recipe iterations later.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g. Classic Sourdough"
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="A short description"
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          </CardContent>
          <CardFooter className="gap-2 pt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create Baked Good"}
            </Button>
            <Button type="button" variant="outline" asChild disabled={isSubmitting}>
              <Link href="/my-bakery">Cancel</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
