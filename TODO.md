# TODO

- [x] Edit page (`/recipe/:id/edit`) should show the current image when opened (not only the preview after picking a new file).
- [x] On the edit page, add an X to the newly selected image preview so it can be cleared again (so it isn't added on save).
- [x] When a new image is selected on the edit page, disable the "remove image" checkbox (a new image and removal are mutually exclusive).
- [x] Replace deprecated `<meta name="apple-mobile-web-app-capable" content="yes">` in `frontend/index.html` with `<meta name="mobile-web-app-capable" content="yes">` (console deprecation warning).
- [x] Use `localhost:5000` for the dev server (set the port in `frontend/vite.config.ts`).
- [ ] Create the UI style / visual design.
- [x] Investigate intermittent console error: `TypeError: Cannot read properties of undefined (reading 'startTime')` at `reportAllChanges`. Happens when pressing edit button. **Finding:** known upstream `web-vitals` bug (GoogleChrome/web-vitals#792), thrown during soft navigations when something initializes web-vitals with `reportAllChanges`. The app never imports `web-vitals`/`@firebase/performance` (only `firebase/auth` + `firebase/firestore`), so it is not thrown by app code - it comes from an external tool/extension. Not fixable in the app.
