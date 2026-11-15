# Receptek home concept — design language

Status: standalone concept, not production code. Last updated 2026-11-15.

This is the handoff document for the home + recipe-detail concept in `docs/home-concept.html`. Read it together with `CHANGES.md` before iterating.

## What this is

A self-contained HTML mock for the Receptek food app. It is not wired into the React app; it exists to settle the visual direction before a real implementation. It uses:

- real recipe titles, descriptions, calories, ingredients and steps from the app's Firestore `recipes` collection;
- real 400×200 card thumbs and 1000×400 detail images from `recipeImages`;
- placeholder `cooked` counts (that field does not exist in Firestore yet).

Preview: run the dev server and open `/docs/home-concept.html`, or open the file directly in a browser.

## Files

| Path                                | Purpose                                                 |
| ----------------------------------- | ------------------------------------------------------- |
| `docs/home-concept.html`            | The mock. Inline CSS + JS, no build step, no framework. |
| `docs/concept/concept-data.js`      | Real recipe data: `window.CONCEPT_RECIPES = [...]`.     |
| `docs/concept/<recipeId>-thumb.jpg` | 400×200 card crops.                                     |
| `docs/concept/<recipeId>-full.jpg`  | 1000×400 detail crops.                                  |
| `docs/concept/CHANGES.md`           | Open change requests.                                   |
| `docs/concept/DESIGN.md`            | This document.                                          |

The detail layout is based on section **08 · Részlet nézet** of `docs/design-system.html`. The data was pulled from the public Firestore REST API; the images were decoded from the stored data URLs.

## Direction

**Editorial dark, three accent variants.** The photography supplies the color and appetite; the UI stays quiet around it. One accent, one material, one motion language. No glassmorphism gradients, no hover lifts, no bouncy easing, no invented copy. The default is a softened indigo with warm charcoal surfaces; the terracotta and sage palettes are available through the page-footer theme switch.

This is deliberately the opposite of the earlier "AI slop" mix of glass gradients and stacked effects. If a change makes the page more decorative, it is probably wrong.

## Principles

1. **Photography first.** Large, consistent 2:1 card crops; a full-bleed detail hero. Don't shrink the images into thumbnails.
2. **One accent.** The softened indigo is used for primary actions, active states and the cook counter. Everything else is neutral; the terracotta and sage variants only swap the accent and surface tint.
3. **Quiet chrome.** Flat surfaces, 1px borders; the only shadow is the floating mobile bar. Card and hero images carry a quiet bottom shade for depth, not a filled decorative gradient.
4. **Type does the hierarchy.** One family, a small set of sizes, deliberate weights and tight tracking on headings.
5. **Real content.** Use actual recipe data. No lorem ipsum, no fake times/authors/servings, no decorative labels.
6. **One motion language.** Short ease transitions and a single image-scale hover. No lift, no squash, no spring.

## Color tokens

All colors live in `:root` in `docs/home-concept.html`. The softened indigo palette is the default; `html[data-theme='terracotta']` and `html[data-theme='sage']` switch the accent and surface tint, and the page-footer toggle changes them live.

| Token            | Indigo (default)            | Terracotta                 | Sage (Zsálya)               | Use                                            |
| ---------------- | --------------------------- | -------------------------- | --------------------------- | ---------------------------------------------- |
| `--bg`           | `#14121b`                   | `#14110e`                  | `#131510`                   | Page background                                |
| `--surface`      | `#1b1825`                   | `#1c1814`                  | `#1a1d16`                   | Cards, inputs, raised surfaces                 |
| `--surface-2`    | `#231f2e`                   | `#241f19`                  | `#22261d`                   | Hover surfaces, ingredient card, hovered cards |
| `--border`       | `#332c41`                   | `#322b23`                  | `#33382a`                   | Default hairline                               |
| `--border-hover` | `#453b55`                   | `#4a3f33`                  | `#464d3a`                   | Hover border                                   |
| `--text`         | `#f0edf7`                   | `#f4eee4`                  | `#eef1e6`                   | Primary text                                   |
| `--text-soft`    | `#d2cbdf`                   | `#d6ccbe`                  | `#cfd4c3`                   | Descriptions                                   |
| `--muted`        | `#9c93ac`                   | `#a99e90`                  | `#98a08c`                   | Secondary text, metadata, labels               |
| `--muted-2`      | `#746b84`                   | `#7d7468`                  | `#717a67`                   | Placeholders                                   |
| `--accent`       | `#9a8ce0`                   | `#e07a56`                  | `#a8c18f`                   | Primary action, active tab, cook `+`           |
| `--accent-hover` | `#8a7bd1`                   | `#ea8c6b`                  | `#96b07d`                   | Accent hover                                   |
| `--accent-soft`  | `rgba(154, 140, 224, 0.16)` | `rgba(224, 122, 86, 0.14)` | `rgba(168, 193, 143, 0.16)` | Active pill, step numbers                      |
| `--on-accent`    | `#17121f`                   | `#1b110c`                  | `#11150c`                   | Text/icons on accent                           |
| `--danger`       | `#e2685a`                   | `#e2685a`                  | `#e2685a`                   | Delete action                                  |

Rules:

- Use `--accent` sparingly: one filled action per view at most.
- Separation comes from borders and surfaces; cards do not use box shadows.
- The logo gradient and the avatar gradient are brand assets and are allowed. The hero's bottom gradient is a functional legibility shade; the card image's bottom shade is a quiet depth cue, not a fill.

## Typography

**Plus Jakarta Sans only.** Loaded from Google Fonts in the mock; the real app already self-hosts the variable version from Fontsource.

Weights: 400, 500, 600, 700. No other family, no display serif.

| Role                       | Size                          | Weight | Notes                                                         |
| -------------------------- | ----------------------------- | ------ | ------------------------------------------------------------- |
| Page title `h1`            | `clamp(2rem, 5vw, 2.75rem)`   | 600    | `line-height: 1.05`, `letter-spacing: -0.035em`               |
| Recipe count               | `0.8125rem`                   | 500    | muted, tabular numbers, baseline-aligned next to `h1`         |
| Card title                 | `1rem`                        | 600    | `1.3` line-height, `-0.015em`, 2-line clamp, reserved `2.6em` |
| Card meta                  | `0.78125rem`                  | 400    | muted, two stacked rows, tabular numbers                      |
| Detail hero title          | `clamp(1.5rem, 4vw, 2.25rem)` | 600    | `1.1`, `-0.03em`, balanced wrapping                           |
| Body / steps / ingredients | `0.9375rem`                   | 400    | `1.65–1.7` line-height                                        |
| Micro label                | `0.6875rem`                   | 600    | uppercase, `0.11em` tracking, muted                           |
| Hero pill                  | `0.75rem`                     | 500    | translucent white surface over the image                      |

Rules: tight tracking on headings only; never fake hierarchy with color alone; numbers are tabular.

## Spacing and shape

- Spacing follows a 4px rhythm. Avoid arbitrary values.
- Page shell: `max-width: 1120px`; horizontal padding `16px` mobile, `24px` at 720px, `32px` at 1024px.
- Radii: `8px` small controls, `12px` inputs/buttons, `16px` cards/ingredients-adjacent surfaces (ingredient card uses `18px`), `24px` detail card, `999px` pills and the mobile bar.
- Elevation: one shadow token (`--shadow-soft`), used only by the floating mobile tab bar. Cards use borders and the image-bottom shade, not box shadows.

## Layout and breakpoints

| Breakpoint | Change                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| `< 640px`  | 1-column recipe grid; mobile brand row, page-title search, floating tab bar                                        |
| `≥ 640px`  | 2-column grid                                                                                                      |
| `≥ 720px`  | Desktop top bar replaces the mobile bar; page-header search hides (navbar search takes over); mobile tab bar hides |
| `≥ 1024px` | 3-column grid                                                                                                      |
| `≤ 819px`  | Detail grid collapses to one column; steps follow ingredients                                                      |

Card images stay 2:1 and never need to display wider than ~400px, matching the 400×200 source. The detail hero uses the 1000×400 full crop; do not upscale a thumb into the hero.

## Components

### Desktop top bar (`≥ 720px`)

Sticky, 64px tall, blurred warm background, 1px bottom border. Brand (logo + wordmark), then the right cluster: growing search, `Receptek`, `Új recept`, `Napi menü`, avatar.

Search collapses to `136px` and grows to `240px` on hover/focus, matching the app's `w-34 → w-60` behavior.

### Mobile header

Logo + wordmark row, then a page head with `Receptek` and the recipe count on one baseline, then a full-width pill search. The floating tab bar sits at the bottom with 10px insets plus safe-area padding.

### Recipe card

- 2:1 image, `object-fit: cover`; subtle scale to `1.04` on hover over 500ms.
- Card radius 16px, 1px border, `--surface`; the 2:1 image carries the same quiet bottom shade as the detail hero. Hover changes the border and surface only — no lift.
- Title: 2 lines reserved, clamped.
- Meta: two stacked muted rows — calories (when present) and `N× főzve` (when > 0). No middle dot. Two lines reserved so cards align.
- Missing image: centered logo mark at 35% opacity.
- Clicking a card opens the detail view; the hash is `#recipe/<id>` for share links.

### Mobile tab bar (`< 720px`)

Floating full pill, 10px from the bottom + safe area, blurred dark surface, one soft shadow. Five icon buttons; the active one uses `--accent-soft` with an accent icon. Fully rounded (the "square" look is intentionally gone).

### Detail view

- Card fills the full shell width (no 1000px cap), radius 24px, 1px border, `--surface`.
- Hero: 2.5:1 (min-height 250px mobile, 320px at ≥720), full image, bottom legibility shade.
- Back button top-left (40px translucent circle). Share button top-right. The cooked counter sits at the bottom of the hero, right-aligned on the title row, and stays there on mobile.
- Title bottom-left; calorie pill below it. No author/time/servings.
- Cook counter: `−  N×  +`; `+` is the accent-filled control; `−` is disabled at zero. Keep it readable over the image.
- Description below the hero when present.
- Content grid: ingredients card `400px` + steps `1fr`, 40px gap; single column below 820px, with steps after ingredients.
- Ingredients: name left, quantity right (muted, nowrap), micro-label header.
- Steps: numbered accent-soft circles, 32px; instruction text beside on desktop and under the number below 720px.
- Footer: `Szerkesztés` and `Törlés`, right-aligned. The action buttons are visual-only in the mock. The theme switch lives in the page footer.

### Page footer

At the bottom of the page, outside both views: a `Színtéma` label and the Indigó / Terrakotta / Zsálya switch. The choice persists in local storage. The page's reserved bottom space keeps it clear of the fixed mobile tab bar.

## Behavior

- Search inputs in the navbar (desktop) and page head (mobile) stay in sync and filter by title; the count updates; an empty state appears when nothing matches.
- Recipes are ordered by `cooked` descending, then by most recent cooking time (`lastCookedAt`) descending.
- `+` increments the cooked count and sets `lastCookedAt`; `−` decrements and is clamped at 0. Returning home re-sorts the grid.
- The share button uses the Web Share API when available and falls back to copying `#recipe/<id>`.
- Edit/delete are presentational in the mock.

Production note: the data model needs `cookedCount` and `lastCookedAt` on the recipe document. Sort client-side or via a Firestore index. Firestore rules already allow allowlisted users to update recipes.

## Data and content rules

- UI language is Hungarian. Keep labels short and functional.
- Do not invent time, author, servings, difficulty, or descriptions. Cards show only calories and cooked count because that is all the data supports.
- Keep the real edge cases visible: one recipe has no image, one has no ingredients/steps. The UI must not break on them.
- Card thumbs are 400×200; never render them much wider than 400px. Full images are 1000×400 and are the only images allowed in the detail hero.

## Porting into the app

- Put the tokens into `src/index.css` `@theme` and map the component classes onto Tailwind.
- The app already loads Plus Jakarta Sans through `@fontsource-variable/plus-jakarta-sans` in `src/main.tsx`; keep that.
- Keep the 2:1 card ratio and the existing `cropToDataUrl` thumb/full crops.
- Add `cookedCount` and `lastCookedAt` to `Recipe`, the Firestore converter and update path.
- Reuse `@dhemeira/ui` primitives where they fit, but do not let the glass components reintroduce gradients.

## For a new AI session

1. Read this file and `CHANGES.md` before editing.
2. The HTML is the visual source of truth; the data and images live in `docs/concept/`.
3. Do not add a second typeface, glass gradients, hover lifts, or decorative copy.
4. Keep the three palettes (soft indigo default, terracotta, sage) unless the user explicitly asks for a new direction.
5. Test at 390px, 768px and 1280px. The mobile detail must keep steps under ingredients.
6. Implement the open items in `CHANGES.md` before inventing new ones.
