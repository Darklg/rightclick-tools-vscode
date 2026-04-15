# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

VS Code extension ("Right Click Tools") adding three context menu commands: open the current file's directory in Finder, in a new VS Code terminal, or in macOS Terminal.app.

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

- `extension.js` — registers three commands in `activate()`: `extension.openInFinder`, `extension.openInTerminal`, `extension.openInMacTerminal`. Helpers: `getUri()` resolves file context (right-click URI or active editor), `getDirectory()` extracts the parent dir.
- `package.json` — declares commands, context menu contributions (`editor/context` with `resourceScheme == file` guard), and activation events.
- macOS-only: `openInFinder` shells out to `open`, `openInMacTerminal` to `open -a Terminal`.

## Conventions

- Vanilla JS (Node/CommonJS), no dependencies at runtime.
- `@vscode/vsce` is the sole dev dependency (packaging).
