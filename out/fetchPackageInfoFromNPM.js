"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPackageInfoFromNPM = void 0;
const node_fetch_1 = require("node-fetch");
async function fetchPackageInfoFromNPM(packageName) {
    const res = await (0, node_fetch_1.default)(`https://registry.npmjs.com/${packageName}/latest`);
    if (res.ok) {
        return JSON.parse(await res.text());
    }
    if (res.status === 404) {
        return undefined;
    }
    throw new Error(`Failed to fetch package info for ${packageName}`);
}
exports.fetchPackageInfoFromNPM = fetchPackageInfoFromNPM;
//# sourceMappingURL=fetchPackageInfoFromNPM.js.map