"use client";

import { useQuery } from "convex/react";
import { api } from "@bakery/backend";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat } from "lucide-react";
import Link from "next/link";

export function SplashCommunityShowcase() {
  const communityBakedGoods = useQuery(api.bakedGoods.listCommunityBakedGoods);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        {communityBakedGoods?.map((bg) => (
          <Card
            key={bg._id}
            className="overflow-hidden border-border group hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5"
          >
            <div className="h-48 sm:h-64 relative bg-muted overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-4xl">🍞</div>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold mb-1">{bg.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{bg.description ?? ""}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="flex justify-between items-center border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                  {bg.authorName.charAt(0)}
                </div>
                <span className="text-sm font-medium">{bg.authorName}</span>
              </div>
              <Button variant="ghost" size="sm" className="group/btn">
                Fork{" "}
                <ChefHat className="ml-2 h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        ))}
        {!communityBakedGoods &&
          [1, 2, 3].map((i) => (
            <div key={i} className="h-[400px] rounded-2xl bg-muted animate-pulse" />
          ))}
      </div>

      <div className="mt-16 text-center">
        <Button asChild variant="outline" size="lg" className="rounded-full px-8">
          <Link href="/community">View All Community Bakes</Link>
        </Button>
      </div>
    </>
  );
}
