import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '~/components/Layout';
import { listRecipes, type RecipeSummary } from '~/api/recipes';
import {
  registerSearchInput,
  setSearchActive,
  setSearchQuery,
  useSearchQuery,
} from '~/utils/search';

function Home() {
  const query = useSearchQuery();
  const [results, setResults] = useState<RecipeSummary[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    registerSearchInput(inputRef.current);

    return () => {
      registerSearchInput(null);
      setSearchActive(false);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      void (async () => {
        setResults(null);
        const rows = await listRecipes(query);
        if (!cancelled) setResults(rows);
      })();
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <Layout>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setSearchQuery(e.target.value);
        }}
        onFocus={() => {
          setSearchActive(true);
        }}
        onBlur={() => {
          setSearchActive(false);
        }}
        placeholder="Keresés…"
        autoComplete="off"
        className="sm:hidden"
      />
      {results === null ? (
        <p>Betöltés…</p>
      ) : results.length === 0 ? (
        <p>Nincs találat.</p>
      ) : (
        <ul>
          {results.map((recipe) => (
            <li key={recipe.id}>
              <Link to={`/recipe/${String(recipe.id)}`}>{recipe.title}</Link>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}

export default Home;
