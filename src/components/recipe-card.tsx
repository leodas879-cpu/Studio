
"use client";

import type { Recipe } from "@/store/recipe-store";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import { Heart, ArrowRight, Vegan, Beef, WheatOff } from "lucide-react";
import { useRecipeStore } from "@/store/recipe-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "./ui/badge";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";


export function RecipeCard({ recipe }: { recipe: Recipe }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const { favoriteRecipes, toggleFavorite } = useRecipeStore();
    const isFavorite = favoriteRecipes.some(r => r.recipeName === recipe.recipeName);

    const description = recipe.steps.length > 0 ? `${recipe.steps[0].substring(0, 100)}...` : 'No instructions available.';
    
    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) {
            toast({
                variant: "destructive",
                title: "Not Logged In",
                description: "You need to be logged in to save favorite recipes.",
            });
            return;
        }
        await toggleFavorite(recipe, user.uid);
    }

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
                    onClick={handleToggleFavorite}
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
            </CardContent>

            <CardFooter className="flex justify-between items-center border-t p-4 bg-muted/30">
                <div className="flex flex-wrap gap-2">
                    {recipe.vegetarian && <Badge variant="outline">Vegetarian</Badge>}
                    {recipe.vegan && <Badge variant="outline">Vegan</Badge>}
                    {recipe.glutenFree && <Badge variant="outline">Gluten-Free</Badge>}
                </div>
                <Link href={`/full-recipe-view?recipe=${encodeURIComponent(recipe.recipeName)}`} passHref>
                    <Button variant="ghost">
                        View <ArrowRight className="ml-2"/>
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
