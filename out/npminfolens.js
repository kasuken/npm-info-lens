"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearUrl = exports.buildCodeLens = exports.buildPackageName = exports.getPackageInfoFromNPMRegistry = exports.openLink = void 0;
const vscode = require("vscode");
const node_fetch_1 = require("node-fetch");
const typescript_1 = require("typescript");
async function openLink(link) {
    await vscode.commands.executeCommand("vscode.open", link);
}
exports.openLink = openLink;
async function retrieveUrlContent(url) {
    const response = await (0, node_fetch_1.default)(url);
    return await response.text();
}
async function getPackageInfoFromNPMRegistry(packageName) {
    let url = `https://registry.npmjs.com/${packageName}/latest`;
    try {
        const content = await retrieveUrlContent(url);
        return JSON.parse(content);
    }
    catch (error) {
        throw new Error(`Failed to fetch url: ${url}`);
    }
}
exports.getPackageInfoFromNPMRegistry = getPackageInfoFromNPMRegistry;
function getPackageName(importPath) {
    if (!importPath) {
        return "";
    }
    const cleanImportPath = importPath.replace(/'/g, "").replace(/"/g, "").trim();
    if (cleanImportPath.startsWith("/") ||
        cleanImportPath.startsWith("./") ||
        cleanImportPath.startsWith("../") ||
        cleanImportPath.startsWith("~")) {
        return "";
    }
    if (cleanImportPath.startsWith("@")) {
        const pathsArray = cleanImportPath.split("/");
        return `${pathsArray[0]}/${pathsArray[1]}`;
    }
    return cleanImportPath.split("/")[0];
}
function buildPackageName(node, document) {
    const importPath = node
        .getChildren()
        .filter((n) => {
        if (n.kind === typescript_1.SyntaxKind.StringLiteral) {
            return true;
        }
        return false;
    })
        .map((n) => n.getFullText());
    const line = document.positionAt(node.getStart());
    const text = document.lineAt(line.line);
    const packageName = getPackageName(importPath[0]?.replace(/'/g, "")?.replace(/"/g, "").trim());
    return {
        importLineText: text,
        packageName: packageName,
    };
}
exports.buildPackageName = buildPackageName;
function buildCodeLens(importTextLine, packageName) {
    const codeLensRange = importTextLine.range;
    return [
        new vscode.CodeLens(codeLensRange, {
            title: `Details for ${packageName} on NPM`,
            command: "openPackageDetails",
            arguments: [packageName, "npm"],
        }),
        new vscode.CodeLens(codeLensRange, {
            title: `GitHub`,
            command: "openPackageDetails",
            arguments: [packageName, "repository"],
        }),
        new vscode.CodeLens(codeLensRange, {
            title: `Website`,
            command: "openPackageDetails",
            arguments: [packageName, "website"],
        }),
    ];
}
exports.buildCodeLens = buildCodeLens;
function clearUrl(url) {
    return url.replace("git+", "").replace(".git", "");
}
exports.clearUrl = clearUrl;
//# sourceMappingURL=npminfolens.js.map