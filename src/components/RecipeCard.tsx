import { Link } from 'react-router-dom';
import type { Recipe } from '~/backend';
import Logo from '~/components/Logo';
import { requestWakeLock } from '~/lib/wakeLock';

interface RecipeCardProps {
  recipe: Recipe;
}

function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link
      className="card border-border bg-surface hover:border-border-hover hover:bg-surface-2 flex flex-col overflow-hidden rounded-2xl border transition-colors duration-200"
      to={`/recipe/${recipe.id}`}
      onClick={() => {
        void requestWakeLock();
      }}>
      {recipe.thumb ? (
        <div className="bg-surface-2 relative aspect-2/1 w-full overflow-hidden">
          <img
            className="card-image h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            src={recipe.thumb}
            alt=""
            loading="lazy"
          />
          <div className="card-media-shade pointer-events-none absolute inset-0" />
        </div>
      ) : (
        <div className="bg-surface-2 relative grid aspect-2/1 w-full place-items-center">
          <Logo className="size-8 opacity-35" />
        </div>
      )}

      <div className="flex flex-col gap-0.5 px-4 pt-3 pb-4">
        <span className="line-clamp-2 min-h-[2.6em] text-base leading-[1.3] font-semibold tracking-[-0.015em]">
          {recipe.title}
        </span>
        <div className="text-text-muted flex min-h-[2.5em] flex-col gap-px text-[0.78125rem] leading-[1.25] tabular-nums">
          {recipe.calorieValue !== null ? (
            <span>
              {recipe.calorieValue} {recipe.calorieUnit ?? 'kcal'}
            </span>
          ) : null}
          {recipe.cookedCount > 0 ? <span>{recipe.cookedCount}x főzve</span> : null}
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard;
