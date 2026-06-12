import {
  clearCrewPayBridgeEndpoint,
  loadCrewPayBridgeEndpoint,
  saveCrewPayBridgeEndpoint,
} from "./bridgeSettingsStorage.js";
import { useState } from "react";

export default function CrewPayBridgeEndpointSettings() {
  const [bridgeEndpoint, setBridgeEndpoint] = useState(loadCrewPayBridgeEndpoint());
  const [saveMessage, setSaveMessage] = useState("");

  function saveEndpoint() {
    const saved = saveCrewPayBridgeEndpoint(bridgeEndpoint);

    if (!saved) {
      setSaveMessage("Workbook bridge endpoint could not be saved.");
      return;
    }

    setBridgeEndpoint(loadCrewPayBridgeEndpoint());
    setSaveMessage(bridgeEndpoint.trim() ? "Workbook bridge endpoint saved locally." : "Workbook bridge endpoint cleared.");
  }

  function clearEndpoint() {
    const cleared = clearCrewPayBridgeEndpoint();

    if (!cleared) {
      setSaveMessage("Workbook bridge endpoint could not be cleared.");
      return;
    }

    setBridgeEndpoint("");
    setSaveMessage("Workbook bridge endpoint cleared.");
  }

  return (
    <section className="bridge-settings-panel">
      <h3>Workbook Bridge</h3>
      <p className="helper">
        This connects only to the workbook pending intake bridge. No token is stored here.
      </p>

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

      <div className="section-actions">
        <button type="button" onClick={saveEndpoint}>
          Save Bridge Endpoint
        </button>
        <button type="button" className="secondary-button" onClick={clearEndpoint}>
          Clear Bridge Endpoint
        </button>
      </div>

      {saveMessage && <p className="helper">{saveMessage}</p>}
    </section>
  );
}
