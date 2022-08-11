import * as vscode from "vscode";
import { tsquery } from "@phenomnomnominal/tsquery";
import ts = require("typescript");
import {
  getPackageInfoFromNPMRegistry,
  buildPackageName,
  buildLinks,
  openLink,
  clearUrl,
} from "./npminfolens";

export function activate(context: vscode.ExtensionContext) {
  context.globalState.get<any>(context.extension.id, {});

  console.log("NPM Info Lens is now active.");

  let regCodeLensProviderDisposable = vscode.languages.registerCodeLensProvider(
    ["typescript", "typescriptreact", "javascript", "javascriptreact"],
    {
      provideCodeLenses(document) {
        const ast = tsquery.ast(document.getText());
        const nodes = tsquery(ast, "ImportDeclaration");
        return nodes
          .map((node) => buildPackageName(node, document))
          .filter(({ packageName }) => packageName !== "")
          .map(({ importLineText, packageName }) =>
            buildLinks(importLineText, packageName)
          )
          .flat();
      },
    }
  );

  let regCommandDisposable = vscode.commands.registerCommand(
    "openPackageDetails",
    async (
      ...args: [string, "npm" | "repository" | "website" | "bundlephobia"]
    ) => {
      const [packageName, destination] = args;
      if (destination === "npm") {
        openLink(
          vscode.Uri.parse(`https://www.npmjs.com/package/${packageName}`)
        );
        return;
      }

      if (destination === "repository") {
        let packageDetails = await getPackageInfoFromNPMRegistry(packageName);
        if (!packageDetails) {
          return;
        }

        openLink(
          vscode.Uri.parse(clearUrl(packageDetails.repository.url as string))
        );
      }

      if (destination === "website") {
        let packageDetails = await getPackageInfoFromNPMRegistry(packageName);
        if (!packageDetails) {
          return;
        }

        openLink(vscode.Uri.parse(clearUrl(packageDetails.homepage as string)));
      }

      if (destination === "bundlephobia") {
        openLink(
          vscode.Uri.parse(`https://bundlephobia.com/package/${packageName}`)
        );
      }

      vscode.window.showInformationMessage("Check your browser");
    }
  );

  context.subscriptions.push(
    regCodeLensProviderDisposable,
    regCommandDisposable
  );
}

export function deactivate() {}
