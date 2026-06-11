# CrewPay System — Current State

## System split

CrewPay currently has two connected but separate repos.

### 1. Admin Workbook App

Local path:
~/projects/crewpay-ledger

GitHub repo:
https://github.com/timbone72-CC/crewpay-ledger-workbook-app

Branch:
main

Purpose:
Admin workbook app and workbook bridge.

Current status:
- Admin workbook app is working.
- Workbook is the source of truth.
- Apps Script bridge exists.
- Bridge setup docs exist.
- Workbook bridge/intake tabs exist.
- Main branch is pushed and aligned with origin/main.

Key files:
- CrewPay_Ledger_Workbook.xlsx
- apps_script/CrewPay_Ledger_BRIDGE.gs
- apps_script/CrewPay_Ledger_ORIGINAL_FINAL.gs
- BRIDGE_SETUP.md
- WORKBOOK_BRIDGE_READY_NOTES.md
- COMPATIBILITY_AUDIT_WORKBOOK_COMPANION.md

Important boundary:
Do not overwrite the preserved original final script.

### 2. Worker Field App

Local path:
~/projects/fieldledger-clone

GitHub repo:
https://github.com/timbone72-CC/crewpay-worker-field-app

Branch:
crewpay-worker-app

Purpose:
Worker-facing local-first field app.

Current status:
- Converted from protected FieldLedger clone into CrewPay Field App.
- Worker app is pushed to its own repo.
- Tests pass.
- Build passes.
- Manual personal cloud backup/export exists.
- Handoff file exists.

Latest confirmed worker app commit:
82f2ac3 Add CrewPay worker app handoff

Key files:
- CREWPAY_WORKER_APP_HANDOFF.md
- src/features/exports/PersonalCloudBackupPanel.jsx
- src/features/crewpay/personalCloudBackup.js
- src/features/crewpay/crewPayIntake.js
- public/manifest.webmanifest
- README.md

Important boundary:
The worker app is not the admin workbook app.
The worker app should remain local-first and worker-facing.
CrewPay Ledger workbook remains the source of truth.

### 3. Protected FieldLedger Source

Local source remote:
fieldledger-source

Push status:
DISABLED_DO_NOT_PUSH_TO_FIELDLEDGER_SOURCE

Important boundary:
Do not push CrewPay worker app changes back to original FieldLedger source.

## Current completion state

Admin workbook app:
Working and bridged.

Worker field app:
Pushed, tested, built, and handed off.

FieldLedger source:
Protected.

## Next likely steps

- Final UI review of Worker Field App.
- Decide whether to deploy Worker Field App.
- Handle Dependabot/security alert separately.
- Add worker-to-workbook sync later only through the approved CrewPay pending intake/bridge design.
