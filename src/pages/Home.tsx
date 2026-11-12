import { useMemo } from 'react';
import RecipeList from '~/components/RecipeList';
import { useDocumentTitle } from '~/hooks/useDocumentTitle';
import { useRecipes } from '~/hooks/useRecipes';
import { matchesRecipeQuery } from '~/lib/search';
import { useSearchQuery } from '~/lib/searchStore';

function Home() {
  const { recipes, loading } = useRecipes();
  const query = useSearchQuery();

  useDocumentTitle('Receptek');

  const results = useMemo(
    () => recipes.filter((recipe) => matchesRecipeQuery(query, recipe)),
    [recipes, query]
  );

  return <RecipeList recipes={results} loading={loading} />;
}

export default Home;
