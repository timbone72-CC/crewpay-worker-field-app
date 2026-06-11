import { mapJobToCrewPayWorkEntry } from "../crewpay/crewPayIntake.js";
import { loadActivePayPeriod } from "../pay-periods/activePayPeriodStorage.js";
import { calculateMileageSummary } from "../../shared/utils/calculateMileageSummary.js";

export default function ReviewRecordsPanel() {
  const payPeriod = loadActivePayPeriod();
  const workEntries = (Array.isArray(payPeriod.jobs) ? payPeriod.jobs : []).map(mapJobToCrewPayWorkEntry);
  const expenses = Array.isArray(payPeriod.expenses) ? payPeriod.expenses : [];
  const mileageEntries = Array.isArray(payPeriod.mileageEntries) ? payPeriod.mileageEntries : [];
  const mileageSummary = calculateMileageSummary(mileageEntries);
  const hasRecords = workEntries.length > 0 || expenses.length > 0 || mileageEntries.length > 0;

  return (
    <section className="panel review-records-panel">
      <div className="section-heading">
        <span className="section-kicker">Review Before Export</span>
        <h2>Saved Records in This Pay Period</h2>
        <p className="helper">
          These are the local records currently saved in this browser. Review them before
          downloading backups, printing a timesheet, or exporting the CrewPay intake CSV.
        </p>
      </div>

      {!hasRecords && (
        <p className="helper">
          No work, expense, or mileage records are saved in the current pay period yet.
          Add work from the Work tab or secondary records from Tools.
        </p>
      )}

      <ReviewSection
        title="Work Entries"
        count={workEntries.length}
        emptyMessage="No work entries saved for this pay period."
      >
        {workEntries.map((entry) => (
          <article className="result-card review-record-card" key={entry.id}>
            <div>
              <span>{entry.entryDate || "No date"}</span>
              <strong>{entry.jobName || entry.jobId || "Work entry"}</strong>
              <span className="helper">{entry.siteName || "No site"}</span>
            </div>
            <div>
              <span>Worker</span>
              <strong>{entry.workerName || entry.workerId || "Not set"}</strong>
            </div>
            <div>
              <span>Hours</span>
              <strong>{Number(entry.hoursWorked || 0).toFixed(2)}</strong>
            </div>
            <span className={`status-pill status-${entry.localStatus || "draft"}`}>
              {formatStatus(entry.localStatus)}
            </span>
            <p className="helper full-width">
              Company: {entry.companyName || "Not set"} · Proof refs: {entry.proofRefs.length}
              {entry.notes ? ` · Notes: ${entry.notes}` : ""}
            </p>
          </article>
        ))}
      </ReviewSection>

      <ReviewSection
        title="Local Expenses"
        count={expenses.length}
        emptyMessage="No expenses saved for this pay period."
      >
        {expenses.map((expense) => {
          const receiptCount = countReceiptPhotos(expense);

          return (
            <article className="result-card review-record-card" key={expense.id}>
              <div>
                <span>{expense.date || expense.expenseDate || "No date"}</span>
                <strong>{expense.vendor || "Expense"}</strong>
                <span className="helper">{expense.category || "Other"}</span>
              </div>
              <div>
                <span>Amount</span>
                <strong>${Number(expense.amount || 0).toFixed(2)}</strong>
              </div>
              <p className="helper full-width">
                Receipt refs: {receiptCount}
                {expense.notes ? ` · Notes: ${expense.notes}` : ""}
              </p>
            </article>
          );
        })}
      </ReviewSection>

      <ReviewSection
        title="Local Mileage"
        count={mileageEntries.length}
        emptyMessage="No mileage saved for this pay period."
      >
        {mileageEntries.map((entry) => (
          <article className="result-card review-record-card" key={entry.id}>
            <div>
              <span>{entry.date || entry.mileageDate || "No date"}</span>
              <strong>{entry.vehicle || "Vehicle"}</strong>
              <span className="helper">{entry.businessPurpose || "Mileage"}</span>
            </div>
            <div>
              <span>Miles</span>
              <strong>{Number(entry.miles || 0).toFixed(1)}</strong>
            </div>
            <div>
              <span>Estimate</span>
              <strong>${Number((entry.miles || 0) * (entry.mileageRateSnapshot || 0)).toFixed(2)}</strong>
            </div>
            <p className="helper full-width">
              Current mileage total in this pay period: {mileageSummary.totalBusinessMiles.toFixed(1)} mi
            </p>
          </article>
        ))}
      </ReviewSection>
    </section>
  );
}

function ReviewSection({ title, count, emptyMessage, children }) {
  return (
    <section className="review-record-section">
      <h3>
        {title} <span className="helper">({count})</span>
      </h3>
      {count === 0 ? <p className="helper">{emptyMessage}</p> : <div className="list">{children}</div>}
    </section>
  );
}

function countReceiptPhotos(expense) {
  if (Array.isArray(expense.receiptPhotos)) {
    return expense.receiptPhotos.filter((photo) => photo?.id).length;
  }

  return expense.receiptPhotoId ? 1 : 0;
}

function formatStatus(status) {
  if (status === "ready") return "Ready";
  if (status === "submitted") return "Submitted";
  if (status === "needs_review") return "Needs review";
  return "Draft";
}
