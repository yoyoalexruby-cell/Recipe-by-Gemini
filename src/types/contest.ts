import { Recipe } from './recipe';

export interface ContestRating {
  taste: number;     // 1 - 5
  plating: number;   // 1 - 5
  heat: number;      // 1 - 5
  overall: number;   // Calculated out of 10
}

export interface ContestComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  score: number;
  content: string;
  createdAt: string;
}

export interface ContestSubmission {
  id: string;
  dishId: string;
  dishName: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  story: string;
  coverImage: string;
  galleryImages?: string[];
  secretTip?: string;
  ingredientsHighlight?: string[];
  recipeData: Recipe;
  totalScore: number;      // e.g. 9.8
  voteCount: number;       // e.g. 48
  ratings: {
    taste: number;
    plating: number;
    heat: number;
  };
  ratedBy: string[];       // User IDs that voted
  comments: ContestComment[];
  createdAt: string;
  badges?: string[];
}

export interface ContestTheme {
  id: string;
  dishName: string;
  dishEnglishName: string;
  category: string;
  coverImage: string;
  seasonTag: string;
  description: string;
  rules: string;
  deadline: string;
  prizeNote: string;
  benchmarkRecipeId?: string;
  tags: string[];
}
