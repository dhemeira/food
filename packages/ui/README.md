# @dhemeira/ui

Dependency-free React UI primitives built on plain HTML elements. Components render native elements (`<button>`, `<input>`, `<dialog>`, …) with no UI/component library underneath.

- **Authoring** — styled with Tailwind CSS v4 (`@theme` tokens + utilities), compiled at build time.
- **Zero setup for consumers** — the compiled CSS is injected automatically when the package is imported. No stylesheet to import, no Tailwind required, no icon dependency.
- **Tree-shakeable** — ESM-only with named exports, so `import { Button } from '@dhemeira/ui'` pulls in only what you use.
- **Collision-proof theming** — all colors come from prefixed `--color-ui-*` tokens, so they never clash with a consumer's own Tailwind theme.

Requires `react >= 19` (peer dependency). No other runtime dependencies.

## Install

```sh
npm install @dhemeira/ui
```

That's it — the styles are injected by the JS. Just import the components:

```tsx
import { Button, Input, Modal } from "@dhemeira/ui";
```

## Components

| Component       | Renders                          | Props                                                        |
| --------------- | -------------------------------- | ------------------------------------------------------------ |
| `Button`        | `<button>` (or `as`)             | `variant`, `small`, `block`, `loading`, `loadingLabel`, `as` |
| `Input`         | `<label>` + `<input>`            | `label`, `error`, `hint`                                     |
| `Select`        | `<label>` + `<select>`           | `label`, `error`                                             |
| `Textarea`      | `<label>` + `<textarea>`         | `label`, `error`                                             |
| `Modal`         | `<dialog>` (native Popover-free) | `trigger`, `title`, `closable`                               |
| `Popover`       | `<div>` + `<button>` + menu      | `trigger`, `label`, `side`, `align`                          |
| `Avatar`        | `<span>`                         | `username`, `className`                                      |
| `EmptyState`    | `<p>`                            | `message`                                                    |
| `LoadingState`  | `<p>`                            | `label`                                                      |
| `ErrorState`    | layout + `Button`                | `message`, `title`, `retryLabel`, `onRetry`                  |
| `ErrorBoundary` | error boundary                   | `children`                                                   |

Every component forwards its own `className`/`style` to the root element, and all native props pass through. Hover any component in your editor for a usage example.

## Examples

```tsx
<Button onClick={handleSave}>Save</Button>
<Button loading>Save</Button>

<Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={titleError} />

<Modal
  title="Delete"
  trigger={(open) => <Button onClick={open}>Delete</Button>}>
  <p>Are you sure?</p>
  <Button data-modal-close onClick={handleDelete}>Delete</Button>
  <Button data-modal-close>Cancel</Button>
</Modal>
```

### Polymorphic `Button`

`Button` renders a native `<button>` by default, but `as` can point at any element or component — so a link-style button stays in your router:

```tsx
import { Link } from "react-router-dom";

<Button as={Link} to="/recipes">
  View recipes
</Button>;
```

### Styling

Colors are driven by prefixed tokens, so instances never read a consumer's theme by accident. Override a component's look with normal `className`, or restyle one instance by overriding a token on it:

```tsx
<Button style={{ "--color-ui-accent": "#f472b6" } as React.CSSProperties}>
  Custom
</Button>
```

## Theming

The library ships sensible dark defaults; override any token by defining it on `:root`. To reuse your existing Tailwind theme, map once in your own CSS:

```css
:root {
  --color-ui-background: var(--color-background);
  --color-ui-surface: var(--color-surface);
  --color-ui-accent: var(--color-accent);
  --color-ui-text: var(--color-text);
}
```

| Token                       | Default                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `--color-ui-background`     | `#11111e`                                                               |
| `--color-ui-surface`        | `#181827`                                                               |
| `--color-ui-surface-2`      | `#1f1f33`                                                               |
| `--color-ui-border`         | `#2d2d4c`                                                               |
| `--color-ui-border-hover`   | `#3c3c63`                                                               |
| `--color-ui-border-focus`   | `#4b4b7c`                                                               |
| `--color-ui-accent`         | `#818cf8`                                                               |
| `--color-ui-accent-hover`   | `color-mix(in oklch, var(--color-ui-accent), var(--color-ui-text) 12%)` |
| `--color-ui-accent-soft`    | `rgba(129 140 248 / 0.14)`                                              |
| `--color-ui-text`           | `#eef0fb`                                                               |
| `--color-ui-success`        | `#34d399`                                                               |
| `--color-ui-success-bg`     | `#0d2818`                                                               |
| `--color-ui-warning`        | `#fbbf24`                                                               |
| `--color-ui-warning-bg`     | `#2a1f05`                                                               |
| `--color-ui-warning-border` | `#b45309`                                                               |
| `--color-ui-danger`         | `#dc2626`                                                               |
| `--color-ui-danger-hover`   | `color-mix(in oklch, var(--color-ui-danger), var(--color-ui-text) 12%)` |

## Development

This package lives in the repo's npm workspaces. From the repo root:

```sh
npm install
npm run build --workspace @dhemeira/ui   # production build (js + css-injected + types)
npm run dev --workspace @dhemeira/ui     # rebuild on change (js/css + types)
npm run typecheck --workspace @dhemeira/ui
```

Heroicons used internally by components are imported from `@heroicons/react` in `src/icons.tsx` and bundled as inline SVG, so the published package stays dependency-free — `@heroicons/react` is a dev dependency only. Icons are internal, not part of the public API.

The build outputs to `dist/`:

- `dist/index.js` — ESM bundle with the compiled CSS embedded and injected at import time
- `dist/*.d.ts` — TypeScript declarations (carry the JSDoc usage docs)

## Publishing

`packages/ui` is self-contained, so publishing works from the monorepo:

```sh
npm publish --workspace @dhemeira/ui
```

or from inside `packages/ui`: `npm publish`. Before publishing, add a `license` and confirm the `@dhemeira` npm scope is registered (scoped packages default to private on npm unless `publishConfig.access: "public"` is set for a public package).
