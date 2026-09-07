import { Link } from 'react-router-dom';
import type { Recipe } from '~/backend';

interface RecipeListProps {
  recipes: Recipe[];
}

function RecipeList({ recipes }: RecipeListProps) {
  if (recipes.length === 0) {
    return <p>Nincs találat.</p>;
  }

  return (
    <ul>
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <Link to={`/recipe/${recipe.id}`}>
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                loading="lazy"
                width={400}
                height={160}
              />
            ) : null}
            <span>{recipe.title}</span>
            {recipe.description ? <span>{recipe.description}</span> : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default RecipeList;
