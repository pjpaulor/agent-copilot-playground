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
- Includes two intentional bugs for copilot repair practice.
- Case-sensitive search match.
- Stale async selection race when clicking agents quickly.

## Prompt to fix the bug
Paste this exact prompt into GitHub Copilot or OpenAI Codex:

```text
When users search for an agent, names should match regardless of uppercase/lowercase letters. Please fix this behavior so search feels natural (for example, typing "alice" should still find "Alice"). Keep the change minimal and add one short inline comment explaining what was adjusted.
```

## Prompt to fix the complex bug
Paste this exact prompt into GitHub Copilot or OpenAI Codex:

```text
Sometimes if a user clicks agents quickly, the UI can show details from an older click instead of the most recent one. Please fix it so the app always reflects the latest selection, even during rapid clicking. Keep the behavior otherwise the same and add one short inline comment describing the fix.
```

## Repro steps for intentional bugs
1. Case-sensitive search bug:
   - Type `Alice` in the search box, then type `alice`.
   - `Alice` matches, but `alice` does not.
2. Stale async selection race bug:
   - Click `Alice`, then quickly click `Bruno` (or `Carla`) within about 1 second.
   - The newer selection appears first, but the older `Alice` result can overwrite it afterward.

## Expected fixed behavior checklist
- Search is case-insensitive: `Alice`, `alice`, and `ALICE` all return the same match.
- Rapid agent clicks never allow an older delayed selection to overwrite the most recent selection.
- Suggestion panel and canvas always stay in sync with the latest clicked agent.

## How to install copilots
### GitHub Copilot (VS Code)
1. Install the GitHub Copilot extension in VS Code.
2. Sign in with your GitHub account that has Copilot access.
3. Open this project folder and start using inline chat or code suggestions.

Official docs:
- https://docs.github.com/en/copilot/get-started-with-github-copilot
- https://code.visualstudio.com/docs/copilot/overview

### GitHub Copilot CLI
1. Install GitHub CLI (`gh`) and authenticate with your GitHub account.
2. Install the Copilot CLI extension:
   ```bash
   gh extension install github/gh-copilot
   ```
3. Use Copilot in terminal, for example:
   ```bash
   gh copilot suggest "how do i start this project?"
   gh copilot explain "npm start"
   ```

Official docs:
- https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-github-copilot-in-the-cli
- https://docs.github.com/en/copilot/get-started-with-github-copilot

### OpenAI Codex
1. Open the Codex getting-started documentation.
2. Follow setup instructions for your environment/editor.
3. Open this project and use Codex to apply edits from prompts.

Official docs:
- https://platform.openai.com/docs/guides/codex
- https://help.openai.com/

### OpenAI Codex CLI
1. Install Codex CLI:
   ```bash
   npm install -g @openai/codex
   ```
2. In your project folder, start Codex:
   ```bash
   codex
   ```
3. Ask in plain language (for example): `Fix the search so it is case-insensitive.`

Official docs:
- https://platform.openai.com/docs/guides/codex
- https://help.openai.com/en/articles/11096431
- https://github.com/openai/codex

## How I designed the repo
I kept the project intentionally small and flat so copilots can understand and edit single files quickly: one static server, one HTML page, one JS file for app logic, one CSS file, and one JSON data file.
