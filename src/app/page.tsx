
"use client";

import { Button } from "@/components/ui/button";
import { ChefHat, CookingPot, Leaf, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline">ChefAI</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="container mx-auto">
            <h2 className="text-5xl font-bold tracking-tighter md:text-6xl font-headline">
              Transform Your Ingredients into Culinary Masterpieces
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
              Welcome to ChefAI, your personal AI-powered cooking companion! With ChefAI, you're not just cooking; you're creating. Tell us what's in your pantry, and we'll generate a delicious, easy-to-follow recipe just for you. Say goodbye to dinner dilemmas and food waste.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/signup">Start Cooking for Free</Link>
              </Button>
            </div>
            <div className="mt-12">
               <Image 
                src="https://placehold.co/1200x600.png" 
                alt="AI generated recipe on a plate"
                data-ai-hint="food dish"
                width={1200}
                height={600}
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-card/50">
          <div className="container mx-auto text-center">
            <h3 className="text-4xl font-bold font-headline">Why You'll Love ChefAI</h3>
            <p className="max-w-2xl mx-auto mt-2 text-muted-foreground">
              Discover the features that make mealtime effortless and exciting. Our goal is to make cooking fun and accessible for everyone, regardless of your skill level or the ingredients you have on hand.
            </p>
            <div className="grid grid-cols-1 gap-8 mt-12 md:grid-cols-3">
              <div className="p-8 text-left bg-background rounded-xl shadow-lg">
                <div className="p-3 mb-4 rounded-full bg-primary/20 w-fit">
                    <Zap className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold font-headline">Instant Recipe Generation</h4>
                <p className="mt-2 text-muted-foreground">
                  No more endless searching. Get recipes in seconds based on the ingredients you already have. Our AI is trained to come up with creative and tasty ideas, so you'll never be bored in the kitchen again.
                </p>
              </div>
              <div className="p-8 text-left bg-background rounded-xl shadow-lg">
                 <div className="p-3 mb-4 rounded-full bg-primary/20 w-fit">
                    <Leaf className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold font-headline">Dietary Customization</h4>
                <p className="mt-2 text-muted-foreground">
                  Vegetarian, gluten-free, high-protein? ChefAI tailors every recipe to your specific dietary needs. You can easily specify your preferences, and our AI will generate a recipe that fits your lifestyle.
                </p>
              </div>
              <div className="p-8 text-left bg-background rounded-xl shadow-lg">
                <div className="p-3 mb-4 rounded-full bg-primary/20 w-fit">
                    <CookingPot className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-2xl font-semibold font-headline">Reduce Food Waste</h4>
                <p className="mt-2 text-muted-foreground">
                  Make the most of what's in your fridge. ChefAI helps you use up ingredients before they go bad, saving you money and helping the environment. It's a win-win for your wallet and the planet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="container mx-auto text-center">
            <h3 className="text-4xl font-bold font-headline">From Our Community</h3>
            <p className="max-w-2xl mx-auto mt-2 text-muted-foreground">
              See what home cooks like you are saying about ChefAI.
            </p>
            <div className="grid grid-cols-1 gap-8 mt-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 text-left bg-card rounded-lg">
                <p className="italic">"I used to throw away so much food. Now, I just tell ChefAI what I have and get amazing recipes. It's a game-changer!"</p>
                <p className="mt-4 font-semibold">- Sarah J.</p>
              </div>
              <div className="p-6 text-left bg-card rounded-lg">
                <p className="italic">"As someone with multiple dietary restrictions, finding recipes is hard. ChefAI makes it so simple to create meals I can actually eat."</p>
                <p className="mt-4 font-semibold">- Michael B.</p>
              </div>
              <div className="p-6 text-left bg-card rounded-lg">
                <p className="italic">"My family thinks I'm a professional chef now! The recipes are so creative and delicious. I'm having so much fun in the kitchen again."</p>
                <p className="mt-4 font-semibold">- Emily R.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-card text-card-foreground">
        <div className="container flex flex-col items-center justify-between mx-auto md:flex-row">
          <p>&copy; 2024 ChefAI. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-sm hover:underline">Privacy Policy</Link>
            <Link href="#" className="text-sm hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
