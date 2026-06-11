import { buildCrewPayBridgeTimeEntryPayload } from "./crewPayIntake.js";

export const REQUIRED_BRIDGE_TIME_ENTRY_FIELDS = [
  "workerId",
  "payPeriodId",
  "workDate",
  "jobWorkType",
  "hoursWorked",
  "rate",
];

export function buildBridgePayloadPreviews(payPeriod = {}) {
  const jobs = Array.isArray(payPeriod.jobs) ? payPeriod.jobs : [];

  return jobs.map((job) => {
    const payload = buildCrewPayBridgeTimeEntryPayload(job, {
      payPeriodId: job.payPeriodId || payPeriod.id,
    });

    return {
      localId: job.id,
      payload,
      missingFields: findMissingBridgeTimeEntryFields(payload),
    };
  });
}

export function findMissingBridgeTimeEntryFields(payload = {}) {
  return REQUIRED_BRIDGE_TIME_ENTRY_FIELDS.filter((field) => {
    if (field === "hoursWorked" || field === "rate") {
      return Number(payload[field]) <= 0;
    }

    return !String(payload[field] ?? "").trim();
  });
}
