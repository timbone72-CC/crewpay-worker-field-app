import assert from "node:assert/strict";
import {
  clearCrewPayBridgeEndpoint,
  clearCrewPayBridgeToken,
  loadCrewPayBridgeEndpoint,
  loadCrewPayBridgeToken,
  saveCrewPayBridgeEndpoint,
  saveCrewPayBridgeToken,
} from "./bridgeSettingsStorage.js";
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
assert.equal(loadCrewPayBridgeToken(), "");
assert.equal(saveCrewPayBridgeEndpoint("  https://example.com/bridge  "), true);
assert.equal(loadCrewPayBridgeEndpoint(), "https://example.com/bridge");
assert.equal(saveCrewPayBridgeToken("  CP_BRIDGE_TOKEN_VALUE  "), true);
assert.equal(loadCrewPayBridgeToken(), "CP_BRIDGE_TOKEN_VALUE");
assert.equal(saveSettings({ workerId: "W-1" }), true);
assert.equal(loadCrewPayBridgeEndpoint(), "https://example.com/bridge");
assert.equal(loadCrewPayBridgeToken(), "CP_BRIDGE_TOKEN_VALUE");
assert.equal(clearCrewPayBridgeEndpoint(), true);
assert.equal(loadCrewPayBridgeEndpoint(), "");
assert.equal(clearCrewPayBridgeToken(), true);
assert.equal(loadCrewPayBridgeToken(), "");

console.log("bridgeSettingsStorage tests passed");
