import { useMemo } from 'react';
import RecipeList from '~/components/RecipeList';
import Search from '~/components/Search';
import { LoadingState } from '@dhemeira/ui';
import { useRecipes } from '~/hooks/useRecipes';
import { matchesRecipeQuery } from '~/lib/search';
import { useSearchQuery } from '~/lib/searchStore';

function Home() {
  const { recipes, loading } = useRecipes();
  const query = useSearchQuery();

  const results = useMemo(
    () => recipes.filter((recipe) => matchesRecipeQuery(query, recipe)),
    [recipes, query]
  );

  return (
    <div>
      {/* The search field stays mounted even while recipes load, so it can be
          focused from the tab bar before the list is ready. */}
      <Search />
      {loading ? <LoadingState /> : <RecipeList recipes={results} />}
    </div>
  );
}

export default Home;
