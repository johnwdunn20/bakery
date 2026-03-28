import Link from "next/link";
import { ChefHat } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className="sticky top-0 z-50 bg-background/95 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/welcome" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm">
              B
            </div>
            <span className="hidden sm:inline">Bakery</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/welcome">Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="py-8 px-4 sm:px-6 border-t border-border bg-card">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Bakery App. The science of baking, simplified.
          </p>
          <div className="flex gap-4">
            <Button asChild variant="link" size="sm" className="text-muted-foreground text-xs">
              <Link href="/terms">Terms</Link>
            </Button>
            <Button asChild variant="link" size="sm" className="text-muted-foreground text-xs">
              <Link href="/privacy">Privacy</Link>
            </Button>
            <Button asChild variant="link" size="sm" className="text-muted-foreground text-xs">
              <Link href="/community">Community</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
