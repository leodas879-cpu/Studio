
'use server';

import { db } from '@/lib/firebase';
import type { Recipe } from '@/store/recipe-store';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where } from "firebase/firestore";

async function getFavoritesCollectionRef(uid: string) {
  const userDocRef = doc(db, 'users', uid);
  return collection(userDocRef, 'favoriteRecipes');
}

export async function saveRecipe(uid:string, recipe: Recipe) {
  try {
    const favoritesCollection = await getFavoritesCollectionRef(uid);
    const recipeDoc = doc(favoritesCollection, recipe.recipeName);
    await setDoc(recipeDoc, recipe);
  } catch (error) {
    console.error('Error saving recipe:', error);
  }
}

export async function removeRecipe(uid: string, recipeName: string) {
  try {
    const favoritesCollection = await getFavoritesCollectionRef(uid);
    const recipeDoc = doc(favoritesCollection, recipeName);
    await deleteDoc(recipeDoc);
  } catch (error) {
    console.error('Error removing recipe:', error);
  }
}

export async function getRecipes(uid: string): Promise<Recipe[]> {
    try {
        const favoritesCollection = await getFavoritesCollectionRef(uid);
        const querySnapshot = await getDocs(favoritesCollection);
        const recipes: Recipe[] = [];
        querySnapshot.forEach((doc) => {
            recipes.push(doc.data() as Recipe);
        });
        return recipes;
    } catch (error) {
        console.error('Error getting recipes:', error);
        return [];
    }
}
