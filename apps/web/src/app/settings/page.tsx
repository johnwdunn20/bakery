"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { UserProfile } from "@clerk/nextjs";
import { Sun, Moon, Monitor } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const themes = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how Bakery looks for you.</CardDescription>
        </CardHeader>
        <CardContent>
          {mounted ? (
            <RadioGroup value={theme} onValueChange={setTheme} className="grid gap-4">
              {themes.map(({ value, label, icon: Icon }) => (
                <Label
                  key={value}
                  htmlFor={`theme-${value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <RadioGroupItem id={`theme-${value}`} value={value} />
                  <Icon className="size-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{label}</span>
                </Label>
              ))}
            </RadioGroup>
          ) : (
            <div className="grid gap-4">
              {themes.map(({ value }) => (
                <div key={value} className="h-14 animate-pulse rounded-lg border bg-muted/30" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your profile, email, and security settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserProfile
            routing="hash"
            appearance={{
              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-none",
                card: "shadow-none border-0 w-full",
                navbar: "hidden",
                navbarMobileMenuButton: "hidden",
                pageScrollBox: "p-0",
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
