import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

import { Recipe } from '../recipes/recipe.model';
import { RecipeService } from '../recipes/recipe.service';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class DataStorageService {
  constructor(private http: HttpClient, private recipeService: RecipeService, private authService : AuthService) {}

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
      return this.http
      .put(
        'https://authpractice-86973.firebaseio.com/recipes.json',
        recipes
      ).subscribe(response => {
      console.log(response);
    });
  }

  fetchRecipes() {
      return this.http
      .get<Recipe[]>(
        'https://authpractice-86973.firebaseio.com/recipes.json').pipe( map(recipes => {
         return recipes.map(recipe => {
        return {
          ...recipe,
          ingredients: recipe.ingredients ? recipe.ingredients : []
        };
      });
    }),
    tap(recipes => {
      this.recipeService.setRecipes(recipes);
    }))
  }
}
