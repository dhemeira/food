import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ReactCrop, { type PercentCrop } from 'react-image-crop';
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
} from '@dhemeira/ui';
import { useDocumentTitle } from '~/hooks/useDocumentTitle';
import { useRecipe } from '~/hooks/useRecipe';
import { useRecipeImage } from '~/hooks/useRecipeImage';
import {
  defaultCardCrop,
  deriveCropRegions,
  processRecipeImage,
  type CropRegion,
  type SourceSize,
} from '~/lib/image';
import { parseIngredients, parseSteps } from '~/lib/recipeParsing';

interface RecipeEditorProps {
  editing: boolean;
  initial: Recipe | null;
}

function pct(value: number): string {
  return `${String(value * 100)}%`;
}

function cropToRegion(percentCrop: PercentCrop): CropRegion {
  return {
    x: percentCrop.x / 100,
    y: percentCrop.y / 100,
    width: percentCrop.width / 100,
    height: percentCrop.height / 100,
  };
}

function toPercentCrop(region: CropRegion): PercentCrop {
  return {
    unit: '%',
    x: region.x * 100,
    y: region.y * 100,
    width: region.width * 100,
    height: region.height * 100,
  };
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<PercentCrop | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceSize, setSourceSize] = useState<SourceSize | null>(null);
  const [processing, setProcessing] = useState(false);
  const processRequest = useRef(0);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { image: existingImage, loading: loadingImage } = useRecipeImage(
    editing ? initial?.id : undefined,
    editing && Boolean(initial?.hasImage)
  );

  useEffect(() => {
    if (!sourceUrl) return;

    return () => {
      URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  function processCrop(file: File, percentCrop: PercentCrop, size: SourceSize): void {
    const request = processRequest.current + 1;
    processRequest.current = request;
    setProcessing(true);
    setImageError(null);

    processRecipeImage(file, cropToRegion(percentCrop), size)
      .then((result) => {
        if (processRequest.current === request) {
          setProcessed(result);
        }
      })
      .catch((error: unknown) => {
        if (processRequest.current === request) {
          setImageError(
            error instanceof Error ? error.message : 'A kép feldolgozása nem sikerült.'
          );
        }
      })
      .finally(() => {
        if (processRequest.current === request) {
          setProcessing(false);
        }
      });
  }

  function handleFileChange(file: File | null): void {
    setProcessed(null);
    setImageError(null);
    setSelectedFile(file);
    setSourceUrl(file ? URL.createObjectURL(file) : null);
    setSourceSize(null);
    setCrop(null);

    if (!file) return;

    setRemoveImage(false);
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

  const detailFrame =
    crop && sourceSize ? deriveCropRegions(cropToRegion(crop), sourceSize).detail : null;

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

      {selectedFile && sourceUrl ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Kivágás beállítása</p>
          <div className="relative w-fit max-w-full">
            <ReactCrop
              className="recipe-crop max-h-64"
              crop={crop ?? undefined}
              aspect={2}
              minWidth={40}
              keepSelection
              onChange={(_, percentCrop) => {
                setCrop(percentCrop);
              }}
              onComplete={(_, percentCrop) => {
                setCrop(percentCrop);
                if (sourceSize) {
                  processCrop(selectedFile, percentCrop, sourceSize);
                }
              }}>
              <img
                className="rounded-lg"
                src={sourceUrl}
                alt="Kivágás előnézete"
                draggable={false}
                onLoad={(event) => {
                  const size = {
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  };
                  const initialCrop = toPercentCrop(defaultCardCrop(size));
                  setSourceSize(size);
                  setCrop(initialCrop);
                  processCrop(selectedFile, initialCrop, size);
                }}
                onError={() => {
                  setImageError('A kép nem érvényes.');
                }}
              />
            </ReactCrop>
            {detailFrame ? (
              <span
                aria-hidden="true"
                className="border-accent pointer-events-none absolute border-2 border-dashed"
                style={{
                  left: pct(detailFrame.x),
                  top: pct(detailFrame.y),
                  width: pct(detailFrame.width),
                  height: pct(detailFrame.height),
                }}
              />
            ) : null}
          </div>
          <p className="text-text/60 text-sm">
            Húzd a kártya keretének sarkait a kép szűkebb kivágásához. A részletes nézet a kivágás
            magasságából számolódik.
          </p>
          <div className="text-text/60 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5">
              <span aria-hidden="true" className="border-accent size-3 rounded-sm border-2" />
              Kártya
            </span>
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="border-accent size-3 rounded-sm border-2 border-dashed"
              />
              Részletes nézet
            </span>
          </div>
        </div>
      ) : null}

      {processing ? <LoadingState label="Feldolgozás…" /> : null}

      {processed ? (
        <div className="flex flex-col gap-2">
          <div>
            <img src={processed.full} alt="Részletes nézet előnézete" width={400} height={160} />
            <p className="text-text/60 text-sm">Részletes nézet</p>
          </div>
          <div>
            <img src={processed.thumb} alt="Kártya előnézete" width={400} height={200} />
            <p className="text-text/60 text-sm">Kártya</p>
          </div>
        </div>
      ) : editing && initial?.hasImage && !removeImage && !selectedFile ? (
        loadingImage ? (
          <LoadingState label="Kép betöltése…" />
        ) : existingImage ? (
          <div className="flex flex-col gap-2">
            <p>Jelenlegi kép</p>
            <div>
              <img src={existingImage} alt="" width={400} height={160} />
              <p className="text-text/60 text-sm">Részletes nézet</p>
            </div>
            {initial.thumb ? (
              <div>
                <img src={initial.thumb} alt="" width={400} height={200} />
                <p className="text-text/60 text-sm">Kártya</p>
              </div>
            ) : null}
          </div>
        ) : null
      ) : null}

      {selectedFile ? (
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            processRequest.current += 1;
            setProcessing(false);
            setProcessed(null);
            setSelectedFile(null);
            setSourceUrl(null);
            setSourceSize(null);
            setCrop(null);
            setImageError(null);
          }}>
          <span className="inline-flex items-center gap-2">
            <XMarkIcon className="size-5" />
            Kiválasztott kép törlése
          </span>
        </Button>
      ) : null}

      {editing && initial?.hasImage ? (
        <label>
          <input
            type="checkbox"
            checked={removeImage}
            disabled={processing || selectedFile !== null}
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

  useDocumentTitle(
    editing ? (recipe ? `${recipe.title} - Szerkesztés` : 'Szerkesztés') : 'Új recept'
  );

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
