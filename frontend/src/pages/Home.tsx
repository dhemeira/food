import { useMemo, useState } from 'react';
import RecipeList from '~/components/RecipeList';
import Search from '~/components/Search';
import { LoadingState } from '@dhemeira/ui';
import { useRecipes } from '~/hooks/useRecipes';
import { matchesRecipeQuery } from '~/lib/search';

function Home() {
  const { recipes, loading } = useRecipes();
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => recipes.filter((recipe) => matchesRecipeQuery(query, recipe)),
    [recipes, query]
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div>
      <Search value={query} onChange={setQuery} />
      <RecipeList recipes={results} />
    </div>
  );
}

export default Home;
