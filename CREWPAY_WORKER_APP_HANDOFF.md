# CrewPay Worker Field App — Current Handoff

Repo:
https://github.com/timbone72-CC/crewpay-worker-field-app.git

Live app:
https://timbone72-cc.github.io/crewpay-worker-field-app/

Local path:
~/projects/fieldledger-clone

Branch:
crewpay-worker-app

Current status:
- Worker app converted from protected FieldLedger clone.
- Dedicated GitHub repo created.
- Branch pushed to origin/crewpay-worker-app.
- GitHub Pages workflow added for static deployment from `dist/`.
- Vite base path, manifest paths, service worker root, and service worker registration were updated for `/crewpay-worker-field-app/`.
- Protected FieldLedger source remote remains disabled for push.
- CrewPay test command is part of the Pages workflow.
- Production build command is part of the Pages workflow.

Latest publish work:
Publish CrewPay worker field app to GitHub Pages from the `crewpay-worker-app` branch.

Key completed work:
- CrewPay worker field app identity.
- CrewPay intake export support.
- Manual personal cloud backup/export option.
- JSON backup download.
- CrewPay Time Entries CSV export.
- Proof manifest export when proof refs exist.
- Web Share API save/share when supported.
- Download fallback when share/file support is unavailable.
- Restore wording updated from FieldLedger to CrewPay Field App.
- README documents workbook source-of-truth boundary and no automatic cloud sync.
- README documents live URL, repo URL, branch, build command, publish method, and protected source boundary.

Confirmed commands from prior local state:
- npm run test:crewpay
- npm run build

Publish workflow commands:
- npm ci
- npm run test:crewpay
- npm run build

Important boundary:
CrewPay Ledger workbook remains the source of truth.
This worker app is local-first and worker-facing.
No OAuth, Drive API, cloud database, background sync, stored credentials, payroll/tax/HR/banking, or admin bridge was added here.
Manual personal cloud backup is manual export/share only, not automatic sync.

Protected source:
fieldledger-source push remains disabled:
DISABLED_DO_NOT_PUSH_TO_FIELDLEDGER_SOURCE

Next likely steps:
- In GitHub repo settings, confirm Pages source is set to GitHub Actions if it is not already enabled.
- Let the Pages workflow complete.
- Open the live app URL and verify install/offline behavior.
- Add worker-to-workbook sync later only through the approved CrewPay bridge/pending intake design.
