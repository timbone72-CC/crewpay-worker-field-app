import { loadActivePayPeriod } from "../pay-periods/activePayPeriodStorage.js";

export default function DownloadPayPeriodJsonButton() {
  function downloadJson() {
    const payPeriod = loadActivePayPeriod();
    const fileName = buildFileName(payPeriod);
    const fileContent = JSON.stringify(payPeriod, null, 2);
    const blob = new Blob([fileContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={downloadJson}>
      Download JSON Backup
    </button>
  );
}

function buildFileName(payPeriod) {
  const label = payPeriod?.label || "current-pay-period";
  const safeLabel = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `crewpay-field-app-backup-${safeLabel || "pay-period"}.json`;
}
