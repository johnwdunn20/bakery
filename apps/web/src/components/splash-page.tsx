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
import { BakersMathCalculator } from "@/components/bakers-math-calculator";
import { SubstitutionSearch } from "@/components/substitution-search";
import {
  ChefHat,
  Microscope,
  Share2,
  Smartphone,
  ArrowRight,
  Star,
} from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SplashPage() {
  const communityBakedGoods = useQuery(api.bakedGoods.listCommunityBakedGoods);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      {/* Header for splash page */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm">
              B
            </div>
            Bakery
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <SignedOut>
              <SignInButton>
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
              <SignUpButton>
                <Button>Get Started</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-1000">
            <Microscope className="h-4 w-4" />
            <span>Master the Science of Baking</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold text-foreground tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
            Stop Guessing. <br />
            <span className="text-primary italic">Start Perfecting.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-300">
            The professional-grade toolkit for home bakers. Store your recipes,
            track variations with precision, and master the math behind every
            loaf.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500">
            <SignedOut>
              <SignUpButton>
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20"
                >
                  Start Your Baking Journal{" "}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20"
              >
                <Link href="/my-bakery">
                  Go to My Bakery <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </SignedIn>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg rounded-full"
            >
              Explore Community Bakes
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border border-border bg-card/50 hover:border-primary/50 transition-all group">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <Share2 className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Infinite Variants</h3>
            <p className="text-muted-foreground">
              Track small tweaks like hydration or salt % across versions. See
              exactly how your bakes evolve over time.
            </p>
          </div>
          <div className="p-8 rounded-3xl border border-border bg-card/50 hover:border-primary/50 transition-all group">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <Microscope className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Baker&apos;s Percentages</h3>
            <p className="text-muted-foreground">
              No more manual math. Scale recipes instantly and understand ratios
              like a pro boulanger.
            </p>
          </div>
          <div className="p-8 rounded-3xl border border-border bg-card/50 hover:border-primary/50 transition-all group">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <Smartphone className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Distraction-Free</h3>
            <p className="text-muted-foreground">
              Bake Mode keeps your screen awake and focused on the steps. Clean,
              interactive, and mobile-friendly.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Tools Section */}
      <section className="py-24 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">
                Try the Tools.
              </h2>
              <p className="text-xl text-muted-foreground max-w-md">
                Get a taste of the precision Bakery provides. These tools are
                live and ready to help your next bake.
              </p>
            </div>
            <SubstitutionSearch />
          </div>
          <div className="lg:pt-20">
            <BakersMathCalculator />
          </div>
        </div>
      </section>

      {/* Community Showcase */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold tracking-tight">
            Community Top Bakes
          </h2>
          <p className="text-xl text-muted-foreground">
            Recipes shared by bakers like you. Fork them to start your own
            experiments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {communityBakedGoods?.map((bg) => (
            <Card
              key={bg._id}
              className="overflow-hidden border-border group hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="h-64 relative bg-muted overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  🍞
                </div>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold mb-1">
                      {bg.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {bg.description ?? ""}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="flex justify-between items-center border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                    {bg.authorName.charAt(0)}
                  </div>
                  <span className="text-sm font-medium">
                    {bg.authorName}
                  </span>
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
          <Button variant="outline" size="lg" className="rounded-full px-8">
            View All Community Bakes
          </Button>
        </div>
      </section>

      {/* Bake Mode Preview */}
      <section className="py-24 px-6 bg-primary text-primary-foreground overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl font-bold leading-tight">
              Focus on the Dough, Not the Screen.
            </h2>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              Our signature **Bake Mode** is designed for the flour-covered
              hands. High-contrast, interactive steps, and a screen that never
              sleeps while you&apos;re working.
            </p>
            <ul className="space-y-4">
              {[
                "Built-in timers",
                "Interactive step tracking",
                "Recipe scaling on the fly",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-lg font-medium"
                >
                  <div className="h-6 w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Star className="h-3 w-3 fill-primary-foreground" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <SignedOut>
              <SignUpButton>
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 px-8 text-lg rounded-full"
                >
                  Join to try Bake Mode
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-14 px-8 text-lg rounded-full"
              >
                <Link href="/my-bakery">Go to My Bakery</Link>
              </Button>
            </SignedIn>
          </div>
          <div className="relative">
            <div className="bg-background rounded-[40px] border-8 border-primary-foreground/10 p-4 shadow-2xl overflow-hidden aspect-9/16 max-w-[320px] mx-auto transform lg:rotate-6">
              <div className="space-y-6 pt-8 px-4">
                <div className="h-2 w-24 bg-muted rounded-full mx-auto mb-8" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-primary/20 rounded" />
                  <div className="h-8 w-full bg-primary/10 rounded" />
                </div>
                <div className="space-y-4 pt-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-center p-4 rounded-xl border border-primary/10"
                    >
                      <div className="h-6 w-6 rounded border border-primary/20" />
                      <div className="space-y-2 flex-1">
                        <div className="h-3 w-full bg-muted rounded" />
                        <div className="h-3 w-2/3 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-2xl">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm">
              B
            </div>
            Bakery
          </div>
          <p className="text-muted-foreground">
            © 2026 Bakery App. The science of baking, simplified.
          </p>
          <div className="flex gap-6">
            <Button variant="link" className="text-muted-foreground">
              Terms
            </Button>
            <Button variant="link" className="text-muted-foreground">
              Privacy
            </Button>
            <Button variant="link" className="text-muted-foreground">
              Contact
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
