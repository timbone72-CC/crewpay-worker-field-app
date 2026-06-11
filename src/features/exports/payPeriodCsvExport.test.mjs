import assert from "node:assert/strict";
import { buildPayPeriodCsv } from "./payPeriodCsv.js";

const payPeriod = {
  label: "May 2026",
  startDate: "2026-05-01",
  endDate: "2026-05-15",
  jobs: [
    {
      id: "local-1",
      schemaVersion: 1,
      workerId: "W-100",
      workerName: "Worker One",
      entryDate: "2026-05-02",
      jobId: "JOB-100",
      jobName: "Install",
      siteName: "Primary Site",
      companyName: "Customer",
      startTime: "08:00",
      endTime: "14:00",
      hoursWorked: 6,
      payType: "hourly",
      rateRef: "standard",
      notes: "Ready for review",
      proofRefs: [{ proofId: "proof-1" }],
      localStatus: "ready",
      submittedAt: "",
      createdAt: "2026-05-02T14:00:00.000Z",
      updatedAt: "2026-05-02T14:30:00.000Z",
    },
    {
      id: "local-2",
      schemaVersion: 1,
      workerId: "W-101",
      workerName: "Worker Two",
      entryDate: "2026-05-03",
      jobId: "JOB-200",
      jobName: "Repair, Inspect",
      siteName: "Secondary Site",
      companyName: "Customer",
      startTime: "09:00",
      endTime: "12:30",
      hoursWorked: 3.5,
      payType: "hourly",
      rateRef: "standard",
      notes: "Quote \"checked\" and newline\nsafe",
      proofRefs: [],
      localStatus: "draft",
      submittedAt: "",
      createdAt: "2026-05-03T12:30:00.000Z",
      updatedAt: "2026-05-03T12:35:00.000Z",
    },
    {
      jobType: "standard_work",
      date: "2026-05-02",
      company: "Customer",
      rigNameOrNumber: "Primary Site",
      fieldTicketNumber: "JOB-300",
      hoursWorked: 4,
      totalPay: 0,
    },
  ],
  mileageEntries: [
    {
      miles: 10,
      mileageRateSnapshot: 0.67,
      businessPurpose: "Test mileage",
    },
  ],
};

const csv = buildPayPeriodCsv(payPeriod);
const rows = csv.split("\n").map((row) => row.split(","));

const headerRow = rows[0];
assert.deepEqual(headerRow, [
  "Schema Version",
  "Local Entry ID",
  "Worker ID",
  "Worker Name",
  "Entry Date",
  "Job ID",
  "Job Name",
  "Site Name",
  "Company Name",
  "Start Time",
  "End Time",
  "Hours Worked",
  "Pay Type",
  "Rate Ref",
  "Notes",
  "Proof Count",
  "Local Status",
  "Submitted At",
  "Created At",
  "Updated At",
]);

const firstEntryRow = rows.find((row) => row[1] === "local-1");
assert.deepEqual(firstEntryRow, [
  "1",
  "local-1",
  "W-100",
  "Worker One",
  "2026-05-02",
  "JOB-100",
  "Install",
  "Primary Site",
  "Customer",
  "08:00",
  "14:00",
  "6",
  "hourly",
  "standard",
  "Ready for review",
  "1",
  "ready",
  "",
  "2026-05-02T14:00:00.000Z",
  "2026-05-02T14:30:00.000Z",
]);

assert.match(csv, /"Repair, Inspect"/);
assert.match(csv, /"Quote ""checked"" and newline\nsafe"/);

assert.doesNotMatch(csv, /mileageEntries/);
assert.doesNotMatch(csv, /mileageRateSnapshot/);
assert.doesNotMatch(csv, /businessPurpose/);

console.log("payPeriodCsvExport tests passed");
