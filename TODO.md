# TODO

- [ ] Edit page (`/recipe/:id/edit`) should show the current image when opened (not only the preview after picking a new file).
- [ ] On the edit page, add an X to the newly selected image preview so it can be cleared again (so it isn't added on save).
- [ ] When a new image is selected on the edit page, disable the "remove image" checkbox (a new image and removal are mutually exclusive).
- [ ] Replace deprecated `<meta name="apple-mobile-web-app-capable" content="yes">` in `frontend/index.html` with `<meta name="mobile-web-app-capable" content="yes">` (console deprecation warning).
- [ ] Use `localhost:5000` for the dev server (set the port in `frontend/vite.config.ts`).
- [ ] Create the UI style / visual design.
- [ ] Investigate intermittent console error: `TypeError: Cannot read properties of undefined (reading 'startTime')` at `reportAllChanges`. It points at minified/injected script code (`VM421`, `n.timeout`), not app source — the app doesn't import `web-vitals`, so check for a browser extension / devtools / build artifact before assuming it's ours.
