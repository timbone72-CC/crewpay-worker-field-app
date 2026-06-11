import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/features/exports/TimesheetPrintView.jsx", "utf8");

assert.match(source, /Date/);
assert.match(source, /Worker/);
assert.match(source, /Job/);
assert.match(source, /Site/);
assert.match(source, /Company/);
assert.match(source, /Hours/);
assert.match(source, /Status/);
assert.match(source, /Proof/);

assert.match(source, /Secondary Local Records/);
assert.match(source, /mileageEntries/);
assert.match(source, /calculateMileageSummary/);
assert.match(source, /Local mileage total/);

console.log("timesheetPrintView tests passed");
