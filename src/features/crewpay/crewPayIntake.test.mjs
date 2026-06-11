import assert from "node:assert/strict";
import {
  buildCrewPayTimeEntriesCsv,
  buildProofManifest,
  createCrewPayWorkEntry,
  formatCsvCell,
  mapJobToCrewPayWorkEntry,
  validateCrewPayWorkEntry,
} from "./crewPayIntake.js";

const blankEntry = createCrewPayWorkEntry();
assert.equal(blankEntry.workerId, "");
assert.equal(blankEntry.workerName, "");
assert.equal(blankEntry.entryDate, "");
assert.deepEqual(blankEntry.proofRefs, []);
assert.equal(blankEntry.localStatus, "draft");
assert.equal(blankEntry.schemaVersion, 1);

const mappedEntry = mapJobToCrewPayWorkEntry({
  id: "local-1",
  workerId: "W-1",
  workerName: "Sample Worker",
  entryDate: "2026-06-11",
  jobId: "J-1",
  jobName: "Install",
  siteName: "North Site",
  companyName: "Sample Customer",
  startTime: "08:00",
  endTime: "16:00",
  hoursWorkedCrewPay: 8,
  payType: "hourly",
  rateRef: "standard",
  notes: "Needs review",
  ticketPhotoId: "photo-1",
  ticketPhotoName: "proof.jpg",
  localStatus: "ready",
  createdAt: "2026-06-11T14:00:00.000Z",
  updatedAt: "2026-06-11T14:30:00.000Z",
});

assert.equal(mappedEntry.workerId, "W-1");
assert.equal(mappedEntry.localStatus, "ready");
assert.equal(mappedEntry.proofRefs.length, 1);
assert.equal(mappedEntry.proofRefs[0].proofId, "photo-1");

const validation = validateCrewPayWorkEntry(mappedEntry);
assert.equal(validation.isValid, true);
assert.deepEqual(validation.errors, []);

const invalidValidation = validateCrewPayWorkEntry({
  id: "",
  entryDate: "",
  hoursWorked: 0,
});
assert.equal(invalidValidation.isValid, false);
assert.ok(invalidValidation.errors.length >= 3);

assert.equal(formatCsvCell('Line "one",\nLine two'), '"Line ""one"",\nLine two"');

const csv = buildCrewPayTimeEntriesCsv([mappedEntry]);
assert.ok(csv.startsWith("Schema Version,Local Entry ID,Worker ID"));
assert.ok(csv.includes("local-1,W-1,Sample Worker,2026-06-11"));
const forbiddenSamples = [
  ["Tim", "othy"].join(""),
  ["Leg", "end"].join(""),
  ["ble", "ger"].join(""),
];
forbiddenSamples.forEach((sample) => {
  assert.ok(!csv.includes(sample));
});

const escapedCsv = buildCrewPayTimeEntriesCsv([
  {
    ...mappedEntry,
    id: "local-2",
    notes: "Comma, quote \" and newline\nsafe",
  },
]);
assert.ok(escapedCsv.includes('"Comma, quote "" and newline\nsafe"'));

const proofManifest = buildProofManifest([mappedEntry]);
assert.equal(proofManifest.appName, "CrewPay Field App");
assert.equal(proofManifest.proofEntries.length, 1);
assert.equal(proofManifest.proofEntries[0].entryId, "local-1");
