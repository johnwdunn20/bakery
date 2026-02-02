"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@bakery/backend";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks";
import { Plus, ChefHat, Clock, Image, Search } from "lucide-react";

export function Dashboard() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const bakedGoods = useQuery(api.bakedGoods.listMyBakedGoods);
  const [search, setSearch] = useState("");

  const filteredBakedGoods = useMemo(() => {
    if (!bakedGoods || !search.trim()) return bakedGoods;
    const query = search.toLowerCase();
    return bakedGoods.filter(
      (bg) =>
        bg.name.toLowerCase().includes(query) ||
        bg.description?.toLowerCase().includes(query)
    );
  }, [bakedGoods, search]);

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

      <div className="flex flex-wrap items-center gap-4">
        <Button asChild size="lg" className="rounded-full">
          <Link href="/baked-goods/new">
            <Plus className="mr-2 h-5 w-5" />
            New Baked Good
          </Link>
        </Button>
        {bakedGoods && bakedGoods.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search baked goods..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        )}
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
        ) : filteredBakedGoods && filteredBakedGoods.length === 0 && !search ? (
          <Card className="border-dashed">
            <CardHeader className="text-center py-12">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">No baked goods yet</CardTitle>
              <CardDescription className="max-w-sm mx-auto">
                Start building your baking journal by creating your first baked good. Track
                iterations, variations, and perfect your craft.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center pb-8">
              <Button asChild>
                <Link href="/baked-goods/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Baked Good
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ) : filteredBakedGoods && filteredBakedGoods.length === 0 && search ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No baked goods matching &quot;{search}&quot;</p>
            <Button
              variant="link"
              onClick={() => setSearch("")}
              className="mt-2"
            >
              Clear search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBakedGoods?.map((bg) => (
              <Link key={bg._id} href={`/baked-goods/${bg._id}`}>
                <Card className="overflow-hidden group hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer h-full">
                  <div className="h-48 relative bg-muted overflow-hidden">
                    {bg.firstPhotoUrl ? (
                      <img
                        src={bg.firstPhotoUrl}
                        alt={`Photo of ${bg.name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                        <Image className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {bg.name}
                    </CardTitle>
                    {bg.description && (
                      <CardDescription className="line-clamp-2">{bg.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardFooter className="text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    Updated{" "}
                    {new Date(bg.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: new Date(bg.updatedAt).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                    })}
                  </CardFooter>
                </Card>
              </Link>
            ))}

            <Link href="/baked-goods/new">
              <Card className="overflow-hidden border-dashed hover:border-primary/50 transition-all cursor-pointer h-full min-h-[320px] flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium">Add New Baked Good</p>
                  <p className="text-sm text-muted-foreground">Start a new baking experiment</p>
                </div>
              </Card>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
