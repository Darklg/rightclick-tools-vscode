# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

VS Code extension ("Right Click Tools") adding four context menu commands: open the file in its default app, open its directory in Finder, in a new VS Code terminal, or in macOS Terminal.app. Each command is available in both the editor and the file explorer, and each can be toggled per-location via settings.

Single-file extension: `extension.js` is the entry point (`main`). No bundler, no TypeScript, no test framework.

## Commands

```bash
npm run build      # clean .vsix + vsce package
npm run install    # install latest .vsix into VS Code
npm run publish    # vsce publish
npm run watch      # node --watch on extension.js
```

Debug: **F5** in VS Code launches an Extension Host window (see `.vscode/launch.json`).

## Architecture

- `extension.js` — registers four commands in `activate()`: `extension.openInDefaultApp`, `extension.openInFinder`, `extension.openInTerminal`, `extension.openInMacTerminal`. Helpers: `getUri()` resolves file context (right-click URI or active editor), `getDirectory()` extracts the parent dir (or returns the path itself if it's a folder, so explorer folder right-clicks work).
- `package.json` — declares commands, context menu contributions (`editor/context` and `explorer/context`), settings (`contributes.configuration`), and activation events (incl. `onStartupFinished`).
- macOS-only: `openInFinder`/`openInDefaultApp` shell out to `open`, `openInMacTerminal` to `open -a Terminal`. The VS Code terminal is named after the folder (`path.basename`).
- **Per-entry toggles** — settings `rightclickTools.<scope>.<command>` (scope = `editor` | `explorer`, all default `true`) control menu visibility. VS Code menu `when` clauses can't read settings directly, so `syncContextKeys()` mirrors each setting into a context key (`setContext`) used in the `when` guards. It runs at activation and on `onDidChangeConfiguration` (live, no reload). To add a command or scope, update the `MENU_SCOPES`/`MENU_ENTRIES` arrays *and* the matching `package.json` config + menu entries.
- Localization: command titles and setting descriptions use `%xxx%` placeholders in `package.json` resolved via `package.nls.json` (en) / `package.nls.fr.json` (fr). Runtime strings use `vscode.l10n.t()` with bundles in `l10n/`.

## Conventions

- Vanilla JS (Node/CommonJS), no dependencies at runtime.
- `@vscode/vsce` is the sole dev dependency (packaging).
