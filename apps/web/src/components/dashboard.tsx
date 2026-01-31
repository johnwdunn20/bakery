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

export function Dashboard() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const bakedGoods = useQuery(api.bakedGoods.listMyBakedGoods);

  const firstName = user?.name?.split(" ")[0] || user?.username || "Baker";

  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      <div>
        {userLoading ? (
          <Skeleton className="h-10 w-64" />
        ) : (
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {firstName}&apos;s Bakery
          </h1>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <Button asChild size="lg" className="rounded-full">
          <a href="/baked-goods/new">
            <Plus className="mr-2 h-5 w-5" />
            New Baked Good
          </a>
        </Button>
      </div>

      <div>
        {bakedGoods === undefined ? (
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
        ) : bakedGoods.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader className="text-center py-12">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">No baked goods yet</CardTitle>
              <CardDescription className="max-w-sm mx-auto">
                Start building your baking journal by creating your first
                baked good. Track iterations, variations, and perfect your craft.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center pb-8">
              <Button asChild>
                <a href="/baked-goods/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Baked Good
                </a>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bakedGoods.map((bg) => (
              <a key={bg._id} href={`/baked-goods/${bg._id}`}>
                <Card className="overflow-hidden group hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer h-full">
                  <div className="h-48 relative bg-muted overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-primary/5 to-primary/10">
                      🍞
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {bg.name}
                    </CardTitle>
                    {bg.description && (
                      <CardDescription className="line-clamp-2">
                        {bg.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter className="text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    Updated{" "}
                    {new Date(bg.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </CardFooter>
                </Card>
              </a>
            ))}

            <a href="/baked-goods/new">
              <Card className="overflow-hidden border-dashed hover:border-primary/50 transition-all cursor-pointer h-full min-h-[320px] flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium">Add New Baked Good</p>
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
