import { buildCrewPayTimeEntriesCsv, buildProofManifest } from "./crewPayIntake.js";

export function buildPersonalCloudBackupFiles(payPeriod = {}) {
  const jobs = Array.isArray(payPeriod.jobs) ? payPeriod.jobs : [];
  const safeLabel = buildSafePayPeriodLabel(payPeriod);
  const proofManifest = buildProofManifest(jobs);
  const files = [
    {
      name: `crewpay-field-app-backup-${safeLabel}.json`,
      type: "application/json",
      content: JSON.stringify(payPeriod, null, 2),
    },
    {
      name: `crewpay-time-entries-${safeLabel}.csv`,
      type: "text/csv",
      content: buildCrewPayTimeEntriesCsv(jobs),
    },
  ];

  if (proofManifest.proofEntries.length > 0) {
    files.push({
      name: `crewpay-proof-manifest-${safeLabel}.json`,
      type: "application/json",
      content: JSON.stringify(proofManifest, null, 2),
    });
  }

  return files;
}

export function canShareFiles(navigatorLike, files) {
  if (!navigatorLike?.share || !navigatorLike?.canShare || !Array.isArray(files) || files.length === 0) {
    return false;
  }

  try {
    return navigatorLike.canShare({ files });
  } catch {
    return false;
  }
}

export function buildSafePayPeriodLabel(payPeriod = {}) {
  const label = payPeriod.label || "current-pay-period";
  const safeLabel = String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return safeLabel || "pay-period";
}
