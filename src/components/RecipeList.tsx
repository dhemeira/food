import type { Recipe } from '~/backend';
import { EmptyState } from '@dhemeira/ui';
import RecipeCard from './RecipeCard';

interface RecipeListProps {
  recipes: Recipe[];
  loading: boolean;
}

const SKELETON_IDS = Array.from({ length: 6 }, (_, index) => `skeleton-${String(index)}`);

function RecipeCardSkeleton() {
  return (
    <div className="bg-surface border-border box-content flex w-full max-w-100 flex-col gap-1 overflow-hidden rounded-xl border">
      <div className="bg-surface-2 aspect-2/1 max-h-50 w-full"></div>
      <div className="flex h-16 flex-col gap-2 px-4 py-2">
        <div className="bg-surface-2 h-4 w-1/2 rounded"></div>
        <div className="bg-surface-2 h-3 w-1/4 rounded"></div>
      </div>
    </div>
  );
}

function RecipeList({ recipes, loading }: RecipeListProps) {
  if (!loading && recipes.length === 0) {
    return <EmptyState message="Nincs találat." />;
  }

  return (
    <div
      className="mx-auto grid w-full max-w-205 auto-rows-fr grid-cols-1 justify-items-center gap-4 sm:grid-cols-2"
      aria-busy={loading}>
      {loading
        ? SKELETON_IDS.map((id) => <RecipeCardSkeleton key={id} />)
        : recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
    </div>
  );
}

export default RecipeList;
