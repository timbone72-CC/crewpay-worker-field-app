# CrewPay Field App

CrewPay Field App is a local-first worker field app for recording daily work entries, proof photos, expenses, mileage, pay-period review notes, backups, and CrewPay intake exports.

Live app:
https://timbone72-cc.github.io/crewpay-worker-field-app/

Repo:
https://github.com/timbone72-CC/crewpay-worker-field-app

Branch:
crewpay-worker-app

This branch is adapted from a protected FieldLedger clone. The goal is a distinct CrewPay worker product, not a direct visual reskin.

## Publish Method

GitHub Pages deploys from the `crewpay-worker-app` branch through `.github/workflows/pages.yml`.

The workflow runs:

```bash
npm ci
npm run test:crewpay
npm run build
```

The Vite production build publishes the `dist/` artifact to GitHub Pages.

Expected public URL:
https://timbone72-cc.github.io/crewpay-worker-field-app/

## Workbook Boundary

CrewPay Ledger workbook remains the source of truth.

The app prepares reviewable local records and export files. It does not approve payroll, replace workbook formulas, mutate final payroll logic, or connect directly to live Google Sheets in this version.

## Local Workflow

- Add work entries with worker, job/site, date, time or hours, pay type, rate reference, notes, and proof.
- Keep expenses and mileage as secondary local field tools.
- Review the current pay period before export.
- Export CrewPay Time Entries CSV for workbook intake review.
- Download JSON backups for worker-owned recovery.
- Download a proof manifest when work entries have proof/photo references.
- Use Personal Cloud Backup to download or share the backup package, then manually save it to a personal cloud folder.

## Privacy Boundary

Do not commit real worker data, customer data, Sheet IDs, Apps Script URLs, tokens, private URLs, emails, phone numbers, or addresses.

Records are stored locally in the browser. Devices do not automatically share data.

Personal Cloud Backup does not connect a cloud account or sync in the background. It only creates files the worker can download or manually save to Google Drive, iCloud, Dropbox, OneDrive, or another personal storage location.

## Protected Source Boundary

This repo was created from a protected FieldLedger clone.

Do not push CrewPay worker app changes to `fieldledger-source`.

The protected source remote should remain disabled for push:

```text
fieldledger-source DISABLED_DO_NOT_PUSH_TO_FIELDLEDGER_SOURCE
```

Push CrewPay worker app changes only to:

```text
origin crewpay-worker-app
```

## Development

```bash
npm install
npm run test:crewpay
npm run build
```

`npm run lint` currently includes legacy lint coverage and may surface pre-existing issues outside the CrewPay v1 changes.
