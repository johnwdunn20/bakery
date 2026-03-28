"use client";

import { useQuery } from "convex/react";
import { api } from "@bakery/backend";
import { Button } from "@/components/ui/button";
import { CommunityCard } from "@/components/community-card";
import Link from "next/link";

export function SplashCommunityShowcase() {
  const communityBakedGoods = useQuery(api.bakedGoods.listCommunityBakedGoods);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        {communityBakedGoods?.map((bg) => (
          <CommunityCard key={bg._id} bg={bg} tall />
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
