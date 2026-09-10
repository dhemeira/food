import { useMemo } from 'react';
import RecipeList from '~/components/RecipeList';
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

  return <div>{loading ? <LoadingState /> : <RecipeList recipes={results} />}</div>;
}

export default Home;
