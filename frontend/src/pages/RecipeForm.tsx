import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  backend,
  CALORIE_UNITS,
  type CalorieUnit,
  type Recipe,
  type RecipeImage,
  type RecipeInput,
} from '~/backend';
import { useRecipe } from '~/hooks/useRecipe';
import { useRecipeImage } from '~/hooks/useRecipeImage';
import { processRecipeImage } from '~/lib/image';
import { parseIngredients, parseSteps } from '~/lib/recipeParsing';

interface RecipeEditorProps {
  editing: boolean;
  initial: Recipe | null;
}

function RecipeEditor({ editing, initial }: RecipeEditorProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [calorieValue, setCalorieValue] = useState(
    initial?.calorieValue != null ? String(initial.calorieValue) : ''
  );
  const [calorieUnit, setCalorieUnit] = useState<CalorieUnit | ''>(initial?.calorieUnit ?? '');
  const [ingredientsText, setIngredientsText] = useState(
    initial ? initial.ingredients.map((i) => `${i.quantity}|${i.name}`).join('\n') : ''
  );
  const [stepsText, setStepsText] = useState(
    initial ? initial.steps.map((s) => s.instruction).join('\n') : ''
  );
  const [processed, setProcessed] = useState<RecipeImage | null>(null);
  const [processing, setProcessing] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const { image: existingImage, loading: loadingImage } = useRecipeImage(
    editing ? initial?.id : undefined,
    editing && Boolean(initial?.hasImage)
  );

  function handleFileChange(file: File | null): void {
    setProcessed(null);

    if (!file) return;

    setRemoveImage(false);
    setProcessing(true);
    processRecipeImage(file)
      .then((result) => {
        setProcessed(result);
      })
      .catch((error: unknown) => {
        window.alert(error instanceof Error ? error.message : 'A kép feldolgozása nem sikerült.');
      })
      .finally(() => {
        setProcessing(false);
      });
  }

  async function handleSubmit(): Promise<void> {
    const input: RecipeInput = {
      title: title.trim(),
      description: description.trim() || null,
      calorieValue: calorieValue === '' ? null : Number(calorieValue),
      calorieUnit: calorieUnit === '' ? null : calorieUnit,
      ingredients: parseIngredients(ingredientsText),
      steps: parseSteps(stepsText),
    };

    if (input.title === '') {
      window.alert('A recept címe kötelező.');
      return;
    }

    setSaving(true);
    try {
      if (editing && initial) {
        await backend.recipes.update(initial.id, input);

        if (processed) {
          await backend.images.set(initial.id, processed);
        } else if (removeImage) {
          await backend.images.remove(initial.id);
        }

        void navigate(`/recipe/${initial.id}`);
      } else {
        const created = await backend.recipes.create(input);

        if (processed) {
          await backend.images.set(created.id, processed);
        }

        void navigate(`/recipe/${created.id}`);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Mentés közben hiba történt.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}>
      <label>
        Cím
        <input
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
          }}
        />
      </label>

      <label>
        Leírás
        <textarea
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
        />
      </label>

      <label>
        Kalória
        <input
          value={calorieValue}
          onChange={(event) => {
            setCalorieValue(event.target.value);
          }}
        />
        <select
          value={calorieUnit}
          onChange={(event) => {
            setCalorieUnit(event.target.value as CalorieUnit | '');
          }}>
          <option value="">—</option>
          {CALORIE_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </label>

      <label>
        Hozzávalók (soronként: mennyiség|név)
        <textarea
          value={ingredientsText}
          onChange={(event) => {
            setIngredientsText(event.target.value);
          }}
        />
      </label>

      <label>
        Elkészítés (soronként egy lépés)
        <textarea
          value={stepsText}
          onChange={(event) => {
            setStepsText(event.target.value);
          }}
        />
      </label>

      <label>
        Kép
        <input
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            event.target.value = '';
            handleFileChange(file);
          }}
        />
      </label>

      {processing ? <p>Feldolgozás…</p> : null}

      {processed ? (
        <div>
          <img src={processed.full} alt="Új kép előnézete" width={400} height={160} />
          <button
            type="button"
            onClick={() => {
              setProcessed(null);
            }}>
            × Kiválasztott kép törlése
          </button>
        </div>
      ) : editing && initial?.hasImage && !removeImage ? (
        loadingImage ? (
          <p>Kép betöltése…</p>
        ) : existingImage ? (
          <div>
            <img src={existingImage} alt="" width={400} height={160} />
            <span>Jelenlegi kép</span>
          </div>
        ) : null
      ) : null}

      {editing && initial?.hasImage ? (
        <label>
          <input
            type="checkbox"
            checked={removeImage}
            disabled={processing || processed !== null}
            onChange={(event) => {
              setRemoveImage(event.target.checked);
            }}
          />
          Kép eltávolítása
        </label>
      ) : null}

      <button type="submit" disabled={saving || processing}>
        {saving ? 'Mentés…' : 'Mentés'}
      </button>
    </form>
  );
}

function RecipeForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { recipe, loading } = useRecipe(editing ? id : undefined);

  if (editing && loading) {
    return <p>Betöltés…</p>;
  }

  if (editing && !recipe) {
    return <p>A recept nem található.</p>;
  }

  return <RecipeEditor key={recipe?.id ?? 'new'} editing={editing} initial={recipe} />;
}

export default RecipeForm;
