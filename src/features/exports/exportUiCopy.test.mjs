import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const exportMenuSource = readFileSync("src/features/exports/ExportActionsDropdown.jsx", "utf8");
const personalBackupSource = readFileSync("src/features/exports/PersonalCloudBackupPanel.jsx", "utf8");

assert.match(exportMenuSource, /Proof photos and receipt photos are stored locally on this device/);
assert.match(exportMenuSource, /photo names and proof references/);
assert.match(exportMenuSource, /do not include the actual image files/);
assert.match(personalBackupSource, /do not include the actual photo or receipt image files/);
assert.match(personalBackupSource, /Photo files are not included/);

assert.doesNotMatch(exportMenuSource, /Print Full Report/);
assert.doesNotMatch(exportMenuSource, /CrewPay Worker Review Report/);

console.log("export UI copy tests passed");
