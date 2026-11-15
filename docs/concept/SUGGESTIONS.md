# Concept polish suggestions

Working notes for a future pass. These are suggestions, not applied changes. Cards being `<div>`s is a concept-only simplification and is intentionally out of scope here.

## Already handled in the current pass

- Larger touch targets: cook 44px, actions 44px, theme 40px, tabs 48px.
- 16px body text on mobile for description, ingredients and steps; `65ch` measure.
- Spacing and radii on a 4/8px scale.

## Visual hierarchy

- Keep one primary action per view: the filled accent belongs to the cook `+`. Make `Szerkesztés` secondary and move `Törlés` to a quieter text or overflow action.
- Use `text-wrap: balance` on headings and `pretty` on all body copy.
- Reserve the accent for the primary action and current state; let borders and surfaces carry the rest.
- Strengthen the card title/meta relationship and make the two-line meta align across cards.

## Color and contrast

- Audit all three palettes: body text 4.5:1, large text/UI/focus 3:1. Placeholders are the usual failure point.
- Add semantic tokens (`success`, `warning`, `danger`, `info`) with tested pairs; don't reuse the accent for status.
- Decide how the warm brand logo relates to the cool palettes. A monochrome or neutral mark would sit more quietly in this concept.
- Use the 60-30-10 balance: neutral surfaces dominate, photography supplies the color, accent is the small 10%.

## Typography

- Keep one family and audit weights; use 500 sparingly for UI labels.
- Make the page title and the recipe title clearly different in scale; keep the `h1` for the home view.
- Keep tabular numbers for cooked counts, calories and quantities.
- Use uppercase micro-labels only for true section labels; they lose impact when repeated.

## Imagery

- Treat images as one system: consistent 2:1 crops, a subtle unified grade, and the bottom shade already used on cards and the hero.
- Add `srcset`/`sizes` and lazy-load card images; load the detail hero eagerly.
- Improve the empty-image fallback with a larger mark (48–64px) and a quiet surface pattern instead of a tiny icon.
- Define an alt-text policy: decorative images empty, informative images described by the recipe title.

## Navigation and mobile

- Add visible labels to the mobile tab bar, or at least a persistent selected label; icons alone require recall.
- Keep the back button as the primary escape from detail.
- Consider hiding the tab bar on the full-bleed mobile detail for immersion; keep the safe-area padding if you do.
- Make the search affordance and active states consistent between the mobile and desktop headers.

## States and feedback

- Add skeleton loading for the grid and detail, an image error fallback, and an empty search state with a reset action.
- Toast for share/copy; saving feedback with undo for the cooked counter; confirmation for destructive actions.
- Design hover, focus-visible, active, disabled and loading states for every interactive element.

## Motion and craft

- Keep transitions 150–250ms ease-out, no lift, and respect reduced motion.
- Unify icon stroke widths (1.5–2px) and optical sizes; align icon boxes.
- Keep a consistent 16px inner rhythm in the full-bleed mobile detail body.
- Give the page footer a clear visual role; in production the theme switch may belong in a settings menu instead.

## Content

- Use one Hungarian sentence-case style and rephrase counts as `8x főzve`.
- Remove or clearly label demo recipes and placeholder cooked counts; never ship invented data.
- Add extra metadata only when the data supports it.

## Design QA

- Test at 320, 390, 768 and 1280px, at 200% zoom, and with reduced motion.
- Capture screenshot regressions for all three palettes.
- Run axe/Lighthouse checks for contrast, accessible names and target size; keep the focus ring visible.
