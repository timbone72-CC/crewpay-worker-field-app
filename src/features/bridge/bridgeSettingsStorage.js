import { loadSettings, saveSettings } from "../settings/settingsStorage.js";

export function loadCrewPayBridgeEndpoint() {
  const settings = loadSettings();
  return typeof settings.bridgeEndpoint === "string" ? settings.bridgeEndpoint : "";
}

export function loadCrewPayBridgeToken() {
  const settings = loadSettings();
  return typeof settings.bridgeToken === "string" ? settings.bridgeToken : "";
}

export function saveCrewPayBridgeEndpoint(bridgeEndpoint) {
  const normalizedEndpoint = normalizeBridgeEndpoint(bridgeEndpoint);
  return saveSettings({
    bridgeEndpoint: normalizedEndpoint,
  });
}

export function saveCrewPayBridgeToken(bridgeToken) {
  const normalizedToken = normalizeBridgeToken(bridgeToken);
  return saveSettings({
    bridgeToken: normalizedToken,
  });
}

export function clearCrewPayBridgeEndpoint() {
  return saveCrewPayBridgeEndpoint("");
}

export function clearCrewPayBridgeToken() {
  return saveCrewPayBridgeToken("");
}

function normalizeBridgeEndpoint(value) {
  return String(value ?? "").trim();
}

function normalizeBridgeToken(value) {
  return String(value ?? "").trim();
}
