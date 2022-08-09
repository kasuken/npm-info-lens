"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const tsquery_1 = require("@phenomnomnominal/tsquery");
const npminfolens_1 = require("./npminfolens");
function activate(context) {
    context.globalState.get(context.extension.id, {});
    console.log("NPM Info Lens is now active.");
    let regCodeLensProviderDisposable = vscode.languages.registerCodeLensProvider(["typescript", "typescriptreact", "javascript", "javascriptreact"], {
        provideCodeLenses(document) {
            const ast = tsquery_1.tsquery.ast(document.getText());
            const nodes = (0, tsquery_1.tsquery)(ast, "ImportDeclaration");
            return nodes
                .map((node) => (0, npminfolens_1.buildPackageName)(node, document))
                .filter(({ packageName }) => packageName !== "")
                .map(({ importLineText, packageName }) => (0, npminfolens_1.buildCodeLens)(importLineText, packageName))
                .flat();
        },
    });
    let regCommandDisposable = vscode.commands.registerCommand("openPackageDetails", async (...args) => {
        const [packageName, destination] = args;
        if (destination === "npm") {
            (0, npminfolens_1.openLink)(vscode.Uri.parse(`https://www.npmjs.com/package/${packageName}`));
            return;
        }
        if (destination === "repository") {
            let packageDetails = await (0, npminfolens_1.getPackageInfoFromNPMRegistry)(packageName);
            if (!packageDetails) {
                return;
            }
            (0, npminfolens_1.openLink)(vscode.Uri.parse((0, npminfolens_1.clearUrl)(packageDetails.repository.url)));
        }
        if (destination === "website") {
            let packageDetails = await (0, npminfolens_1.getPackageInfoFromNPMRegistry)(packageName);
            if (!packageDetails) {
                return;
            }
            (0, npminfolens_1.openLink)(vscode.Uri.parse((0, npminfolens_1.clearUrl)(packageDetails.homepage)));
        }
        vscode.window.showInformationMessage("Check your browser");
    });
    context.subscriptions.push(regCodeLensProviderDisposable, regCommandDisposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map