/**
 * 1. CrewPay Field App Active Pay Period Validation
 *
 * Central shape validation for saved pay period data.
 * This checks structure only. It does not repair data.
 */

export function validateActivePayPeriod(payPeriod) {
  const errors = [];

  if (!payPeriod || typeof payPeriod !== "object" || Array.isArray(payPeriod)) {
    return {
      isValid: false,
      errors: ["Pay period must be an object."],
    };
  }

  validateString(errors, payPeriod.id, "id");
  validateString(errors, payPeriod.label, "label");
  validateString(errors, payPeriod.startDate, "startDate");
  validateString(errors, payPeriod.endDate, "endDate");
  validateString(errors, payPeriod.status, "status");
  validateNumber(errors, payPeriod.schemaVersion, "schemaVersion");
  validateArray(errors, payPeriod.jobs, "jobs");
  validateArray(errors, payPeriod.expenses, "expenses");
  validateArray(errors, payPeriod.mileageEntries, "mileageEntries");

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 2. Field Helpers
 */

function validateString(errors, value, fieldName) {
  if (typeof value !== "string") {
    errors.push(`${fieldName} must be a string.`);
  }
}

function validateNumber(errors, value, fieldName) {
  if (typeof value !== "number") {
    errors.push(`${fieldName} must be a number.`);
  }
}

function validateArray(errors, value, fieldName) {
  if (!Array.isArray(value)) {
    errors.push(`${fieldName} must be an array.`);
  }
}
