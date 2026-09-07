import { Link, useNavigate, useParams } from 'react-router-dom';
import { backend } from '~/backend';
import { useAuth } from '~/context/auth';
import { useRecipe } from '~/hooks/useRecipe';

function RecipeDetail() {
  const { id } = useParams();
  const { recipe, loading } = useRecipe(id);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <p>Betöltés…</p>;
  }

  if (!recipe) {
    return <p>A recept nem található.</p>;
  }

  const current = recipe;
  const recipeId = id ?? '';

  async function handleDelete(): Promise<void> {
    if (recipeId === '' || !window.confirm('Biztosan törlöd ezt a receptet?')) return;

    await backend.recipes.remove(recipeId);
    if (current.imageUrl) {
      await backend.images.remove(recipeId).catch(() => undefined);
    }
    void navigate('/');
  }

  return (
    <div>
      <h1>{current.title}</h1>
      {current.description ? <p>{current.description}</p> : null}
      {current.imageUrl ? (
        <img src={current.imageUrl} alt={current.title} width={1000} height={400} />
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
        <button type="button" onClick={() => void handleDelete()}>
          Törlés
        </button>
      ) : null}
    </div>
  );
}

export default RecipeDetail;
