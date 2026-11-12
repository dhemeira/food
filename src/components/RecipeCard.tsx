import { Link } from 'react-router-dom';
import type { Recipe } from '~/backend';
import { requestWakeLock } from '~/lib/wakeLock';

interface RecipeCardProps {
  recipe: Recipe;
}

function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link
      className="bg-surface border-border hover:border-accent/35 hover:bg-surface-2 box-content flex w-full max-w-100 flex-col gap-1 overflow-hidden rounded-xl border transition-transform duration-200 ease-out hover:-translate-y-0.75"
      to={`/recipe/${recipe.id}`}
      onClick={() => {
        void requestWakeLock();
      }}>
      {recipe.thumb ? (
        <img
          className="aspect-2/1 max-h-50 w-full object-cover"
          src={recipe.thumb}
          alt=""
          loading="lazy"
        />
      ) : (
        <div className="from-surface-2 to-border aspect-2/1 max-h-50 w-full bg-linear-135"></div>
      )}
      <div className="flex flex-col gap-1 px-4 py-2">
        <span className="line-clamp-2">{recipe.title}</span>
        {recipe.calorieValue ? (
          <div className="text-text-muted flex items-center gap-1 text-sm">
            <span>{recipe.calorieValue}</span>
            <span>{recipe.calorieUnit ?? 'kcal'}</span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}

export default RecipeCard;
