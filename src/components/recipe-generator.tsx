"use client";

import { useState, useMemo, useEffect } from "react";
import type { GenerateRecipeOutput } from "@/ai/flows/generate-recipe-flow";
import { handleGenerateRecipe } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecipeDisplay } from "./recipe-display";
import { Sparkles, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useRecipeStore } from "@/store/recipe-store";

const ingredientsData = [
  { name: 'Almonds', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: true },
  { name: 'Avocado', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Basil', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Black Beans', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: true },
  { name: 'Blueberries', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Bread', isVegetarian: true, isVegan: true, isGlutenFree: false, isHighProtein: false },
  { name: 'Broccoli', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Butter', isVegetarian: true, isVegan: false, isGlutenFree: true, isHighProtein: false },
  { name: 'Carrots', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Cayenne Pepper', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Cheese', isVegetarian: true, isVegan: false, isGlutenFree: true, isHighProtein: true },
  { name: 'Chicken', isVegetarian: false, isVegan: false, isGlutenFree: true, isHighProtein: true },
  { name: 'Chickpeas', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: true },
  { name: 'Cilantro', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Cinnamon', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Corn', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Cumin', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Coriander', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Eggs', isVegetarian: true, isVegan: false, isGlutenFree: true, isHighProtein: true },
  { name: 'Fish', isVegetarian: false, isVegan: false, isGlutenFree: true, isHighProtein: true },
  { name: 'Flour', isVegetarian: true, isVegan: true, isGlutenFree: false, isHighProtein: false },
  { name: 'Garlic', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Ginger', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Honey', isVegetarian: true, isVegan: false, isGlutenFree: true, isHighProtein: false },
  { name: 'Kale', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Lemon', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Lentils', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: true },
  { name: 'Lime', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Maple Syrup', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Milk', isVegetarian: true, isVegan: false, isGlutenFree: true, isHighProtein: false },
  { name: 'Mushrooms', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Mustard', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Oats', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false }, // Assuming gluten-free oats
  { name: 'Olive Oil', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Onions', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Paprika', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Pasta', isVegetarian: true, isVegan: true, isGlutenFree: false, isHighProtein: false },
  { name: 'Pork', isVegetarian: false, isVegan: false, isGlutenFree: true, isHighProtein: true },
  { name: 'Potatoes', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Quinoa', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: true },
  { name: 'Rice', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Salmon', isVegetarian: false, isVegan: false, isGlutenFree: true, isHighProtein: true },
  { name: 'Shrimp', isVegetarian: false, isVegan: false, isGlutenFree: true, isHighProtein: true },
  { name: 'Soy Sauce', isVegetarian: true, isVegan: true, isGlutenFree: false, isHighProtein: false },
  { name: 'Spinach', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Strawberries', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Sugar', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Sweet Potatoes', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Tempeh', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: true },
  { name: 'Tofu', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: true },
  { name: 'Tomatoes', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false },
  { name: 'Walnuts', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: true },
  { name: 'Yogurt', isVegetarian: true, isVegan: false, isGlutenFree: true, isHighProtein: true },
  { name: 'Zucchini', isVegetarian: true, isVegan: true, isGlutenFree: true, isHighProtein: false }
].sort((a, b) => a.name.localeCompare(b.name));

export function RecipeGenerator() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(['Chicken', 'Rice', 'Onions']);
  const [dietaryPreferences, setDietaryPreferences] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    highProtein: false,
  });
  const [generatedRecipe, setGeneratedRecipe] = useState<GenerateRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();
  const { addRecentRecipe } = useRecipeStore();
  
  const availableIngredients = useMemo(() => {
    return ingredientsData.filter(ingredient => {
      if (dietaryPreferences.vegetarian && !ingredient.isVegetarian) return false;
      if (dietaryPreferences.vegan && !ingredient.isVegan) return false;
      if (dietaryPreferences.glutenFree && !ingredient.isGlutenFree) return false;
      if (dietaryPreferences.highProtein && !ingredient.isHighProtein) return false;
      return true;
    });
  }, [dietaryPreferences]);

  useEffect(() => {
    // When available ingredients change, filter out any selected ingredients that are no longer available.
    const availableNames = availableIngredients.map(i => i.name);
    setSelectedIngredients(prev => prev.filter(name => availableNames.includes(name)));
  }, [availableIngredients]);


  const handleIngredientToggle = (ingredient: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handlePreferenceToggle = (preference: keyof typeof dietaryPreferences) => {
    setDietaryPreferences((prev) => ({ ...prev, [preference]: !prev[preference] }));
  };

  const handleSubmit = async () => {
    if (selectedIngredients.length === 0) {
      toast({
        variant: "destructive",
        title: "No Ingredients Selected",
        description: "Please select at least one ingredient to start.",
      });
      return;
    }
    
    setIsLoading(true);
    setGeneratedRecipe(null);

    const input = {
      ingredients: selectedIngredients,
      ...dietaryPreferences,
    };

    const result = await handleGenerateRecipe(input);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: result.error,
      });
      setGeneratedRecipe(null);
    } else if (result.data) {
      setGeneratedRecipe(result.data);
      addRecentRecipe(result.data);
    }
    
    setIsLoading(false);
  };

  const filteredIngredients = availableIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">1. Choose Your Ingredients</CardTitle>
              <CardDescription>Select the items you have on hand. The list will update based on your diet.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search ingredients..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <ScrollArea className="h-60 border rounded-md p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredIngredients.map((ingredient) => (
                    <div key={ingredient.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={ingredient.name}
                        checked={selectedIngredients.includes(ingredient.name)}
                        onCheckedChange={() => handleIngredientToggle(ingredient.name)}
                      />
                      <Label htmlFor={ingredient.name} className="cursor-pointer text-sm font-normal">{ingredient.name}</Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">2. Set Dietary Preferences</CardTitle>
              <CardDescription>Tailor the recipe to your dietary needs.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(dietaryPreferences).map((key) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-md">
                  <Label htmlFor={key} className="capitalize font-medium">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Switch
                    id={key}
                    checked={dietaryPreferences[key as keyof typeof dietaryPreferences]}
                    onCheckedChange={() => handlePreferenceToggle(key as keyof typeof dietaryPreferences)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div>
            <h3 className="text-xl font-semibold mb-2 font-headline">Your Pantry</h3>
            <div className="p-4 rounded-lg border bg-card/50 min-h-[6rem] transition-all">
              {selectedIngredients.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedIngredients.map((ingredient) => (
                    <Badge key={ingredient} variant="secondary" className="text-base py-1 px-3">{ingredient}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm p-4 text-center">Your selected ingredients will show up here.</p>
              )}
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={isLoading} size="lg" className="w-full text-lg py-7 shadow-lg hover:shadow-primary/50 transition-shadow">
            <Sparkles className="mr-2 h-5 w-5" />
            {isLoading ? 'Generating your masterpiece...' : 'Generate Recipe'}
          </Button>

        </div>

        <div className="lg:sticky lg:top-8 h-full min-h-[500px] lg:min-h-0">
          <RecipeDisplay recipe={generatedRecipe} isLoading={isLoading} />
        </div>
      </div>
  );
}
