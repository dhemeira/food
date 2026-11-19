# Design-system workbench

The general UI library lives in [`dhemeira/ui`](https://github.com/dhemeira/ui); app-specific composites stay in this app.

## Sources

- **Visual source of truth:** `docs/home-concept.html` — three palettes, mobile/desktop layouts, states.
- **Secondary reference:** `docs/design-system.html` — component coverage, variants and states.
- **Functionality source:** `dhemeira/ui`. In the dev container it is cloned at `/home/node/ui` (it is not part of this repo).

## Storybook

Storybook lives in the ui library, not here:

```sh
cd /home/node/ui
npm run storybook
```

It serves on port 6006. Open a second VS Code window attached to this container on `/home/node/ui` to follow along.

## Boundaries

- General primitives belong in `dhemeira/ui`: tokens, Button, Input, Card, TabBar, Modal, Popover, state components, and the general `NumberStepper` (the concept’s cook counter becomes an app composite on top of it).
- App-specific composites belong here: RecipeCard, RecipeDetail, IngredientsCard, StepList.
- Storybook is only in the ui library for now.
- No a11y addon for the current Hungarian-only scope.
