# Double Tap Edit/Delete

ShiggyCord plugin: double tap your own message to instantly edit or delete it.
Works in DMs, group chats, and servers, since it patches the shared message
row component rather than anything channel-type-specific.

- Double tap action is configurable in the plugin's settings screen: **Edit**
  or **Delete**.
- Delete supports an optional confirmation dialog (on by default).
- Delete also works on other people's messages if you have Manage Messages
  in that server — matching normal Discord permissions.

## Build locally

```bash
npm install
npm run build
```

Output goes to `dist/doubletap-edit-delete/` (manifest.json + index.js).

## Deploy via GitHub Pages (matches your existing repo A setup)

1. Push this folder to your repo's `main` branch. The included
   `.github/workflows/build.yml` runs `npm install && npm run build` and
   publishes `dist/` to the `gh-pages` branch automatically.
2. In the repo: **Settings → Pages → Source → Deploy from a branch →
   `gh-pages`**.
3. Your plugin URL will be:
   `https://selm9676-code.github.io/A/doubletap-edit-delete`
4. Paste that into ShiggyCord's Plugins page.

## If the double tap doesn't do anything

The one part of this plugin that can drift when Discord updates its app
internals is the exact message-row component name it patches. If `onLoad`
logs an error in the console:

1. Settings → General → enable Developer Settings in ShiggyCord.
2. Open the JS console / module inspector.
3. Search loaded modules for one exposing both a `message` and `onPress`
   prop for an individual message.
4. Update `MODULE_KEY` / `EXPORT_KEY` at the top of `src/index.tsx` to match.

Everything else (double-tap timing, permission checks, the edit/delete
calls, settings UI) doesn't depend on that and won't need touching.
