import type { Recipe } from '~/backend';
import RecipeCard from './RecipeCard';

interface RecipeListProps {
  recipes: Recipe[];
  loading: boolean;
}

const SKELETON_IDS = Array.from({ length: 6 }, (_, index) => `skeleton-${String(index)}`);

function RecipeCardSkeleton() {
  return (
    <div className="border-border bg-surface flex animate-pulse flex-col overflow-hidden rounded-2xl border">
      <div className="bg-surface-2 aspect-2/1 w-full" />
      <div className="flex flex-col gap-2 px-4 pt-3 pb-4">
        <div className="bg-surface-2 h-4 w-1/2 rounded" />
        <div className="bg-surface-2 h-3 w-1/4 rounded" />
      </div>
    </div>
  );
}

function RecipeList({ recipes, loading }: RecipeListProps) {
  if (!loading && recipes.length === 0) {
    return (
      <p className="text-text-muted order-3 mt-8 text-[0.95rem]">
        Nincs a keresésnek megfelelő recept.
      </p>
    );
  }

  return (
    <div
      className="order-3 mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
      aria-busy={loading}>
      {loading
        ? SKELETON_IDS.map((id) => <RecipeCardSkeleton key={id} />)
        : recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
    </div>
  );
}

export default RecipeList;
