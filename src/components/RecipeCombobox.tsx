import { useEffect, useMemo, useRef, useState } from 'react';
import type { Recipe } from '~/backend';

interface RecipeComboboxProps {
  recipes: Recipe[];
  selected: Recipe | null;
  onSelect: (recipe: Recipe) => void;
}

function RecipeCombobox({ recipes, selected, onSelect }: RecipeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? recipes.filter((r) => r.title.toLowerCase().includes(q)) : recipes;
    return list.slice(0, 50);
  }, [recipes, query]);

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent): void {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onDoc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
    };
  }, [open]);

  function select(recipe: Recipe): void {
    onSelect(recipe);
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
        }}
        className="border-border bg-background text-text w-full rounded-lg border px-3 py-2 text-left">
        {selected ? selected.title : 'Recept kiválasztása…'}
      </button>

      {open ? (
        <div className="border-border bg-surface absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border p-1">
          <input
            autoFocus
            type="search"
            value={query}
            placeholder="Keresés…"
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            className="border-border bg-background text-text mb-1 w-full rounded-md border px-2 py-1"
          />
          {matches.length === 0 ? (
            <p className="text-text/60 p-2 text-sm">Nincs találat.</p>
          ) : (
            matches.map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                onPointerDown={() => {
                  select(recipe);
                }}
                className="text-text hover:bg-accent-soft block w-full rounded-md px-2 py-1 text-left">
                {recipe.title}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export default RecipeCombobox;
