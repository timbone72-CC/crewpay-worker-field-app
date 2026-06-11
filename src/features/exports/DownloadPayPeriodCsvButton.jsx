import { loadActivePayPeriod } from "../pay-periods/activePayPeriodStorage.js";
import { buildPayPeriodCsv } from "./payPeriodCsv.js";

export default function DownloadPayPeriodCsvButton() {
  function downloadCsv() {
    const payPeriod = loadActivePayPeriod();
    const csvContent = buildPayPeriodCsv(payPeriod);
    const fileName = buildFileName(payPeriod);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={downloadCsv}>
      Export CrewPay Time Entries CSV
    </button>
  );
}


function buildFileName(payPeriod) {
  const label = payPeriod?.label || "current-pay-period";
  const safeLabel = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `crewpay-time-entries-${safeLabel || "pay-period"}.csv`;
}
