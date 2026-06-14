import assert from "node:assert/strict";
import {
  retryCrewPayBridgePendingTimeEntries,
  submitCrewPayBridgeTimeEntriesWithPendingQueue,
} from "./crewPayBridge.js";
import {
  clearCrewPayBridgePendingQueue,
  enqueueCrewPayBridgePendingTimeEntries,
  loadCrewPayBridgePendingQueue,
} from "./bridgePendingQueueStorage.js";

const storage = new Map();

global.window = {
  localStorage: {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, value);
    },
    removeItem(key) {
      storage.delete(key);
    },
  },
  alert() {},
};

const validPayload = {
  action: "submitTimeEntry",
  clientId: "crewpay-worker-field-app",
  entryId: "entry-1",
  workerId: "W-1",
  workerName: "Worker One",
  payPeriodId: "PP-1",
  workDate: "2026-06-12",
  jobWorkType: "Install",
  hoursWorked: 8,
  rate: 25,
  notes: "Ready",
};

assert.equal(clearCrewPayBridgePendingQueue(), true);
assert.deepEqual(loadCrewPayBridgePendingQueue(), []);

const missingEndpointResult = await submitCrewPayBridgeTimeEntriesWithPendingQueue({
  payloads: [validPayload],
  fetchImpl: async () => {
    throw new Error("fetch should not be called without endpoint");
  },
});

assert.equal(missingEndpointResult.ok, false);
assert.equal(missingEndpointResult.queuedCount, 1);
assert.equal(missingEndpointResult.failedCount, 0);
assert.match(missingEndpointResult.message, /Queued 1 time entry/i);
assert.equal(loadCrewPayBridgePendingQueue().length, 1);

assert.equal(clearCrewPayBridgePendingQueue(), true);

const missingTokenResult = await submitCrewPayBridgeTimeEntriesWithPendingQueue({
  endpoint: "https://example.com/bridge",
  payloads: [validPayload],
  fetchImpl: async () => {
    throw new Error("fetch should not be called without token");
  },
});

assert.equal(missingTokenResult.ok, false);
assert.equal(missingTokenResult.queuedCount, 1);
assert.match(loadCrewPayBridgePendingQueue()[0].lastError, /token is missing/i);

assert.equal(clearCrewPayBridgePendingQueue(), true);

const invalidResult = await submitCrewPayBridgeTimeEntriesWithPendingQueue({
  endpoint: "https://example.com/bridge",
  token: "CP_BRIDGE_TOKEN_VALUE",
  payloads: [{ ...validPayload, workerId: "" }],
  fetchImpl: async () => {
    throw new Error("fetch should not be called for invalid payloads");
  },
});

assert.equal(invalidResult.ok, false);
assert.equal(invalidResult.queuedCount, 0);
assert.equal(invalidResult.failedCount, 1);
assert.equal(loadCrewPayBridgePendingQueue().length, 0);

const networkResult = await submitCrewPayBridgeTimeEntriesWithPendingQueue({
  endpoint: "https://example.com/bridge",
  token: "CP_BRIDGE_TOKEN_VALUE",
  payloads: [validPayload],
  fetchImpl: async () => {
    throw new Error("offline");
  },
});

assert.equal(networkResult.ok, false);
assert.equal(networkResult.queuedCount, 1);
assert.equal(networkResult.details[0].queued, true);
assert.equal(loadCrewPayBridgePendingQueue().length, 1);

assert.equal(clearCrewPayBridgePendingQueue(), true);

enqueueCrewPayBridgePendingTimeEntries(
  [
    validPayload,
    {
      ...validPayload,
      entryId: "entry-2",
      workDate: "2026-06-13",
    },
  ],
  {
    reason: "manual test queue",
    now: () => "2026-06-14T12:00:00.000Z",
  },
);

const retrySuccessRequests = [];
const retrySuccessResult = await retryCrewPayBridgePendingTimeEntries({
  endpoint: "https://example.com/bridge",
  token: "CP_BRIDGE_TOKEN_VALUE",
  fetchImpl: async (url, options) => {
    retrySuccessRequests.push({ url, options });
    return {
      ok: true,
      status: 200,
      headers: {
        get() {
          return "application/json";
        },
      },
      async json() {
        return { ok: true };
      },
    };
  },
});

assert.equal(retrySuccessResult.ok, true);
assert.equal(retrySuccessResult.submittedCount, 2);
assert.equal(retrySuccessRequests.length, 2);
assert.equal(loadCrewPayBridgePendingQueue().length, 0);

enqueueCrewPayBridgePendingTimeEntries([validPayload], {
  reason: "retry failure setup",
  now: () => "2026-06-14T13:00:00.000Z",
});

const retryFailureResult = await retryCrewPayBridgePendingTimeEntries({
  endpoint: "https://example.com/bridge",
  token: "CP_BRIDGE_TOKEN_VALUE",
  fetchImpl: async () => ({
    ok: false,
    status: 503,
    headers: {
      get() {
        return "application/json";
      },
    },
    async json() {
      return { error: "temporary outage" };
    },
  }),
});

const remainingQueue = loadCrewPayBridgePendingQueue();
assert.equal(retryFailureResult.ok, false);
assert.equal(remainingQueue.length, 1);
assert.equal(remainingQueue[0].attempts, 1);
assert.match(remainingQueue[0].lastError, /temporary outage/i);

console.log("crewPayBridgePendingQueue tests passed");
