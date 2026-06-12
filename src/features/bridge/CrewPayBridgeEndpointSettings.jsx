import {
  clearCrewPayBridgeEndpoint,
  clearCrewPayBridgeToken,
  loadCrewPayBridgeEndpoint,
  loadCrewPayBridgeToken,
  saveCrewPayBridgeEndpoint,
  saveCrewPayBridgeToken,
} from "./bridgeSettingsStorage.js";
import { useState } from "react";

export default function CrewPayBridgeEndpointSettings() {
  const [bridgeEndpoint, setBridgeEndpoint] = useState(loadCrewPayBridgeEndpoint());
  const [bridgeToken, setBridgeToken] = useState(loadCrewPayBridgeToken());
  const [saveMessage, setSaveMessage] = useState("");

  function saveBridgeSettings() {
    const savedEndpoint = saveCrewPayBridgeEndpoint(bridgeEndpoint);
    const savedToken = saveCrewPayBridgeToken(bridgeToken);

    if (!savedEndpoint || !savedToken) {
      setSaveMessage("Workbook bridge settings could not be saved.");
      return;
    }

    setBridgeEndpoint(loadCrewPayBridgeEndpoint());
    setBridgeToken(loadCrewPayBridgeToken());
    setSaveMessage("Workbook bridge settings saved locally.");
  }

  function clearBridgeSettings() {
    const clearedEndpoint = clearCrewPayBridgeEndpoint();
    const clearedToken = clearCrewPayBridgeToken();

    if (!clearedEndpoint || !clearedToken) {
      setSaveMessage("Workbook bridge settings could not be cleared.");
      return;
    }

    setBridgeEndpoint("");
    setBridgeToken("");
    setSaveMessage("Workbook bridge settings cleared.");
  }

  return (
    <section className="bridge-settings-panel">
      <h3>Workbook Bridge</h3>
      <p className="helper">
        This connects only to the workbook pending intake bridge. Stored locally in this browser/device.
        Used only for manual submit to Pending Time Entries.
      </p>

      <div className="form-grid">
        <label className="field">
          Bridge Endpoint
          <input
            value={bridgeEndpoint}
            onChange={(event) => setBridgeEndpoint(event.target.value)}
            placeholder="https://example.com/bridge"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </label>

        <label className="field">
          Workbook Bridge Token
          <input
            type="password"
            value={bridgeToken}
            onChange={(event) => setBridgeToken(event.target.value)}
            placeholder="CP_BRIDGE_TOKEN"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </label>
      </div>

      <p className="helper">
        Endpoint is the Apps Script Web App URL. Token is the workbook bridge token stored in Apps Script Script Properties as <code>CP_BRIDGE_TOKEN</code>.
      </p>

      <div className="section-actions">
        <button type="button" onClick={saveBridgeSettings}>
          Save Bridge Settings
        </button>
        <button type="button" className="secondary-button" onClick={clearBridgeSettings}>
          Clear Bridge Settings
        </button>
      </div>

      {saveMessage && <p className="helper">{saveMessage}</p>}
    </section>
  );
}
