import { useEffect, useState } from "react";
import { loadActivePayPeriod, saveActivePayPeriod } from "../pay-periods/activePayPeriodStorage.js";
import { loadPhotoBlob } from "../../shared/storage/photoBlobStorage.js";

export default function SavedJobsList({ onJobDeleted }) {
  const payPeriod = loadActivePayPeriod();
  const jobs = Array.isArray(payPeriod.jobs) ? payPeriod.jobs : [];
  const jobsPreviewKey = jobs.map((job) => `${job.id}:${job.ticketPhotoId || ""}`).join("|");
  const [previewUrls, setPreviewUrls] = useState({});

  useEffect(() => {
    let active = true;
    const urls = {};

    async function loadPreviews() {
      for (const job of jobs) {
        if (!job.ticketPhotoId) continue;

        try {
          const record = await loadPhotoBlob(job.ticketPhotoId);

          if (record?.blob) {
            urls[job.id] = URL.createObjectURL(record.blob);
          }
        } catch {
          // Ignore broken preview records.
        }
      }

      if (active) {
        setPreviewUrls(urls);
      }
    }

    loadPreviews();

    return () => {
      active = false;
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [jobsPreviewKey]);

  function editJob(job) {
    window.dispatchEvent(
      new CustomEvent("fieldledger:edit-job", {
        detail: { job },
      }),
    );
  }

  function deleteJob(jobId) {
    const confirmed = window.confirm("Delete this saved job?");

    if (!confirmed) {
      return;
    }

    const latestPayPeriod = loadActivePayPeriod();
    const latestJobs = Array.isArray(latestPayPeriod.jobs) ? latestPayPeriod.jobs : [];

    const saved = saveActivePayPeriod({
      ...latestPayPeriod,
      jobs: latestJobs.filter((job) => job.id !== jobId),
      updatedAt: new Date().toISOString(),
    });

    if (!saved) {
      return;
    }

    if (typeof onJobDeleted === "function") {
      onJobDeleted();
    }
  }

  return (
    <section className="panel">
      <h2>Saved Work Entries</h2>

      {jobs.length === 0 ? (
        <p className="helper">No work entries saved yet.</p>
      ) : (
        <div className="list saved-jobs-list">
          {jobs.map((job) => (
            <div className="result-card" key={job.id}>
              <span>{formatJobLabel(job)}</span>
              <strong>{Number(job.hoursWorkedCrewPay || job.hoursWorked || 0).toFixed(2)} hrs</strong>
              <span className={`status-pill status-${job.localStatus || "draft"}`}>
                {formatStatus(job.localStatus)}
              </span>

              {(job.ticketPhotoId || job.ticketPhotoName || previewUrls[job.id]) && (
                <div
                  className="helper"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {previewUrls[job.id] ? (
                    <img
                      src={previewUrls[job.id]}
                      alt="Ticket preview"
                      style={{
                        width: "42px",
                        height: "42px",
                        objectFit: "cover",
                        borderRadius: "0.5rem",
                        border: "1px solid #d8d4ef",
                      }}
                    />
                  ) : (
                    <span aria-hidden="true">📎</span>
                  )}
                  <span>
                    Proof Photo
                    {job.ticketPhotoName ? `: ${job.ticketPhotoName}` : ""}
                    {job.ticketPhotoId && !previewUrls[job.id] ? " — preview unavailable here" : ""}
                  </span>
                </div>
              )}

              <div className="card-actions">
                <button type="button" onClick={() => editJob(job)}>
                  Edit
                </button>
                <button type="button" onClick={() => deleteJob(job.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatJobLabel(job) {
  const date = job.entryDate || job.date || "No date";
  const jobName = job.jobName || job.jobId || "Work entry";
  const siteName = job.siteName || job.rigNameOrNumber || "No site";
  const companyName = job.companyName || job.company || "";

  return [date, jobName, siteName, companyName].filter(Boolean).join(" - ");
}

function formatStatus(status) {
  if (status === "ready") return "Ready";
  if (status === "submitted") return "Submitted";
  if (status === "needs_review") return "Needs review";
  return "Draft";
}
