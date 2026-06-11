import { buildCrewPayTimeEntriesCsv, formatCsvCell } from "../crewpay/crewPayIntake.js";

export function buildPayPeriodCsv(payPeriod) {
  const jobs = Array.isArray(payPeriod?.jobs) ? payPeriod.jobs : [];
  return buildCrewPayTimeEntriesCsv(jobs);
}

export { formatCsvCell };
