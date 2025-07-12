import { NextResponse } from 'next/server';
import { analyzeImage, generateRecipes } from '@/lib/geminiClient';

export async function POST(request: Request) {
  try {
    const { image, preferences } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Please provide an image' },
        { status: 400 }
      );
    }

    // First analyze the image to get ingredients
    const ingredients = await analyzeImage(image);

    // Then generate recipes based on the ingredients
    const recipes = await generateRecipes(ingredients, preferences);

    // Add placeholder images for recipes
    const recipesWithImages = recipes.map(recipe => ({
      ...recipe,
      imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(recipe.name)}`
    }));

    return NextResponse.json({ recipes: recipesWithImages });
  } catch (error) {
    console.error('Error generating recipes:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipes' },
      { status: 500 }
    );
  }
} 