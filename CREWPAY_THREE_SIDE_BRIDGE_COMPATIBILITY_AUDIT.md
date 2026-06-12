# CrewPay Worker Field App — Three-Side Bridge Compatibility Audit

## Audit status

Completed from local repository inspection and targeted test/build checks. No app or workbook code was modified during the audit.

## Executive summary

The worker app, workbook bridge, and workbook/admin side are aligned on the core `submitTimeEntry` bridge contract:

- Top-level `token`
- Top-level `action: "submitTimeEntry"`
- Top-level `clientId`
- Top-level `payload`
- Payload fields limited to the pending intake shape

The worker app sends the correct wrapper and blocks submit when endpoint or token is missing. The workbook bridge validates the token before any writes and writes only to `Pending Time Entries` plus `App Submission Log`. The workbook/admin repo includes the required pending intake tab structure and a review/promotion boundary.

Verdict: **Compatible with setup requirements**

Reason:

- The bridge contract matches on all three sides.
- The worker app is local-first and does not change payroll truth.
- Live submission still depends on correct Apps Script deployment, bridge token setup, and workbook tab installation.

## Commands run

Worker app:

- `git status --short --branch`
- `git log --oneline -3`
- `npm run test:crewpay`
- `npm run build`

Workbook/admin repo:

- `git status --short --branch`
- `git log --oneline -3`
- `sed -n '1,260p' apps_script/CrewPay_Ledger_BRIDGE.gs`
- `sed -n '214,470p' apps_script/CrewPay_Ledger_BRIDGE.gs`
- `sed -n '470,760p' apps_script/CrewPay_Ledger_BRIDGE.gs`
- `sed -n '760,920p' apps_script/CrewPay_Ledger_BRIDGE.gs`
- `sed -n '1,260p' BRIDGE_SETUP.md`
- `rg -n "Pending Time Entries|App Submission Log|submitTimeEntry|validateToken_|CP_BRIDGE_TOKEN|doPost|parseRequest_|routeAction_|review|import|submission" apps_script README.md docs src --glob '!node_modules/**'`

## Repo / publish state

Worker app repo:

- Branch: `crewpay-worker-app`
- Latest known commit at audit time: `7cff0dc Finish CrewPay workbook bridge submit contract`
- Working tree: clean

Workbook/admin repo:

- Branch: `main`
- Latest known commit at audit time: `336243e Fix bridge workbook tab installer`
- Working tree: clean

## Three-side compatibility matrix

| Side | Status | Evidence |
| --- | --- | --- |
| Worker app | Compatible | Builds request body with top-level `token`, `action`, `clientId`, `payload`; blocks missing endpoint/token; validates payload before submit; keeps records local. |
| Workbook bridge | Compatible | `doPost` parses JSON into `token`, `action`, `clientId`, `payload`; `routeAction_` validates token before writes; `submitTimeEntry_` writes only pending intake + submission log. |
| Workbook/admin side | Compatible with setup requirements | `BRIDGE_SETUP.md` defines `Pending Time Entries`, `App Submission Log`, token property setup, deploy steps, and review/promotion boundary. |

## Exact contract confirmed

### Request wrapper

The worker app sends:

```js
{
  token,
  action: "submitTimeEntry",
  clientId: "crewpay-worker-field-app",
  payload: {
    entryId,
    workerId,
    workerName,
    payPeriodId,
    workDate,
    jobWorkType,
    hoursWorked,
    rate,
    notes
  }
}
```

### Payload fields

Confirmed worker payload fields:

- `entryId` optional
- `workerId` required by workbook bridge
- `workerName` optional
- `payPeriodId` required by workbook bridge
- `workDate` required by workbook bridge
- `jobWorkType` required by workbook bridge
- `hoursWorked` required by workbook bridge
- `rate` required by workbook bridge
- `notes` optional

### Target tab

- `Pending Time Entries`

### Log tab

- `App Submission Log`

### Token location

- Workbook Apps Script Script Properties key: `CP_BRIDGE_TOKEN`
- Token is sent at the top level of the POST body
- Worker app stores token locally in browser/device settings only

## Findings

### Critical blockers

None found from code/doc inspection.

### Important mismatches

1. **Admin-side docs are still admin-app-centric**
   - `BRIDGE_SETUP.md` and parts of `README.md` describe the bridge as an admin app companion and use `crewpay-admin-app` in examples.
   - The actual workbook bridge accepts `clientId` generically, so this is a documentation mismatch, not a contract failure.
   - Likely files: `README.md`, `BRIDGE_SETUP.md`, `apps_script/CrewPay_Ledger_BRIDGE.gs`
   - Fix scope: small documentation update

2. **No live submission was performed during audit**
   - Contract compatibility was verified from code and local tests, not from a live Apps Script POST against a deployed workbook URL.
   - Likely files: none
   - Fix scope: none, but live test still required

### Nice-to-have improvements

1. Add a worker-specific bridge setup note in the worker app README.
2. Add a short workbook bridge smoke-test checklist to the workbook repo docs for `submitTimeEntry`.
3. Update bridge examples to show the worker client ID alongside the admin client ID where appropriate.

## Audit answers

### A. Worker app compatibility

1. Correct bridge wrapper: **Yes**
2. Exact `action: "submitTimeEntry"`: **Yes**
3. Token local-only: **Yes**
4. Submit blocking:
   - Missing endpoint: **Yes**
   - Missing token: **Yes**
   - Invalid payload: **Yes**
5. Local records preserved after submit: **Yes**
6. No paid/approved/final payroll mutation: **Yes**
7. No automatic sync/background sync/cloud backup: **Yes**
8. Payload fields mapped: **Yes**
9. Validation matches workbook requirements: **Yes**

### B. Workbook / Apps Script bridge compatibility

1. `doPost` parses JSON correctly: **Yes**
2. `parseRequest_` expects token/action/clientId/payload: **Yes**
3. `routeAction_` validates token before writes: **Yes**
4. `submitTimeEntry_` requires workerId/payPeriodId/workDate/jobWorkType/hoursWorked/rate: **Yes**
5. Optional fields accepted: **Yes** for `entryId`, `workerName`, `notes`
6. Writes only to `Pending Time Entries`: **Yes**
7. Logs only to `App Submission Log`: **Yes**
8. Unsafe writes blocked: **Yes**
9. Schema/docs match code: **Mostly yes**; docs still skew admin-side in wording, but bridge contract and tab names match
10. Response shape interpretable by worker app: **Yes**

### C. Workbook / admin side compatibility

1. Required pending intake tab defined: **Yes**
2. Expected headers match bridge writes: **Yes**
3. Clear review/import path: **Yes**
4. Pending intake separate from final truth: **Yes**
5. Dashboard/report/formula tabs protected: **Yes**
6. Mismatches between docs/tabs/payload fields: **Minor documentation mismatch only**
7. Setup docs present for URL/token/test flow/tab verification: **Yes**

### D. Security / privacy audit

1. Token documented as local-only in worker app: **Yes**
2. Token not printed in logs/tests/docs: **Mostly yes**; docs mention the token name, but not real values
3. Token excluded from payload summaries/log summaries where possible: **Yes**
4. Worker proof/private data excluded from bridge submit: **Yes**
5. Pay amounts limited to pending intake calculation only: **Yes**
6. Final payroll approval/admin notes protected from worker writes: **Yes**

### E. Test / build audit

Worker app:

- `npm run test:crewpay` — passed
- `npm run build` — passed
- `git status --short --branch` — clean
- `git log --oneline -3` — clean history checkpoint visible

Workbook/admin repo:

- `git status --short --branch` — clean
- `git log --oneline -3` — clean history checkpoint visible

## Setup requirements before live test

1. In workbook Apps Script, set `CP_BRIDGE_TOKEN` in Script Properties.
2. Deploy `apps_script/CrewPay_Ledger_BRIDGE.gs` as a Web App.
3. Run `installCrewPayBridgeTabs`.
4. Confirm `Pending Time Entries` exists and has the expected headers.
5. Confirm `App Submission Log` exists and has the expected headers.
6. In the worker app, save the Web App URL as the bridge endpoint.
7. In the worker app, save the same workbook bridge token.
8. Submit one worker time entry from the Review bridge preview or submit flow.
9. Confirm the row appears only in `Pending Time Entries`.
10. Confirm `App Submission Log` records the action.

## Safe live test checklist

- Use a demo token, not a production secret.
- Use a demo workbook or isolated test copy.
- Submit one known-safe time entry.
- Verify only `Pending Time Entries` and `App Submission Log` changed.
- Verify no final payroll/admin tabs changed.
- Verify unauthorized requests fail when token is missing or incorrect.
- Verify the worker app remains local-first after submit.

## Evidence

### File names

Worker app:

- `src/features/bridge/crewPayBridge.js`
- `src/features/bridge/bridgeSettingsStorage.js`
- `src/features/bridge/CrewPayBridgeEndpointSettings.jsx`
- `src/features/crewpay/BridgePayloadPreviewPanel.jsx`
- `src/features/settings/settingsStorage.js`
- `src/features/bridge/crewPayBridge.test.mjs`
- `src/features/bridge/bridgeSettingsStorage.test.mjs`

Workbook/admin repo:

- `apps_script/CrewPay_Ledger_BRIDGE.gs`
- `BRIDGE_SETUP.md`
- `README.md`

### Function names

Worker app:

- `submitCrewPayBridgeTimeEntries`
- `validateCrewPayBridgeTimeEntryPayload`
- `buildCrewPayBridgeTimeEntryPayloads`
- `loadCrewPayBridgeToken`
- `saveCrewPayBridgeToken`

Workbook bridge:

- `doPost`
- `parseRequest_`
- `routeAction_`
- `validateToken_`
- `submitTimeEntry_`
- `appendLog_`
- `installCrewPayBridgeTabs`

### Test commands run

- `npm run test:crewpay`
- `npm run build`

### Build result

- Worker app build passed.

### Git status

- Worker app repo clean at audit time.
- Workbook/admin repo clean at audit time.

## Explicit statement of what was not changed

- No worker app code was changed during this audit.
- No workbook/admin code was changed during this audit.
- No Apps Script deployment was performed during this audit.
- No live POST was sent.
- No payroll, admin, formula, or final ledger behavior was modified.
- No token, URL, or private workbook data was exposed.

