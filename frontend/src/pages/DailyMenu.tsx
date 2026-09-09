import { useMemo } from 'react';
import { LoadingState } from '@dhemeira/ui';
import MealRow from '~/components/MealRow';
import { useRecipes } from '~/hooks/useRecipes';
import { MEAL_SLOTS, defaultAmountFor, mealKcal, omitMeal, useDailyMenu } from '~/lib/dailyMenu';

function DailyMenu() {
  const { recipes, loading } = useRecipes();
  const [state, setState] = useDailyMenu();

  const byId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  const total = useMemo(() => {
    let sum = 0;
    for (const slot of MEAL_SLOTS) {
      const entry = state.meals[slot.key];
      if (!entry) continue;
      const recipe = byId.get(entry.recipeId);
      if (!recipe) continue;
      const kcal = mealKcal(recipe, entry.amount);
      if (kcal != null) sum += kcal;
    }
    return sum;
  }, [state.meals, byId]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-text text-xl font-semibold">Napi menü</h1>

      <div className="border-border bg-surface rounded-xl border p-3">
        <label htmlFor="daily-target" className="text-text text-sm font-semibold">
          Napi cél (kcal)
        </label>
        <input
          id="daily-target"
          type="number"
          min={0}
          value={state.target}
          onChange={(event) => {
            setState((s) => ({ ...s, target: Number(event.target.value) }));
          }}
          className="border-border bg-background text-text mt-1 w-full rounded-md border px-2 py-1"
        />
      </div>

      {MEAL_SLOTS.map((slot) => {
        const entry = state.meals[slot.key];
        const recipe = entry ? (byId.get(entry.recipeId) ?? null) : null;
        return (
          <MealRow
            key={slot.key}
            label={slot.label}
            recipes={recipes}
            recipe={recipe}
            amount={entry?.amount ?? 1}
            onSelect={(r) => {
              setState((s) => ({
                ...s,
                meals: {
                  ...s.meals,
                  [slot.key]: { recipeId: r.id, amount: defaultAmountFor(r) },
                },
              }));
            }}
            onAmountChange={(amount) => {
              setState((s) => {
                const current = s.meals[slot.key];
                if (!current) return s;
                return {
                  ...s,
                  meals: { ...s.meals, [slot.key]: { ...current, amount } },
                };
              });
            }}
            onClear={() => {
              setState((s) => ({ ...s, meals: omitMeal(s.meals, slot.key) }));
            }}
          />
        );
      })}

      <div className="border-border bg-surface rounded-xl border p-3">
        <div className="text-text flex items-center justify-between">
          <span className="font-semibold">Összesen</span>
          <span className="text-lg font-semibold">{Math.round(total)} kcal</span>
        </div>
        {state.target > 0 ? (
          <div className="text-text/60 text-sm">
            {`${String(Math.round(state.target - total))} kcal maradt a célból`}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DailyMenu;
