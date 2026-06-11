import { STORAGE_KEYS } from "../../shared/constants/storageKeys.js";
import { loadJson, removeJson, saveJson } from "../../shared/storage/localJsonStorage.js";
import { validateActivePayPeriod } from "../../shared/utils/validateActivePayPeriod.js";

const ACTIVE_PAY_PERIOD_SCHEMA_VERSION = 1;

export function loadActivePayPeriod() {
  return validateNormalizedPayPeriod(
    normalizePayPeriod(loadJson(STORAGE_KEYS.ACTIVE_PAY_PERIOD, createEmptyPayPeriod()))
  );
}

export function saveActivePayPeriod(payPeriod) {
  return saveJson(STORAGE_KEYS.ACTIVE_PAY_PERIOD, validateNormalizedPayPeriod(normalizePayPeriod(payPeriod)));
}

export function clearActivePayPeriod() {
  return removeJson(STORAGE_KEYS.ACTIVE_PAY_PERIOD);
}

export function createEmptyPayPeriod() {
  return {
    id: "active",
    label: "Current Pay Period",
    startDate: "",
    endDate: "",
    status: "open",
    jobs: [],
    expenses: [],
    schemaVersion: ACTIVE_PAY_PERIOD_SCHEMA_VERSION,
    mileageEntries: [],
  };
}

function validateNormalizedPayPeriod(payPeriod) {
  const validation = validateActivePayPeriod(payPeriod);

  if (validation.isValid) {
    return payPeriod;
  }

  if (typeof window.dispatchEvent === "function" && typeof window.CustomEvent === "function") {
    window.dispatchEvent(
      new window.CustomEvent("fieldledger:storage-recovery", {
        detail: {
          message:
            "CrewPay Field App found saved pay-period data with an invalid structure and loaded a safe blank version instead. If you have a backup JSON file, use Import JSON to restore it.",
        },
      })
    );
  }

  return createEmptyPayPeriod();
}

function normalizePayPeriod(payPeriod) {
  const emptyPayPeriod = createEmptyPayPeriod();

  if (!payPeriod || typeof payPeriod !== "object" || Array.isArray(payPeriod)) {
    return emptyPayPeriod;
  }

  const safeJobs = Array.isArray(payPeriod.jobs)
    ? payPeriod.jobs.filter((job) => {
        return (
          job &&
          typeof job === "object" &&
          typeof job.id === "string" &&
          typeof job.payPeriodId === "string" &&
          typeof job.jobType === "string" &&
          typeof job.totalPay === "number"
        );
      })
    : [];

  const safeExpenses = Array.isArray(payPeriod.expenses)
    ? payPeriod.expenses.filter((expense) => {
        return (
          expense &&
          typeof expense === "object" &&
          typeof expense.id === "string" &&
          typeof expense.payPeriodId === "string" &&
          typeof expense.amount === "number"
        );
      })
    : [];

  const safeMileage = Array.isArray(payPeriod.mileageEntries)
    ? payPeriod.mileageEntries.filter((entry) => {
        return (
          entry &&
          typeof entry === "object" &&
          typeof entry.id === "string" &&
          typeof entry.payPeriodId === "string" &&
          typeof entry.miles === "number"
        );
      })
    : [];

  return {
    ...emptyPayPeriod,
    ...payPeriod,
    id: typeof payPeriod.id === "string" && payPeriod.id ? payPeriod.id : emptyPayPeriod.id,
    label: typeof payPeriod.label === "string" ? payPeriod.label : emptyPayPeriod.label,
    startDate: typeof payPeriod.startDate === "string" ? payPeriod.startDate : emptyPayPeriod.startDate,
    endDate: typeof payPeriod.endDate === "string" ? payPeriod.endDate : emptyPayPeriod.endDate,
    status: typeof payPeriod.status === "string" ? payPeriod.status : emptyPayPeriod.status,
    schemaVersion: ACTIVE_PAY_PERIOD_SCHEMA_VERSION,
    jobs: safeJobs,
    expenses: safeExpenses,
    mileageEntries: safeMileage,
  };
}
