"use client";

import { useQuery } from "convex/react";
import { api } from "@bakery/backend";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks";
import { Plus, ChefHat, Clock } from "lucide-react";
import Image from "next/image";

export function Dashboard() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const recipes = useQuery(api.recipes.listMyRecipes);

  // Get first name for the title
  const firstName = user?.name?.split(" ")[0] || user?.username || "Baker";

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      {/* Header */}
      <div>
        {userLoading ? (
          <Skeleton className="h-10 w-64" />
        ) : (
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {firstName}&apos;s Bakery
          </h1>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button asChild size="lg" className="rounded-full">
          <a href="/recipes/new">
            <Plus className="mr-2 h-5 w-5" />
            New Recipe
          </a>
        </Button>
      </div>

      {/* Recipe Grid */}
      <div>
        {recipes === undefined ? (
          // Loading state
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          // Empty state
          <Card className="border-dashed">
            <CardHeader className="text-center py-12">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">No recipes yet</CardTitle>
              <CardDescription className="max-w-sm mx-auto">
                Start building your baking journal by creating your first
                recipe. Track ingredients, variations, and perfect your craft.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center pb-8">
              <Button asChild>
                <a href="/recipes/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Recipe
                </a>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          // Recipe grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <a key={recipe._id} href={`/recipes/${recipe._id}`}>
                <Card className="overflow-hidden group hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer h-full">
                  <div className="h-48 relative bg-muted overflow-hidden">
                    {recipe.imageUrl ? (
                      <Image
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-primary/5 to-primary/10">
                        🍞
                      </div>
                    )}
                    {recipe.variantCount > 0 && (
                      <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-2 py-1 rounded-md text-xs font-medium">
                        {recipe.variantCount} variant
                        {recipe.variantCount === 1 ? "" : "s"}
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {recipe.name}
                    </CardTitle>
                    {recipe.description && (
                      <CardDescription className="line-clamp-2">
                        {recipe.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter className="text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    Updated{" "}
                    {new Date(recipe.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </CardFooter>
                </Card>
              </a>
            ))}

            {/* Add new recipe card */}
            <a href="/recipes/new">
              <Card className="overflow-hidden border-dashed hover:border-primary/50 transition-all cursor-pointer h-full min-h-[320px] flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium">Add New Recipe</p>
                  <p className="text-sm text-muted-foreground">
                    Start a new baking experiment
                  </p>
                </div>
              </Card>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
