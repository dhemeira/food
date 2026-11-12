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
    <div className="flex flex-wrap justify-center gap-2">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}

export default RecipeList;
