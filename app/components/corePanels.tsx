import type { Assignment, PlannerTask, Priority } from "../domain";

type AuthPanelProps = {
  currentUser: string;
  role: "student" | "instructor" | "admin";
  sessionStatus: "loading" | "authenticated" | "unauthenticated";
  oauthProviders: Array<{ id: string; name: string }>;
  isAuthRequired: boolean;
  returnToLabel: string;
  loginPendingProviderId: string | null;
  authMsg: string;
  onLogin: (providerId: string) => void;
  onLogout: () => void;
};

export function AuthPanel(props: AuthPanelProps) {
  const {
    currentUser,
    role,
    sessionStatus,
    oauthProviders,
    isAuthRequired,
    returnToLabel,
    loginPendingProviderId,
    authMsg,
    onLogin,
    onLogout,
  } = props;

  const providerPriority: Record<string, number> = {
    google: 0,
    "azure-ad": 1,
    github: 2,
    apple: 3,
  };

  const sortedProviders = [...oauthProviders].sort((a, b) => {
    const pa = providerPriority[a.id] ?? 99;
    const pb = providerPriority[b.id] ?? 99;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name);
  });

  return (
    <article className="panel auth-panel">
      <h2>Welcome to Student Productivity Hub</h2>
      <p className="compact-line">Sign in with one secure click. Your provider handles identity, and you return here to continue working.</p>

      {isAuthRequired ? (
        <p className="auth-context">Sign in required to continue to: {returnToLabel}</p>
      ) : null}

      <div className="auth-meta-grid mt-8">
        <div>
          <label>Session state</label>
          <div className="status">{sessionStatus}</div>
        </div>
        <div>
          <label>Signed-in account</label>
          <div className="status">{currentUser || "No active session"}</div>
        </div>
        <div>
          <label>Authorization role</label>
          <div className="status">{role.toUpperCase()}</div>
        </div>
      </div>

      <div className="auth-provider-list mt-8" aria-live="polite">
        {sortedProviders.length ? (
          sortedProviders.map((provider) => {
            const isPending = loginPendingProviderId === provider.id;
            const isDisabled = Boolean(loginPendingProviderId);
            return (
              <button
                key={provider.id}
                className="primary auth-provider-btn"
                onClick={() => onLogin(provider.id)}
                disabled={isDisabled}
              >
                {isPending ? `Connecting to ${provider.name}...` : `Continue with ${provider.name}`}
              </button>
            );
          })
        ) : (
          <p className="compact-line">No OAuth providers are configured yet. Add credentials in your environment file.</p>
        )}
      </div>

      <p className="auth-helper mt-8">Typical sign-in time is under 10 seconds.</p>

      <div className="btn-row mt-8">
        <button className="ghost" onClick={onLogout}>Logout</button>
      </div>

      {authMsg ? <div className="status">{authMsg}</div> : null}
    </article>
  );
}

type AccessDeniedPanelProps = {
  heading: string;
  detail: string;
  role: "student" | "instructor" | "admin";
  actionLabel: string;
  onAction: () => void;
};

export function AccessDeniedPanel(props: AccessDeniedPanelProps) {
  const { heading, detail, role, actionLabel, onAction } = props;

  return (
    <article className="panel">
      <h2>{heading}</h2>
      <p className="warning">Access denied for role: {role.toUpperCase()}</p>
      <p className="compact-line">{detail}</p>
      <div className="btn-row mt-8">
        <button className="secondary" onClick={onAction}>{actionLabel}</button>
      </div>
    </article>
  );
}

type AssignmentsPanelProps = {
  hwTitle: string;
  hwSubject: string;
  hwDue: string;
  hwPriority: Priority;
  hwStatus: string;
  sortedAssignments: Assignment[];
  setHwTitle: (value: string) => void;
  setHwSubject: (value: string) => void;
  setHwDue: (value: string) => void;
  setHwPriority: (value: Priority) => void;
  onAddAssignment: () => void;
  onMarkAssignment: (id: string, completed: boolean) => void;
  onDeleteAssignment: (id: string) => void;
};

export function AssignmentsPanel(props: AssignmentsPanelProps) {
  const {
    hwTitle,
    hwSubject,
    hwDue,
    hwPriority,
    hwStatus,
    sortedAssignments,
    setHwTitle,
    setHwSubject,
    setHwDue,
    setHwPriority,
    onAddAssignment,
    onMarkAssignment,
    onDeleteAssignment,
  } = props;

  return (
    <article className="panel">
      <h2>Assignments</h2>
      <div className="form-row">
        <label>Title</label>
        <input value={hwTitle} onChange={(e) => setHwTitle(e.target.value)} placeholder="Essay draft" />
      </div>
      <div className="form-row">
        <label>Subject</label>
        <input value={hwSubject} onChange={(e) => setHwSubject(e.target.value)} placeholder="Physics" />
      </div>
      <div className="form-row">
        <label>Due date</label>
        <input title="Assignment due date" placeholder="Select due date" type="date" value={hwDue} onChange={(e) => setHwDue(e.target.value)} />
      </div>
      <div className="form-row">
        <label>Priority</label>
        <select title="Assignment priority" value={hwPriority} onChange={(e) => setHwPriority(e.target.value as Priority)}>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>
      <button className="primary" onClick={onAddAssignment}>Add assignment</button>
      {hwStatus ? <div className="status">{hwStatus}</div> : null}

      <ul className="list">
        {sortedAssignments.map((assignment) => (
          <li key={assignment.id} className={assignment.completed ? "done" : ""}>
            <strong>{assignment.title}</strong> · {assignment.subject} · {assignment.dueDate || "No date"}{" "}
            <span className={`pill ${assignment.priority.toLowerCase()}`}>{assignment.priority}</span>
            <div className="btn-row mt-6">
              <button className="secondary" onClick={() => onMarkAssignment(assignment.id, !assignment.completed)}>
                {assignment.completed ? "Reopen" : "Complete"}
              </button>
              <button className="ghost" onClick={() => onDeleteAssignment(assignment.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

type PlannerPanelProps = {
  taskText: string;
  taskStatus: string;
  planner: PlannerTask[];
  setTaskText: (value: string) => void;
  onAddTask: () => void;
  onToggleTask: (id: string) => void;
  onRemoveTask: (id: string) => void;
};

export function PlannerPanel(props: PlannerPanelProps) {
  const { taskText, taskStatus, planner, setTaskText, onAddTask, onToggleTask, onRemoveTask } = props;

  return (
    <article className="panel">
      <h2>Planner</h2>
      <div className="form-row">
        <label>Task</label>
        <input value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Revise chapter 2" />
      </div>
      <button className="primary" onClick={onAddTask}>Add task</button>
      {taskStatus ? <div className="status">{taskStatus}</div> : null}

      <ul className="list">
        {planner.map((task) => (
          <li key={task.id} className={task.done ? "done" : ""}>
            {task.done ? "[done] " : ""}
            {task.text}
            <div className="btn-row mt-6">
              <button className="secondary" onClick={() => onToggleTask(task.id)}>Toggle done</button>
              <button className="ghost" onClick={() => onRemoveTask(task.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
