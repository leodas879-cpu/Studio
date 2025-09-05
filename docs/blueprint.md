# **App Name**: RecipeAI

## Core Features:

- Ingredient Selection: Ingredient selection with checkboxes for specifying the ingredients the user wants to include in the generated recipe.
- Dietary Filters: Dietary preference toggles (switches) for vegetarian, vegan, gluten-free, and high-protein diets.
- Pantry Display: Display selected ingredients, indicating what the user has chosen for the recipe.
- Generate Recipe Trigger: A button to trigger the recipe generation, sending the selected ingredients and dietary preferences to the backend API. The AI model acts as a tool to select relevant info to display to the user.
- Recipe Display: Display the AI-generated recipe with name, steps, required ingredients, and alternative suggestions.
- Frontend Structure: React-based frontend using Next.js framework with Tailwind CSS for styling to manage the user interface and interactions.
- Backend Logic: Backend uses Next.js API routes with Genkit for AI integration and Zod for validation to process user inputs and generate recipes.

## Style Guidelines:

- Primary color: Light beige (#F5F5DC) for a natural, comforting feel, evoking the essence of home cooking.
- Background color: Off-white (#FAF9F6) to provide a clean and unobtrusive backdrop that enhances readability and focuses attention on the recipe content.
- Accent color: Soft orange (#FFB347) to highlight interactive elements and important information, adding warmth without overwhelming the visual experience.
- Body and headline font: 'Literata', a serif font, provides a literary, slightly vintage aesthetic for comfortable reading.
- Use simple, outline-style icons for ingredients and dietary preferences, ensuring clarity and ease of use.
- Employ a clean and intuitive layout, focusing on readability and ease of navigation to enhance the user experience.
- Implement subtle transitions and animations for feedback, such as highlighting selected ingredients or smoothly displaying the generated recipe.