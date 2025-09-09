
"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChefHat, Home, Heart, Clock, User, LogOut, Sun, Moon, Laptop } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "next-themes";
import { useProfileStore } from "@/store/profile-store";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const mainNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
];

const recipeCollectionsLinks = [
  { href: "/recent-recipes", label: "Recent Recipes", icon: Clock },
  { href: "/favorite-recipes", label: "Favorite Recipes", icon: Heart },
];

const accountLinks = [
    { href: "/dashboard/profile", label: "Profile", icon: User },
];

const landingPageLinks = [
    { href: "/login", label: "Log In" },
    { href: "/signup", label: "Sign Up" },
];

export function MobileHeader({ isLanding = false }: { isLanding?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { setTheme } = useTheme();
  const { profile } = useProfileStore();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    router.push("/");
  };
  
  const handleLinkClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <ChefHat className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-headline">ChefAI</h1>
            </div>
          </div>
        </SheetHeader>

        {isLanding ? (
            <nav className="flex-1 p-4 space-y-2">
                 {landingPageLinks.map((link) => (
                    <Button key={link.href} variant="ghost" className="w-full justify-start text-lg" onClick={() => handleLinkClick(link.href)}>
                        {link.label}
                    </Button>
                 ))}
            </nav>
        ) : (
          <>
            <nav className="flex-1 p-4 space-y-4">
                {user && (
                     <div className="flex items-center gap-3 px-2 mb-6">
                        <Avatar>
                            <AvatarImage src={user.photoURL || profile.profilePhoto} alt="Profile Photo" />
                            <AvatarFallback>{profile.firstName?.[0]}{profile.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{user.displayName || `${profile.firstName} ${profile.lastName}`}</p>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>
                )}
              
              <div>
                <h2 className="px-2 mb-2 text-lg font-semibold tracking-tight">Navigation</h2>
                <div className="space-y-1">
                  {mainNavLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant={pathname === link.href ? "secondary" : "ghost"}
                      className="w-full justify-start text-base"
                      onClick={() => handleLinkClick(link.href)}
                    >
                      <link.icon className="mr-3" />
                      {link.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="px-2 mb-2 text-lg font-semibold tracking-tight">Collections</h2>
                <div className="space-y-1">
                  {recipeCollectionsLinks.map((link) => (
                     <Button
                        key={link.href}
                        variant={pathname === link.href ? "secondary" : "ghost"}
                        className="w-full justify-start text-base"
                        onClick={() => handleLinkClick(link.href)}
                    >
                      <link.icon className="mr-3" />
                      {link.label}
                    </Button>
                  ))}
                </div>
              </div>
               <div>
                <h2 className="px-2 mb-2 text-lg font-semibold tracking-tight">Account</h2>
                <div className="space-y-1">
                  {accountLinks.map((link) => (
                     <Button
                        key={link.href}
                        variant={pathname === link.href ? "secondary" : "ghost"}
                        className="w-full justify-start text-base"
                        onClick={() => handleLinkClick(link.href)}
                    >
                      <link.icon className="mr-3" />
                      {link.label}
                    </Button>
                  ))}
                   <Button
                        variant="ghost"
                        className="w-full justify-start text-base"
                        onClick={handleLogout}
                    >
                      <LogOut className="mr-3" />
                      Log Out
                    </Button>
                </div>
              </div>
            </nav>

            <div className="mt-auto p-4 border-t">
                <p className="font-semibold px-2 mb-2">Theme</p>
                 <div className="flex justify-around">
                    <Button variant="outline" size="icon" onClick={() => setTheme("light")}><Sun/></Button>
                    <Button variant="outline" size="icon" onClick={() => setTheme("dark")}><Moon/></Button>
                    <Button variant="outline" size="icon" onClick={() => setTheme("system")}><Laptop/></Button>
                </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
