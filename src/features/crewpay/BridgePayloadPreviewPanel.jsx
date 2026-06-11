import { loadActivePayPeriod } from "../pay-periods/activePayPeriodStorage.js";
import {
  buildBridgePayloadPreviewExport,
  buildBridgePayloadPreviews,
  buildBridgePreviewSummary,
} from "./bridgePayloadPreview.js";

export default function BridgePayloadPreviewPanel() {
  const payPeriod = loadActivePayPeriod();
  const previewPayloads = buildBridgePayloadPreviews(payPeriod);
  const summary = buildBridgePreviewSummary(previewPayloads);

  function downloadPreviewJson() {
    const previewExport = buildBridgePayloadPreviewExport(payPeriod);
    const blob = new Blob([JSON.stringify(previewExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "crewpay-bridge-payload-preview.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="panel">
      <h2>Workbook Bridge Preview</h2>
      <p className="helper">
        Preview only. This shows the pending time-entry payload shape the app can prepare for the
        CrewPay workbook bridge. Nothing is submitted from this panel.
      </p>

      {previewPayloads.length > 0 && (
        <>
          <div className="review-total-grid">
            <div className="review-total-card">
              <span>Total</span>
              <strong>{summary.totalPreviewCount}</strong>
            </div>
            <div className="review-total-card">
              <span>Ready</span>
              <strong>{summary.bridgeReadyCount}</strong>
            </div>
            <div className="review-total-card">
              <span>Missing Fields</span>
              <strong>{summary.missingFieldCount}</strong>
            </div>
          </div>
          <div className="section-actions">
            <button type="button" className="secondary-button" onClick={downloadPreviewJson}>
              Download Preview JSON
            </button>
          </div>
        </>
      )}

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
