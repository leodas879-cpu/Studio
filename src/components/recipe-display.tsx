import type { GenerateRecipeOutput } from "@/ai/flows/generate-recipe-flow";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "./ui/separator";

interface RecipeDisplayProps {
  recipe: GenerateRecipeOutput | null;
  isLoading: boolean;
}

export function RecipeDisplay({ recipe, isLoading }: RecipeDisplayProps) {
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

  return (
    <Card className="h-full overflow-auto animate-in fade-in-50 duration-500 shadow-lg">
      <CardHeader>
        <CardTitle className="text-4xl font-headline tracking-tight">{recipe.recipeName}</CardTitle>
        <CardDescription>A delicious recipe generated just for you by ChefAI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
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
