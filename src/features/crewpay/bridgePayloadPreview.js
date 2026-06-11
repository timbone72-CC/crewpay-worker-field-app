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

export function buildBridgePayloadPreviewExport(payPeriod = {}, options = {}) {
  const previews = buildBridgePayloadPreviews(payPeriod);

  return {
    appName: "CrewPay Field App",
    exportType: "bridge-payload-preview",
    exportedAt: options.exportedAt || new Date().toISOString(),
    payPeriodId: stringOr(payPeriod.id, ""),
    payPeriodLabel: stringOr(payPeriod.label, ""),
    totalPreviewCount: previews.length,
    bridgeReadyCount: previews.filter((preview) => preview.missingFields.length === 0).length,
    previewOnly: true,
    note: "Preview only. This file is for review before workbook connection is enabled.",
    previews,
  };
}

export function findMissingBridgeTimeEntryFields(payload = {}) {
  return REQUIRED_BRIDGE_TIME_ENTRY_FIELDS.filter((field) => {
    if (field === "hoursWorked" || field === "rate") {
      return Number(payload[field]) <= 0;
    }

    return !String(payload[field] ?? "").trim();
  });
}

function stringOr(value, fallback) {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || typeof value === "undefined") {
    return fallback;
  }

  return String(value);
}
