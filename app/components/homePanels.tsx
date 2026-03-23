type CommandCenterPanelProps = {
  title: string;
  detail: string;
  actionLabel: string;
  onPrimaryAction: () => void;
  onOpenCoach: () => void;
};

export function CommandCenterPanel(props: CommandCenterPanelProps) {
  const { title, detail, actionLabel, onPrimaryAction, onOpenCoach } = props;

  return (
    <article className="panel command-center">
      <h2>Today Command Center</h2>
      <p className="status">{title}</p>
      <p className="compact-line">{detail}</p>
      <div className="btn-row mt-8">
        <button className="primary" onClick={onPrimaryAction}>{actionLabel}</button>
        <button className="ghost" onClick={onOpenCoach}>Open Study Coach</button>
      </div>
    </article>
  );
}

import type {
  ModuleDescriptor,
  ModuleProfile,
  ProfileImportPlan,
  UserSettings,
  ViewKey,
} from "../domain";

type WorkloadRiskPanelProps = {
  overdue: number;
  dueIn3Days: number;
  dueIn7Days: number;
  pendingTasks: number;
  riskLevel: string;
};

export function WorkloadRiskPanel(props: WorkloadRiskPanelProps) {
  const { overdue, dueIn3Days, dueIn7Days, pendingTasks, riskLevel } = props;

  return (
    <article className="panel">
      <h2>Workload Risk Radar</h2>
      <div className="analytics">
        <div className="metric">
          <span>Overdue</span>
          <strong>{overdue}</strong>
        </div>
        <div className="metric">
          <span>Due in 3 days</span>
          <strong>{dueIn3Days}</strong>
        </div>
        <div className="metric">
          <span>Due in 7 days</span>
          <strong>{dueIn7Days}</strong>
        </div>
        <div className="metric">
          <span>Pending tasks</span>
          <strong>{pendingTasks}</strong>
        </div>
      </div>
      <p className={`risk-pill risk-${riskLevel}`}>
        Current risk: {riskLevel.toUpperCase()}
      </p>
    </article>
  );
}

type ModuleWorkspacePanelProps = {
  currentUser: string;
  moduleProfiles: ModuleProfile[];
  moduleCatalog: ModuleDescriptor[];
  settings: UserSettings;
  moduleStatus: string;
  customProfileName: string;
  customProfilesTransferText: string;
  customProfilesImportMode: "replace" | "merge";
  customProfileConflictMode: "rename" | "overwrite" | "skip";
  customProfileImportPreview: ProfileImportPlan;
  setCustomProfileName: (value: string) => void;
  setCustomProfilesTransferText: (value: string) => void;
  setCustomProfilesImportMode: (value: "replace" | "merge") => void;
  setCustomProfileConflictMode: (value: "rename" | "overwrite" | "skip") => void;
  onApplyModuleProfile: (profileId: string) => void;
  onSaveCurrentAsCustomProfile: () => void;
  onExportCustomProfiles: () => void;
  onImportCustomProfiles: () => void;
  onApplyCustomProfile: (profileId: string) => void;
  onDeleteCustomProfile: (profileId: string) => void;
  onToggleModule: (module: ViewKey) => void;
  onMoveModule: (module: ViewKey, direction: -1 | 1) => void;
  onSetDefaultModule: (module: ViewKey) => void;
  onResetModuleLayout: () => void;
};

export function ModuleWorkspacePanel(props: ModuleWorkspacePanelProps) {
  const {
    currentUser,
    moduleProfiles,
    moduleCatalog,
    settings,
    moduleStatus,
    customProfileName,
    customProfilesTransferText,
    customProfilesImportMode,
    customProfileConflictMode,
    customProfileImportPreview,
    setCustomProfileName,
    setCustomProfilesTransferText,
    setCustomProfilesImportMode,
    setCustomProfileConflictMode,
    onApplyModuleProfile,
    onSaveCurrentAsCustomProfile,
    onExportCustomProfiles,
    onImportCustomProfiles,
    onApplyCustomProfile,
    onDeleteCustomProfile,
    onToggleModule,
    onMoveModule,
    onSetDefaultModule,
    onResetModuleLayout,
  } = props;

  return (
    <article className="panel">
      <h2>Workspace Modules</h2>
      <p className="compact-line">Enable only what you need, reorder the navigation, and choose your default module.</p>
      {currentUser ? (
        <>
          <div className="profile-grid mt-8">
            {moduleProfiles.map((profile) => (
              <button key={profile.id} className="ghost" onClick={() => onApplyModuleProfile(profile.id)} title={profile.description}>
                {profile.name}
              </button>
            ))}
          </div>

          <div className="form-row mt-8">
            <label>Save current layout as custom profile</label>
            <div className="btn-row">
              <input
                className="inline-input"
                value={customProfileName}
                onChange={(e) => setCustomProfileName(e.target.value)}
                placeholder="My Finals Week"
                maxLength={50}
              />
              <button className="secondary" onClick={onSaveCurrentAsCustomProfile}>Save profile</button>
            </div>
          </div>

          <div className="form-row">
            <label>Export or import custom profiles</label>
            <div className="btn-row">
              <select title="Custom profile import mode" value={customProfilesImportMode} onChange={(e) => setCustomProfilesImportMode(e.target.value as "replace" | "merge")}>
                <option value="replace">Replace existing profiles</option>
                <option value="merge">Merge with existing profiles</option>
              </select>
              <select title="Duplicate profile name behavior" value={customProfileConflictMode} onChange={(e) => setCustomProfileConflictMode(e.target.value as "rename" | "overwrite" | "skip")}>
                <option value="rename">On duplicate: rename imported</option>
                <option value="overwrite">On duplicate: overwrite existing</option>
                <option value="skip">On duplicate: skip imported</option>
              </select>
            </div>
            <div className="btn-row">
              <button className="secondary" onClick={onExportCustomProfiles}>Export custom profiles</button>
              <button className="secondary" onClick={onImportCustomProfiles}>Import custom profiles</button>
            </div>
            <textarea
              value={customProfilesTransferText}
              onChange={(e) => setCustomProfilesTransferText(e.target.value)}
              placeholder='Paste profile JSON here or click "Export custom profiles"'
            />

            <div className="import-preview">
              <p className="compact-line"><strong>Import dry-run:</strong> {customProfileImportPreview.message}</p>
              <div className="import-preview-grid">
                <span>Incoming: {customProfileImportPreview.incomingCount}</span>
                <span>Add: {customProfileImportPreview.summary.add}</span>
                <span>Rename: {customProfileImportPreview.summary.rename}</span>
                <span>Overwrite: {customProfileImportPreview.summary.overwrite}</span>
                <span>Skip: {customProfileImportPreview.summary.skip}</span>
              </div>
              {customProfileImportPreview.actions.length ? (
                <ul className="list module-list mt-8">
                  {customProfileImportPreview.actions.slice(0, 12).map((row, idx) => (
                    <li key={`${row.sourceName}-${row.targetName}-${idx}`}>
                      <strong>{row.action.toUpperCase()}</strong>
                      <div className="compact-line">{row.sourceName} → {row.targetName}</div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          {settings.customProfiles.length ? (
            <ul className="list module-list">
              {settings.customProfiles.map((profile) => (
                <li key={profile.id}>
                  <div className="module-row">
                    <strong>{profile.name}</strong>
                    <div className="btn-row">
                      <button className="secondary" onClick={() => onApplyCustomProfile(profile.id)}>Apply</button>
                      <button className="warn" onClick={() => onDeleteCustomProfile(profile.id)}>Delete</button>
                    </div>
                  </div>
                  <div className="compact-line">Default: {profile.defaultView} · Enabled: {profile.enabledViews.length} modules</div>
                </li>
              ))}
            </ul>
          ) : null}

          <ul className="list module-list mt-8">
            {settings.viewOrder.map((moduleKey, idx) => {
              const module = moduleCatalog.find((item) => item.key === moduleKey);
              if (!module) return null;
              const enabled = settings.enabledViews.includes(module.key);
              const isDefault = settings.defaultView === module.key;

              return (
                <li key={module.key}>
                  <div className="module-row">
                    <label className="module-toggle" htmlFor={`module-${module.key}`}>
                      <input
                        id={`module-${module.key}`}
                        type="checkbox"
                        checked={enabled}
                        onChange={() => onToggleModule(module.key)}
                      />
                      <span>{module.label}</span>
                    </label>
                    <div className="btn-row">
                      <button className="ghost" disabled={idx === 0} onClick={() => onMoveModule(module.key, -1)}>Up</button>
                      <button className="ghost" disabled={idx === settings.viewOrder.length - 1} onClick={() => onMoveModule(module.key, 1)}>Down</button>
                      <button className="secondary" disabled={!enabled} onClick={() => onSetDefaultModule(module.key)}>
                        {isDefault ? "Default" : "Set default"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="btn-row mt-8">
            <button className="warn" onClick={onResetModuleLayout}>Reset module layout</button>
          </div>
          {moduleStatus ? <p className="status">{moduleStatus}</p> : null}
        </>
      ) : (
        <p className="compact-line">Sign in to save your module layout and default workspace.</p>
      )}
    </article>
  );
}
