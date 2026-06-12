import { useState } from "react";
import { loadCrewPayBridgeEndpoint } from "../bridge/bridgeSettingsStorage.js";
import { submitCrewPayBridgeTimeEntries } from "../bridge/crewPayBridge.js";
import { loadActivePayPeriod } from "../pay-periods/activePayPeriodStorage.js";
import { loadSettings } from "../settings/settingsStorage.js";
import {
  buildBridgePayloadPreviewExport,
  buildBridgePayloadPreviews,
  buildBridgePreviewSummary,
} from "./bridgePayloadPreview.js";

const PREVIEW_FILTERS = {
  ALL: "all",
  READY: "ready",
  MISSING: "missing",
};

export default function BridgePayloadPreviewPanel() {
  const payPeriod = loadActivePayPeriod();
  const savedSettings = loadSettings();
  const previewPayloads = buildBridgePayloadPreviews(payPeriod, {
    defaultRate: Number(savedSettings.hourlyRate || 0),
  });
  const summary = buildBridgePreviewSummary(previewPayloads);
  const bridgeEndpoint = loadCrewPayBridgeEndpoint();
  const [copyMessage, setCopyMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState(PREVIEW_FILTERS.ALL);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const visiblePayloads = filterPreviewPayloads(previewPayloads, activeFilter);
  const readyPayloads = previewPayloads.filter((preview) => preview.missingFields.length === 0);

  function buildPreviewJsonText() {
    return JSON.stringify(
      buildBridgePayloadPreviewExport(payPeriod, {
        defaultRate: Number(savedSettings.hourlyRate || 0),
      }),
      null,
      2,
    );
  }

  async function copyPreviewJson() {
    const previewText = buildPreviewJsonText();

    try {
      await navigator.clipboard.writeText(previewText);
      setCopyMessage("Preview JSON copied.");
    } catch {
      setCopyMessage("Copy unavailable here. Use Download Preview JSON instead.");
    }
  }

  function downloadPreviewJson() {
    const blob = new Blob([buildPreviewJsonText()], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "crewpay-bridge-payload-preview.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function submitReadyPayloads() {
    if (!bridgeEndpoint) {
      setSubmitMessage("Preview only - no workbook bridge endpoint is configured.");
      return;
    }

    if (readyPayloads.length === 0) {
      setSubmitMessage("No bridge-ready payloads are available to submit.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitCrewPayBridgeTimeEntries({
        endpoint: bridgeEndpoint,
        payloads: readyPayloads.map((preview) => preview.payload),
      });

      setSubmitMessage(result.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel">
      <h2>Workbook Bridge Preview</h2>
      <p className="helper">
        {bridgeEndpoint
          ? "This shows the pending time-entry payload shape the app can prepare for the CrewPay workbook bridge."
          : "Preview only - no workbook bridge endpoint is configured. Save an endpoint in Settings to enable manual submit."}
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
            <button type="button" className="secondary-button" onClick={() => setActiveFilter(PREVIEW_FILTERS.ALL)}>
              All
            </button>
            <button type="button" className="secondary-button" onClick={() => setActiveFilter(PREVIEW_FILTERS.READY)}>
              Ready
            </button>
            <button type="button" className="secondary-button" onClick={() => setActiveFilter(PREVIEW_FILTERS.MISSING)}>
              Missing Fields
            </button>
          </div>
          <div className="section-actions">
            <button type="button" className="secondary-button" onClick={copyPreviewJson}>
              Copy Preview JSON
            </button>
            <button type="button" className="secondary-button" onClick={downloadPreviewJson}>
              Download Preview JSON
            </button>
            <button
              type="button"
              onClick={submitReadyPayloads}
              disabled={!bridgeEndpoint || readyPayloads.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Ready Payloads"}
            </button>
          </div>
          <p className="helper">Showing {visiblePayloads.length} preview record(s).</p>
          {copyMessage && <p className="helper">{copyMessage}</p>}
          {submitMessage && <p className="helper">{submitMessage}</p>}
        </>
      )}

      {previewPayloads.length === 0 ? (
        <p className="helper">No saved work entries are available to preview.</p>
      ) : visiblePayloads.length === 0 ? (
        <p className="helper">No preview records match this filter.</p>
      ) : (
        <div className="list">
          {visiblePayloads.slice(0, 5).map(({ localId, payload, missingFields }) => (
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

      {visiblePayloads.length > 5 && (
        <p className="helper">Showing first 5 of {visiblePayloads.length} matching work entries.</p>
      )}
    </section>
  );
}

function filterPreviewPayloads(previewPayloads, activeFilter) {
  if (activeFilter === PREVIEW_FILTERS.READY) {
    return previewPayloads.filter((preview) => preview.missingFields.length === 0);
  }

  if (activeFilter === PREVIEW_FILTERS.MISSING) {
    return previewPayloads.filter((preview) => preview.missingFields.length > 0);
  }

  return previewPayloads;
}
