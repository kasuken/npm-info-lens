import * as vscode from "vscode";
import fetch from "node-fetch";
import ts = require("typescript");
import { SyntaxKind } from "typescript";

export async function openLink(link: vscode.Uri) {
  await vscode.commands.executeCommand("vscode.open", link);
}

async function retrieveUrlContent(url: string) {
  const response = await fetch(url);
  return await response.text();
}

export async function getPackageInfoFromNPMRegistry(packageName: string) {
  let url = `https://registry.npmjs.com/${packageName}/latest`;

  try {
    const content = await retrieveUrlContent(url);
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to fetch url: ${url}`);
  }
}

function getPackageName(importPath: string): string {
  if (!importPath) {
    return "";
  }
  const cleanImportPath = importPath.replace(/'/g, "").replace(/"/g, "").trim();
  if (
    cleanImportPath.startsWith("/") ||
    cleanImportPath.startsWith("./") ||
    cleanImportPath.startsWith("../") ||
    cleanImportPath.startsWith("~")
  ) {
    return "";
  }

  if (cleanImportPath.startsWith("@")) {
    const pathsArray = cleanImportPath.split("/");
    return `${pathsArray[0]}/${pathsArray[1]}`;
  }

  return cleanImportPath.split("/")[0];
}

export function buildPackageName(node: ts.Node, document: vscode.TextDocument) {
  const importPath = node
    .getChildren()
    .filter((n) => {
      if (n.kind === SyntaxKind.StringLiteral) {
        return true;
      }
      return false;
    })
    .map((n) => n.getFullText());
  const line = document.positionAt(node.getStart());
  const text = document.lineAt(line.line);
  const packageName = getPackageName(
    importPath[0]?.replace(/'/g, "")?.replace(/"/g, "").trim()
  );
  return {
    importLineText: text,
    packageName: packageName,
  };
}

export function buildLinks(
  importTextLine: vscode.TextLine,
  packageName: string
) {
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
    new vscode.CodeLens(codeLensRange, {
      title: `BundlePhobia`,
      command: "openPackageDetails",
      arguments: [packageName, "bundlephobia"],
    }),
  ];
}

export function clearUrl(url: string) {
  return url.replace("git+", "").replace(".git", "");
}
