# Facilitator Prompts

Use these prompts when running guided copilot practice sessions.

## Prompt to fix the bug
```text
When users search for an agent, names should match regardless of uppercase/lowercase letters. Please fix this behavior so search feels natural (for example, typing "alice" should still find "Alice"). Keep the change minimal and add one short inline comment explaining what was adjusted.
```

## Prompt to fix the complex bug
```text
Sometimes if a user clicks agents quickly, the UI can show details from an older click instead of the most recent one. Please fix it so the app always reflects the latest selection, even during rapid clicking. Keep the behavior otherwise the same and add one short inline comment describing the fix.
```
