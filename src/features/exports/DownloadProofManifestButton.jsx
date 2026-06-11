import { buildProofManifest } from "../crewpay/crewPayIntake.js";
import { loadActivePayPeriod } from "../pay-periods/activePayPeriodStorage.js";

export default function DownloadProofManifestButton() {
  function downloadManifest() {
    const payPeriod = loadActivePayPeriod();
    const proofManifest = buildProofManifest(payPeriod.jobs);
    const blob = new Blob([JSON.stringify(proofManifest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "crewpay-proof-manifest.json";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={downloadManifest}>
      Download Proof Manifest
    </button>
  );
}
