/* eslint-disable react-x/no-array-index-key -- recipe ingredients and steps have no stable ids */
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { EmptyState, ErrorState, Modal } from '@dhemeira/ui';
import { backend } from '~/backend';
import CookCounter from '~/components/CookCounter';
import WakeLock from '~/components/WakeLock';
import { useAuth } from '~/context/auth';
import { useDocumentTitle } from '~/hooks/useDocumentTitle';
import { useRecipe } from '~/hooks/useRecipe';
import { useRecipeImage } from '~/hooks/useRecipeImage';

const ACTION_BUTTON_CLASS =
  'border-border bg-surface-2 text-text hover:border-border-hover hover:bg-surface inline-flex h-11 ' +
  'items-center justify-center rounded-xl border px-4 text-sm font-semibold transition-colors';

const DANGER_BUTTON_CLASS =
  'border-danger/35 text-danger hover:border-danger/60 hover:bg-danger/10 inline-flex h-11 ' +
  'items-center justify-center rounded-xl border bg-transparent px-4 text-sm font-semibold transition-colors';

const MICRO_LABEL_CLASS =
  'text-text-muted m-0 mb-4 text-[0.6875rem] font-semibold tracking-[0.11em] uppercase';

function RecipeDetailSkeleton() {
  return (
    <div className="-mx-4 min-[720px]:mx-0 min-[720px]:pt-8">
      <div className="border-border bg-surface overflow-hidden rounded-none border-0 min-[720px]:rounded-3xl min-[720px]:border">
        <div className="bg-surface-2 aspect-[5/2] min-h-64 w-full animate-pulse min-[720px]:min-h-80" />
        <div className="flex animate-pulse flex-col gap-4 px-2 pt-4 pb-6 min-[720px]:px-8 min-[720px]:pt-8 min-[720px]:pb-8">
          <div className="bg-surface-2 h-4 w-2/3 rounded" />
          <div className="bg-surface-2 h-4 w-1/3 rounded" />
          <div className="bg-surface-2 h-40 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function RecipeDetail() {
  const { id } = useParams();
  const { recipe, loading, error, reload } = useRecipe(id);
  const { image } = useRecipeImage(id, recipe?.hasImage ?? false);
  const { user, isAdmin, isAllowed } = useAuth();
  const navigate = useNavigate();

  // Keyed by recipe id so navigating to another recipe never shows the
  // previous recipe's optimistic count.
  const [cookedState, setCookedState] = useState<{ id: string; value: number } | null>(null);
  const [cookingId, setCookingId] = useState<string | null>(null);

  useDocumentTitle(recipe?.title ?? 'Receptek');

  if (loading) {
    return <RecipeDetailSkeleton />;
  }

  if (error) {
    return (
      <ErrorState message={error} title="Hiba történt" retryLabel="Újrapróbálás" onRetry={reload} />
    );
  }

  if (!recipe) {
    return <EmptyState message="A recept nem található." />;
  }

  const current = recipe;
  const cooked = cookedState?.id === current.id ? cookedState.value : current.cookedCount;
  const cooking = cookingId === current.id;
  const canCook = user !== null && isAllowed;
  const hasIngredients = current.ingredients.length > 0;
  const hasSteps = current.steps.length > 0;
  const recipeId = id ?? '';

  async function handleCook(delta: 1 | -1): Promise<void> {
    if (cooking) return;

    const previous = cooked;
    setCookedState({ id: current.id, value: Math.max(0, cooked + delta) });
    setCookingId(current.id);

    try {
      const next = await backend.recipes.cook(current.id, delta);
      setCookedState({ id: current.id, value: next });
    } catch {
      setCookedState({ id: current.id, value: previous });
    } finally {
      setCookingId(null);
    }
  }

  async function handleDelete(): Promise<void> {
    if (recipeId === '') return;

    await backend.recipes.remove(recipeId);
    void navigate('/');
  }

  return (
    <div className="-mx-4 min-[720px]:mx-0 min-[720px]:pt-8">
      <WakeLock />
      <article className="border-border bg-surface overflow-hidden rounded-none border-0 min-[720px]:rounded-3xl min-[720px]:border">
        <div className="bg-surface-2 relative aspect-[5/2] min-h-64 w-full min-[720px]:min-h-80">
          {current.hasImage && image ? (
            <img className="absolute inset-0 h-full w-full object-cover" src={image} alt="" />
          ) : (
            <div className="hero-empty absolute inset-0" />
          )}
          <div className="media-shade pointer-events-none absolute inset-0" />

          <Link
            to="/"
            aria-label="Vissza a receptekhez"
            className="bg-background/60 text-text hover:bg-background/85 absolute top-4 left-4 grid size-11 place-items-center rounded-full border border-white/[0.16] backdrop-blur-md transition-colors">
            <ArrowLeftIcon className="size-5" aria-hidden="true" />
          </Link>

          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            <button
              type="button"
              aria-label="Megosztás"
              className="bg-background/60 text-text hover:bg-background/85 inline-flex h-11 items-center gap-2 rounded-full border border-white/[0.16] px-4 text-[0.8125rem] font-medium backdrop-blur-md transition-colors">
              <ArrowUpTrayIcon className="size-4" aria-hidden="true" />
              <span>Megosztás</span>
            </button>
          </div>

          <div className="absolute inset-x-4 bottom-4 min-[720px]:inset-x-8 min-[720px]:bottom-8">
            <div className="flex items-end justify-between gap-3">
              <h1 className="min-w-0 flex-1 text-[clamp(1.5rem,4vw,2.25rem)] leading-[1.1] font-semibold tracking-[-0.03em] text-balance">
                {current.title}
              </h1>
              {canCook ? (
                <CookCounter
                  count={cooked}
                  disabled={cooking}
                  onChange={(delta) => {
                    void handleCook(delta);
                  }}
                />
              ) : null}
            </div>

            {current.calorieValue !== null ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-text rounded-full border border-white/[0.15] bg-white/[0.08] px-3 py-1 text-xs font-medium tabular-nums">
                  {current.calorieValue} {current.calorieUnit ?? 'kcal'}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="px-2 pt-2 pb-4 min-[720px]:px-8 min-[720px]:pt-8 min-[720px]:pb-8">
          {current.description ? (
            <p className="text-text-soft max-w-[65ch] text-base leading-[1.65] text-pretty">
              {current.description}
            </p>
          ) : null}

          <div
            className={
              'mt-6 grid gap-5 min-[820px]:gap-10 ' +
              (hasIngredients && hasSteps
                ? 'min-[820px]:grid-cols-[minmax(0,400px)_minmax(0,1fr)]'
                : 'grid-cols-1')
            }>
            {hasIngredients ? (
              <section
                className="border-border bg-surface-2 rounded-2xl border p-4 min-[720px]:p-6"
                aria-labelledby="ingredients-title">
                <h2 id="ingredients-title" className={MICRO_LABEL_CLASS}>
                  Hozzávalók
                </h2>
                <ul className="flex flex-col gap-3">
                  {current.ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className="flex items-baseline justify-between gap-3 text-base text-pretty min-[720px]:text-[0.9375rem]">
                      <span>{ingredient.name}</span>
                      {ingredient.quantity ? (
                        <span className="text-text-muted whitespace-nowrap tabular-nums">
                          {ingredient.quantity}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {hasSteps ? (
              <section aria-labelledby="steps-title">
                <h2 id="steps-title" className={MICRO_LABEL_CLASS}>
                  Elkészítés
                </h2>
                <ol className="flex flex-col gap-5">
                  {current.steps.map((step, index) => (
                    <li key={index} className="flex gap-4 max-[719px]:block">
                      <span className="bg-accent-soft text-accent inline-grid size-8 flex-none place-items-center rounded-full text-[0.8125rem] font-semibold tabular-nums max-[719px]:mr-2 max-[719px]:align-middle">
                        {index + 1}
                      </span>
                      <span className="max-w-[65ch] text-base leading-[1.7] text-pretty min-[720px]:pt-1 min-[720px]:text-[0.9375rem]">
                        {step.instruction}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>

          {user !== null || isAdmin ? (
            <div className="border-border mt-8 flex justify-end border-t pt-6 max-[719px]:block">
              <div className="flex gap-2 max-[719px]:grid max-[719px]:w-full max-[719px]:auto-cols-fr max-[719px]:grid-flow-col">
                {user !== null ? (
                  <Link to={`/recipe/${current.id}/edit`} className={ACTION_BUTTON_CLASS}>
                    Szerkesztés
                  </Link>
                ) : null}
                {isAdmin ? (
                  <Modal
                    title="Törlés"
                    trigger={(open) => (
                      <button type="button" className={DANGER_BUTTON_CLASS} onClick={open}>
                        Törlés
                      </button>
                    )}>
                    <p className="text-text-soft mt-3">Biztos törölni akarod?</p>
                    <div className="mt-6 flex justify-end gap-2">
                      <button type="button" className={ACTION_BUTTON_CLASS} data-modal-close>
                        Mégse
                      </button>
                      <button
                        type="button"
                        className={DANGER_BUTTON_CLASS}
                        data-modal-close
                        onClick={() => {
                          void handleDelete();
                        }}>
                        Törlés
                      </button>
                    </div>
                  </Modal>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </article>
    </div>
  );
}

export default RecipeDetail;
