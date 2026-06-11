import { calculatePayPeriodSummary } from "../../shared/utils/calculatePayPeriodSummary.js";
import { calculateMileageSummary } from "../../shared/utils/calculateMileageSummary.js";
import { TAX_DISCLAIMER } from "../../shared/constants/fieldLedgerDefaults.js";
import { mapJobToCrewPayWorkEntry } from "../crewpay/crewPayIntake.js";
import { loadActivePayPeriod } from "./activePayPeriodStorage.js";

export default function PayPeriodSummaryPanel() {
  const payPeriod = loadActivePayPeriod();
  const summary = calculatePayPeriodSummary(payPeriod);
  const mileageSummary = calculateMileageSummary(payPeriod.mileageEntries);
  const workEntries = (Array.isArray(payPeriod.jobs) ? payPeriod.jobs : []).map(mapJobToCrewPayWorkEntry);
  const readyCount = workEntries.filter((entry) => entry.localStatus === "ready").length;
  const needsReviewCount = workEntries.filter((entry) => entry.localStatus === "needs_review").length;
  const submittedCount = workEntries.filter((entry) => entry.localStatus === "submitted").length;
  const totalHours = workEntries.reduce((total, entry) => total + Number(entry.hoursWorked || 0), 0);

  return (
    <section className="panel">
      <h2>Current Pay Period Review</h2>

      <p className="helper">
        {payPeriod.label || "Current Pay Period"}
        {payPeriod.startDate || payPeriod.endDate
          ? ` — ${payPeriod.startDate || "No start date"} to ${payPeriod.endDate || "No end date"}`
          : ""}
      </p>

      <div className="result-card">
        <span>Work Entries</span>
        <strong>{summary.jobCount}</strong>
      </div>

      <div className="result-card">
        <span>Total Hours</span>
        <strong>{totalHours.toFixed(2)}</strong>
      </div>

      <div className="result-card">
        <span>Ready / Submitted</span>
        <strong>{readyCount} / {submittedCount}</strong>
      </div>

      <div className="result-card">
        <span>Needs Review</span>
        <strong>{needsReviewCount}</strong>
      </div>

      <div className="result-card">
        <span>Local Expenses</span>
        <strong>${summary.expenseTotal.toFixed(2)}</strong>
      </div>

      <div className="result-card">
        <span>Local Mileage</span>
        <strong>{mileageSummary.totalBusinessMiles.toFixed(2)} mi</strong>
      </div>

      <p className="helper">{TAX_DISCLAIMER}</p>
    </section>
  );
}
