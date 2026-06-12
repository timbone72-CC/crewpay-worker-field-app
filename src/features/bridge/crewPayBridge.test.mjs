import assert from "node:assert/strict";
import {
  buildCrewPayBridgeTimeEntryPayloads,
  submitCrewPayBridgeTimeEntries,
  validateCrewPayBridgeTimeEntryPayload,
} from "./crewPayBridge.js";

const payPeriod = {
  id: "PP-1",
  jobs: [
    {
      id: "entry-1",
      workerId: "W-1",
      workerName: "Worker One",
      entryDate: "2026-06-12",
      jobName: "Install",
      siteName: "North Site",
      hoursWorked: 8,
      rateRef: "standard",
      payType: "hourly",
      notes: "Ready",
    },
    {
      id: "entry-2",
      workerId: "W-2",
      workerName: "Worker Two",
      entryDate: "2026-06-13",
      jobName: "Inspect",
      siteName: "South Site",
      hoursWorked: 6,
      rateRef: "standard",
      payType: "hourly",
      notes: "Submitted",
    },
  ],
};

const payloads = buildCrewPayBridgeTimeEntryPayloads(payPeriod);
const ratedPayloads = buildCrewPayBridgeTimeEntryPayloads(
  {
    ...payPeriod,
    hourlyRate: 25,
  },
);
assert.equal(payloads.length, 2);
assert.equal(ratedPayloads[0].rate, 25);
assert.deepEqual(payloads[0], {
  action: "submitTimeEntry",
  clientId: "crewpay-worker-field-app",
  entryId: "entry-1",
  workerId: "W-1",
  workerName: "Worker One",
  payPeriodId: "PP-1",
  workDate: "2026-06-12",
  jobWorkType: "Install",
  hoursWorked: 8,
  rate: 0,
  notes: "Ready",
});

const ratedValidation = validateCrewPayBridgeTimeEntryPayload(ratedPayloads[0]);
assert.equal(ratedValidation.isValid, true);
assert.deepEqual(ratedValidation.errors, []);

const validation = validateCrewPayBridgeTimeEntryPayload({
  ...payloads[0],
  rate: 25,
});
assert.equal(validation.isValid, true);
assert.deepEqual(validation.errors, []);

const missingEndpointResult = await submitCrewPayBridgeTimeEntries({
  payloads,
  fetchImpl: async () => {
    throw new Error("fetch should not be called");
  },
});
assert.equal(missingEndpointResult.ok, false);
assert.match(missingEndpointResult.message, /Preview only/);

const calledRequests = [];
const successResult = await submitCrewPayBridgeTimeEntries({
  endpoint: "https://example.com/bridge",
  payloads: ratedPayloads,
  fetchImpl: async (url, options) => {
    calledRequests.push({ url, options });
    return {
      ok: true,
      status: 200,
    };
  },
});

assert.equal(successResult.ok, true);
assert.equal(successResult.submittedCount, 2);
assert.equal(calledRequests.length, 2);
assert.equal(calledRequests[0].url, "https://example.com/bridge");
assert.equal(calledRequests[0].options.method, "POST");
assert.equal(calledRequests[0].options.headers["Content-Type"], "application/json");

const failureResult = await submitCrewPayBridgeTimeEntries({
  endpoint: "https://example.com/bridge",
  payloads: [{ ...payloads[0], workerId: "", rate: 25 }],
  fetchImpl: async () => ({
    ok: true,
    status: 200,
  }),
});

assert.equal(failureResult.ok, false);
assert.equal(failureResult.failedCount, 1);
assert.match(failureResult.message, /failed/);

console.log("crewPayBridge tests passed");
