import { useEffect, useState } from "react";

type MotivationPanelProps = {
  quote: string;
  onRandomQuote: () => void;
};

export function MotivationPanel({ quote, onRandomQuote }: MotivationPanelProps) {
  return (
    <article className="panel">
      <h2>Motivation</h2>
      <p className="quote-text">{quote}</p>
      <button className="secondary" onClick={onRandomQuote}>New quote</button>
    </article>
  );
}

type SettingsEditorProps = {
  settings: { displayName: string; studyMinutes: number; breakMinutes: number };
  onSave: (name: string, study: number, brk: number) => void;
};

function SettingsEditor({ settings, onSave }: SettingsEditorProps) {
  const [name, setName] = useState(settings.displayName);
  const [study, setStudy] = useState(settings.studyMinutes);
  const [brk, setBrk] = useState(settings.breakMinutes);

  useEffect(() => {
    setName(settings.displayName);
    setStudy(settings.studyMinutes);
    setBrk(settings.breakMinutes);
  }, [settings]);

  return (
    <div>
      <h3>Settings</h3>
      <div className="form-row">
        <label>Display name</label>
        <input title="Display name" placeholder="Your display name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Study minutes</label>
        <input title="Study minutes" placeholder="25" type="number" value={study} onChange={(e) => setStudy(Number(e.target.value))} />
      </div>
      <div className="form-row">
        <label>Break minutes</label>
        <input title="Break minutes" placeholder="5" type="number" value={brk} onChange={(e) => setBrk(Number(e.target.value))} />
      </div>
      <button className="primary" onClick={() => onSave(name, study, brk)}>Save settings</button>
    </div>
  );
}

type BackupPanelProps = {
  exportText: string;
  importText: string;
  backupStatus: string;
  backups: Array<{ createdAt: number }>;
  settings: { displayName: string; studyMinutes: number; breakMinutes: number };
  setExportText: (value: string) => void;
  setImportText: (value: string) => void;
  onGenerateExport: () => void;
  onImport: () => void;
  onCreateBackup: () => void;
  onRestoreBackup: (index: number) => void;
  onSaveSettings: (name: string, study: number, brk: number) => void;
};

export function BackupPanel(props: BackupPanelProps) {
  const {
    exportText,
    importText,
    backupStatus,
    backups,
    settings,
    setExportText,
    setImportText,
    onGenerateExport,
    onImport,
    onCreateBackup,
    onRestoreBackup,
    onSaveSettings,
  } = props;

  return (
    <article className="panel">
      <h2>Export, Import & Backups</h2>
      <div className="btn-row">
        <button className="primary" onClick={onGenerateExport}>Generate export JSON</button>
        <button className="secondary" onClick={onImport}>Import JSON</button>
        <button className="warn" onClick={onCreateBackup}>Create backup</button>
      </div>

      <div className="form-row mt-8">
        <label>Export payload</label>
        <textarea value={exportText} onChange={(e) => setExportText(e.target.value)} placeholder="Click generate export" />
      </div>
      <div className="form-row">
        <label>Import payload</label>
        <textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste snapshot JSON and click import" />
      </div>
      <div className="status">{backupStatus}</div>

      <ul className="list">
        {backups.map((backup, index) => (
          <li key={`${backup.createdAt}-${index}`}>
            {new Date(backup.createdAt).toLocaleString()}
            <div className="btn-row mt-6">
              <button className="secondary" onClick={() => onRestoreBackup(index)}>Restore</button>
            </div>
          </li>
        ))}
      </ul>

      <hr />
      <SettingsEditor settings={settings} onSave={onSaveSettings} />
    </article>
  );
}

type StudyCoachPanelProps = {
  energyLevel: number;
  availableMinutes: number;
  coachPlan: string;
  setEnergyLevel: (value: number) => void;
  setAvailableMinutes: (value: number) => void;
  onGeneratePlan: () => void;
  onOpenTimer: () => void;
};

export function StudyCoachPanel(props: StudyCoachPanelProps) {
  const {
    energyLevel,
    availableMinutes,
    coachPlan,
    setEnergyLevel,
    setAvailableMinutes,
    onGeneratePlan,
    onOpenTimer,
  } = props;

  return (
    <article className="panel">
      <h2>Study Coach (Learning Science Mode)</h2>
      <div className="form-row">
        <label>Current energy level (1 low - 5 high)</label>
        <input
          title="Current energy level"
          type="range"
          min={1}
          max={5}
          value={energyLevel}
          onChange={(e) => setEnergyLevel(Number(e.target.value))}
        />
        <span>Energy: {energyLevel}/5</span>
      </div>
      <div className="form-row">
        <label>Available study minutes now</label>
        <input
          title="Available study minutes"
          type="number"
          min={15}
          max={240}
          value={availableMinutes}
          onChange={(e) => setAvailableMinutes(Number(e.target.value))}
        />
      </div>
      <div className="btn-row mt-8">
        <button className="primary" onClick={onGeneratePlan}>Generate science-based plan</button>
        <button className="secondary" onClick={onOpenTimer}>Open timer</button>
      </div>

      {coachPlan ? (
        <pre className="coach-plan">{coachPlan}</pre>
      ) : (
        <p className="compact-line">Generate a plan to get retrieval practice, interleaving, and sprint timing tuned for your energy.</p>
      )}
    </article>
  );
}
