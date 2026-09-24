# Mortgage Calculator

Static HTML/CSS/JS mortgage calculator with Czech (CZK) localization and ČNB regulatory checks.

## Project structure

```
index.html   — markup
style.css    — all styles (light/dark theme, responsive)
app.js       — calculator logic, i18n, affordability checks
```

No build step. GitHub Pages deploys from the repo root on push to master.

## Local testing

Use `.claude/launch.json` to start a local server:

1. Run `preview_start` with name `mortgage-calc` — this starts `python -m http.server 8123` and opens the browser pane.
2. If `preview_start` fails (e.g. wrong working directory), start manually:
   ```
   python -m http.server 8124
   ```
   Then `navigate` to `http://localhost:8124`.

## Visual verification checklist

After any change, verify in the browser pane:

1. **Page loads** — navigate to the local server URL, take a screenshot.
2. **Calculator works** — check that the result block shows a calculated value (not "—").
3. **Mode toggle** — click "Find Loan Amount", verify it switches fields. Click "Find Payment" to switch back.
4. **Language toggle** — click "CZ", verify labels change to Czech. Click "EN" to revert.
5. **Affordability panel** — click "Can I afford this?", verify the side panel expands with DTI/DSTI results.
6. **Field alignment** — in the affordability panel, verify the DTI and DSTI input boxes are horizontally aligned (same vertical position) even when their labels have different line counts.
7. **Dark mode** — if possible, toggle dark mode and verify colors apply correctly.
8. **Mobile** — use `resize_window` with preset "mobile", reload, verify layout stacks vertically.

## Useful browser pane commands

- `find` with query text to locate interactive elements by label
- `javascript_tool` to inspect computed styles or DOM state
- `computer` with `action: "screenshot"` to capture current state
- `resize_window` with `preset: "mobile"` or `preset: "desktop"` for responsive testing
