import { loadActivePayPeriod } from "../pay-periods/activePayPeriodStorage.js";
import { buildCrewPayBridgeTimeEntryPayload } from "./crewPayIntake.js";

const REQUIRED_BRIDGE_FIELDS = [
  "workerId",
  "payPeriodId",
  "workDate",
  "jobWorkType",
  "hoursWorked",
  "rate",
];

export default function BridgePayloadPreviewPanel() {
  const payPeriod = loadActivePayPeriod();
  const jobs = Array.isArray(payPeriod.jobs) ? payPeriod.jobs : [];
  const previewPayloads = jobs.map((job) => {
    const payload = buildCrewPayBridgeTimeEntryPayload(job, {
      payPeriodId: job.payPeriodId || payPeriod.id,
    });

    return {
      localId: job.id,
      payload,
      missingFields: findMissingBridgeFields(payload),
    };
  });

  return (
    <section className="panel">
      <h2>Workbook Bridge Preview</h2>
      <p className="helper">
        Preview only. This shows the pending time-entry payload shape the app can prepare for the
        CrewPay workbook bridge. Nothing is submitted from this panel.
      </p>

      {previewPayloads.length === 0 ? (
        <p className="helper">No saved work entries are available to preview.</p>
      ) : (
        <div className="list">
          {previewPayloads.slice(0, 5).map(({ localId, payload, missingFields }) => (
            <div className="result-card" key={localId || `${payload.workerId}-${payload.workDate}`}>
              <strong>{payload.workDate || "No work date"}</strong>
              <span>{payload.jobWorkType || "No job/work type"}</span>
              <span>{Number(payload.hoursWorked || 0).toFixed(2)} hrs</span>
              <span className={`status-pill ${missingFields.length ? "status-needs_review" : "status-submitted"}`}>
                {missingFields.length ? "Missing bridge fields" : "Bridge-ready shape"}
              </span>
              {missingFields.length > 0 && (
                <p className="helper">Missing: {missingFields.join(", ")}</p>
              )}
              <pre className="helper">{JSON.stringify(payload, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}

      {previewPayloads.length > 5 && (
        <p className="helper">Showing first 5 of {previewPayloads.length} saved work entries.</p>
      )}
    </section>
  );
}

function findMissingBridgeFields(payload) {
  return REQUIRED_BRIDGE_FIELDS.filter((field) => {
    if (field === "hoursWorked" || field === "rate") {
      return Number(payload[field]) <= 0;
    }

    return !String(payload[field] ?? "").trim();
  });
}
