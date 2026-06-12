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
  payloads,
  fetchImpl = globalThis.fetch,
} = {}) {
  const safeEndpoint = normalizeEndpoint(endpoint);
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
      const response = await fetchImpl(safeEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response?.ok) {
        failedCount += 1;
        details.push({
          entryId: payload.entryId || "",
          ok: false,
          status: response?.status || 0,
          error: `Bridge returned ${response?.status || "an error"}.`,
        });
        continue;
      }

      submittedCount += 1;
      details.push({
        entryId: payload.entryId || "",
        ok: true,
        status: response.status,
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

function normalizeEndpoint(endpoint) {
  return String(endpoint ?? "").trim();
}

function safeMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
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
