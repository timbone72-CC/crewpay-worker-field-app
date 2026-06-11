# CrewPay Worker Field App — Current Handoff

Repo:
https://github.com/timbone72-CC/crewpay-worker-field-app.git

Local path:
~/projects/fieldledger-clone

Branch:
crewpay-worker-app

Current status:
- Worker app converted from protected FieldLedger clone.
- Dedicated GitHub repo created.
- Branch pushed to origin/crewpay-worker-app.
- Protected FieldLedger source remote remains disabled for push.
- Tests passing.
- Production build passing.

Latest confirmed commit:
bf91e8a Add manual personal cloud backup export

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

Confirmed commands:
- npm run test:crewpay
- npm run build

Important boundary:
CrewPay Ledger workbook remains the source of truth.
This worker app is local-first and worker-facing.
No OAuth, Drive API, cloud database, background sync, stored credentials, payroll/tax/HR/banking, or admin bridge was added here.

Protected source:
fieldledger-source push remains disabled:
DISABLED_DO_NOT_PUSH_TO_FIELDLEDGER_SOURCE

Next likely steps:
- Final UI review.
- Deploy worker app if desired.
- Add worker-to-workbook sync later only through the approved CrewPay bridge/pending intake design.
