export default function HelpPanel() {
  return (
    <section className="help-panel">
      <h2>Help & Workflow Guide</h2>

      <p>
        CrewPay Field App is an offline-first worker companion for local work entries,
        proof, expenses, mileage, review, backup, and CrewPay intake exports.
      </p>

      <nav className="help-contents" aria-label="Help guide contents">
        <strong>Guide contents</strong>
        <ul>
          <li><a href="#help-getting-started">Getting Started</a></li>
          <li><a href="#help-data-reminder">Important Data Reminder</a></li>
          <li><a href="#help-workbook-boundary">Workbook Boundary</a></li>
          <li><a href="#help-update-app">Keeping the App Fresh</a></li>
        </ul>
      </nav>

      <section id="help-getting-started">
        <h3>Getting Started</h3>

        <ol>
          <li>Set worker defaults in Settings if useful.</li>
          <li>Add work entries from the Work tab.</li>
          <li>Attach proof photos as part of the work entry when needed.</li>
          <li>Use Review to inspect records before exporting CrewPay intake CSV.</li>
          <li>Use JSON Backup regularly to protect local records.</li>
        </ol>
      </section>

      <section id="help-data-reminder">
        <h3>Important Data Reminder</h3>

        <p>
          CrewPay Field App stores records locally on this browser/device.
        </p>

        <p>
          Your phone and computer do not automatically share data. Use JSON Backup
          before clearing browser data, switching devices, reinstalling the app, or
          importing replacement backups.
        </p>
      </section>

      <section id="help-workbook-boundary">
        <h3>Workbook Boundary</h3>

        <p>
          CrewPay Ledger workbook remains the source of truth. This app prepares
          reviewable intake exports and does not approve, calculate, or override payroll.
        </p>
      </section>

      <section id="help-update-app">
        <h3>Keeping the App Fresh</h3>

        <p>
          If the installed app looks outdated after a deployment, open Settings and tap
          <strong> Refresh Installed App</strong>. Local records stay on this device.
        </p>
      </section>
    </section>
  );
}
