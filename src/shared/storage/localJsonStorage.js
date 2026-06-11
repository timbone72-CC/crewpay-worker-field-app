const STORAGE_RECOVERY_EVENT = "fieldledger:storage-recovery";

function notifyStorageRecovery(message) {
  if (typeof window.dispatchEvent !== "function" || typeof window.CustomEvent !== "function") {
    return;
  }

  window.dispatchEvent(
    new window.CustomEvent(STORAGE_RECOVERY_EVENT, {
      detail: { message },
    })
  );
}

export function loadJson(key, fallbackValue) {
  try {
    const storedValue = window.localStorage.getItem(key);

    if (!storedValue) {
      return fallbackValue;
    }

    return JSON.parse(storedValue);
  } catch {
    notifyStorageRecovery(
      "CrewPay Field App found corrupted saved data and loaded a safe blank version instead. If you have a backup JSON file, use Import JSON to restore it."
    );

    return fallbackValue;
  }
}

export function saveJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    window.alert("CrewPay Field App could not save this data. Your browser storage may be full or blocked.");
    return false;
  }
}

export function removeJson(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    window.alert("CrewPay Field App could not remove this data. Your browser storage may be blocked.");
    return false;
  }
}
