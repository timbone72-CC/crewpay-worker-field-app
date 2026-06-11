import DownloadPayPeriodCsvButton from "./DownloadPayPeriodCsvButton.jsx";
import DownloadPayPeriodJsonButton from "./DownloadPayPeriodJsonButton.jsx";
import DownloadProofManifestButton from "./DownloadProofManifestButton.jsx";
import ImportPayPeriodJsonButton from "./ImportPayPeriodJsonButton.jsx";
import PersonalCloudBackupPanel from "./PersonalCloudBackupPanel.jsx";
import ClearPayPeriodButton from "../pay-periods/ClearPayPeriodButton.jsx";

export default function ExportActionsDropdown({ onShowTimesheet, onDataChanged }) {
  function handlePrintTimesheet() {
    if (typeof onShowTimesheet === "function") {
      onShowTimesheet();
    }

    document.body.classList.add("print-timesheet");

    setTimeout(() => {
      window.print();

      setTimeout(() => {
        document.body.classList.remove("print-timesheet");
      }, 200);
    }, 300);
  }

  return (
    <details className="export-actions">
      <summary>Export / Backup</summary>

      <div className="export-actions-menu">
        <p className="helper">
          CrewPay Field App data is saved in this browser. Use Download JSON Backup when you want a
          manual copy before switching devices, clearing browser data, or importing a replacement
          backup. Clear Pay Period downloads its own safety backup before clearing.
        </p>

        <p className="helper">
          Proof photos and receipt photos are stored locally on this device. JSON backups, CSV files,
          and proof manifests keep photo names and proof references, but they do not include the
          actual image files. Save or share important photos separately if you need them outside this
          device.
        </p>

        <p className="helper">
          <strong>Backup / Restore</strong>
        </p>
        <PersonalCloudBackupPanel />
        <DownloadPayPeriodJsonButton />
        <ImportPayPeriodJsonButton onImportComplete={onDataChanged} />

        <p className="helper">
          <strong>CrewPay Intake / Reports</strong>
        </p>
        <DownloadPayPeriodCsvButton />
        <DownloadProofManifestButton />

        <button type="button" onClick={handlePrintTimesheet}>
          Print Worker Timesheet
        </button>

        <p className="helper">
          <strong>Danger Zone</strong>
        </p>
        <ClearPayPeriodButton onPayPeriodCleared={onDataChanged} />
      </div>
    </details>
  );
}
