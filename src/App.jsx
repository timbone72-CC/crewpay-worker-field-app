import { useEffect, useState } from "react";
import "./App.css";
import ExpenseEntryForm from "./features/expenses/ExpenseEntryForm.jsx";
import SavedExpensesList from "./features/expenses/SavedExpensesList.jsx";
import ExportActionsDropdown from "./features/exports/ExportActionsDropdown.jsx";
import JobEntryForm from "./features/jobs/JobEntryForm.jsx";
import SavedJobsList from "./features/jobs/SavedJobsList.jsx";
import MileageEntryForm from "./features/mileage/MileageEntryForm.jsx";
import SavedMileageList from "./features/mileage/SavedMileageList.jsx";
import PayPeriodInfoForm from "./features/pay-periods/PayPeriodInfoForm.jsx";
import PayPeriodSummaryPanel from "./features/pay-periods/PayPeriodSummaryPanel.jsx";
import ReviewRecordsPanel from "./features/review/ReviewRecordsPanel.jsx";
import SettingsPanel from "./features/settings/SettingsPanel.jsx";
import HelpPanel from "./features/help/HelpPanel.jsx";
import TimesheetPrintView from "./features/exports/TimesheetPrintView.jsx";
import { APP_NAME } from "./shared/constants/appInfo.js";

const TABS = {
  HOME: "home",
  WORK: "work",
  REVIEW: "review",
  TOOLS: "tools",
  SETTINGS: "settings",
  HELP: "help",
};

export default function App() {
  const [activeTab, setActiveTab] = useState(TABS.HOME);
  const [refreshCount, setRefreshCount] = useState(0);
  const [showTimesheetPrintView, setShowTimesheetPrintView] = useState(false);
  const [storageRecoveryMessage, setStorageRecoveryMessage] = useState("");

  useEffect(() => {
    function handleStorageRecovery(event) {
      setStorageRecoveryMessage(event.detail?.message || `${APP_NAME} recovered from a storage problem.`);
    }

    window.addEventListener("fieldledger:storage-recovery", handleStorageRecovery);

    return () => {
      window.removeEventListener("fieldledger:storage-recovery", handleStorageRecovery);
    };
  }, []);

  function refreshAppData() {
    setRefreshCount((currentCount) => currentCount + 1);
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">CrewPay Worker Field App</p>
        <h1>Daily work entries, proof, review, and CrewPay export.</h1>
        <p className="subtext">
          Save worker-owned records locally, review the current pay period, and export a
          CrewPay intake package for workbook review.
        </p>
        <div className="hero-actions">
          <button type="button" onClick={() => setActiveTab(TABS.WORK)}>
            Add Work Entry
          </button>
          <button type="button" className="secondary-button" onClick={() => setActiveTab(TABS.REVIEW)}>
            Review & Export
          </button>
        </div>
      </section>

      {storageRecoveryMessage && (
        <section className="storage-recovery-banner" role="alert">
          <strong>Storage recovery notice</strong>
          <p>{storageRecoveryMessage}</p>
          <button type="button" onClick={() => setStorageRecoveryMessage("")}>
            Dismiss
          </button>
        </section>
      )}

      <nav className="tab-bar" aria-label="CrewPay Field App sections">
        <TabButton activeTab={activeTab} tab={TABS.HOME} onSelect={setActiveTab}>Today</TabButton>
        <TabButton activeTab={activeTab} tab={TABS.WORK} onSelect={setActiveTab}>Work</TabButton>
        <TabButton activeTab={activeTab} tab={TABS.REVIEW} onSelect={setActiveTab}>Review</TabButton>
        <TabButton activeTab={activeTab} tab={TABS.TOOLS} onSelect={setActiveTab}>Tools</TabButton>
        <TabButton activeTab={activeTab} tab={TABS.SETTINGS} onSelect={setActiveTab}>Settings</TabButton>
        <TabButton activeTab={activeTab} tab={TABS.HELP} onSelect={setActiveTab}>Help</TabButton>
      </nav>

      {activeTab === TABS.HOME && (
        <>
          <section className="data-ownership-notice">
            <strong>Workbook boundary</strong>
            <p>
              CrewPay Ledger workbook remains the source of truth. This app prepares local
              worker records and reviewable exports; it does not approve or override payroll.
            </p>
          </section>
          <PayPeriodSummaryPanel key={`summary-${refreshCount}`} />
          <section className="panel action-panel">
            <h2>Start Fast</h2>
            <div className="quick-action-grid">
              <button type="button" onClick={() => setActiveTab(TABS.WORK)}>Add Work Entry</button>
              <button type="button" onClick={() => setActiveTab(TABS.REVIEW)}>Review Current Period</button>
              <button type="button" className="secondary-button" onClick={() => setActiveTab(TABS.TOOLS)}>Expenses & Mileage</button>
            </div>
          </section>
        </>
      )}

      {activeTab === TABS.WORK && (
        <>
          <SavedJobsList key={`jobs-${refreshCount}`} onJobDeleted={refreshAppData} />
          <JobEntryForm onJobSaved={refreshAppData} />
        </>
      )}

      {activeTab === TABS.REVIEW && (
        <>
          <PayPeriodInfoForm key={`pay-period-info-${refreshCount}`} />
          <PayPeriodSummaryPanel key={`review-summary-${refreshCount}`} />
          <ReviewRecordsPanel key={`review-records-${refreshCount}`} />
          <ExportActionsDropdown
            onShowTimesheet={() => setShowTimesheetPrintView(true)}
            onDataChanged={refreshAppData}
          />
          {showTimesheetPrintView && <TimesheetPrintView />}
        </>
      )}

      {activeTab === TABS.TOOLS && (
        <>
          <section className="panel">
            <h2>Secondary Field Tools</h2>
            <p className="helper">
              Expenses, mileage, reports, and backups stay available for worker records.
              CrewPay time-entry export only includes the confirmed intake subset.
            </p>
          </section>
          <SavedExpensesList key={`expenses-${refreshCount}`} onExpenseDeleted={refreshAppData} />
          <ExpenseEntryForm onExpenseSaved={refreshAppData} />
          <SavedMileageList key={`mileage-${refreshCount}`} onMileageDeleted={refreshAppData} />
          <MileageEntryForm onMileageSaved={refreshAppData} />
        </>
      )}

      {activeTab === TABS.SETTINGS && <SettingsPanel />}

      {activeTab === TABS.HELP && <HelpPanel />}
    </main>
  );
}

function TabButton({ activeTab, tab, onSelect, children }) {
  return (
    <button
      type="button"
      className={activeTab === tab ? "active" : ""}
      onClick={() => onSelect(tab)}
    >
      {children}
    </button>
  );
}
