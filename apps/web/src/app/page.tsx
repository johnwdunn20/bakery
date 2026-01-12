import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <section className="py-20 px-6 text-center">
        <h1 className="text-5xl font-bold text-foreground mb-4">Welcome to Sweet Delights</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Freshly baked goods made with love. From artisan breads to decadent pastries, we bring
          warmth to every bite.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg">Order Now</Button>
          <Button variant="outline" size="lg">
            View Menu
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-6 bg-muted/50">
        <h2 className="text-3xl font-semibold text-foreground text-center mb-10">
          Today&apos;s Specials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Croissants</CardTitle>
              <CardDescription>Buttery, flaky perfection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-accent rounded-md flex items-center justify-center text-accent-foreground">
                🥐
              </div>
              <p className="mt-4 text-muted-foreground">
                Our signature croissants are made fresh every morning with imported French butter.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <span className="text-lg font-semibold text-primary">$4.50</span>
              <Button size="sm">Add to Cart</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sourdough Loaf</CardTitle>
              <CardDescription>24-hour fermented</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-secondary rounded-md flex items-center justify-center text-secondary-foreground">
                🍞
              </div>
              <p className="mt-4 text-muted-foreground">
                Crusty exterior, soft interior. Made with our 50-year-old starter.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <span className="text-lg font-semibold text-primary">$8.00</span>
              <Button size="sm">Add to Cart</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pink Macarons</CardTitle>
              <CardDescription>Rose & raspberry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-primary/20 rounded-md flex items-center justify-center">
                🧁
              </div>
              <p className="mt-4 text-muted-foreground">
                Delicate French macarons with a rose-raspberry ganache filling.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <span className="text-lg font-semibold text-primary">$3.00</span>
              <Button size="sm">Add to Cart</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Button Variants Showcase */}
      <section className="py-16 px-6">
        <h2 className="text-3xl font-semibold text-foreground text-center mb-10">Button Styles</h2>
        <div className="flex flex-wrap gap-4 justify-center max-w-3xl mx-auto">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 px-6 bg-card">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Join Our Mailing List</CardTitle>
            <CardDescription>Get notified about new treats and exclusive offers!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Subscribe</Button>
          </CardFooter>
        </Card>
      </section>

      {/* Color Palette Preview */}
      <section className="py-16 px-6 bg-muted/30">
        <h2 className="text-3xl font-semibold text-foreground text-center mb-10">Theme Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="space-y-2 text-center">
            <div className="h-20 bg-primary rounded-lg"></div>
            <p className="text-sm text-muted-foreground">Primary</p>
          </div>
          <div className="space-y-2 text-center">
            <div className="h-20 bg-secondary rounded-lg"></div>
            <p className="text-sm text-muted-foreground">Secondary</p>
          </div>
          <div className="space-y-2 text-center">
            <div className="h-20 bg-accent rounded-lg"></div>
            <p className="text-sm text-muted-foreground">Accent</p>
          </div>
          <div className="space-y-2 text-center">
            <div className="h-20 bg-muted rounded-lg"></div>
            <p className="text-sm text-muted-foreground">Muted</p>
          </div>
          <div className="space-y-2 text-center">
            <div className="h-20 bg-card border border-border rounded-lg"></div>
            <p className="text-sm text-muted-foreground">Card</p>
          </div>
          <div className="space-y-2 text-center">
            <div className="h-20 bg-background border border-border rounded-lg"></div>
            <p className="text-sm text-muted-foreground">Background</p>
          </div>
          <div className="space-y-2 text-center">
            <div className="h-20 bg-foreground rounded-lg"></div>
            <p className="text-sm text-muted-foreground">Foreground</p>
          </div>
          <div className="space-y-2 text-center">
            <div className="h-20 bg-destructive rounded-lg"></div>
            <p className="text-sm text-muted-foreground">Destructive</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border text-center">
        <p className="text-muted-foreground">
          © 2026 Sweet Delights Bakery. Made with love and flour.
        </p>
      </footer>
    </div>
  );
}
