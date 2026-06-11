import { useEffect, useMemo, useRef, useState } from "react";
import { createCrewPayWorkEntry } from "../crewpay/crewPayIntake.js";
import { loadActivePayPeriod, saveActivePayPeriod } from "../pay-periods/activePayPeriodStorage.js";
import { TIMESHEET_COMPANIES, TIMESHEET_RIG_NAMES } from "../../shared/constants/fieldLedgerDefaults.js";
import { deletePhotoBlob, loadPhotoBlob, savePhotoBlob } from "../../shared/storage/photoBlobStorage.js";
import { loadSettings } from "../settings/settingsStorage.js";
import { loadJobSuggestions, rememberJobSuggestions } from "../../shared/storage/jobSuggestionStorage.js";
import CameraCapture from "../../shared/components/CameraCapture.jsx";

const DEFAULT_STATUS = "draft";

function createBlankForm() {
  const settings = loadSettings();

  return {
    editingJobId: "",
    workerId: settings.workerId || "",
    workerName: settings.workerName || "",
    entryDate: "",
    jobId: "",
    jobName: "",
    siteName: "",
    companyName: "",
    startTime: "",
    endTime: "",
    hoursWorked: "",
    payType: settings.defaultPayType || "hourly",
    rateRef: settings.defaultRateRef || "",
    notes: "",
    localStatus: DEFAULT_STATUS,
    submittedAt: "",
    ticketPhotoId: "",
    ticketPhotoName: "",
  };
}

export default function JobEntryForm({ onJobSaved }) {
  const ticketPhotoInputRef = useRef(null);
  const [form, setForm] = useState(createBlankForm);
  const [ticketPhotoFile, setTicketPhotoFile] = useState(null);
  const [ticketPhotoPreviewUrl, setTicketPhotoPreviewUrl] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const savedJobs = Array.isArray(loadActivePayPeriod().jobs)
    ? loadActivePayPeriod().jobs
    : [];

  const jobSuggestions = loadJobSuggestions();

  const companyOptions = Array.from(
    new Set([
      ...TIMESHEET_COMPANIES,
      ...jobSuggestions.companies,
      ...savedJobs.map((job) => job.companyName || job.company),
    ]
      .map((value) => value?.trim())
      .filter(Boolean)),
  ).sort();

  const siteOptions = Array.from(
    new Set([
      ...TIMESHEET_RIG_NAMES,
      ...jobSuggestions.rigs,
      ...savedJobs.map((job) => job.siteName || job.rigNameOrNumber),
    ]
      .map((value) => value?.trim())
      .filter(Boolean)),
  ).sort();

  useEffect(() => {
    function loadJobForEditing(event) {
      const job = event.detail?.job;

      if (!job) {
        return;
      }

      const crewPayEntry = createCrewPayWorkEntry({
        ...job,
        entryDate: job.entryDate || job.date,
        siteName: job.siteName || job.rigNameOrNumber,
        companyName: job.companyName || job.company,
        hoursWorked: job.hoursWorkedCrewPay || job.hoursWorked || job.additionalHours,
      });

      setForm({
        editingJobId: job.id,
        workerId: crewPayEntry.workerId,
        workerName: crewPayEntry.workerName,
        entryDate: crewPayEntry.entryDate,
        jobId: crewPayEntry.jobId,
        jobName: crewPayEntry.jobName,
        siteName: crewPayEntry.siteName,
        companyName: crewPayEntry.companyName,
        startTime: crewPayEntry.startTime,
        endTime: crewPayEntry.endTime,
        hoursWorked: crewPayEntry.hoursWorked ? String(crewPayEntry.hoursWorked) : "",
        payType: crewPayEntry.payType,
        rateRef: crewPayEntry.rateRef,
        notes: crewPayEntry.notes,
        localStatus: crewPayEntry.localStatus,
        submittedAt: crewPayEntry.submittedAt,
        ticketPhotoId: job.ticketPhotoId || crewPayEntry.proofRefs[0]?.proofId || "",
        ticketPhotoName: job.ticketPhotoName || crewPayEntry.proofRefs[0]?.name || "",
      });
      setTicketPhotoFile(null);
      if (ticketPhotoInputRef.current) {
        ticketPhotoInputRef.current.value = "";
      }
      setSaveMessage("Editing saved work entry. Make changes, then save.");
    }

    window.addEventListener("fieldledger:edit-job", loadJobForEditing);

    return () => {
      window.removeEventListener("fieldledger:edit-job", loadJobForEditing);
    };
  }, []);

  useEffect(() => {
    let previewUrl = "";
    let cancelled = false;

    async function loadTicketPhotoPreview() {
      try {
        if (ticketPhotoFile) {
          previewUrl = URL.createObjectURL(ticketPhotoFile);

          if (!cancelled) {
            setTicketPhotoPreviewUrl(previewUrl);
          }

          return;
        }

        if (!form.ticketPhotoId) {
          setTicketPhotoPreviewUrl("");
          return;
        }

        const photoRecord = await loadPhotoBlob(form.ticketPhotoId);

        if (!photoRecord?.blob) {
          setTicketPhotoPreviewUrl("");
          return;
        }

        previewUrl = URL.createObjectURL(photoRecord.blob);

        if (!cancelled) {
          setTicketPhotoPreviewUrl(previewUrl);
        }
      } catch {
        setTicketPhotoPreviewUrl("");
      }
    }

    loadTicketPhotoPreview();

    return () => {
      cancelled = true;

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [form.ticketPhotoId, ticketPhotoFile]);

  const calculatedHours = useMemo(() => {
    if (form.hoursWorked) {
      return Number(form.hoursWorked || 0);
    }

    if (!form.startTime || !form.endTime) {
      return 0;
    }

    const [startHours, startMinutes] = form.startTime.split(":").map(Number);
    const [endHours, endMinutes] = form.endTime.split(":").map(Number);

    if (![startHours, startMinutes, endHours, endMinutes].every(Number.isFinite)) {
      return 0;
    }

    const start = startHours * 60 + startMinutes;
    const end = endHours * 60 + endMinutes;
    const minutes = end >= start ? end - start : end + 24 * 60 - start;

    return Number((minutes / 60).toFixed(2));
  }, [form.endTime, form.hoursWorked, form.startTime]);

  function updateForm(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function resetForm(message) {
    setForm(createBlankForm());
    setTicketPhotoFile(null);
    setTicketPhotoPreviewUrl("");
    if (ticketPhotoInputRef.current) {
      ticketPhotoInputRef.current.value = "";
    }
    setSaveMessage(message);
  }

  async function saveJob() {
    const payPeriod = loadActivePayPeriod();
    const existingJobs = Array.isArray(payPeriod.jobs) ? payPeriod.jobs : [];
    const hoursValue = calculatedHours;

    if (!form.entryDate) {
      setSaveMessage("Entry date is required.");
      return;
    }

    if (!form.workerId.trim() && !form.workerName.trim()) {
      setSaveMessage("Worker ID or worker name is required.");
      return;
    }

    if (!form.jobId.trim() && !form.jobName.trim() && !form.siteName.trim() && !form.companyName.trim()) {
      setSaveMessage("Add a job, site, or company before saving.");
      return;
    }

    if (hoursValue <= 0) {
      setSaveMessage("Hours worked must be greater than 0.");
      return;
    }

    let nextTicketPhotoId = form.ticketPhotoId;

    if (ticketPhotoFile) {
      try {
        nextTicketPhotoId = await savePhotoBlob(ticketPhotoFile);
      } catch {
        setSaveMessage("Proof photo could not be saved. Work entry was not saved.");
        return;
      }
    }

    const proofRefs = nextTicketPhotoId || form.ticketPhotoName
      ? [
          {
            proofId: nextTicketPhotoId,
            type: "photo",
            name: form.ticketPhotoName || ticketPhotoFile?.name || "Work proof",
            localOnly: true,
          },
        ]
      : [];

    const crewPayEntry = createCrewPayWorkEntry({
      id: form.editingJobId || crypto.randomUUID(),
      workerId: form.workerId,
      workerName: form.workerName,
      entryDate: form.entryDate,
      jobId: form.jobId,
      jobName: form.jobName,
      siteName: form.siteName,
      companyName: form.companyName,
      startTime: form.startTime,
      endTime: form.endTime,
      hoursWorked: hoursValue,
      payType: form.payType,
      rateRef: form.rateRef,
      notes: form.notes,
      proofRefs,
      localStatus: form.localStatus,
      submittedAt: form.submittedAt,
      createdAt: form.editingJobId ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const job = {
      ...crewPayEntry,
      date: crewPayEntry.entryDate,
      company: crewPayEntry.companyName,
      rigNameOrNumber: crewPayEntry.siteName,
      fieldTicketNumber: crewPayEntry.jobId,
      transportation: 0,
      payPeriodId: payPeriod.id,
      ticketPhotoId: nextTicketPhotoId,
      ticketPhotoName: form.ticketPhotoName || ticketPhotoFile?.name || "",
      jobType: "standard_work",
      buckingState: "",
      jobsCompleted: 0,
      hoursPerJob: 0,
      hoursWorked: crewPayEntry.hoursWorked,
      hoursWorkedCrewPay: crewPayEntry.hoursWorked,
      baseJobPay: 0,
      additionalHours: crewPayEntry.hoursWorked,
      hourlyRateSnapshot: 0,
      totalPay: 0,
      createdAt: form.editingJobId ? undefined : crewPayEntry.createdAt,
      updatedAt: crewPayEntry.updatedAt,
    };

    const nextJobs = form.editingJobId
      ? existingJobs.map((existingJob) => {
          if (existingJob.id !== form.editingJobId) {
            return existingJob;
          }

          return {
            ...existingJob,
            ...job,
            createdAt: existingJob.createdAt,
          };
        })
      : [...existingJobs, job];

    const saved = saveActivePayPeriod({
      ...payPeriod,
      jobs: nextJobs,
      updatedAt: new Date().toISOString(),
    });

    if (!saved) {
      setSaveMessage("Work entry could not be saved.");
      return;
    }

    rememberJobSuggestions({
      company: crewPayEntry.companyName,
      rigNameOrNumber: crewPayEntry.siteName,
    });

    resetForm(form.editingJobId ? "Work entry updated." : "Work entry saved as a local draft.");

    if (typeof onJobSaved === "function") {
      onJobSaved();
    }
  }

  async function removeTicketPhoto() {
    if (!form.ticketPhotoId) {
      setTicketPhotoFile(null);
      setTicketPhotoPreviewUrl("");
      return;
    }

    const confirmed = window.confirm("Remove this proof photo from the saved work entry?");

    if (!confirmed) {
      return;
    }

    try {
      await deletePhotoBlob(form.ticketPhotoId);
    } catch {
      setSaveMessage("Proof photo reference was removed, but the stored photo could not be deleted.");
    }

    updateForm("ticketPhotoId", "");
    updateForm("ticketPhotoName", "");
    setTicketPhotoFile(null);
    setTicketPhotoPreviewUrl("");
    setSaveMessage("Proof photo removed. Save work entry changes to keep this update.");
  }

  function cancelEdit() {
    resetForm("");
  }

  return (
    <section className="panel work-entry-panel">
      <div className="section-heading">
        <span className="section-kicker">Daily Work</span>
        <h2>{form.editingJobId ? "Edit Work Entry" : "Add Work Entry"}</h2>
      </div>

      <div className="form-grid">
        <label className="field">
          Worker ID
          <input value={form.workerId} onChange={(event) => updateForm("workerId", event.target.value)} />
        </label>

        <label className="field">
          Worker Name
          <input value={form.workerName} onChange={(event) => updateForm("workerName", event.target.value)} />
        </label>

        <label className="field">
          Entry Date
          <input type="date" value={form.entryDate} onChange={(event) => updateForm("entryDate", event.target.value)} />
        </label>

        <label className="field">
          Local Status
          <select value={form.localStatus} onChange={(event) => updateForm("localStatus", event.target.value)}>
            <option value="draft">Draft</option>
            <option value="ready">Ready for Review</option>
            <option value="submitted">Submitted</option>
            <option value="needs_review">Needs Review</option>
          </select>
        </label>

        <label className="field">
          Job ID
          <input value={form.jobId} onChange={(event) => updateForm("jobId", event.target.value)} />
        </label>

        <label className="field">
          Job Name
          <input value={form.jobName} onChange={(event) => updateForm("jobName", event.target.value)} />
        </label>

        <label className="field">
          Site Name
          <input
            type="text"
            list="site-name-options"
            value={form.siteName}
            onChange={(event) => updateForm("siteName", event.target.value)}
          />
          <datalist id="site-name-options">
            {siteOptions.map((siteOption) => (
              <option key={siteOption} value={siteOption} />
            ))}
          </datalist>
        </label>

        <label className="field">
          Company
          <input
            type="text"
            list="company-options"
            value={form.companyName}
            onChange={(event) => updateForm("companyName", event.target.value)}
          />
          <datalist id="company-options">
            {companyOptions.map((companyOption) => (
              <option key={companyOption} value={companyOption} />
            ))}
          </datalist>
        </label>

        <label className="field">
          Start Time
          <input type="time" value={form.startTime} onChange={(event) => updateForm("startTime", event.target.value)} />
        </label>

        <label className="field">
          End Time
          <input type="time" value={form.endTime} onChange={(event) => updateForm("endTime", event.target.value)} />
        </label>

        <label className="field">
          Hours Worked
          <input
            type="number"
            min="0"
            step="0.25"
            value={form.hoursWorked}
            onChange={(event) => updateForm("hoursWorked", event.target.value)}
            placeholder={calculatedHours ? String(calculatedHours) : "0"}
          />
        </label>

        <label className="field">
          Pay Type
          <input value={form.payType} onChange={(event) => updateForm("payType", event.target.value)} />
        </label>

        <label className="field">
          Rate Ref
          <input value={form.rateRef} onChange={(event) => updateForm("rateRef", event.target.value)} />
        </label>

        <label className="field full-width">
          Notes
          <textarea value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} />
        </label>
      </div>

      <div className="proof-panel">
        <h3>Proof Photo</h3>
        <CameraCapture
          label="Take Proof Photo"
          onPhotoCaptured={(photoFile) => {
            setTicketPhotoFile(photoFile);
            if (ticketPhotoInputRef.current) {
              ticketPhotoInputRef.current.value = "";
            }
          }}
        />

        <label className="field">
          Proof Photo Name
          <input
            type="text"
            value={form.ticketPhotoName}
            onChange={(event) => updateForm("ticketPhotoName", event.target.value)}
          />
        </label>

        <label className="field">
          Upload Proof Photo
          <input
            ref={ticketPhotoInputRef}
            type="file"
            accept="image/*"
            onChange={(event) => {
              setTicketPhotoFile(event.target.files?.[0] || null);
              setSaveMessage("");
            }}
          />
        </label>

        {(form.ticketPhotoId || ticketPhotoFile || ticketPhotoPreviewUrl) && (
          <div className="attached-photo-preview">
            {ticketPhotoPreviewUrl && (
              <img src={ticketPhotoPreviewUrl} alt="Attached proof preview" />
            )}

            <p className="helper">{form.ticketPhotoName || ticketPhotoFile?.name || "Unnamed proof photo"}</p>

            <button type="button" onClick={removeTicketPhoto}>
              Remove Photo
            </button>
          </div>
        )}
      </div>

      <div className="result-card status-card">
        <span>CrewPay Intake Hours</span>
        <strong>{calculatedHours.toFixed(2)}</strong>
        <small>Workbook review remains the source of truth for approved pay.</small>
      </div>

      <div className="section-actions">
        <button type="button" onClick={saveJob}>
          {form.editingJobId ? "Save Work Changes" : "Save Draft"}
        </button>

        {form.editingJobId && (
          <button type="button" onClick={cancelEdit}>
            Cancel Edit
          </button>
        )}
      </div>

      {saveMessage && <p className="helper">{saveMessage}</p>}
    </section>
  );
}
