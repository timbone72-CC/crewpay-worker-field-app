# CrewPay Worker Intake Mapping Spec

## 1. Purpose

This document defines the worker-facing data model and intake/export mapping for adapting the FieldLedger clone into a full CrewPay-compatible worker app.

The goal is to preserve the useful FieldLedger-style worker experience and add a CrewPay Ledger intake/export layer alongside it. This document is a planning spec only. It does not rename the app, change source code, connect to Google Sheets, or replace any workbook logic.

## 2. Product Direction: Option B

The target product is a full FieldLedger-style worker app with CrewPay Ledger compatibility, not a minimal intake-only app.

Option B means the FieldLedger clone remains a practical worker-facing field app where useful. It can keep richer local recordkeeping, review, proof, backup, export, and reporting features while adding a clean CrewPay intake mapping layer.

CrewPay compatibility should be additive. The app can keep records that are broader than the CrewPay workbook intake requirement, but CrewPay exports/submissions should include only the subset needed by controlled workbook intake.

Features should be removed, hidden, or isolated only when they are private/personal, unsafe, confusing for CrewPay workers, specific to old FieldLedger business rules, or incompatible with CrewPay Ledger intake.

## 3. Source-of-Truth Boundary

CrewPay Ledger workbook is the source of truth.

The worker app is only an intake companion. It should collect worker-entered records, keep local drafts, and prepare reviewable export/submission packages for controlled workbook intake tabs.

The worker app must work offline/local-first where practical. A worker should be able to create, edit, review, export, and back up local records without a live network connection.

The workbook must still work if the app never ships, is unavailable, or breaks. No payroll, approval, or source-of-truth workflow may depend exclusively on this app.

The app should submit or export rows into controlled intake tabs. It must not directly mutate payroll logic, final workbook tables, formulas, approvals, worker access, or admin-only state.

## 4. Worker-Facing MVP Scope

The MVP should preserve the current app shell and local-first behavior, then add a clean CrewPay-compatible intake/export schema.

The worker-facing workflow should remain a full field app experience:

1. Worker opens app.
2. Worker selects or enters worker identity.
3. Worker selects job/site.
4. Worker enters date.
5. Worker enters start/end time or total hours.
6. Worker selects pay type.
7. Worker adds notes if needed.
8. Worker adds proof/photo reference if available.
9. Worker may continue tracking richer local records where useful, such as expenses, mileage, proof, reports, or pay-period grouping.
10. Worker saves local draft.
11. Worker reviews entries and related local records.
12. Worker exports or submits a CrewPay intake package for workbook review.

The MVP should prioritize reliable entry capture, local recovery, explicit review, and a clean intake format over automation. It should not delete existing FieldLedger functionality during early CrewPay adaptation.

## 5. Minimal Local Data Model

Proposed CrewPay-mapped local time/work entry record:

```json
{
  "workerId": "worker-001",
  "workerName": "Worker Name",
  "entryDate": "2026-06-11",
  "jobId": "job-001",
  "jobName": "Job Name",
  "siteName": "Site Name",
  "companyName": "Company Name",
  "startTime": "08:00",
  "endTime": "16:30",
  "hoursWorked": 8.5,
  "payType": "hourly",
  "rateRef": "standard-hourly",
  "notes": "Optional worker note.",
  "proofRefs": [
    {
      "proofId": "proof-001",
      "type": "photo",
      "name": "photo.jpg",
      "localOnly": true
    }
  ],
  "localStatus": "draft",
  "submittedAt": "",
  "createdAt": "2026-06-11T14:00:00.000Z",
  "updatedAt": "2026-06-11T14:00:00.000Z",
  "schemaVersion": 1
}
```

Suggested local package shape:

```json
{
  "appName": "CrewPay Worker App",
  "schemaVersion": 1,
  "exportedAt": "2026-06-11T14:30:00.000Z",
  "worker": {
    "workerId": "worker-001",
    "workerName": "Worker Name"
  },
  "entries": [
    {
      "workerId": "worker-001",
      "workerName": "Worker Name",
      "entryDate": "2026-06-11",
      "jobId": "job-001",
      "jobName": "Job Name",
      "siteName": "Site Name",
      "companyName": "Company Name",
      "startTime": "08:00",
      "endTime": "16:30",
      "hoursWorked": 8.5,
      "payType": "hourly",
      "rateRef": "standard-hourly",
      "notes": "Optional worker note.",
      "proofRefs": [],
      "localStatus": "ready_to_submit",
      "submittedAt": "",
      "createdAt": "2026-06-11T14:00:00.000Z",
      "updatedAt": "2026-06-11T14:20:00.000Z",
      "schemaVersion": 1
    }
  ]
}
```

`workerName`, `jobName`, `siteName`, and `companyName` may be display snapshots for review. Workbook intake should prefer stable IDs when available.

The app may also preserve richer FieldLedger-style records outside this CrewPay intake shape, such as expense records, mileage records, proof records, and printable summaries. Those local records do not have to be exported to CrewPay until a workbook mapping is explicitly designed.

## 6. Workbook Intake Mapping

| App field | Likely workbook target | Likely target column | Notes |
| --- | --- | --- | --- |
| `workerId` | Workers, Time Entries, Import Queue / Intake | NEEDS CONFIRMATION | Stable worker identifier should be required before import. |
| `workerName` | Workers, Time Entries, Import Queue / Intake | NEEDS CONFIRMATION | Display snapshot only; workbook should validate against Workers. |
| `entryDate` | Time Entries, Import Queue / Intake, Schedule later if applicable | NEEDS CONFIRMATION | Required date for time/work record. |
| `jobId` | Jobs, Time Entries, Import Queue / Intake | NEEDS CONFIRMATION | Preferred stable job reference when available. |
| `jobName` | Jobs, Time Entries, Import Queue / Intake | NEEDS CONFIRMATION | Display fallback if `jobId` is not available. |
| `siteName` | Jobs, Time Entries, Import Queue / Intake | NEEDS CONFIRMATION | May map to job/site/location depending on workbook schema. |
| `companyName` | Jobs, Time Entries, Import Queue / Intake | NEEDS CONFIRMATION | Should be controlled or validated by workbook. |
| `startTime` | Time Entries, Import Queue / Intake | NEEDS CONFIRMATION | Optional if `hoursWorked` is entered directly. |
| `endTime` | Time Entries, Import Queue / Intake | NEEDS CONFIRMATION | Optional if `hoursWorked` is entered directly. |
| `hoursWorked` | Time Entries, Import Queue / Intake | NEEDS CONFIRMATION | Required for payroll intake; app may calculate from times but workbook should validate. |
| `payType` | Time Entries, Jobs, Import Queue / Intake | NEEDS CONFIRMATION | Examples may include hourly, day rate, piece rate, salary adjustment; exact values need workbook confirmation. |
| `rateRef` | Time Entries, Jobs, Import Queue / Intake | NEEDS CONFIRMATION | Reference to workbook-controlled rate, not final payroll authority. |
| `notes` | Time Entries, Import Queue / Intake, Admin Notices later if applicable | NEEDS CONFIRMATION | Worker-entered note for review. Avoid private/admin-only notes. |
| `proofRefs` | Worker Proof, Import Queue / Intake | NEEDS CONFIRMATION | References local proof metadata or future uploaded proof IDs. |
| `localStatus` | Import Queue / Intake | NEEDS CONFIRMATION | Local-only status may help prevent duplicate submission. |
| `submittedAt` | Import Queue / Intake, Time Entries | NEEDS CONFIRMATION | Submission timestamp from app/device; workbook may replace with received timestamp. |
| `createdAt` | Import Queue / Intake | NEEDS CONFIRMATION | Local creation timestamp. |
| `updatedAt` | Import Queue / Intake | NEEDS CONFIRMATION | Local last-edited timestamp. |
| `schemaVersion` | Import Queue / Intake | NEEDS CONFIRMATION | Needed for future migrations. |

Schedule mapping should be deferred. A worker-entered time record should not automatically create schedule state. Schedule use may later consume approved workbook data or admin notices.

Admin Notices mapping should be deferred. Worker notes are not admin notices. A future app may display admin notices from a worker-safe read model, but the MVP should not design live notice sync.

## 7. Export / Submission Format

Minimal export package:

- CSV for Time Entries intake.
- JSON backup package for full local app backup.
- Optional proof manifest JSON for photos/proof references.

CSV should contain only intake fields needed for workbook review. It should not include hardcoded personal data, company billing data, private addresses, phone numbers, emails, or old FieldLedger-specific header blocks.

JSON backup should preserve the complete local app state needed for worker recovery, including drafts, submitted status, proof manifests, schema version, and timestamps.

Proof manifest JSON should describe proof records without embedding large binary data by default:

```json
{
  "schemaVersion": 1,
  "entryId": "entry-001",
  "proofRefs": [
    {
      "proofId": "proof-001",
      "type": "photo",
      "name": "job-photo.jpg",
      "size": 123456,
      "localOnly": true,
      "createdAt": "2026-06-11T14:05:00.000Z"
    }
  ]
}
```

Live Apps Script submission is intentionally out of scope for this spec. The first implementation should produce reviewable local export artifacts only.

## 8. Additive CrewPay Mapping Layer

The app can keep richer local records than CrewPay Ledger needs for immediate workbook intake.

CrewPay export should send only the subset needed by workbook intake. For example, the app may keep expenses, mileage, photos, local notes, printable summaries, and backup metadata, while the CrewPay Time Entries CSV exports only worker/time/job/rate-reference fields confirmed for workbook intake.

Records not needed by CrewPay, such as expenses or mileage, may remain local/reporting features unless later mapped to workbook tabs. A later mapping could intentionally send expense or mileage summaries to separate workbook intake tabs, but that should be a separate design decision.

The CrewPay mapping layer must not mutate workbook payroll logic directly. It should prepare controlled intake rows for review, validation, and import by workbook-side logic or admin workflows.

## 9. Future UI Direction: Distinct CrewPay Worker App

The CrewPay worker app should not look like FieldLedger.

FieldLedger functionality may be reused, but the visual design should be separate. The app should feel like a worker-friendly CrewPay field companion, not a renamed FieldLedger clone.

The target is not a visual reskin only. The CrewPay worker app should keep the useful FieldLedger capabilities while changing the information architecture, screen flow, labels, and visual style so it becomes its own product.

The redesign should happen after the data/schema/export boundaries are defined. Early implementation should avoid mixing visual redesign with schema/export changes unless explicitly requested.

Future UI goals:

- Simpler worker-first home screen.
- Clear daily entry workflow.
- Large mobile-friendly buttons.
- Fast "add work entry" path.
- Clear saved draft / submitted / needs review states.
- Separate review screen before export/submission.
- Proof/photo capture should feel like part of the work entry flow.
- CrewPay branding should be distinct from FieldLedger branding.
- Avoid old oilfield-specific wording unless intentionally retained as a configurable work type.
- Preserve advanced tools like expenses, mileage, reports, and backups, but organize them so they do not overwhelm basic worker entry.

Do not delete existing features just to simplify the UI. First decide whether each feature should be primary, secondary, hidden behind settings, or isolated for later.

## 10. Preserve vs Adapt

| Existing FieldLedger Feature | Preserve / Adapt / Isolate / Remove Later | Reason | CrewPay Mapping Impact |
| --- | --- | --- | --- |
| Jobs | Adapt | Job entry is central to worker field records, but current fields are old-domain specific. | Map job/site/company/date/time/pay fields to Time Entries, Jobs, and Import Queue / Intake after workbook columns are confirmed. |
| Expenses | Preserve initially, adapt later if needed | Useful full worker-app recordkeeping; not necessarily part of CrewPay payroll intake MVP. | Keep local/reporting only unless CrewPay adds expense intake. |
| Mileage | Preserve initially, adapt later if needed | Useful field-worker recordkeeping; may not belong in CrewPay payroll intake MVP. | Keep local/reporting only unless CrewPay adds mileage intake. |
| Photos/proof | Preserve and adapt | Proof capture is valuable for worker review and future workbook proof mapping. | Map proof metadata to Worker Proof / Intake later; avoid embedding large binaries in CSV. |
| Pay periods | Preserve and adapt | Grouping supports review, export batches, and worker records. | Use as optional batch/export grouping for CrewPay intake. |
| Printable reports | Preserve and adapt | Worker review/proof-style summaries are useful before export. | Reports should show CrewPay-safe summaries and avoid private hardcoded data. |
| JSON backup/restore | Preserve and adapt | Local-first worker ownership depends on backup/recovery. | Backup should include all local records, not only CrewPay-exported fields. |
| CSV export | Preserve concept, replace format | Export mechanism is useful; current CSV is not CrewPay-safe. | Create CrewPay intake CSV with confirmed fields and no hardcoded personal/company data. |
| Trusted Sheet URL/token UI | Isolate | Current UI targets old trusted-sheet flow and stores a URL locally. | Do not wire to CrewPay until a worker-safe bridge is designed. |
| Apps Script integration | Isolate | Current script includes old admin/menu/calendar assumptions. | Replace later with a worker-safe intake bridge or keep separate from the worker app. |
| Bucking/Torque Turn fields | Isolate or remove later | These are old FieldLedger business rules and may confuse CrewPay workers. | Replace with CrewPay pay type/rate reference mapping. |
| 1099 tax estimate | Isolate or remove later | Likely outside CrewPay worker payroll intake and may confuse employee/payroll workflows. | No CrewPay intake mapping unless explicitly needed for worker-owned reports. |
| Hardcoded personal CSV data | Remove later | Private/personal and unsafe for CrewPay use. | Must not appear in any CrewPay export. |

## 11. FieldLedger Code Reuse Assessment

Likely reusable:

- PWA shell.
- `localStorage` and IndexedDB foundation.
- Photo storage pattern.
- Pay period grouping concept if CrewPay intake needs pay-period batches.
- JSON backup/restore concept.
- CSV export concept.
- Print/review concept.
- Settings where safe and useful.

Likely removed, hidden, or isolated later:

- 1099 tax estimates.
- Bucking / Torque Turn workflow.
- Trusted Sheet URL/token UI.
- Old Apps Script bridge.
- LEG calendar sync assumptions.
- Hardcoded personal/company CSV data.

The current app has useful mechanics and a broad worker-facing shape. The CrewPay adaptation should preserve that full worker app behavior where useful, while replacing old-domain rules that conflict with CrewPay.

## 12. Safety Rules for Future Implementation

- No hardcoded personal data.
- No real worker data in repo.
- No real company/client/private data in repo.
- No live Sheet IDs committed.
- No Apps Script deployment URLs committed.
- No tokens in source.
- No direct payroll calculation override from the app.
- All app output must be reviewable before workbook import.
- Local drafts must be editable and deletable before submission.
- Submission status must prevent accidental duplicate imports later.
- Workbook-controlled rates, approvals, and payroll logic must remain in the workbook.
- App schema migrations must preserve worker-owned backups where practical.
- Do not delete existing FieldLedger functionality during early CrewPay adaptation. First isolate unsafe/private pieces, add tests, and introduce CrewPay mappings alongside current behavior.

## 13. Stopper-to-Task Breakdown

Future task candidates:

- Remove private/hardcoded CSV data.
- Disable or isolate old FieldLedger Apps Script integration.
- Define CrewPay worker schema.
- Replace old CSV export with CrewPay intake export.
- Add worker identity model.
- Simplify worker UI.
- Add duplicate/submission status handling.
- Fix lint baseline.

These are implementation candidates only. They should be handled in separate scoped changes after this spec is reviewed.

## 14. Recommended Next Step

Create a new isolated CrewPay worker intake schema module and tests without wiring it into the UI yet.
