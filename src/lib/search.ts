export function matchesRecipeQuery(
  query: string,
  recipe: { title: string; description: string | null }
): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const haystack = `${recipe.title} ${recipe.description ?? ''}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
}
