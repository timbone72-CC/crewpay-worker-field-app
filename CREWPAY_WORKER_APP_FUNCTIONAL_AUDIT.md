# CrewPay Worker Field App — Functional Audit

## Audit status

Complete. This was a blind functional audit of the current `crewpay-worker-app` branch in `~/projects/fieldledger-clone`.

The audit inspected repo state, publish configuration, source wiring, local export/import logic, PWA files, tests, and build output. No app source code was changed.

## Commands run

```bash
pwd
git status --branch --short
git remote -v
git log --oneline -8
node -e "const p=require('./package.json'); console.log(p.scripts || {})"
find src -type f | sort
ls -lh vite.config.* index.html public/manifest.webmanifest public/sw.js .github/workflows/pages.yml
npm run test:crewpay
npm run build
grep -RInE 'Today|Work|Review|Tools|Settings|Help|Print|Report|Export|Backup|Restore|Saved|pay period|localStorage' src --exclude-dir=node_modules --exclude='*.test.*' | head -220
grep -RInE 'FieldLedger|fieldledger|CrewPay|payroll|tax|OAuth|Drive|sync|cloud|report|timesheet' README.md CREWPAY_WORKER_APP_HANDOFF.md CREWPAY_SYSTEM_CURRENT_STATE.md src public index.html vite.config.* 2>/dev/null | head -220
grep -RInE 'print|timesheet|report|@media|display: none|visibility' src/App.css src/index.css src --exclude-dir=node_modules | head -220
grep -RInE 'AIza|token|secret|password|SpreadsheetApp|script.google.com|docs.google.com/spreadsheets|@gmail.com|phone|address' README.md CREWPAY_WORKER_APP_HANDOFF.md CREWPAY_SYSTEM_CURRENT_STATE.md src public index.html package.json vite.config.* 2>/dev/null || true
```

## Repo/publish state

- Current path: `/home/timbone/projects/fieldledger-clone`
- Current branch: `crewpay-worker-app`
- Current branch tracks `origin/crewpay-worker-app`
- `origin` points to `https://github.com/timbone72-CC/crewpay-worker-field-app.git`
- `fieldledger-source` fetches from `/home/timbone/projects/fieldledger`
- `fieldledger-source` push URL remains `DISABLED_DO_NOT_PUSH_TO_FIELDLEDGER_SOURCE`
- GitHub Pages workflow exists at `.github/workflows/pages.yml`
- Vite base is `/crewpay-worker-field-app/`
- Manifest `start_url`, `id`, `scope`, and icon paths use `/crewpay-worker-field-app/`
- Service worker registers and caches under `/crewpay-worker-field-app/`

## Summary judgment

Functional but incomplete.

The app builds, the CrewPay helper tests pass, core local storage/export paths are present, and the PWA/GitHub Pages pathing appears aligned for the published URL. The main blocker to considering it ready for broad worker testing is not technical build failure; it is incomplete worker review/report behavior and visible leftovers from the source app in user-facing recovery/clear flows.

## Findings

### F-001

- Feature area: Print/report buttons
- Severity: major
- Expected behavior: `Print Full Report` should either print a complete report view or not appear.
- Actual behavior: `PrintPayPeriodReportButton` accepts an optional `setPrintMode`, but `ExportActionsDropdown` renders it without passing that prop. No full-report view is mounted in `App.jsx`. The button still adds `print-full-report` and calls `window.print()`, but there is no CSS/report view that makes a full report visible.
- Evidence: `src/features/exports/PrintPayPeriodReportButton.jsx`; `src/features/exports/ExportActionsDropdown.jsx`; `src/App.jsx`.
- Likely file(s): `src/features/exports/PrintPayPeriodReportButton.jsx`, `src/features/exports/ExportActionsDropdown.jsx`, `src/App.jsx`, print CSS.
- Recommended fix scope: small if removed/hidden; medium if implemented.
- Notes: This is the clearest broken control in the current UI.

### F-002

- Feature area: Review tab completeness
- Severity: major
- Expected behavior: Review should let a worker inspect the actual saved work entries, proof references, expenses, mileage, and statuses before export/backup.
- Actual behavior: Review shows pay-period info, export controls, an optional print view, and summary cards. It does not show a record-level review list unless the user goes back to Work or Tools.
- Evidence: `src/App.jsx` review branch renders `PayPeriodInfoForm`, `ExportActionsDropdown`, optional `TimesheetPrintView`, and `PayPeriodSummaryPanel`.
- Likely file(s): `src/App.jsx`, `src/features/jobs/SavedJobsList.jsx`, `src/features/expenses/SavedExpensesList.jsx`, `src/features/mileage/SavedMileageList.jsx`.
- Recommended fix scope: medium.
- Notes: This is a product-flow gap, not a storage failure. Records appear to share active pay-period storage.

### F-003

- Feature area: Print Timesheet naming and output
- Severity: minor
- Expected behavior: `Print Timesheet` should print a worker timesheet or be labeled to match the output.
- Actual behavior: The printed component heading is `CrewPay Worker Review Report`, and it includes a review-style table plus mileage summary. The button label and output purpose are not aligned.
- Evidence: Button text in `src/features/exports/ExportActionsDropdown.jsx`; heading in `src/features/exports/TimesheetPrintView.jsx`.
- Likely file(s): `src/features/exports/ExportActionsDropdown.jsx`, `src/features/exports/TimesheetPrintView.jsx`.
- Recommended fix scope: small.
- Notes: The mounted print view is not blank; the mismatch is naming/expectation.

### F-004

- Feature area: Source-app wording
- Severity: minor
- Expected behavior: Visible worker-facing text should use CrewPay Field App identity.
- Actual behavior: Several user-facing error/help strings still say `FieldLedger`, including storage recovery, clear failure, clear confirmation copy, and backup-before-clear file naming.
- Evidence: `src/features/pay-periods/activePayPeriodStorage.js`; `src/features/pay-periods/ClearPayPeriodButton.jsx`; `src/shared/storage/localJsonStorage.js`.
- Likely file(s): `src/features/pay-periods/activePayPeriodStorage.js`, `src/features/pay-periods/ClearPayPeriodButton.jsx`, `src/shared/storage/localJsonStorage.js`.
- Recommended fix scope: small.
- Notes: Internal event names/storage keys can remain for compatibility, but visible messages should be rebranded.

### F-005

- Feature area: JSON backup/photo proof completeness
- Severity: major
- Expected behavior: A worker who downloads a backup may reasonably expect proof photos/receipts to be recoverable.
- Actual behavior: JSON backup exports the active pay-period object, including photo IDs/names, but photo blobs live separately in IndexedDB and are not included in the JSON backup. Restoring JSON can restore references without restoring the actual image blobs.
- Evidence: JSON export in `src/features/exports/DownloadPayPeriodJsonButton.jsx`; photo blob storage in `src/shared/storage/photoBlobStorage.js`; proof manifest builder in `src/features/crewpay/crewPayIntake.js`.
- Likely file(s): export buttons, `photoBlobStorage.js`, backup documentation.
- Recommended fix scope: medium.
- Notes: This may be acceptable if documented as proof references only, but current backup wording can overpromise recovery.

### F-006

- Feature area: Manual personal cloud backup
- Severity: minor
- Expected behavior: The personal backup package should clearly provide all manual files and degrade safely.
- Actual behavior: The package builder correctly includes JSON backup, CSV, and proof manifest only when proof refs exist. The UI falls back to downloads when Web Share file support is unavailable. However, multiple programmatic downloads may be blocked or partially suppressed by some mobile browsers.
- Evidence: `src/features/crewpay/personalCloudBackup.js`; `src/features/exports/PersonalCloudBackupPanel.jsx`.
- Likely file(s): `src/features/exports/PersonalCloudBackupPanel.jsx`.
- Recommended fix scope: small to medium.
- Notes: Needs manual browser verification on iOS Safari, Android Chrome, and desktop Chrome/Edge.

### F-007

- Feature area: Pay-period summary accuracy
- Severity: minor
- Expected behavior: Summary metrics should match the CrewPay worker app model and not imply payroll calculation.
- Actual behavior: Current visible summary cards for entry count, hours, status counts, expenses, and mileage are appropriate. Under the hood, `calculatePayPeriodSummary` still computes `grossEarnings` and `netIncome` from old FieldLedger job types, but those values are not displayed in the current summary panel.
- Evidence: `src/features/pay-periods/PayPeriodSummaryPanel.jsx`; `src/shared/utils/calculatePayPeriodSummary.js`; `src/shared/utils/calculateJobPay.js`.
- Likely file(s): summary utilities and tests.
- Recommended fix scope: small.
- Notes: Not user-facing today, but stale payroll-style utility names can confuse future changes.

### F-008

- Feature area: JSON restore validation
- Severity: minor
- Expected behavior: Restore should accept valid CrewPay Field App backups and reject unsafe shapes.
- Actual behavior: Restore validation is conservative and still validates old compatibility fields such as `company`, `rigNameOrNumber`, `fieldTicketNumber`, `buckingState`, and `totalPay`. New app-created work entries include those compatibility fields, so current backups should restore. A future pure CrewPay schema backup without those old fields would fail restore.
- Evidence: `src/features/exports/validatePayPeriodBackup.js`; compatibility fields added in `src/features/jobs/JobEntryForm.jsx`.
- Likely file(s): `src/features/exports/validatePayPeriodBackup.js`.
- Recommended fix scope: medium.
- Notes: This is not breaking current app-created backups, but it preserves hidden coupling to the source schema.

### F-009

- Feature area: Work entry defaults/settings
- Severity: minor
- Expected behavior: Worker defaults saved in Settings should make fast daily entry easier.
- Actual behavior: Worker ID/name/default pay type/rate ref are loaded into new work-entry forms. This part is wired. There is no worker selection list or controlled job/site catalog, which is acceptable for local-first v1 but limits repeated multi-job worker testing.
- Evidence: `src/features/settings/settingsStorage.js`; `src/features/settings/SettingsPanel.jsx`; `src/features/jobs/JobEntryForm.jsx`.
- Likely file(s): settings and work-entry form.
- Recommended fix scope: small.
- Notes: Consider this enhancement, not a blocker.

### F-010

- Feature area: PWA/offline behavior
- Severity: minor
- Expected behavior: Published PWA should install and load from `/crewpay-worker-field-app/`.
- Actual behavior: Vite base, manifest, icon paths, service worker root, and workflow artifact path are aligned. The service worker caches the app root, manifest, favicon, and icons on install and runtime-caches same-origin GET assets. Hashed build assets are not precached on install, so first offline use depends on prior online loading of those asset requests.
- Evidence: `vite.config.js`; `public/manifest.webmanifest`; `public/sw.js`; `.github/workflows/pages.yml`.
- Likely file(s): `public/sw.js`.
- Recommended fix scope: small to medium.
- Notes: Good enough for basic runtime offline behavior, but not a robust precache strategy.

### F-011

- Feature area: Test coverage
- Severity: major
- Expected behavior: Tests should catch critical worker flows: save work entry, display in review, export same entries, restore backup, print/report wiring.
- Actual behavior: `npm run test:crewpay` covers schema, CSV mapping, proof manifest, and personal backup package builder. Existing focused tests cover some helper/source checks. There is no render/integration test for tab flow, Review contents, print buttons, JSON restore UI, or IndexedDB photo backup expectations.
- Evidence: package script `test:crewpay`; test files under `src/features/crewpay` and `src/features/exports`.
- Likely file(s): test suite setup/new tests.
- Recommended fix scope: medium.
- Notes: This explains why the broken `Print Full Report` control can pass current checks.

## Passes / working areas

- Repo is on `crewpay-worker-app`, tracking `origin/crewpay-worker-app`.
- Protected `fieldledger-source` push URL remains disabled.
- `npm run test:crewpay` passed.
- `npm run build` passed.
- Main navigation has clear sections: Today, Work, Review, Tools, Settings, Help.
- Work entries save into active pay-period storage with CrewPay fields and compatibility fields.
- Saved work entries list supports empty state, proof preview, edit dispatch, and delete.
- Settings defaults feed new work-entry forms.
- CSV export delegates to CrewPay intake mapping and has tests for headers/escaping.
- JSON backup export exists.
- JSON restore/import exists and uses validation before replacing active pay-period data.
- Personal Cloud Backup builds JSON, CSV, and proof manifest package and safely falls back when Web Share files are unsupported.
- Expense and mileage tools are preserved as secondary local tools.
- Manifest, Vite base, service worker path, and Pages workflow are aligned with the published URL.
- Private data scan found no live secrets. Matches were generic documentation warnings about tokens and device sharing.

## Unknowns / needs manual browser verification

- Actual live GitHub Pages behavior was not manually exercised in a browser during this audit.
- Camera capture behavior needs device/browser testing.
- IndexedDB photo persistence and preview behavior needs browser testing after reload/install.
- Web Share API behavior needs mobile browser testing.
- Multiple-file download behavior needs mobile and desktop browser testing.
- Print output needs visual browser verification on desktop and mobile.
- PWA install/offline behavior should be tested after first online load and after a cold offline launch.

## Recommended fix order

1. Remove, hide, or correctly wire `Print Full Report`.
2. Replace visible `FieldLedger` wording in recovery and clear-pay-period flows.
3. Add a real Review record list or read-only review component for work entries, expenses, mileage, notes, proof refs, and statuses.
4. Align `Print Timesheet` label/output, or split it into distinct Timesheet and Review Report actions.
5. Clarify backup wording around proof photos versus proof references, or add a photo-inclusive backup strategy.
6. Loosen restore validation toward the CrewPay schema while preserving legacy backup compatibility.
7. Add browser-level or component-level tests for save-to-review-to-export and print/report wiring.
8. Improve service worker precaching if stronger offline guarantees are required.

## Fix Pass 1

- Removed the visible `Print Full Report` control until a real full-report view is implemented.
- Replaced visible FieldLedger wording in recovery, local storage, clear-pay-period, and backup-before-clear flows with CrewPay Field App wording.
- Review tab completeness remains open for a later pass.
- Proof-photo backup expectations remain open for a later pass.

## Fix Pass 2

- Added a read-only Review records panel that shows saved work entries, proof reference counts, expenses, mileage, notes, statuses, and empty states before export/backup.
- Wired the Review records panel into the Review tab between the summary and export controls.
- Review tab completeness is improved for worker testing, but proof-photo backup expectations, restore-schema modernization, print label alignment, and stronger tests remain open.
