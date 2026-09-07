import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  backend,
  CALORIE_UNITS,
  type CalorieUnit,
  type Ingredient,
  type Recipe,
  type RecipeInput,
  type Step,
} from '~/backend';
import { useRecipe } from '~/hooks/useRecipe';

function parseIngredients(text: string): Ingredient[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator = line.indexOf('|');
      if (separator === -1) {
        return { quantity: '', name: line };
      }
      return {
        quantity: line.slice(0, separator).trim(),
        name: line.slice(separator + 1).trim(),
      };
    });
}

function parseSteps(text: string): Step[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((instruction) => ({ instruction }));
}

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
  const [image, setImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);

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
        let imageUrl = initial.imageUrl;

        if (image) {
          imageUrl = await backend.images.upload(initial.id, image);
        } else if (removeImage) {
          if (initial.imageUrl) {
            await backend.images.remove(initial.id);
          }
          imageUrl = null;
        }

        await backend.recipes.update(initial.id, { ...input, imageUrl });
        void navigate(`/recipe/${initial.id}`);
      } else {
        const created = await backend.recipes.create(input);

        if (image) {
          const imageUrl = await backend.images.upload(created.id, image);
          await backend.recipes.update(created.id, { ...input, imageUrl });
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
            setImage(event.target.files?.[0] ?? null);
          }}
        />
      </label>

      {editing && initial?.imageUrl ? (
        <label>
          <input
            type="checkbox"
            checked={removeImage}
            onChange={(event) => {
              setRemoveImage(event.target.checked);
            }}
          />
          Kép eltávolítása
        </label>
      ) : null}

      <button type="submit" disabled={saving}>
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
