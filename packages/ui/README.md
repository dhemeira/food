# @dhemeira/ui

Dependency-free React UI primitives built on plain HTML elements. Components render native elements (`<button>`, `<input>`, `<dialog>`, …) with no UI/component library underneath.

- **Authoring** — styled with Tailwind CSS v4 (`@theme` tokens + utilities), compiled at build time.
- **Zero setup for consumers** — the compiled CSS is injected automatically when the package is imported. No stylesheet to import, no Tailwind required, no icon dependency.
- **Tree-shakeable** — ESM-only with named exports, so `import { Button } from '@dhemeira/ui'` pulls in only what you use.
- **Collision-proof theming** — all colors come from prefixed `--color-ui-*` tokens, so they never clash with a consumer's own Tailwind theme.
- **Icons** — inline SVG components using `currentColor`; they follow text color automatically.

Requires `react >= 19` (peer dependency). No other runtime dependencies.

## Install

```sh
npm install @dhemeira/ui
```

That's it — the styles are injected by the JS. Just import the components:

```tsx
import { Button, Input, Modal } from '@dhemeira/ui';
```

## Components

| Component | Renders | Props |
|---|---|---|
| `Button` | `<button>` (or `as`) | `variant`, `small`, `block`, `loading`, `loadingLabel`, `as` |
| `Input` | `<label>` + `<input>` | `label`, `error`, `hint` |
| `Select` | `<label>` + `<select>` | `label`, `error` |
| `Textarea` | `<label>` + `<textarea>` | `label`, `error` |
| `Modal` | `<dialog>` (native Popover-free) | `trigger`, `title`, `closable` |
| `Avatar` | `<button>` | `username`, `popoverTarget` |
| `EmptyState` | `<p>` | `message` |
| `LoadingState` | `<p>` | `label` |
| `ErrorState` | layout + `Button` | `message`, `title`, `retryLabel`, `onRetry` |
| `ErrorBoundary` | error boundary | `children` |
| `CheckIcon`, `PlusIcon`, `XMarkIcon` | `<svg>` | standard SVG props |

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
import { Link } from 'react-router-dom';

<Button as={Link} to="/recipes">View recipes</Button>
```

### Styling

Colors are driven by prefixed tokens, so instances never read a consumer's theme by accident. Override a component's look with normal `className`, or restyle one instance by overriding a token on it:

```tsx
<Button style={{ '--color-ui-accent': '#f472b6' } as React.CSSProperties}>Custom</Button>
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

| Token | Default |
|---|---|
| `--color-ui-background` | `#11111e` |
| `--color-ui-surface` | `#181827` |
| `--color-ui-surface-2` | `#1f1f33` |
| `--color-ui-border` | `#2d2d4c` |
| `--color-ui-border-hover` | `#3c3c63` |
| `--color-ui-border-focus` | `#4b4b7c` |
| `--color-ui-accent` | `#818cf8` |
| `--color-ui-accent-hover` | `color-mix(in oklch, var(--color-ui-accent), white 12%)` |
| `--color-ui-accent-soft` | `rgba(129 140 248 / 0.14)` |
| `--color-ui-text` | `#eef0fb` |
| `--color-ui-success` | `#34d399` |
| `--color-ui-success-bg` | `#0d2818` |
| `--color-ui-warning` | `#fbbf24` |
| `--color-ui-warning-bg` | `#2a1f05` |
| `--color-ui-warning-border` | `#b45309` |
| `--color-ui-danger` | `#dc2626` |
| `--color-ui-danger-hover` | `color-mix(in oklch, var(--color-ui-danger), white 12%)` |

## Icons

Icons are static inline SVGs (`stroke="currentColor"`), generated from [heroicons](https://heroicons.com). They ship as part of the package — no separate icon dependency.

```tsx
import { XMarkIcon } from '@dhemeira/ui';

<XMarkIcon className="size-5 text-ui-danger" />
```

## Development

This package lives in the repo's npm workspaces. From the repo root:

```sh
npm install
npm run build --workspace @dhemeira/ui   # production build (js + css-injected + types)
npm run dev --workspace @dhemeira/ui     # rebuild on change (js/css + types)
npm run typecheck --workspace @dhemeira/ui
```

To (re)generate icons from heroicons, edit the icon list in `scripts/gen-icons.mjs`, then:

```sh
npm run icons --workspace @dhemeira/ui
```

The build outputs to `dist/`:
- `dist/index.js` — ESM bundle with the compiled CSS embedded and injected at import time
- `dist/*.d.ts` — TypeScript declarations (carry the JSDoc usage docs)

## Publishing

`packages/ui` is self-contained, so publishing works from the monorepo:

```sh
npm publish --workspace @dhemeira/ui
```

or from inside `packages/ui`: `npm publish`. Before publishing, add a `license` and confirm the `@dhemeira` npm scope is registered (scoped packages default to private on npm unless `publishConfig.access: "public"` is set for a public package).
