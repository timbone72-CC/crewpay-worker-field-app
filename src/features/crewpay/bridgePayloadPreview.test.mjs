import assert from "node:assert/strict";
import {
  buildBridgePayloadPreviewExport,
  buildBridgePayloadPreviews,
  buildBridgePreviewSummary,
  findMissingBridgeTimeEntryFields,
} from "./bridgePayloadPreview.js";

const payPeriod = {
  id: "PP-1",
  label: "Current Pay Period",
  jobs: [
    {
      id: "job-1",
      workerId: "W-1",
      workerName: "Sample Worker",
      entryDate: "2026-06-11",
      jobName: "Install",
      hoursWorked: 8,
      hourlyRate: 25,
      notes: "Ready for review",
    },
    {
      id: "job-2",
      workerId: "",
      entryDate: "",
      jobName: "",
      hoursWorked: 0,
      hourlyRate: 0,
    },
  ],
};

const previews = buildBridgePayloadPreviews(payPeriod);

assert.equal(previews.length, 2);
assert.deepEqual(previews[0].missingFields, []);
assert.deepEqual(previews[0].payload, {
  action: "submitTimeEntry",
  clientId: "crewpay-worker-field-app",
  entryId: "job-1",
  workerId: "W-1",
  workerName: "Sample Worker",
  payPeriodId: "PP-1",
  workDate: "2026-06-11",
  jobWorkType: "Install",
  hoursWorked: 8,
  rate: 25,
  notes: "Ready for review",
});

assert.deepEqual(previews[1].missingFields, [
  "workerId",
  "workDate",
  "jobWorkType",
  "hoursWorked",
  "rate",
]);

assert.deepEqual(buildBridgePreviewSummary(previews), {
  totalPreviewCount: 2,
  bridgeReadyCount: 1,
  missingFieldCount: 1,
});

assert.deepEqual(buildBridgePreviewSummary("not-array"), {
  totalPreviewCount: 0,
  bridgeReadyCount: 0,
  missingFieldCount: 0,
});

const previewExport = buildBridgePayloadPreviewExport(payPeriod, {
  exportedAt: "2026-06-11T18:00:00.000Z",
});
assert.equal(previewExport.exportType, "bridge-payload-preview");
assert.equal(previewExport.exportedAt, "2026-06-11T18:00:00.000Z");
assert.equal(previewExport.payPeriodId, "PP-1");
assert.equal(previewExport.payPeriodLabel, "Current Pay Period");
assert.equal(previewExport.totalPreviewCount, 2);
assert.equal(previewExport.bridgeReadyCount, 1);
assert.equal(previewExport.missingFieldCount, 1);
assert.equal(previewExport.previewOnly, true);
assert.equal(previewExport.previews.length, 2);

assert.deepEqual(findMissingBridgeTimeEntryFields({
  workerId: "W-2",
  payPeriodId: "PP-2",
  workDate: "2026-06-12",
  jobWorkType: "Repair",
  hoursWorked: 4,
  rate: 30,
}), []);

assert.deepEqual(buildBridgePayloadPreviews({ jobs: "not-array" }), []);
