type TimerPanelProps = {
  timerMode: "study" | "break";
  timerStatus: string;
  totalStudyText: string;
  totalBreakText: string;
  remainingText: string;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onToggleMode: () => void;
};

export function TimerPanel(props: TimerPanelProps) {
  const {
    timerMode,
    timerStatus,
    totalStudyText,
    totalBreakText,
    remainingText,
    onStart,
    onPause,
    onReset,
    onToggleMode,
  } = props;

  return (
    <article className="panel">
      <h2>Pomodoro Engine</h2>
      <div className="timer-core">
        <p>Mode: {timerMode}</p>
        <h3>{remainingText}</h3>
        <div className="btn-row justify-center">
          <button className="primary" onClick={onStart}>Start</button>
          <button className="secondary" onClick={onPause}>Pause</button>
          <button className="ghost" onClick={onReset}>Reset</button>
          <button className="warn" onClick={onToggleMode}>Toggle mode</button>
        </div>
      </div>
      <p className="status">{timerStatus}</p>
      <p className="compact-line">Total study: {totalStudyText} | Total break: {totalBreakText}</p>
    </article>
  );
}

type GpaPanelProps = {
  gInputs: string[];
  gpaText: string;
  setGInputs: (next: string[]) => void;
  onRunGpa: () => void;
};

export function GpaPanel(props: GpaPanelProps) {
  const { gInputs, gpaText, setGInputs, onRunGpa } = props;

  return (
    <article className="panel">
      <h2>GPA Studio</h2>
      {gInputs.map((val, i) => (
        <div className="form-row" key={i}>
          <label>Grade line {i + 1}</label>
          <input
            value={val}
            onChange={(e) => {
              const next = [...gInputs];
              next[i] = e.target.value;
              setGInputs(next);
            }}
            placeholder="A,3 or B+ 4"
          />
        </div>
      ))}
      <button className="primary" onClick={onRunGpa}>Compute GPA</button>
      {gpaText ? <p className="status">{gpaText}</p> : null}
    </article>
  );
}

type AnalyticsPanelProps = {
  completedAssignments: number;
  sessionsCount: number;
  avgSessionText: string;
  maxSessionText: string;
  minSessionText: string;
};

export function AnalyticsPanel(props: AnalyticsPanelProps) {
  const { completedAssignments, sessionsCount, avgSessionText, maxSessionText, minSessionText } = props;

  return (
    <article className="panel">
      <h2>Analytics</h2>
      <div className="analytics">
        <div className="metric">
          <span>Assignments done</span>
          <strong>{completedAssignments}</strong>
        </div>
        <div className="metric">
          <span>Sessions</span>
          <strong>{sessionsCount}</strong>
        </div>
        <div className="metric">
          <span>Avg session</span>
          <strong>{avgSessionText}</strong>
        </div>
        <div className="metric">
          <span>Best / least</span>
          <strong>{maxSessionText} / {minSessionText}</strong>
        </div>
      </div>
    </article>
  );
}
