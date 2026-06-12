const vscode = require('vscode');
const path = require('path');
const {
    exec
} = require('child_process');

function getUri(uri) {
    if (uri && uri.fsPath) {
        return uri;
    }

    const editor = vscode.window.activeTextEditor;
    if (editor) {
        return editor.document.uri;
    }

    throw new Error(vscode.l10n.t('No file context available'));
}

/**
 * Get directory path from URI
 * @param {vscode.Uri} uri
 * @returns {string}
 */
function getDirectory(uri) {
    if (!uri || !uri.fsPath) {
        throw new Error(vscode.l10n.t('Invalid URI'));
    }

    const fsPath = uri.fsPath;
    return path.extname(fsPath) ? path.dirname(fsPath) : fsPath;
}

/**
 * Open folder in Finder (macOS)
 * @param {string} dir
 */
function openInFinder(dir) {
    exec(`open "${dir}"`, (err) => {
        if (err) {
            vscode.window.showErrorMessage(vscode.l10n.t('Failed to open Finder: {0}', err.message));
        }
    });
}

/**
 * Open file in its default macOS app
 * @param {string} file
 */
function openInDefaultApp(file) {
    exec(`open "${file}"`, (err) => {
        if (err) {
            vscode.window.showErrorMessage(vscode.l10n.t('Failed to open file: {0}', err.message));
        }
    });
}

/**
 * Open folder in macOS Terminal.app
 * @param {string} dir
 */
function openInMacTerminal(dir) {
    exec(`open -a Terminal "${dir}"`, (err) => {
        if (err) {
            vscode.window.showErrorMessage(vscode.l10n.t('Failed to open macOS Terminal: {0}', err.message));
        }
    });
}

/**
 * Open folder in VSCode terminal
 * @param {string} dir
 */
function openInTerminal(dir) {
    const terminal = vscode.window.createTerminal({
        name: path.basename(dir),
        cwd: dir
    });

    terminal.show();
}

// Context menu entries toggled via settings, per location scope
const MENU_SCOPES = ['editor', 'explorer'];
const MENU_ENTRIES = [
    'openInDefaultApp',
    'openInFinder',
    'openInTerminal',
    'openInMacTerminal'
];

/**
 * Publish a context key per menu entry/scope reflecting its setting,
 * so menu `when` clauses can hide disabled entries.
 */
function syncContextKeys() {
    MENU_SCOPES.forEach((scope) => {
        const config = vscode.workspace.getConfiguration(`rightclickTools.${scope}`);
        MENU_ENTRIES.forEach((entry) => {
            vscode.commands.executeCommand(
                'setContext',
                `rightclickTools.${scope}.${entry}`,
                config.get(entry, true)
            );
        });
    });
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    syncContextKeys();

    const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('rightclickTools')) {
            syncContextKeys();
        }
    });

    const openFinderCmd = vscode.commands.registerCommand(
        'extension.openInFinder',
        (uri) => {
            try {
                const dir = getDirectory(getUri(uri));
                openInFinder(dir);
            } catch (e) {
                vscode.window.showErrorMessage(e.message);
            }
        }
    );

    const openTerminalCmd = vscode.commands.registerCommand(
        'extension.openInTerminal',
        (uri) => {
            try {
                const dir = getDirectory(getUri(uri));
                openInTerminal(dir);
            } catch (e) {
                vscode.window.showErrorMessage(e.message);
            }
        }
    );

    const openMacTerminalCmd = vscode.commands.registerCommand(
        'extension.openInMacTerminal',
        (uri) => {
            try {
                const dir = getDirectory(getUri(uri));
                openInMacTerminal(dir);
            } catch (e) {
                vscode.window.showErrorMessage(e.message);
            }
        }
    );

    const openInDefaultAppCmd = vscode.commands.registerCommand(
        'extension.openInDefaultApp',
        (uri) => {
            try {
                const fileUri = getUri(uri);
                openInDefaultApp(fileUri.fsPath);
            } catch (e) {
                vscode.window.showErrorMessage(e.message);
            }
        }
    );

    context.subscriptions.push(configWatcher, openFinderCmd, openTerminalCmd, openMacTerminalCmd, openInDefaultAppCmd);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
