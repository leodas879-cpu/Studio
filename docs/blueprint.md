# ChefAI Blueprint

This document outlines the architecture and components of the ChefAI application.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI/Generative**: Genkit with Google AI
- **Authentication**: Firebase Auth
- **Database**: Firestore

## File Structure

The project follows a standard Next.js `src` directory structure.

- `src/app`: Contains all routes and pages.
- `src/components`: Reusable React components.
- `src/ai`: Genkit flows and AI-related logic.
- `src/lib`: Utility functions and library initializations (Firebase).
- `src/hooks`: Custom React hooks.
- `src/services`: Server-side functions for database interactions.
- `src/store`: Zustand stores for client-side state management.
