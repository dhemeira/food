import { Link } from 'react-router-dom';
import type { Recipe } from '~/backend';
import { requestWakeLock } from '~/lib/wakeLock';

interface RecipeCardProps {
  recipe: Recipe;
}

function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link
      className="bg-surface border-border flex w-full max-w-100 flex-col gap-1 overflow-hidden rounded-xl border"
      to={`/recipe/${recipe.id}`}
      onClick={() => {
        void requestWakeLock();
      }}>
      {recipe.thumb ? (
        <img
          className="aspect-5/2 max-h-40 w-full object-cover"
          src={recipe.thumb}
          alt=""
          loading="lazy"
        />
      ) : (
        <div className="from-surface-2 to-border aspect-5/2 max-h-40 w-full bg-linear-135"></div>
      )}
      <div className="flex flex-col gap-1 px-4 py-2">
        <span>{recipe.title}</span>
        {recipe.calorieValue ? (
          <span>
            {recipe.calorieValue}
            {recipe.calorieUnit}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

export default RecipeCard;
