
# ChefAI Blueprint

This document outlines the structure and key components of the ChefAI application.

## Core Technologies

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS with ShadCN UI
- **AI/ML**: Genkit
- **Authentication & DB**: Firebase

## Project Structure

The project follows a standard Next.js `src` directory structure.

- `src/app`: Contains all routes and UI pages.
- `src/components`: Reusable React components, including ShadCN UI components.
- `src/lib`: Utility functions and library initializations (e.g., Firebase).
- `src/hooks`: Custom React hooks (e.g., `useAuth`, `useToast`).
- `src/store`: Zustand stores for global state management.
- `src/services`: Server-side functions for database interactions.
- `src/ai`: Genkit flows and AI-related logic.
