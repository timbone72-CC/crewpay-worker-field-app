import assert from "node:assert/strict";
import {
  buildPersonalCloudBackupFiles,
  buildSafePayPeriodLabel,
  canShareFiles,
} from "./personalCloudBackup.js";

const payPeriod = {
  label: "June 1-15, 2026",
  jobs: [
    {
      id: "entry-1",
      workerId: "W-100",
      workerName: "Worker One",
      entryDate: "2026-06-11",
      jobId: "JOB-1",
      jobName: "Install",
      siteName: "Primary Site",
      companyName: "Customer",
      startTime: "08:00",
      endTime: "16:00",
      hoursWorked: 8,
      payType: "hourly",
      rateRef: "standard",
      notes: "Ready",
      proofRefs: [{ proofId: "proof-1", type: "photo", name: "proof.jpg", localOnly: true }],
      localStatus: "ready",
      createdAt: "2026-06-11T13:00:00.000Z",
      updatedAt: "2026-06-11T14:00:00.000Z",
    },
  ],
};

const backupFiles = buildPersonalCloudBackupFiles(payPeriod);
assert.equal(backupFiles.length, 3);
assert.deepEqual(
  backupFiles.map((file) => file.name),
  [
    "crewpay-field-app-backup-june-1-15-2026.json",
    "crewpay-time-entries-june-1-15-2026.csv",
    "crewpay-proof-manifest-june-1-15-2026.json",
  ],
);
assert.match(backupFiles[0].content, /"jobs"/);
assert.match(backupFiles[1].content, /Schema Version,Local Entry ID,Worker ID/);
assert.match(backupFiles[2].content, /"proofEntries"/);

const noProofFiles = buildPersonalCloudBackupFiles({ label: "No Proof", jobs: [{ ...payPeriod.jobs[0], proofRefs: [] }] });
assert.equal(noProofFiles.length, 2);

const forbiddenSamples = [
  ["Tim", "othy"].join(""),
  ["Leg", "end"].join(""),
  ["ble", "ger"].join(""),
];
backupFiles.forEach((file) => {
  forbiddenSamples.forEach((sample) => {
    assert.ok(!file.content.includes(sample));
  });
});

assert.equal(buildSafePayPeriodLabel({ label: "  Current Pay Period!! " }), "current-pay-period");
assert.equal(canShareFiles({}, [{ name: "backup.json" }]), false);
assert.equal(
  canShareFiles(
    {
      share() {},
      canShare(payload) {
        return payload.files.length === 1;
      },
    },
    [{ name: "backup.json" }],
  ),
  true,
);
