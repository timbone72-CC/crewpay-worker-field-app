# CrewPay App ↔ Workbook Match Audit

Purpose:
Confirm whether the CrewPay Worker Field App currently matches the CrewPay workbook well enough to safely build the workbook bridge.

Do not build the bridge from assumptions.
Do not connect worker submissions to final payroll tabs.
Do not expose private admin/workbook fields to the worker app.

## Audit rule

Workbook remains source of truth.

Worker app may submit:
- Worker time entries
- Day-off requests
- Correction requests, if present
- Worker proof/export metadata, if approved

Worker app must not control:
- Final approval
- Payroll calculation authority
- Pay status
- Admin notes
- Private rejection/correction notes
- Full calendar/payroll details
- Worker access status authority

## Repos / files to inspect

### Worker app repo

Repo:
- `~/projects/crewpay-worker-field-app`

Inspect:
- `src/`
- `README.md`
- package/config files
- export/sync/storage modules
- CrewPay-specific modules
- tests, if present

### Workbook repo

Repo:
- `~/projects/crewpay-ledger`

Inspect:
- workbook build scripts
- workbook spec docs
- Apps Script files, if present
- generated workbook files, if useful
- acceptance/state docs

## Audit sections

## 1. App identity and purpose

| Check | Status | Evidence | Notes |
|---|---:|---|---|
| App is clearly named CrewPay Worker Field App | Unknown |  |  |
| App is worker-facing, not admin-facing | Unknown |  |  |
| App says workbook/admin remains source of truth | Unknown |  |  |
| App avoids presenting itself as payroll authority | Unknown |  |  |

## 2. Worker identity / access fields

| App field / feature | Workbook column / tab | Status | Required? | Notes |
|---|---|---:|---:|---|
| workerId |  | Unknown | Yes | Needed for sync and worker registry match |
| workerInitials |  | Unknown | Yes | Needed for privacy-safe calendar/day-off labels |
| workerDisplayName |  | Unknown | Maybe | Should not be exposed broadly |
| inviteCode / accessToken |  | Unknown | Yes | Needed for bridge v1 access |
| accessStatus |  | Unknown | Workbook-only | App may read status, not control it |
| deviceId |  | Unknown | Maybe | Useful for audit/duplicate troubleshooting |

## 3. Time entry field match

| App field | Workbook column / tab | Status | Required? | Notes |
|---|---|---:|---:|---|
| entryId |  | Unknown | Yes | Needed for duplicate protection |
| workerId |  | Unknown | Yes |  |
| workDate |  | Unknown | Yes |  |
| startTime |  | Unknown | Maybe | Depends on workbook model |
| endTime |  | Unknown | Maybe | Depends on workbook model |
| hoursWorked |  | Unknown | Yes |  |
| jobName / projectName |  | Unknown | Maybe | Naming must match workbook |
| location / site |  | Unknown | Maybe |  |
| workType |  | Unknown | Maybe |  |
| notes |  | Unknown | Maybe | Worker-visible notes only |
| submittedAt |  | Unknown | Yes | Needed for audit trail |
| syncStatus |  | Unknown | App-local | Workbook may store received status |
| approvalStatus |  | Unknown | Workbook-only | App may display returned status later |
| payAmount |  | Do not send | No | Workbook/admin should calculate/control |
| adminNotes |  | Do not send | No | Private admin field |

## 4. Day-off request field match

| App field | Workbook column / tab | Status | Required? | Notes |
|---|---|---:|---:|---|
| requestId |  | Unknown | Yes | Needed for duplicate protection |
| workerId |  | Unknown | Yes |  |
| workerInitials |  | Unknown | Yes | For calendar label only |
| startDate |  | Unknown | Yes |  |
| endDate |  | Unknown | Maybe | Needed for multi-day requests |
| requestNote |  | Unknown | Maybe | Should not appear on shared calendar |
| submittedAt |  | Unknown | Yes |  |
| approvalStatus |  | Unknown | Workbook-only |  |
| rejectionReason |  | Do not expose broadly | No | Private unless admin chooses worker-visible message |

## 5. Local storage / offline safety

| Check | Status | Evidence | Notes |
|---|---:|---|---|
| App autosaves drafts locally | Unknown |  |  |
| App has pending sync queue | Unknown |  |  |
| App keeps submitted history locally | Unknown |  |  |
| App can export CSV | Unknown |  |  |
| App can download JSON backup | Unknown |  |  |
| App can restore JSON backup | Unknown |  |  |
| App does not require cloud login in v1 | Unknown |  |  |

## 6. Workbook intake readiness

| Workbook tab / feature | Status | Evidence | Notes |
|---|---:|---|---|
| Worker Registry | Unknown |  |  |
| Time Entry Inbox | Unknown |  |  |
| Day Off Request Inbox | Unknown |  |  |
| Sync Log | Unknown |  |  |
| Bridge Settings | Unknown |  |  |
| Calendar Queue | Unknown |  | Later unless already present |
| Correction Requests | Unknown |  | Later unless already present |
| Worker Access Log | Unknown |  | Later unless already present |

## 7. Bridge readiness

| Check | Status | Evidence | Notes |
|---|---:|---|---|
| App has bridge URL setting | Unknown |  |  |
| App has test connection action | Unknown |  |  |
| App can POST JSON payload | Unknown |  |  |
| App handles bridge success response | Unknown |  |  |
| App handles bridge error response | Unknown |  |  |
| App blocks/resolves duplicate submits | Unknown |  |  |
| Workbook has Apps Script bridge endpoint | Unknown |  |  |
| Workbook bridge can validate worker access | Unknown |  |  |
| Workbook bridge can write pending time entry rows | Unknown |  |  |
| Workbook bridge can write pending day-off rows | Unknown |  |  |

## 8. Privacy and safety boundary

| Check | Status | Evidence | Notes |
|---|---:|---|---|
| Worker app does not show full crew private calendar details | Unknown |  |  |
| Worker app does not show pay amounts from other workers | Unknown |  |  |
| Worker app does not expose admin notes | Unknown |  |  |
| Worker app does not expose rejection/private reason fields broadly | Unknown |  |  |
| Calendar labels use initials-only standard | Unknown |  |  |
| Shared calendar is visibility/reminder only | Unknown |  |  |

## 9. Audit findings

### Matches confirmed

- TBD

### App fields missing from workbook

- TBD

### Workbook fields missing from app

- TBD

### Naming mismatches

- TBD

### Safety/privacy risks

- TBD

### Bridge blockers

- TBD

### Safe bridge v1 scope

- TBD

## 10. Final recommendation

Status:
- Unknown until audit is completed.

Recommendation:
- Do not build workbook bridge until this audit confirms the minimum field match and intake tabs.


---

# Initial Audit Findings — Fresh Build Pass

Date:
2026-06-11

## Scope correction

This is a fresh worker app build. The audit should not judge the app as if it already had full OAuth, background sync, retry queues, access validation, or production bridge behavior.

Correct question:
Does the fresh worker app have enough clean CrewPay intake/export structure to become connected to the workbook next?

## Current app intake shape found

The CrewPay intake mapping spec shows these planned worker time-entry fields:

- workerId
- workerName
- entryDate
- jobName
- startTime
- endTime
- hoursWorked
- payType
- notes
- proofRefs
- proofId

## Current workbook bridge shape found

The workbook repo already contains a bridge script and setup docs.

The workbook bridge writes time entries to:

- Pending Time Entries

The bridge does not write directly to:

- Worker Proof
- dashboards
- formula/report tabs
- final ledger tabs

The workbook bridge submitTimeEntry action expects these required fields:

- workerId
- payPeriodId
- workDate
- jobWorkType
- hoursWorked
- rate

Optional fields:

- entryId
- workerName
- notes

## Confirmed matches

| App field | Workbook bridge field | Workbook header | Status | Notes |
|---|---|---|---|---|
| workerId | workerId | Worker ID | Match | Required by bridge |
| workerName | workerName | Worker Name | Match | Optional display context |
| hoursWorked | hoursWorked | Hours | Match | Required by bridge |
| notes | notes | Notes | Match | Optional |

## Naming mismatches

| App field | Workbook bridge field | Workbook header | Status | Notes |
|---|---|---|---|---|
| entryDate | workDate | Work Date | Needs mapping | Rename in bridge payload or add translator |
| jobName | jobWorkType | Job / Work Type | Needs mapping | App can keep jobName locally but submit as jobWorkType |

## Workbook-required fields not confirmed in app mapping

| Required bridge field | Status | Notes |
|---|---|---|
| payPeriodId | Gap | Needed before submitTimeEntry can work |
| rate | Gap | Needed because bridge calculates Amount as hoursWorked * rate |

## App fields not currently needed by Pending Time Entries v1

| App field | Status | Notes |
|---|---|---|
| startTime | Keep local/export-only for now | Workbook bridge v1 does not require it |
| endTime | Keep local/export-only for now | Workbook bridge v1 does not require it |
| payType | Keep local/export-only for now | Bridge currently expects rate, not payType |
| proofRefs | Keep local/export-only for now | Do not push proof into Worker Proof directly |
| proofId | Keep local/export-only for now | Can become a later proof manifest bridge |

## Bridge blockers

The app should not connect to submitTimeEntry until these are handled:

1. Add or derive payPeriodId.
2. Add or derive rate.
3. Map entryDate to workDate.
4. Map jobName to jobWorkType.
5. Decide whether entryId is generated by the app or left optional.
6. Keep proofRefs out of workbook final/proof tabs in bridge v1.

## Safe bridge v1 recommendation

Build only a small worker time-entry payload translator first.

Do not build broad sync yet.

Safe v1 payload from app to workbook bridge:

{
  "action": "submitTimeEntry",
  "token": "configured-bridge-token",
  "clientId": "crewpay-worker-field-app",
  "entryId": "app-generated-entry-id",
  "workerId": "worker-id",
  "workerName": "worker-name",
  "payPeriodId": "selected-or-derived-pay-period-id",
  "workDate": "from-entryDate",
  "jobWorkType": "from-jobName",
  "hoursWorked": 8,
  "rate": 20,
  "notes": "worker note"
}

## Final recommendation

Status:
Fresh build is aligned enough to continue, but not ready for direct workbook submit until the small mapping gaps are closed.

Next build should add the worker app bridge payload translator and bridge settings/test submit flow, not a full sync system.

