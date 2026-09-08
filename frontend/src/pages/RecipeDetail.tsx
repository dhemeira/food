import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { backend } from '~/backend';
import WakeLock from '~/components/WakeLock';
import { Button, EmptyState, ErrorState, LoadingState } from '~/components/ui';
import { useAuth } from '~/context/auth';
import { useRecipe } from '~/hooks/useRecipe';
import { useRecipeImage } from '~/hooks/useRecipeImage';

function RecipeDetail() {
  const { id } = useParams();
  const { recipe, loading, error, reload } = useRecipe(id);
  const { image } = useRecipeImage(id, recipe?.hasImage ?? false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={reload} />;
  }

  if (!recipe) {
    return <EmptyState message="A recept nem található." />;
  }

  const current = recipe;
  const recipeId = id ?? '';

  async function handleDelete(): Promise<void> {
    if (recipeId === '') return;

    await backend.recipes.remove(recipeId);
    void navigate('/');
  }

  return (
    <div>
      <WakeLock />
      <h1>{current.title}</h1>
      {current.description ? <p>{current.description}</p> : null}
      {current.hasImage && image ? (
        <img src={image} alt={current.title} width={1000} height={400} />
      ) : null}
      {current.calorieValue !== null ? (
        <p>
          {current.calorieValue} {current.calorieUnit}
        </p>
      ) : null}

      <h2>Hozzávalók</h2>
      <ul>
        {current.ingredients.map((ingredient, index) => (
          // eslint-disable-next-line react-x/no-array-index-key -- ingredients have no stable id
          <li key={index}>
            {ingredient.quantity} {ingredient.name}
          </li>
        ))}
      </ul>

      <h2>Elkészítés</h2>
      <ol>
        {current.steps.map((step, index) => (
          // eslint-disable-next-line react-x/no-array-index-key -- steps have no stable id
          <li key={index}>{step.instruction}</li>
        ))}
      </ol>

      {user ? <Link to={`/recipe/${current.id}/edit`}>Szerkesztés</Link> : null}
      {isAdmin ? (
        confirmingDelete ? (
          <div>
            <span>Biztosan törlöd ezt a receptet?</span>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                void handleDelete();
              }}>
              Törlés
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setConfirmingDelete(false);
              }}>
              Mégse
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              setConfirmingDelete(true);
            }}>
            Törlés
          </Button>
        )
      ) : null}
    </div>
  );
}

export default RecipeDetail;
