# ChefAI - Your Personal AI Cooking Companion

ChefAI is a modern, AI-powered web application designed to transform the way you cook. By simply selecting the ingredients you have on hand, ChefAI generates delicious, creative, and easy-to-follow recipes tailored to your needs. The app leverages cutting-edge AI to understand food science, suggest ingredient substitutions, and help you reduce food waste, all within a clean, responsive, and user-friendly interface.

## 🚀 Key Features

*   **AI-Powered Recipe Generation**: Leverages Google's Gemini models via Genkit to create unique recipes from a list of user-selected ingredients.
*   **Intelligent Ingredient Analysis**: A "Culinary Science Logic Engine" analyzes ingredient combinations for compatibility, flagging impossible or unappetizing pairings before a recipe is generated.
*   **Smart Substitutions**: When an incompatible ingredient combination is detected, the AI provides a set of cohesive suggestions to fix the recipe, which can be applied with a single click.
*   **Pantry-to-Plate Functionality**: Users can easily select ingredients from a comprehensive catalog of over 200 items. The app includes innovative ways to add ingredients, including:
    *   **Image Analysis**: Upload a photo of your ingredients, and the AI will identify them and add them to your pantry.
    *   **Voice-to-Text**: Use your microphone to speak ingredient names, which are automatically added to the search filter.
*   **Grocery Shopping Integration**: Each ingredient in the list includes a "Buy" button with direct links to popular grocery delivery services (Zepto, Swiggy Instamart, etc.) to make shopping seamless.
*   **Dietary Customization**: Filter recipes based on common dietary preferences like vegetarian, vegan, gluten-free, and high-protein.
*   **User Authentication**: Secure user login and registration handled by Firebase Authentication, including Google federated sign-in.
*   **Personalized Recipe Management**: Users can save their favorite recipes and view a list of recently generated ones, all stored and managed with Firestore.
*   **Comprehensive User Profiles**: Users can manage their personal information, update their profile photo, and view their cooking statistics.
*   **Fully Responsive Design**: A mobile-first approach ensures a seamless experience across all devices, from desktops to smartphones.

## 🛠️ Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (using the App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **AI Toolkit**: [Genkit](https://firebase.google.com/docs/genkit) for defining and managing AI flows with Google's Gemini models.
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
*   **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) for a modern, accessible, and customizable component library.
*   **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth) for secure user management.
*   **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore) for storing user profiles and saved recipes.
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand) for lightweight, global state management.
*   **Deployment**: Ready for [Firebase App Hosting](https://firebase.google.com/docs/hosting).

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later)
*   npm

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-repo/chef-ai.git
    cd chef-ai
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of your project and add your Firebase project configuration keys. This is required for Firebase services and Genkit to connect to your backend.
    ```env
    # Firebase and Google Cloud credentials
    NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
    # ... and other necessary environment variables
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## 🏗️ Project Structure

The project follows the standard Next.js App Router structure.

```
src
├── ai/                    # Genkit AI flows and configuration
│   ├── flows/             # Individual AI flow definitions
│   └── genkit.ts          # Global Genkit configuration
├── app/                   # Next.js App Router pages and layouts
│   ├── (auth)/            # Route group for login/signup pages
│   ├── dashboard/         # Main application dashboard and protected routes
│   └── ...
├── components/            # Reusable React components
│   ├── ui/                # Shadcn/UI components
│   └── ...
├── hooks/                 # Custom React hooks (e.g., useAuth, useSpeechRecognition)
├── lib/                   # Utility functions and Firebase configuration
├── services/              # Functions for interacting with backend services (e.g., Firestore)
└── store/                 # Zustand state management stores (profile, recipes)
```

This clear and detailed README should provide a great overview of your project!