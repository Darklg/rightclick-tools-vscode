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

    throw new Error('No file context available');
}

/**
 * Get directory path from URI
 * @param {vscode.Uri} uri
 * @returns {string}
 */
function getDirectory(uri) {
    if (!uri || !uri.fsPath) {
        throw new Error('Invalid URI');
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
            vscode.window.showErrorMessage(`Failed to open Finder: ${err.message}`);
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
            vscode.window.showErrorMessage(`Failed to open macOS Terminal: ${err.message}`);
        }
    });
}

/**
 * Open folder in VSCode terminal
 * @param {string} dir
 */
function openInTerminal(dir) {
    const terminal = vscode.window.createTerminal({
        name: 'Folder Terminal',
        cwd: dir
    });

    terminal.show();
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
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

    context.subscriptions.push(openFinderCmd, openTerminalCmd, openMacTerminalCmd);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
