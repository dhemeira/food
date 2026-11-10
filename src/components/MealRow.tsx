import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Recipe } from '~/backend';
import { amountLabel, mealKcal } from '~/lib/dailyMenu';
import RecipeCombobox from './RecipeCombobox';

interface MealRowProps {
  label: string;
  recipes: Recipe[];
  recipe: Recipe | null;
  amount: number;
  onSelect: (recipe: Recipe) => void;
  onAmountChange: (amount: number) => void;
  onClear: () => void;
}

function MealRow({
  label,
  recipes,
  recipe,
  amount,
  onSelect,
  onAmountChange,
  onClear,
}: MealRowProps) {
  const kcal = recipe ? mealKcal(recipe, amount) : null;

  return (
    <div className="border-border bg-surface rounded-xl border p-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2 className="text-text text-sm font-semibold">{label}</h2>
        {recipe ? (
          <button
            type="button"
            onClick={onClear}
            aria-label={`${label} törlése`}
            className="text-text/60 hover:text-danger p-1">
            <XMarkIcon className="size-5" />
          </button>
        ) : null}
      </div>

      <RecipeCombobox recipes={recipes} selected={recipe} onSelect={onSelect} />

      {recipe ? (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(event) => {
              onAmountChange(Number(event.target.value));
            }}
            className="border-border bg-background text-text w-24 rounded-md border px-2 py-1"
          />
          <span className="text-text/60 text-sm">{amountLabel(recipe)}</span>
          <span className="text-text ml-auto text-sm font-semibold">
            {kcal != null ? `${String(Math.round(kcal))} kcal` : '—'}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export default MealRow;
