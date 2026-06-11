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

Live app:
https://timbone72-cc.github.io/crewpay-worker-field-app/

Branch:
crewpay-worker-app

Purpose:
Worker-facing local-first field app.

Current status:
- Converted from protected FieldLedger clone into CrewPay Field App.
- Worker app is pushed to its own repo.
- GitHub Pages workflow exists for static deployment.
- Vite base path, manifest paths, service worker root, and service worker registration match `/crewpay-worker-field-app/`.
- Tests pass in the prior confirmed local state.
- Build passes in the prior confirmed local state.
- Pages workflow runs `npm run test:crewpay` and `npm run build` before deployment.
- Manual personal cloud backup/export exists.
- Handoff file exists.

Key files:
- .github/workflows/pages.yml
- CREWPAY_WORKER_APP_HANDOFF.md
- src/features/exports/PersonalCloudBackupPanel.jsx
- src/features/crewpay/personalCloudBackup.js
- src/features/crewpay/crewPayIntake.js
- public/manifest.webmanifest
- public/sw.js
- src/main.jsx
- vite.config.js
- README.md

Important boundary:
The worker app is not the admin workbook app.
The worker app should remain local-first and worker-facing.
CrewPay Ledger workbook remains the source of truth.
Manual personal cloud backup is manual export/share only, not automatic sync.

### 3. Protected FieldLedger Source

Local source remote:
fieldledger-source

Push status:
Disabled for push.

Important boundary:
Do not push CrewPay worker app changes back to original FieldLedger source.

## Current completion state

Admin workbook app:
Working and bridged.

Worker field app:
Pushed, tested, built, handed off, and configured for GitHub Pages deployment.

FieldLedger source:
Protected.

## Next likely steps

- In GitHub repo settings, confirm Pages source is set to GitHub Actions if it is not already enabled.
- Let the Pages workflow complete.
- Open the live app URL and verify install/offline behavior.
- Handle Dependabot/security alert separately.
- Add worker-to-workbook sync later only through the approved CrewPay pending intake/bridge design.

## Worker App Final Publish Status

Status date:
2026-06-11

Current safe head:
999158c Fix export copy test whitespace match

Live URL:
https://timbone72-cc.github.io/crewpay-worker-field-app/

Final verified state:
- GitHub Pages deploy succeeded.
- Live bundle includes worker timesheet wording, proof/photo backup warnings, total hours, and proof refs.
- Full worker app tests pass with npm run test:worker-app.
- Production build passes with npm run build.
- Branch is clean/aligned with origin/crewpay-worker-app.

Worker app boundary:
- Worker-facing local-first field app.
- CrewPay Ledger workbook remains source of truth.
- No backend, admin dashboard, tax system, banking system, cloud sync, OAuth, or live Google Sheets submission added.
