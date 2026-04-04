"use client";

import { useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@bakery/backend";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Id } from "@bakery/backend/dataModel";

interface CommunityBakedGood {
  _id: Id<"bakedGoods">;
  name: string;
  description?: string;
  authorName: string;
  coverPhotoUrl?: string | null;
  iterationCount?: number;
}

export function CommunityCard({ bg, tall }: { bg: CommunityBakedGood; tall?: boolean }) {
  const { isSignedIn } = useAuth();
  const forkBakedGood = useMutation(api.bakedGoods.forkBakedGood);
  const router = useRouter();

  async function handleFork(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      toast.error("Sign in to fork recipes to your bakery");
      return;
    }

    try {
      const newId = await forkBakedGood({ id: bg._id });
      toast.success(`Forked "${bg.name}" to your bakery!`);
      router.push(`/baked-goods/${newId}`);
    } catch {
      toast.error("Failed to fork recipe. Please try again.");
    }
  }

  return (
    <Link href={`/community/${bg._id}`}>
      <Card className="overflow-hidden border-border group hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5 h-full">
        <div className={`${tall ? "h-48 sm:h-64" : "h-48"} relative bg-muted overflow-hidden`}>
          {bg.coverPhotoUrl ? (
            <Image
              src={bg.coverPhotoUrl}
              alt={bg.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🍞</div>
          )}
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
          <Button variant="ghost" size="sm" className="group/btn" onClick={handleFork}>
            Fork <ChefHat className="ml-2 h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
