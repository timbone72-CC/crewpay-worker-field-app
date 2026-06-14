import {
  enqueueCrewPayBridgePendingTimeEntries,
  loadCrewPayBridgePendingQueue,
  saveCrewPayBridgePendingQueue,
} from "./bridgePendingQueueStorage.js";
import { buildCrewPayBridgeTimeEntryPayload, mapJobToCrewPayWorkEntry } from "../crewpay/crewPayIntake.js";

const BRIDGE_ACTION = "submitTimeEntry";

export function buildCrewPayBridgeTimeEntryPayloads(payPeriod = {}, options = {}) {
  const jobs = Array.isArray(payPeriod.jobs) ? payPeriod.jobs : [];
  const defaultRate = safeMoney(
    options.defaultRate ?? payPeriod?.hourlyRate ?? payPeriod?.defaultRate ?? 0,
  );

  return jobs.map((job) =>
    buildCrewPayBridgeTimeEntryPayload(mapJobToCrewPayWorkEntry(job), {
      payPeriodId: payPeriod.id,
      clientId: "crewpay-worker-field-app",
      rate: defaultRate,
    }),
  );
}

export function validateCrewPayBridgeTimeEntryPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      isValid: false,
      errors: ["Payload must be an object."],
    };
  }

  if (payload.action !== BRIDGE_ACTION) {
    errors.push("action must be submitTimeEntry.");
  }

  validateString(errors, payload.workerId, "workerId");
  validateString(errors, payload.payPeriodId, "payPeriodId");
  validateString(errors, payload.workDate, "workDate");
  validateString(errors, payload.jobWorkType, "jobWorkType");
  validatePositiveNumber(errors, payload.hoursWorked, "hoursWorked");
  validatePositiveNumber(errors, payload.rate, "rate");

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function submitCrewPayBridgeTimeEntries({
  endpoint,
  token,
  payloads,
  fetchImpl = globalThis.fetch,
} = {}) {
  const safeEndpoint = normalizeEndpoint(endpoint);
  const safeToken = normalizeToken(token);
  const safePayloads = Array.isArray(payloads) ? payloads : [];

  if (!safeEndpoint) {
    return {
      ok: false,
      submittedCount: 0,
      failedCount: safePayloads.length,
      message: "Preview only - no workbook bridge endpoint is configured.",
      details: [],
    };
  }

  if (!safeToken) {
    return {
      ok: false,
      submittedCount: 0,
      failedCount: safePayloads.length,
      message: "Submit failed - workbook bridge token is missing.",
      details: [],
    };
  }

  if (typeof fetchImpl !== "function") {
    return {
      ok: false,
      submittedCount: 0,
      failedCount: safePayloads.length,
      message: "Submit failed - fetch is not available in this browser.",
      details: [],
    };
  }

  if (safePayloads.length === 0) {
    return {
      ok: false,
      submittedCount: 0,
      failedCount: 0,
      message: "No time entries are available to submit.",
      details: [],
    };
  }

  const details = [];
  let submittedCount = 0;
  let failedCount = 0;

  for (const payload of safePayloads) {
    const validation = validateCrewPayBridgeTimeEntryPayload(payload);

    if (!validation.isValid) {
      failedCount += 1;
      details.push({
        entryId: payload?.entryId || "",
        ok: false,
        status: "invalid",
        error: validation.errors.join(" "),
      });
      continue;
    }

    try {
      const requestBody = {
        token: safeToken,
        action: BRIDGE_ACTION,
        clientId: "crewpay-worker-field-app",
        payload,
      };
      const response = await fetchImpl(safeEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseBody = await readBridgeResponseBody(response);

      if (!response?.ok) {
        failedCount += 1;
        details.push({
          entryId: payload.entryId || "",
          ok: false,
          status: response?.status || 0,
          error: bridgeResponseErrorMessage(response, responseBody),
        });
        continue;
      }

      if (responseBody && typeof responseBody === "object") {
        if (responseBody.ok === false || responseBody.success === false) {
          failedCount += 1;
          details.push({
            entryId: payload.entryId || "",
            ok: false,
            status: response.status,
            error: bridgeResponseErrorMessage(response, responseBody),
          });
          continue;
        }
      }

      submittedCount += 1;
      details.push({
        entryId: payload.entryId || "",
        ok: true,
        status: response.status,
        response: responseBody,
      });
    } catch (error) {
      failedCount += 1;
      details.push({
        entryId: payload?.entryId || "",
        ok: false,
        status: "network_error",
        error: error?.message || "Submit failed.",
      });
    }
  }

  const ok = failedCount === 0;

  return {
    ok,
    submittedCount,
    failedCount,
    message: ok
      ? `Sent ${submittedCount} ${formatTimeEntryWord(submittedCount)} to pending intake.`
      : submittedCount > 0
        ? `Sent ${submittedCount} ${formatTimeEntryWord(submittedCount)} to pending intake; ${failedCount} failed.`
        : `Submit failed for ${failedCount} ${formatTimeEntryWord(failedCount)}.`,
    details,
  };
}

export async function submitCrewPayBridgeTimeEntriesWithPendingQueue({
  endpoint,
  token,
  payloads,
  fetchImpl = globalThis.fetch,
} = {}) {
  const safePayloads = Array.isArray(payloads) ? payloads : [];
  const { validPayloads, invalidDetails } = splitValidBridgePayloads(safePayloads);

  if (safePayloads.length === 0) {
    const result = await submitCrewPayBridgeTimeEntries({
      endpoint,
      token,
      payloads: safePayloads,
      fetchImpl,
    });

    return {
      ...result,
      queuedCount: 0,
      pendingCount: loadCrewPayBridgePendingQueue().length,
    };
  }

  const queueReason = bridgeQueueReason({ endpoint, token, fetchImpl });

  if (queueReason) {
    const queuedItems = enqueueCrewPayBridgePendingTimeEntries(validPayloads, {
      reason: queueReason,
    });

    return {
      ok: false,
      submittedCount: 0,
      failedCount: invalidDetails.length,
      queuedCount: queuedItems.length,
      pendingCount: loadCrewPayBridgePendingQueue().length,
      message:
        queuedItems.length > 0
          ? `Queued ${queuedItems.length} ${formatTimeEntryWord(queuedItems.length)} for pending sync.`
          : "No valid time entries are available to queue.",
      details: [
        ...invalidDetails,
        ...queuedItems.map((item) => ({
          entryId: item.payload.entryId || "",
          ok: false,
          queued: true,
          status: "queued",
          error: queueReason,
        })),
      ],
    };
  }

  const submitResult = await submitCrewPayBridgeTimeEntries({
    endpoint,
    token,
    payloads: validPayloads,
    fetchImpl,
  });
  const networkFailedPayloads = findFailedNetworkPayloads(validPayloads, submitResult.details);
  const queuedItems = enqueueCrewPayBridgePendingTimeEntries(networkFailedPayloads, {
    reason: "Submit failed while offline or unreachable.",
  });
  const queuedEntryIds = new Set(queuedItems.map((item) => item.payload.entryId || ""));
  const details = [
    ...invalidDetails,
    ...submitResult.details.map((detail) =>
      queuedEntryIds.has(detail.entryId || "")
        ? {
            ...detail,
            queued: true,
            status: "queued",
          }
        : detail,
    ),
  ];
  const failedCount = invalidDetails.length + submitResult.failedCount;

  return {
    ok: failedCount === 0,
    submittedCount: submitResult.submittedCount,
    failedCount,
    queuedCount: queuedItems.length,
    pendingCount: loadCrewPayBridgePendingQueue().length,
    message:
      queuedItems.length > 0
        ? `${submitResult.message} Queued ${queuedItems.length} ${formatTimeEntryWord(queuedItems.length)} for pending sync.`
        : invalidDetails.length > 0
          ? `Submit blocked for ${invalidDetails.length} invalid ${formatTimeEntryWord(invalidDetails.length)}. ${submitResult.message}`
          : submitResult.message,
    details,
  };
}

export async function retryCrewPayBridgePendingTimeEntries({
  endpoint,
  token,
  fetchImpl = globalThis.fetch,
} = {}) {
  const queuedItems = loadCrewPayBridgePendingQueue();

  if (queuedItems.length === 0) {
    return {
      ok: false,
      submittedCount: 0,
      failedCount: 0,
      pendingCount: 0,
      message: "No pending bridge time entries are queued.",
      details: [],
    };
  }

  const submitResult = await submitCrewPayBridgeTimeEntries({
    endpoint,
    token,
    payloads: queuedItems.map((item) => item.payload),
    fetchImpl,
  });
  const nextQueue = updateQueueAfterRetry(queuedItems, submitResult.details, submitResult.message);
  saveCrewPayBridgePendingQueue(nextQueue);

  return {
    ...submitResult,
    pendingCount: nextQueue.length,
    message:
      nextQueue.length === 0 && submitResult.submittedCount > 0
        ? `Synced ${submitResult.submittedCount} pending ${formatTimeEntryWord(submitResult.submittedCount)}.`
        : `${submitResult.message} ${nextQueue.length} pending ${formatTimeEntryWord(nextQueue.length)} remain queued.`,
  };
}

function normalizeEndpoint(endpoint) {
  return String(endpoint ?? "").trim();
}

function normalizeToken(token) {
  return String(token ?? "").trim();
}

function safeMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function splitValidBridgePayloads(payloads) {
  const validPayloads = [];
  const invalidDetails = [];

  for (const payload of payloads) {
    const validation = validateCrewPayBridgeTimeEntryPayload(payload);

    if (validation.isValid) {
      validPayloads.push(payload);
      continue;
    }

    invalidDetails.push({
      entryId: payload?.entryId || "",
      ok: false,
      status: "invalid",
      error: validation.errors.join(" "),
    });
  }

  return { validPayloads, invalidDetails };
}

function bridgeQueueReason({ endpoint, token, fetchImpl }) {
  if (!normalizeEndpoint(endpoint)) {
    return "No workbook bridge endpoint is configured.";
  }

  if (!normalizeToken(token)) {
    return "Workbook bridge token is missing.";
  }

  if (typeof fetchImpl !== "function") {
    return "Fetch is not available in this browser.";
  }

  return "";
}

function findFailedNetworkPayloads(payloads, details) {
  const networkFailedEntryIds = new Set(
    details
      .filter((detail) => detail.status === "network_error")
      .map((detail) => detail.entryId || ""),
  );

  return payloads.filter((payload) => networkFailedEntryIds.has(payload.entryId || ""));
}

function updateQueueAfterRetry(queuedItems, details, fallbackError) {
  const detailByEntryId = new Map(
    details.map((detail) => [detail.entryId || "", detail]),
  );
  const updatedAt = new Date().toISOString();

  return queuedItems.flatMap((item) => {
    const detail = detailByEntryId.get(item.payload?.entryId || "");

    if (detail?.ok) {
      return [];
    }

    return [
      {
        ...item,
        attempts: safeAttemptCount(item.attempts) + 1,
        lastError: detail?.error || fallbackError || "Submit failed.",
        status: "pending",
        updatedAt,
      },
    ];
  });
}

function safeAttemptCount(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

function validateString(errors, value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    errors.push(`${fieldName} is required.`);
  }
}

function validatePositiveNumber(errors, value, fieldName) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    errors.push(`${fieldName} must be greater than 0.`);
  }
}

function formatTimeEntryWord(count) {
  return count === 1 ? "time entry" : "time entries";
}

async function readBridgeResponseBody(response) {
  if (!response || typeof response !== "object") {
    return null;
  }

  const contentType = String(response.headers?.get?.("content-type") || "").toLowerCase();

  try {
    if (contentType.includes("application/json") && typeof response.json === "function") {
      return await response.json();
    }

    if (typeof response.text === "function") {
      const text = await response.text();
      return text ? tryParseJson(text) : text;
    }
  } catch {
    return null;
  }

  return null;
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function bridgeResponseErrorMessage(response, responseBody) {
  const bodyMessage =
    responseBody && typeof responseBody === "object"
      ? responseBody.message || responseBody.error || responseBody.details
      : "";

  if (bodyMessage) {
    return String(bodyMessage);
  }

  return `Bridge returned ${response?.status || "an error"}.`;
}
