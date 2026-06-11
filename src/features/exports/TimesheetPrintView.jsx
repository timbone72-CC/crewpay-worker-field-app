import { mapJobToCrewPayWorkEntry } from "../crewpay/crewPayIntake.js";
import { loadActivePayPeriod } from "../pay-periods/activePayPeriodStorage.js";
import { calculateMileageSummary } from "../../shared/utils/calculateMileageSummary.js";

export default function TimesheetPrintView() {
  const payPeriod = loadActivePayPeriod();
  const jobs = Array.isArray(payPeriod.jobs) ? payPeriod.jobs : [];
  const entries = jobs.map(mapJobToCrewPayWorkEntry);
  const mileageEntries = Array.isArray(payPeriod.mileageEntries) ? payPeriod.mileageEntries : [];
  const mileageSummary = calculateMileageSummary(mileageEntries);
  const totalHours = entries.reduce((total, entry) => total + Number(entry.hoursWorked || 0), 0);
  const totalProofRefs = entries.reduce((total, entry) => total + entry.proofRefs.length, 0);

  return (
    <section className="timesheet-print-view">
      <h2>CrewPay Worker Timesheet</h2>
      <p>
        {payPeriod.label || "Current Pay Period"}
        {payPeriod.startDate || payPeriod.endDate
          ? ` - ${payPeriod.startDate || "No start date"} to ${payPeriod.endDate || "No end date"}`
          : ""}
      </p>

      <div className="timesheet-print-summary">
        <span>Entries: <strong>{entries.length}</strong></span>
        <span>Total Hours: <strong>{totalHours.toFixed(2)}</strong></span>
        <span>Proof Refs: <strong>{totalProofRefs}</strong></span>
        <span>Mileage: <strong>{mileageSummary.totalBusinessMiles.toFixed(2)} mi</strong></span>
      </div>

      <table className="timesheet-print-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Worker</th>
            <th>Job</th>
            <th>Site</th>
            <th>Company</th>
            <th>Hours</th>
            <th>Status</th>
            <th>Proof</th>
          </tr>
        </thead>

        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan="8">No work entries saved.</td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.entryDate}</td>
                <td>{entry.workerName || entry.workerId}</td>
                <td>{entry.jobName || entry.jobId}</td>
                <td>{entry.siteName}</td>
                <td>{entry.companyName}</td>
                <td>{Number(entry.hoursWorked || 0).toFixed(2)}</td>
                <td>{entry.localStatus}</td>
                <td>{entry.proofRefs.length}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <section className="timesheet-mileage-summary">
        <h3>Secondary Local Records</h3>

        {mileageEntries.length === 0 ? (
          <p>No mileage entries.</p>
        ) : (
          <p>
            Local mileage total:{" "}
            <strong>{mileageSummary.totalBusinessMiles.toFixed(2)} mi</strong>
          </p>
        )}
      </section>
    </section>
  );
}
