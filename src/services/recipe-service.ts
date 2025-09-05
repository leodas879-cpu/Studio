
'use server';

import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe-flow';

const USERS_COLLECTION = 'users';
const RECIPES_COLLECTION = 'recipes';

export async function saveRecipe(uid: string, recipe: GenerateRecipeOutput & { isFavorite?: boolean }) {
  const recipeRef = doc(db, USERS_COLLECTION, uid, RECIPES_COLLECTION, recipe.recipeName);
  await setDoc(recipeRef, { ...recipe, isFavorite: true }, { merge: true });
}

export async function removeRecipe(uid: string, recipeName: string) {
  const recipeRef = doc(db, USERS_COLLECTION, uid, RECIPES_COLLECTION, recipeName);
  await deleteDoc(recipeRef);
}

export async function getRecipes(uid: string): Promise<(GenerateRecipeOutput & { isFavorite?: boolean })[]> {
  const recipesRef = collection(db, USERS_COLLECTION, uid, RECIPES_COLLECTION);
  const querySnapshot = await getDocs(recipesRef);
  const recipes: (GenerateRecipeOutput & { isFavorite?: boolean })[] = [];
  querySnapshot.forEach((doc) => {
    recipes.push(doc.data() as GenerateRecipeOutput & { isFavorite?: boolean });
  });
  return recipes;
}
