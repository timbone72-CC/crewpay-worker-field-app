import { useState } from "react";
import { APP_NAME, APP_VERSION_DATE, APP_VERSION_LABEL, APP_VERSION_NOTE } from "../../shared/constants/appInfo.js";
import { loadSettings, saveSettings } from "./settingsStorage.js";
import CrewPayBridgeEndpointSettings from "../bridge/CrewPayBridgeEndpointSettings.jsx";

export default function SettingsPanel() {
  const savedSettings = loadSettings();

  const [workerId, setWorkerId] = useState(savedSettings.workerId || "");
  const [workerName, setWorkerName] = useState(savedSettings.workerName || "");
  const [defaultPayType, setDefaultPayType] = useState(savedSettings.defaultPayType || "hourly");
  const [defaultRateRef, setDefaultRateRef] = useState(savedSettings.defaultRateRef || "");
  const [hourlyRate, setHourlyRate] = useState(savedSettings.hourlyRate || 0);
  const [saveMessage, setSaveMessage] = useState("");

  function saveUserSettings() {
    const saved = saveSettings({
      workerId,
      workerName,
      defaultPayType,
      defaultRateRef,
      hourlyRate: Number(hourlyRate || 0),
    });

    if (!saved) {
      setSaveMessage("");
      return;
    }

    setSaveMessage("Worker settings saved locally.");
  }

  async function updateApp() {
    if (!navigator.onLine) {
      window.alert(
        "You appear to be offline. Reconnect before refreshing the installed app shell. Local records stay on this device."
      );
      return;
    }

    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      if ("caches" in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith("crewpay-field-app-"))
            .map((cacheName) => window.caches.delete(cacheName)),
        );
      }
    } finally {
      window.location.reload();
    }
  }

  return (
    <section className="panel settings-panel">
      <h2>Worker Settings</h2>

      <div className="form-grid">
        <label className="field">
          Worker ID
          <input value={workerId} onChange={(event) => setWorkerId(event.target.value)} />
        </label>

        <label className="field">
          Worker Name
          <input value={workerName} onChange={(event) => setWorkerName(event.target.value)} />
        </label>

        <label className="field">
          Default Pay Type
          <input value={defaultPayType} onChange={(event) => setDefaultPayType(event.target.value)} />
        </label>

        <label className="field">
          Rate Reference
          <input value={defaultRateRef} onChange={(event) => setDefaultRateRef(event.target.value)} />
        </label>

        <label className="field">
          Optional Local Rate
          <input
            type="number"
            min="0"
            step="0.01"
            value={hourlyRate}
            onChange={(event) => setHourlyRate(event.target.value)}
          />
        </label>
      </div>

      <p className="helper">
        Rate references are for CrewPay workbook review. The workbook remains the source of truth for approved payroll values.
      </p>

      <button type="button" onClick={saveUserSettings}>
        Save Worker Settings
      </button>

      <CrewPayBridgeEndpointSettings />

      <div className="helper">
        <strong>App Version:</strong> {APP_NAME} - {APP_VERSION_LABEL}
        <br />
        Current update: {APP_VERSION_DATE} - {APP_VERSION_NOTE}
      </div>

      <button type="button" onClick={updateApp}>
        Refresh Installed App
      </button>

      {saveMessage && <p className="helper">{saveMessage}</p>}
    </section>
  );
}
