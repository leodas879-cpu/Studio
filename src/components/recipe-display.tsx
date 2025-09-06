import type { GenerateRecipeOutput } from "@/ai/flows/generate-recipe-flow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, Heart, Youtube, AlertTriangle, Salad, Beef, Soup, Wheat } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { useRecipeStore, type Recipe } from "@/store/recipe-store";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import Image from "next/image";


interface RecipeDisplayProps {
  recipe: Recipe | null;
  isLoading: boolean;
}

export function RecipeDisplay({ recipe, isLoading }: RecipeDisplayProps) {
  const { favoriteRecipes, toggleFavorite } = useRecipeStore();
  const { user } = useAuth();
  const { toast } = useToast();

  if (isLoading) {
    return <RecipeSkeleton />;
  }

  if (!recipe) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-8 bg-card/50 border-dashed border-2">
        <UtensilsCrossed className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-center font-headline">Your recipe will appear here</h2>
        <p className="text-muted-foreground text-center mt-2 max-w-sm">
          Select ingredients and preferences on the left, then click "Generate Recipe" to see the magic happen!
        </p>
      </Card>
    );
  }

  const isFavorite = favoriteRecipes.some(r => r.recipeName === recipe.recipeName);
  
  const handleToggleFavorite = async () => {
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
    <Card className="h-full overflow-auto animate-in fade-in-50 duration-500 shadow-lg flex flex-col">
      <CardHeader>
        {recipe.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden">
                <Image
                    src={recipe.imageUrl}
                    alt={recipe.recipeName}
                    data-ai-hint="food meal"
                    width={800}
                    height={400}
                    className="object-cover w-full h-64"
                />
            </div>
        )}
        <CardTitle className="text-4xl font-headline tracking-tight">{recipe.recipeName}</CardTitle>
        <CardDescription>A delicious recipe generated just for you by ChefAI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 flex-1">
        
        {recipe.substitutionWarning && (
            <Alert variant="default" className="bg-yellow-50 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-800">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertTitle className="text-yellow-800 dark:text-yellow-300">Ingredient Substituted</AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                    {recipe.substitutionWarning}
                </AlertDescription>
            </Alert>
        )}

        {recipe.nutrition && (
            <div>
                <h3 className="text-xl font-semibold mb-3 font-headline">Nutrition Info (per serving)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-accent/50">
                        <Salad className="mx-auto w-7 h-7 text-green-500 mb-1"/>
                        <p className="text-lg font-bold">{recipe.nutrition.calories?.toFixed(0) ?? 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">Calories</p>
                    </div>
                    <div className="p-3 rounded-lg bg-accent/50">
                        <Beef className="mx-auto w-7 h-7 text-red-500 mb-1"/>
                        <p className="text-lg font-bold">{recipe.nutrition.protein?.toFixed(1) ?? 'N/A'} g</p>
                        <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                     <div className="p-3 rounded-lg bg-accent/50">
                        <Wheat className="mx-auto w-7 h-7 text-yellow-600 mb-1"/>
                        <p className="text-lg font-bold">{recipe.nutrition.carbs?.toFixed(1) ?? 'N/A'} g</p>
                        <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                     <div className="p-3 rounded-lg bg-accent/50">
                        <Soup className="mx-auto w-7 h-7 text-orange-500 mb-1"/>
                        <p className="text-lg font-bold">{recipe.nutrition.fat?.toFixed(1) ?? 'N/A'} g</p>
                        <p className="text-xs text-muted-foreground">Fat</p>
                    </div>
                </div>
            </div>
        )}

        <div>
          <h3 className="text-xl font-semibold mb-3 font-headline">Required Ingredients</h3>
          <div className="flex flex-wrap gap-2">
            {recipe.requiredIngredients.map((ingredient) => (
              <Badge key={ingredient} variant="default" className="bg-primary/20 text-primary-foreground hover:bg-primary/30 text-sm">{ingredient}</Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-xl font-semibold mb-3 font-headline">Cooking Instructions</h3>
          <ol className="list-decimal list-inside space-y-4 text-base">
            {recipe.steps.map((step, index) => (
              <li key={index} className="pl-2 leading-relaxed">{step}</li>
            ))}
          </ol>
        </div>

        {recipe.alternativeSuggestions && recipe.alternativeSuggestions.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-xl font-semibold mb-3 font-headline">Alternatives & Suggestions</h3>
              <ul className="list-disc list-inside space-y-3 text-base">
                {recipe.alternativeSuggestions.map((suggestion, index) => (
                  <li key={index} className="pl-2 leading-relaxed">{suggestion}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
       <CardFooter className="bg-card/50 border-t mt-auto flex items-center justify-between gap-2">
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={handleToggleFavorite} 
          className="flex-1 text-lg"
        >
          <Heart className={cn("mr-2", isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
          {isFavorite ? 'Favorited' : 'Favorite'}
        </Button>
        {recipe.youtubeLink && (
            <>
                <Separator orientation="vertical" className="h-8" />
                <Button variant="ghost" size="lg" asChild className="flex-1 text-lg">
                    <Link href={recipe.youtubeLink} target="_blank">
                        <Youtube className="mr-2 text-red-600" />
                        Watch Tutorial
                    </Link>
                </Button>
            </>
        )}
      </CardFooter>
    </Card>
  );
}

function RecipeSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="w-full h-64 rounded-lg" />
        <Skeleton className="h-10 w-3/4 rounded-lg mt-4" />
        <Skeleton className="h-4 w-1/2 mt-2 rounded-lg" />
      </CardHeader>
      <CardContent className="space-y-8">
         <div>
          <Skeleton className="h-6 w-1/4 mb-4 rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        </div>
        <div>
          <Skeleton className="h-6 w-1/3 mb-4 rounded-lg" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        </div>
        <Separator />
        <div>
          <Skeleton className="h-6 w-1/2 mb-4 rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-full rounded-lg" />
            <Skeleton className="h-5 w-11/12 rounded-lg" />
            <Skeleton className="h-5 w-full rounded-lg" />
            <Skeleton className="h-5 w-5/6 rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
