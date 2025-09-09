
import type { Recipe } from "@/store/recipe-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, Heart, Clock, Users, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { useRecipeStore } from "@/store/recipe-store";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";


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
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-4xl font-headline tracking-tight">{recipe.recipeName}</CardTitle>
            <CardDescription>A delicious recipe generated just for you by ChefAI.</CardDescription>
          </div>
          {recipe.cuisine && (
            <Badge variant="outline" className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4"/>
              {recipe.cuisine}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-8 flex-1">
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            {recipe.prepTime && (
                <div className="p-2 rounded-lg bg-accent/50">
                    <Clock className="mx-auto w-7 h-7 text-primary"/>
                    <p className="text-xl font-bold">{recipe.prepTime} <span className="text-sm">min</span></p>
                    <p className="text-xs text-muted-foreground">Prep Time</p>
                </div>
            )}
            {recipe.cookTime && (
                <div className="p-2 rounded-lg bg-accent/50">
                    <Clock className="mx-auto w-7 h-7 text-primary"/>
                    <p className="text-xl font-bold">{recipe.cookTime} <span className="text-sm">min</span></p>
                    <p className="text-xs text-muted-foreground">Cook Time</p>
                </div>
            )}
             {recipe.servings && (
                <div className="p-2 rounded-lg bg-accent/50 col-span-2 sm:col-span-1">
                    <Users className="mx-auto w-7 h-7 text-primary"/>
                    <p className="text-xl font-bold">{recipe.servings}</p>
                    <p className="text-xs text-muted-foreground">Servings</p>
                </div>
            )}
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-2xl font-semibold mb-4 font-headline text-center">Ingredients</h3>
                <ul className="space-y-3">
                    {recipe.requiredIngredients.map((ingredient, index) => (
                    <li key={`${ingredient.name}-${index}`} className="flex items-start gap-3">
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-primary/80 shrink-0"></span>
                        <span className="text-base">{ingredient.quantity} {ingredient.name}</span>
                    </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className="text-2xl font-semibold mb-4 font-headline text-center">Instructions</h3>
                <ol className="space-y-4">
                    {recipe.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center">
                            {index + 1}
                        </div>
                        <p className="flex-1 pt-1 leading-relaxed text-base">{step}</p>
                    </li>
                    ))}
                </ol>
            </div>
        </div>

        {recipe.servingSuggestions && (
          <>
            <Separator />
            <div>
              <h3 className="text-xl font-semibold mb-3 font-headline">Serving Suggestions</h3>
              <p className="text-base leading-relaxed">{recipe.servingSuggestions}</p>
            </div>
          </>
        )}

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
       <CardFooter className="bg-card/50 border-t mt-auto">
        <Button 
          variant="ghost" 
          size="lg" 
          onClick={handleToggleFavorite} 
          className="w-full text-lg"
        >
          <Heart className={cn("mr-2", isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </Button>
      </CardFooter>
    </Card>
  );
}

function RecipeSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="h-10 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-1/2 mt-2 rounded-lg" />
      </CardHeader>
      <CardContent className="space-y-8">
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
