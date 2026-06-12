import {
  DEFAULT_HOURLY_RATE,
} from "../../shared/constants/fieldLedgerDefaults.js";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys.js";
import { loadJson, saveJson } from "../../shared/storage/localJsonStorage.js";

export function loadSettings() {
  return loadJson(STORAGE_KEYS.SETTINGS, createDefaultSettings());
}

export function saveSettings(settings) {
  const existingSettings = loadSettings();

  return saveJson(STORAGE_KEYS.SETTINGS, {
    ...createDefaultSettings(),
    ...existingSettings,
    ...settings,
    updatedAt: new Date().toISOString(),
  });
}

export function createDefaultSettings() {
  return {
    hourlyRate: DEFAULT_HOURLY_RATE,
    workerId: "",
    workerName: "",
    defaultPayType: "hourly",
    defaultRateRef: "",
    bridgeEndpoint: "",
  };
}
