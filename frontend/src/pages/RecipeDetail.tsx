import { Link, useNavigate, useParams } from 'react-router-dom';
import { backend } from '~/backend';
import WakeLock from '~/components/WakeLock';
import { Button, EmptyState, ErrorState, LoadingState, Modal } from '@dhemeira/ui';
import { useAuth } from '~/context/auth';
import { useRecipe } from '~/hooks/useRecipe';
import { useRecipeImage } from '~/hooks/useRecipeImage';
import { useUserDisplayName } from '~/hooks/useUserDisplayName';

function RecipeDetail() {
  const { id } = useParams();
  const { recipe, loading, error, reload } = useRecipe(id);
  const { image } = useRecipeImage(id, recipe?.hasImage ?? false);
  const { user, isAdmin } = useAuth();
  const authorName = useUserDisplayName(recipe?.createdBy);
  const navigate = useNavigate();

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
      {authorName ? <p>Készítette: {authorName}</p> : null}
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

      {user ? (
        <Button as={Link} to={`/recipe/${current.id}/edit`} small>
          Szerkesztés
        </Button>
      ) : null}
      {isAdmin ? (
        <Modal
          title="Törlés"
          trigger={(open) => (
            <Button variant="danger" block onClick={open}>
              Törlés
            </Button>
          )}>
          <p>Biztos törölni akarod?</p>
          <Button variant="secondary" small data-modal-close>
            Mégse
          </Button>
          <Button
            variant="danger-full"
            small
            data-modal-close
            onClick={() => {
              void handleDelete();
            }}>
            Törlés
          </Button>
        </Modal>
      ) : null}
    </div>
  );
}

export default RecipeDetail;
