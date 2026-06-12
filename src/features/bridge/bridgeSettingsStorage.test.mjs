import assert from "node:assert/strict";
import { clearCrewPayBridgeEndpoint, loadCrewPayBridgeEndpoint, saveCrewPayBridgeEndpoint } from "./bridgeSettingsStorage.js";
import { saveSettings } from "../settings/settingsStorage.js";

const storage = new Map();

global.window = {
  localStorage: {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, value);
    },
    removeItem(key) {
      storage.delete(key);
    },
  },
};

assert.equal(loadCrewPayBridgeEndpoint(), "");
assert.equal(saveCrewPayBridgeEndpoint("  https://example.com/bridge  "), true);
assert.equal(loadCrewPayBridgeEndpoint(), "https://example.com/bridge");
assert.equal(saveSettings({ workerId: "W-1" }), true);
assert.equal(loadCrewPayBridgeEndpoint(), "https://example.com/bridge");
assert.equal(clearCrewPayBridgeEndpoint(), true);
assert.equal(loadCrewPayBridgeEndpoint(), "");

console.log("bridgeSettingsStorage tests passed");
