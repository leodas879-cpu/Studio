import { RecipeGenerator } from '@/components/recipe-generator';
import { ChefHat } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold font-headline text-foreground">RecipeAI</h1>
        </div>
        <p className="text-muted-foreground mt-1">Your personal AI-powered chef. Create delicious recipes from the ingredients you have.</p>
      </header>
      <main className="container mx-auto px-4 py-8 flex-grow">
        <RecipeGenerator />
      </main>
      <footer className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
        <p>Powered by Genkit and Next.js. Created with love for foodies.</p>
      </footer>
    </div>
  );
}
