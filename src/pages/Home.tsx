import { useMemo } from 'react';
import type { Recipe } from '~/backend';
import RecipeList from '~/components/RecipeList';
import { useDocumentTitle } from '~/hooks/useDocumentTitle';
import { useRecipes } from '~/hooks/useRecipes';
import { matchesRecipeQuery } from '~/lib/search';
import { useSearchQuery } from '~/lib/searchStore';

/** Most-cooked first, then most recently cooked, then most recently edited. */
function compareRecipes(a: Recipe, b: Recipe): number {
  return (
    b.cookedCount - a.cookedCount ||
    (b.lastCookedAt ?? '').localeCompare(a.lastCookedAt ?? '') ||
    (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '')
  );
}

function Home() {
  const { recipes, loading } = useRecipes();
  const query = useSearchQuery();

  useDocumentTitle('Receptek');

  const results = useMemo(
    () => recipes.filter((recipe) => matchesRecipeQuery(query, recipe)).sort(compareRecipes),
    [recipes, query]
  );

  return (
    <>
      <header className="order-1 pt-4 min-[720px]:pt-12">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-[clamp(2rem,5vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            Receptek
          </h1>
          {loading ? null : (
            <span className="text-text-muted text-[0.8125rem] font-medium tabular-nums">
              {results.length} recept
            </span>
          )}
        </div>
      </header>
      <RecipeList recipes={results} loading={loading} />
    </>
  );
}

export default Home;
