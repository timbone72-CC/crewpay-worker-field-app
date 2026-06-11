export const CREWPAY_WORK_ENTRY_SCHEMA_VERSION = 1;

export const CREWPAY_LOCAL_STATUSES = ["draft", "ready", "submitted", "needs_review"];

export const CREWPAY_TIME_ENTRY_HEADERS = [
  "Schema Version",
  "Local Entry ID",
  "Worker ID",
  "Worker Name",
  "Entry Date",
  "Job ID",
  "Job Name",
  "Site Name",
  "Company Name",
  "Start Time",
  "End Time",
  "Hours Worked",
  "Pay Type",
  "Rate Ref",
  "Notes",
  "Proof Count",
  "Local Status",
  "Submitted At",
  "Created At",
  "Updated At",
];

export function createCrewPayWorkEntry(input = {}) {
  const now = new Date().toISOString();
  const existingProofRefs = Array.isArray(input.proofRefs) ? input.proofRefs : [];

  return {
    id: stringOr(input.id, ""),
    workerId: stringOr(input.workerId, ""),
    workerName: stringOr(input.workerName, ""),
    entryDate: stringOr(input.entryDate ?? input.date, ""),
    jobId: stringOr(input.jobId, ""),
    jobName: stringOr(input.jobName, ""),
    siteName: stringOr(input.siteName ?? input.rigNameOrNumber, ""),
    companyName: stringOr(input.companyName ?? input.company, ""),
    startTime: stringOr(input.startTime, ""),
    endTime: stringOr(input.endTime, ""),
    hoursWorked: safeHours(input.hoursWorked ?? input.hoursWorkedCrewPay ?? input.hoursWorked),
    payType: stringOr(input.payType, ""),
    rateRef: stringOr(input.rateRef, ""),
    notes: stringOr(input.notes, ""),
    proofRefs: existingProofRefs.map(normalizeProofRef),
    localStatus: normalizeLocalStatus(input.localStatus),
    submittedAt: stringOr(input.submittedAt, ""),
    createdAt: stringOr(input.createdAt, now),
    updatedAt: stringOr(input.updatedAt, now),
    schemaVersion: CREWPAY_WORK_ENTRY_SCHEMA_VERSION,
  };
}

export function validateCrewPayWorkEntry(entry) {
  const normalized = createCrewPayWorkEntry(entry);
  const errors = [];

  if (!normalized.id) errors.push("id is required.");
  if (!normalized.entryDate) errors.push("entryDate is required.");
  if (!normalized.workerId && !normalized.workerName) errors.push("workerId or workerName is required.");
  if (!normalized.jobId && !normalized.jobName && !normalized.siteName && !normalized.companyName) {
    errors.push("jobId, jobName, siteName, or companyName is required.");
  }
  if (normalized.hoursWorked <= 0) errors.push("hoursWorked must be greater than 0.");
  if (!CREWPAY_LOCAL_STATUSES.includes(normalized.localStatus)) {
    errors.push("localStatus is invalid.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    entry: normalized,
  };
}

export function mapJobToCrewPayWorkEntry(job = {}) {
  const proofRefs = [];

  if (job.ticketPhotoId || job.ticketPhotoName) {
    proofRefs.push({
      proofId: stringOr(job.ticketPhotoId, ""),
      type: "photo",
      name: stringOr(job.ticketPhotoName, "Work proof"),
      localOnly: true,
    });
  }

  const hoursWorked = safeHours(job.hoursWorkedCrewPay ?? job.hoursWorked ?? job.additionalHours);

  return createCrewPayWorkEntry({
    id: job.id,
    workerId: job.workerId,
    workerName: job.workerName,
    entryDate: job.entryDate ?? job.date,
    jobId: job.jobId,
    jobName: job.jobName,
    siteName: job.siteName ?? job.rigNameOrNumber,
    companyName: job.companyName ?? job.company,
    startTime: job.startTime,
    endTime: job.endTime,
    hoursWorked,
    payType: job.payType,
    rateRef: job.rateRef,
    notes: job.notes,
    proofRefs: Array.isArray(job.proofRefs) ? job.proofRefs : proofRefs,
    localStatus: job.localStatus,
    submittedAt: job.submittedAt,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  });
}

export function buildCrewPayTimeEntriesCsv(jobs = []) {
  const entries = (Array.isArray(jobs) ? jobs : []).map(mapJobToCrewPayWorkEntry);
  const rows = [
    CREWPAY_TIME_ENTRY_HEADERS,
    ...entries.map((entry) => [
      entry.schemaVersion,
      entry.id,
      entry.workerId,
      entry.workerName,
      entry.entryDate,
      entry.jobId,
      entry.jobName,
      entry.siteName,
      entry.companyName,
      entry.startTime,
      entry.endTime,
      entry.hoursWorked,
      entry.payType,
      entry.rateRef,
      entry.notes,
      entry.proofRefs.length,
      entry.localStatus,
      entry.submittedAt,
      entry.createdAt,
      entry.updatedAt,
    ]),
  ];

  return rows.map((row) => row.map(formatCsvCell).join(",")).join("\n");
}

export function buildProofManifest(jobs = []) {
  const entries = (Array.isArray(jobs) ? jobs : []).map(mapJobToCrewPayWorkEntry);
  const proofEntries = entries
    .filter((entry) => entry.proofRefs.length > 0)
    .map((entry) => ({
      schemaVersion: CREWPAY_WORK_ENTRY_SCHEMA_VERSION,
      entryId: entry.id,
      proofRefs: entry.proofRefs,
    }));

  return {
    appName: "CrewPay Field App",
    schemaVersion: CREWPAY_WORK_ENTRY_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    proofEntries,
  };
}

export function formatCsvCell(value) {
  const text = String(value ?? "");

  if (text.includes(",") || text.includes('"') || text.includes("\n") || text.includes("\r")) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function normalizeLocalStatus(value) {
  return CREWPAY_LOCAL_STATUSES.includes(value) ? value : "draft";
}

function normalizeProofRef(proofRef) {
  return {
    proofId: stringOr(proofRef?.proofId ?? proofRef?.id, ""),
    type: stringOr(proofRef?.type, "photo"),
    name: stringOr(proofRef?.name, ""),
    localOnly: proofRef?.localOnly !== false,
  };
}

function safeHours(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
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
