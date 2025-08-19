
"use client";

import type { GenerateRecipeOutput } from "@/ai/flows/generate-recipe-flow";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Heart, ArrowRight, Vegan, Beef, WheatOff } from "lucide-react";
import { useRecipeStore } from "@/store/recipe-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "./ui/badge";
import Image from "next/image";

interface RecipeCardProps {
    recipe: GenerateRecipeOutput & { vegetarian?: boolean, vegan?: boolean, glutenFree?: boolean };
}

const DietInfo = ({ icon: Icon, label }: { icon: React.ElementType, label: string }) => (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Icon className="w-4 h-4 text-primary" />
    <span>{label}</span>
  </div>
);

export function RecipeCard({ recipe }: RecipeCardProps) {
    const { favoriteRecipes, toggleFavorite } = useRecipeStore();
    const isFavorite = favoriteRecipes.some(r => r.recipeName === recipe.recipeName);

    const description = recipe.steps.length > 0 ? `${recipe.steps[0].substring(0, 100)}...` : 'No instructions available.';

    return (
        <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden rounded-xl border">
            <div className="relative">
                <Image 
                    src={`https://dummyimage.com/600x400/f5a623/ffffff.png&text=${encodeURIComponent(recipe.recipeName)}`}
                    alt={recipe.recipeName}
                    data-ai-hint="food dish"
                    width={600}
                    height={400}
                    className="object-cover w-full h-48"
                />
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(recipe);
                    }}
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full text-muted-foreground hover:text-red-500"
                >
                    <Heart className={cn("w-6 h-6 transition-all", isFavorite ? "fill-red-500 text-red-500" : "")} />
                </Button>
            </div>
            
            <CardHeader>
                <CardTitle className="font-headline tracking-tight text-xl">{recipe.recipeName}</CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 space-y-4">
                <p className="text-muted-foreground text-sm">{description}</p>
                <div className="flex flex-wrap gap-4">
                    {recipe.vegetarian && <DietInfo icon={Beef} label="Vegetarian" />}
                    {recipe.vegan && <DietInfo icon={Vegan} label="Vegan" />}
                    {recipe.glutenFree && <DietInfo icon={WheatOff} label="Gluten-Free" />}
                </div>
            </CardContent>

            <CardFooter className="flex justify-end items-center border-t p-4 bg-muted/30">
                <Link href={`/full-recipe-view?recipe=${encodeURIComponent(recipe.recipeName)}`} passHref>
                    <Button>
                        View Full Recipe <ArrowRight className="ml-2"/>
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
