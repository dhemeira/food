import type { Recipe } from '~/backend';
import { EmptyState } from '@dhemeira/ui';
import RecipeCard from './RecipeCard';

interface RecipeListProps {
  recipes: Recipe[];
}

function RecipeList({ recipes }: RecipeListProps) {
  if (recipes.length === 0) {
    return <EmptyState message="Nincs találat." />;
  }

  return (
    <div className="mx-auto grid w-full max-w-205 auto-rows-fr grid-cols-1 justify-items-center gap-4 sm:grid-cols-2">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}

export default RecipeList;
