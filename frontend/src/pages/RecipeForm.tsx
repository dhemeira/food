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
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Select,
  Textarea,
} from '~/components/ui';
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
  const [titleError, setTitleError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { image: existingImage, loading: loadingImage } = useRecipeImage(
    editing ? initial?.id : undefined,
    editing && Boolean(initial?.hasImage)
  );

  function handleFileChange(file: File | null): void {
    setProcessed(null);
    setImageError(null);

    if (!file) return;

    setRemoveImage(false);
    setProcessing(true);
    processRecipeImage(file)
      .then((result) => {
        setProcessed(result);
      })
      .catch((error: unknown) => {
        setImageError(error instanceof Error ? error.message : 'A kép feldolgozása nem sikerült.');
      })
      .finally(() => {
        setProcessing(false);
      });
  }

  async function handleSubmit(): Promise<void> {
    const trimmedTitle = title.trim();
    if (trimmedTitle === '') {
      setTitleError('A recept címe kötelező.');
      return;
    }

    const input: RecipeInput = {
      title: trimmedTitle,
      description: description.trim() || null,
      calorieValue: calorieValue === '' ? null : Number(calorieValue),
      calorieUnit: calorieUnit === '' ? null : calorieUnit,
      ingredients: parseIngredients(ingredientsText),
      steps: parseSteps(stepsText),
    };

    setSaving(true);
    setSaveError(null);
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
      setSaveError(error instanceof Error ? error.message : 'Mentés közben hiba történt.');
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
      <Input
        label="Cím"
        value={title}
        error={titleError ?? undefined}
        onChange={(event) => {
          setTitle(event.target.value);
          setTitleError(null);
        }}
      />

      <Textarea
        label="Leírás"
        value={description}
        onChange={(event) => {
          setDescription(event.target.value);
        }}
      />

      <Input
        label="Kalória"
        value={calorieValue}
        onChange={(event) => {
          setCalorieValue(event.target.value);
        }}
      />
      <Select
        label="Mértékegység"
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
      </Select>

      <Textarea
        label="Hozzávalók (soronként: mennyiség|név)"
        value={ingredientsText}
        onChange={(event) => {
          setIngredientsText(event.target.value);
        }}
      />

      <Textarea
        label="Elkészítés (soronként egy lépés)"
        value={stepsText}
        onChange={(event) => {
          setStepsText(event.target.value);
        }}
      />

      <Input
        label="Kép"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          event.target.value = '';
          handleFileChange(file);
        }}
      />
      {imageError ? <p>{imageError}</p> : null}

      {processing ? <LoadingState label="Feldolgozás…" /> : null}

      {processed ? (
        <div>
          <img src={processed.full} alt="Új kép előnézete" width={400} height={160} />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setProcessed(null);
            }}>
            × Kiválasztott kép törlése
          </Button>
        </div>
      ) : editing && initial?.hasImage && !removeImage ? (
        loadingImage ? (
          <LoadingState label="Kép betöltése…" />
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

      {saveError ? <p>{saveError}</p> : null}

      <Button type="submit" loading={saving} disabled={processing}>
        {saving ? 'Mentés…' : 'Mentés'}
      </Button>
    </form>
  );
}

function RecipeForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { recipe, loading, error, reload } = useRecipe(editing ? id : undefined);

  if (editing && loading) {
    return <LoadingState />;
  }

  if (editing && error) {
    return <ErrorState message={error} onRetry={reload} />;
  }

  if (editing && !recipe) {
    return <EmptyState message="A recept nem található." />;
  }

  return <RecipeEditor key={recipe?.id ?? 'new'} editing={editing} initial={recipe} />;
}

export default RecipeForm;
