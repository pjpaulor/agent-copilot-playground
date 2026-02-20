# agent-copilot-playground

A minimal Node.js + vanilla JavaScript playground for testing coding copilots on a tiny front-end experiment.

## Run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm start
   ```
3. Open `http://localhost:3000` in your browser.

## What this app does
- Shows a small list of agents loaded from `public/data/agents.json`.
- Includes a search box to filter agents by name.
- Clicking an agent opens a suggestion panel and updates a tiny visualization (color swatch) on a canvas.

## Prompt to fix the bug
Paste this exact prompt into GitHub Copilot or OpenAI Codex:

```text
In public/app.js, fix the search filtering so it is case-insensitive (for example, searching "alice" should match "Alice"). Keep the logic simple and only change what is needed. Add a one-line inline comment explaining that both strings are normalized to lowercase for case-insensitive comparison.
```

## How to install copilots
### GitHub Copilot (VS Code)
1. Install the GitHub Copilot extension in VS Code.
2. Sign in with your GitHub account that has Copilot access.
3. Open this project folder and start using inline chat or code suggestions.

Official docs:
- https://docs.github.com/en/copilot/get-started-with-github-copilot
- https://code.visualstudio.com/docs/copilot/overview

### OpenAI Codex
1. Open the Codex getting-started documentation.
2. Follow setup instructions for your environment/editor.
3. Open this project and use Codex to apply edits from prompts.

Official docs:
- https://platform.openai.com/docs/guides/codex
- https://help.openai.com/

## How I designed the repo
I kept the project intentionally small and flat so copilots can understand and edit single files quickly: one static server, one HTML page, one JS file for app logic, one CSS file, and one JSON data file.
