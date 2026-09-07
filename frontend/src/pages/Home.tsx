import { useMemo, useState } from 'react';
import RecipeList from '~/components/RecipeList';
import Search from '~/components/Search';
import { useRecipes } from '~/hooks/useRecipes';

function matches(query: string, recipe: { title: string; description: string | null }): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const haystack = `${recipe.title} ${recipe.description ?? ''}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

function Home() {
  const { recipes, loading } = useRecipes();
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => recipes.filter((recipe) => matches(query, recipe)),
    [recipes, query]
  );

  if (loading) {
    return <p>Betöltés…</p>;
  }

  return (
    <div>
      <Search value={query} onChange={setQuery} />
      <RecipeList recipes={results} />
    </div>
  );
}

export default Home;
