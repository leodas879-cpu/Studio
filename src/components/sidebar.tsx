
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Home, Heart, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const mainNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
];

const recipeCollectionsLinks = [
  { href: "/recent-recipes", label: "Recent Recipes", icon: Clock },
  { href: "/favorite-recipes", label: "Favorite Recipes", icon: Heart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card text-card-foreground border-r flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <ChefHat className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-headline">ChefAI</h1>
            <p className="text-sm text-muted-foreground">Your AI Cooking Companion</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-4">
        <div>
          <h2 className="px-4 mb-2 text-lg font-semibold tracking-tight">Navigation</h2>
          <div className="space-y-1">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2 text-base font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="px-4 mb-2 text-lg font-semibold tracking-tight">Recipe Collections</h2>
          <div className="space-y-1">
            {recipeCollectionsLinks.map((link) => (
               <Link
                key={link.href}
                href={link.href}
                className={cn("flex items-center justify-between gap-3 rounded-lg px-4 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === link.href ? "bg-accent text-accent-foreground" : ""
                )}
              >
                <div className="flex items-center gap-3">
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6"/></svg>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
