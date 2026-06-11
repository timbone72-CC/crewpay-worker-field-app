import assert from "node:assert/strict";
import {
  buildBridgePayloadPreviews,
  findMissingBridgeTimeEntryFields,
} from "./bridgePayloadPreview.js";

const previews = buildBridgePayloadPreviews({
  id: "PP-1",
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
});

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

assert.deepEqual(findMissingBridgeTimeEntryFields({
  workerId: "W-2",
  payPeriodId: "PP-2",
  workDate: "2026-06-12",
  jobWorkType: "Repair",
  hoursWorked: 4,
  rate: 30,
}), []);

assert.deepEqual(buildBridgePayloadPreviews({ jobs: "not-array" }), []);
