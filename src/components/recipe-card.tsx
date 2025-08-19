
"use client";

import type { GenerateRecipeOutput } from "@/ai/flows/generate-recipe-flow";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Heart, UtensilsCrossed, ArrowRight } from "lucide-react";
import { useRecipeStore } from "@/store/recipe-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "./ui/badge";

interface RecipeCardProps {
    recipe: GenerateRecipeOutput;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
    const { favoriteRecipes, toggleFavorite } = useRecipeStore();
    const isFavorite = favoriteRecipes.some(r => r.recipeName === recipe.recipeName);

    // Truncate steps for preview
    const description = recipe.steps.length > 0 ? `${recipe.steps[0].substring(0, 100)}...` : 'No instructions available.';

    return (
        <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
                <CardTitle className="font-headline tracking-tight">{recipe.recipeName}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                 <div className="flex flex-wrap gap-2">
                    {recipe.requiredIngredients.slice(0, 4).map((ingredient) => (
                        <Badge key={ingredient} variant="secondary">{ingredient}</Badge>
                    ))}
                    {recipe.requiredIngredients.length > 4 && <Badge variant="outline">...</Badge>}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4">
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(recipe);
                    }}
                    className="text-muted-foreground hover:text-red-500"
                >
                    <Heart className={cn("w-6 h-6", isFavorite ? "fill-red-500 text-red-500" : "")} />
                </Button>
                <Link href={`/full-recipe-view?recipe=${encodeURIComponent(recipe.recipeName)}`} passHref>
                    <Button variant="outline">
                        View Recipe <ArrowRight className="ml-2"/>
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
