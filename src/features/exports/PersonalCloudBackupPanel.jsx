import { buildPersonalCloudBackupFiles, canShareFiles } from "../crewpay/personalCloudBackup.js";
import { loadActivePayPeriod } from "../pay-periods/activePayPeriodStorage.js";

export default function PersonalCloudBackupPanel() {
  function buildBrowserFiles() {
    return buildPersonalCloudBackupFiles(loadActivePayPeriod()).map((backupFile) => ({
      ...backupFile,
      file: new File([backupFile.content], backupFile.name, { type: backupFile.type }),
    }));
  }

  function downloadBackupPackage() {
    buildPersonalCloudBackupFiles(loadActivePayPeriod()).forEach(downloadTextFile);
  }

  async function shareBackupPackage() {
    if (typeof File !== "function") {
      downloadBackupPackage();
      return;
    }

    const browserFiles = buildBrowserFiles();
    const files = browserFiles.map((backupFile) => backupFile.file);

    if (!canShareFiles(navigator, files)) {
      downloadBackupPackage();
      return;
    }

    try {
      await navigator.share({
        title: "CrewPay Field App Backup",
        text: "Manual CrewPay Field App backup files. Save them to your personal cloud folder if needed. Photo files are not included.",
        files,
      });
    } catch (error) {
      if (error?.name !== "AbortError") {
        downloadBackupPackage();
      }
    }
  }

  return (
    <section className="personal-cloud-panel">
      <div className="section-heading">
        <span className="section-kicker">Manual Backup</span>
        <h3>Personal Cloud Backup</h3>
      </div>

      <p className="helper">
        Data stays on this device until you export it. Nothing is automatically uploaded,
        synced, or connected to a cloud account.
      </p>

      <p className="helper">
        Download these files, then manually save them to Google Drive, iCloud, Dropbox,
        OneDrive, or another personal cloud folder. CrewPay Ledger workbook remains the
        payroll source of truth.
      </p>

      <p className="helper">
        Backup files include JSON data, the CrewPay CSV, and proof manifests when proof
        references exist. They keep photo names and reference details, but they do not
        include the actual photo or receipt image files from this device.
      </p>

      <div className="section-actions">
        <button type="button" onClick={downloadBackupPackage}>
          Download Backup Files
        </button>
        <button type="button" className="secondary-button" onClick={shareBackupPackage}>
          Share / Save Files
        </button>
      </div>
    </section>
  );
}

function downloadTextFile(backupFile) {
  const blob = new Blob([backupFile.content], { type: backupFile.type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = backupFile.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
