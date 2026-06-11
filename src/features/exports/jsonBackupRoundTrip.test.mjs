import assert from "node:assert/strict";

const originalPayPeriod = {
  id: "active",
  label: "Integrity Test Pay Period",
  startDate: "2026-05-01",
  endDate: "2026-05-15",
  status: "open",
  schemaVersion: 1,
  jobs: [
    {
      id: "job-1",
      payPeriodId: "active",
      jobType: "standard_work",
      schemaVersion: 1,
      workerId: "W-100",
      workerName: "Worker One",
      entryDate: "2026-05-06",
      jobId: "JOB-1001",
      jobName: "Crew support",
      siteName: "Primary Site",
      companyName: "Customer",
      startTime: "08:00",
      endTime: "14:00",
      hoursWorkedCrewPay: 6,
      payType: "hourly",
      rateRef: "standard",
      localStatus: "ready",
      date: "2026-05-06",
      company: "Customer",
      rigNameOrNumber: "Primary Site",
      fieldTicketNumber: "JOB-1001",
      hoursWorked: 6,
      hourlyRateSnapshot: 28,
      transportation: 25,
      ticketPhotoId: "ticket-photo-1",
      notes: "CrewPay test work",
      totalPay: 168,
    },
  ],
  expenses: [
    {
      id: "expense-1",
      payPeriodId: "active",
      date: "2026-05-06",
      vendor: "Pilot",
      category: "Fuel",
      amount: 42.5,
      receiptPhotoId: "receipt-photo-1",
      notes: "Fuel receipt",
    },
  ],
  mileageEntries: [
    {
      id: "mileage-1",
      payPeriodId: "active",
      date: "2026-05-06",
      vehicle: "Truck",
      startLocation: "Yard",
      endLocation: "Rig",
      businessPurpose: "Field work",
      miles: 120,
      mileageRateSnapshot: 0.67,
      notes: "Round trip",
      createdAt: "2026-05-06T12:00:00.000Z",
      updatedAt: "2026-05-06T12:00:00.000Z",
    },
  ],
};

const exportedText = JSON.stringify(originalPayPeriod, null, 2);
const restoredPayPeriod = JSON.parse(exportedText);

assert.deepEqual(restoredPayPeriod, originalPayPeriod);
assert.deepEqual(restoredPayPeriod.jobs, originalPayPeriod.jobs);
assert.deepEqual(restoredPayPeriod.expenses, originalPayPeriod.expenses);
assert.deepEqual(restoredPayPeriod.mileageEntries, originalPayPeriod.mileageEntries);
assert.equal(restoredPayPeriod.schemaVersion, 1);

assert.equal(restoredPayPeriod.jobs[0].ticketPhotoId, "ticket-photo-1");
assert.equal(restoredPayPeriod.expenses[0].receiptPhotoId, "receipt-photo-1");
assert.equal(restoredPayPeriod.mileageEntries[0].vehicle, "Truck");

const grossEarnings = restoredPayPeriod.jobs.reduce((sum, job) => sum + job.totalPay, 0);
const expenseTotal = restoredPayPeriod.expenses.reduce((sum, expense) => sum + expense.amount, 0);
const mileageTotal = restoredPayPeriod.mileageEntries.reduce(
  (sum, entry) => sum + entry.miles * entry.mileageRateSnapshot,
  0,
);

assert.equal(grossEarnings, 168);
assert.equal(expenseTotal, 42.5);
assert.equal(mileageTotal, 80.4);

console.log("jsonBackupRoundTrip tests passed");
