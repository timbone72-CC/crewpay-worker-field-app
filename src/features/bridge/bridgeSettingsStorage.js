import { loadSettings, saveSettings } from "../settings/settingsStorage.js";

export function loadCrewPayBridgeEndpoint() {
  const settings = loadSettings();
  return typeof settings.bridgeEndpoint === "string" ? settings.bridgeEndpoint : "";
}

export function saveCrewPayBridgeEndpoint(bridgeEndpoint) {
  const normalizedEndpoint = normalizeBridgeEndpoint(bridgeEndpoint);
  return saveSettings({
    bridgeEndpoint: normalizedEndpoint,
  });
}

export function clearCrewPayBridgeEndpoint() {
  return saveCrewPayBridgeEndpoint("");
}

function normalizeBridgeEndpoint(value) {
  return String(value ?? "").trim();
}
