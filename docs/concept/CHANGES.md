# Concept changes

## 2026-11-15 — first pass

1. Főzve counter moved from the top-right hero stack to the bottom of the detail image, right-aligned on the title row.
2. Edit / delete footer buttons right-aligned.
3. Mobile detail: share button and Főzve counter verified in the title row.
4. Card shadow experiment: recipe cards use the soft shadow token.
5. Indigo made the default palette with an Indigó / Terrakotta toggle in the detail footer.

## 2026-11-15 — second pass

1. Ingredients and step copy use `text-wrap: pretty`.
2. Mobile steps stack the instruction under the number.
3. Detail hero gets an explicit width so `min-height` + aspect-ratio no longer stretch it to 625px on mobile; this restores the share button and Főzve counter. Footer buttons stay clear of the fixed tab bar.
4. Theme switch moved out of the detail footer to the page footer.
5. Indigo softened to a muted lavender accent on warm charcoal surfaces.
6. Sage palette added as a third option.
7. Recipe card images get the detail hero's bottom shade; the card box-shadow experiment was removed.

## 2026-11-15 — third pass

1. Mobile detail fills the screen: below 720px the detail view is full-bleed with no horizontal gutters, border or rounded card surface.
2. Sage replaced with a muted powder-blue palette (`blue`, labelled "Kék").
3. `×` removed from cooked labels: card meta and counter use a plain `x`; cook buttons use SVG plus/minus icons.
4. Larger touch targets: cook buttons 44px, hero back/share 44px, action buttons 44px, theme buttons 40px, tab bar tabs 48px; tab bar insets and gaps normalized.
5. Reading measure and base size: 16px body text on mobile for descriptions, ingredients and steps; step text and descriptions capped at `65ch`; descriptions use pretty wrapping.
6. Spacing and radii normalized to a 4/8px scale across the hero, pills, detail spacing, actions, tab bar and page footer; action buttons use the 12px radius token.

## 2026-11-15 — fourth pass

1. Mobile step numbers now sit inline at the start of the step text: the badge is part of the first line, and the text wraps to the full width below. No reserved column and no centered stack.
2. Blue replaced with a muted olive palette (`olive`, labelled "Olíva"); the muted indigo and terracotta palettes are kept.
3. Mobile detail body horizontal padding reduced to 8px.
4. Theme comparison and testing helpers: `?theme=indigo|terracotta|olive` for shareable links, `?ab=1` for a persistent random assignment, and `window.CONCEPT_THEME` exposes the active variant for analytics.

## 2026-11-15 — fifth pass

1. Removed the `?theme` query-param and `?ab=1` helpers.
2. Replaced the named theme switch with three unlabelled colour swatches for Indigó, Terrakotta and Olíva. The colour names remain as accessible labels only.

DESIGN.md is intentionally not updated for these passes; it will be refreshed at the end of the session.
