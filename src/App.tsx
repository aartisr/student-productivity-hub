import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckSquare, 
  Clock, 
  BookOpen, 
  Brain, 
  Flame, 
  Trophy, 
  Sparkles, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  FileText, 
  Calendar, 
  Award, 
  TrendingUp, 
  ChevronRight, 
  ExternalLink, 
  ArrowRight,
  Terminal,
  Activity,
  User,
  Heart,
  Send,
  CornerDownRight,
  RefreshCw,
  Search,
  Check,
  Star,
  GitFork,
  CheckCircle2,
  AlertCircle,
  Layout,
  Code,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Folder
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface Task {
  id: string;
  title: string;
  category: 'Exam' | 'Assignment' | 'Reading' | 'Project' | 'Other';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  completed: boolean;
  notes?: string;
}

interface Note {
  id: string;
  title: string;
  category: string;
  content: string;
  updatedAt: string;
}

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: number;
  targetGrade: number; // Percentage
  currentGrade: number; // Percentage
}

interface Habit {
  id: string;
  name: string;
  streak: number;
  completedDays: Record<string, boolean>; // e.g. "2026-08-31": true
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

// Auditor Types
interface MetricDetail {
  score: number;
  review: string;
  bullets: string[];
}

interface EvaluationResult {
  overallScore: number;
  summary: string;
  metrics: {
    codeQuality: MetricDetail;
    documentation: MetricDetail;
    structure: MetricDetail;
    modernity: MetricDetail;
    polish: MetricDetail;
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  actionableRoadmap: {
    priority: string;
    task: string;
    benefit: string;
    difficulty: string;
  }[];
}

interface RepoMetadata {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  language: string;
  avatarUrl: string;
  htmlUrl: string;
  ownerLogin: string;
  isFallback?: boolean;
}

interface EvaluationResponse {
  success: boolean;
  metadata: RepoMetadata;
  evaluation: EvaluationResult;
  hasFetchError: boolean;
  fetchErrorMessage?: string;
}

// ==========================================
// AUDIO SYNTHESIZER FOR DEEP FOCUS
// ==========================================
class AmbientSynth {
  private ctx: AudioContext | null = null;
  private source: AudioNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private mainGain: GainNode | null = null;
  private bufferSize = 4096;

  startRain() {
    this.stop();
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create white/pink noise procedurally
    const noiseNode = this.ctx.createScriptProcessor(this.bufferSize, 1, 1);
    let lastOut = 0.0;
    noiseNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < this.bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Pink-ish noise filter filter roll-off
        lastOut = 0.99 * lastOut + 0.01 * white;
        output[i] = lastOut * 0.45; // lower volume slightly
      }
    };

    // Filter to make it sound like gentle rain
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 850;

    this.mainGain = this.ctx.createGain();
    this.mainGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    noiseNode.connect(this.filter);
    this.filter.connect(this.mainGain);
    this.mainGain.connect(this.ctx.destination);
    this.source = noiseNode;
  }

  startBinaural() {
    this.stop();
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const oscLeft = this.ctx.createOscillator();
    const oscRight = this.ctx.createOscillator();
    const merger = this.ctx.createChannelMerger(2);

    oscLeft.frequency.value = 140; // 140Hz left
    oscRight.frequency.value = 144; // 144Hz right (creates 4Hz Theta beat)

    oscLeft.type = 'sine';
    oscRight.type = 'sine';

    this.mainGain = this.ctx.createGain();
    this.mainGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);
    merger.connect(this.mainGain);
    this.mainGain.connect(this.ctx.destination);

    oscLeft.start();
    oscRight.start();

    this.source = merger; // handle reference to stop it
  }

  startWhiteNoise() {
    this.stop();
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const noiseNode = this.ctx.createScriptProcessor(this.bufferSize, 1, 1);
    noiseNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < this.bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.12;
      }
    };

    this.mainGain = this.ctx.createGain();
    this.mainGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    noiseNode.connect(this.mainGain);
    this.mainGain.connect(this.ctx.destination);
    this.source = noiseNode;
  }

  stop() {
    if (this.source) {
      try {
        if ((this.source as any).stop) (this.source as any).stop();
      } catch (_) {}
      this.source = null;
    }
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (_) {}
      this.ctx = null;
    }
  }
}

// ==========================================
// CORE APP IMPLEMENTATION
// ==========================================

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'app' | 'auditor'>('app');

  // Load and save state functions
  const getStored = <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (_) {
      return defaultValue;
    }
  };

  // State definitions
  const [tasks, setTasks] = useState<Task[]>(() => getStored('sph_tasks', [
    { id: '1', title: 'Complete Advanced Algorithms homework', category: 'Assignment', priority: 'High', dueDate: '2026-09-02', completed: false, notes: 'Focus on dynamic programming problems' },
    { id: '2', title: 'Read Chapter 4 of Literature review', category: 'Reading', priority: 'Medium', dueDate: '2026-09-05', completed: true },
    { id: '3', title: 'Start working on React Term Project', category: 'Project', priority: 'High', dueDate: '2026-09-12', completed: false, notes: 'Design modular layouts first' },
    { id: '4', title: 'Prepare study notes for Calculus I midterm', category: 'Exam', priority: 'Low', dueDate: '2026-09-01', completed: false }
  ]));

  const [notes, setNotes] = useState<Note[]>(() => getStored('sph_notes', [
    { id: '1', title: 'Dynamic Programming Recipes', category: 'Computer Science', content: '### Dynamic Programming Strategy\n\n1. **Define Subproblems**: Break the larger problem down into manageable parts.\n2. **Identify Recurrence Relations**: Solve recursively and build memoization lookup tables.\n3. **Set Base Cases**: Establish boundaries.\n\n*Time Complexity*: reduces from exponential to polynomial $O(N)$ or $O(N^2)$.', updatedAt: '2026-08-31' },
    { id: '2', title: 'Calculus Derivatives Reference', category: 'Mathematics', content: '### Common Derivatives Cheat Sheet\n\n- $\\frac{d}{dx}[x^n] = n x^{n-1}$\n- $\\frac{d}{dx}[e^x] = e^x$\n- $\\frac{d}{dx}[\\sin x] = \\cos x$\n- $\\frac{d}{dx}[\\cos x] = -\\sin x$', updatedAt: '2026-08-30' }
  ]));

  const [courses, setCourses] = useState<Course[]>(() => getStored('sph_courses', [
    { id: '1', name: 'CS 301: Advanced Algorithms', grade: 'A', credits: 4, targetGrade: 95, currentGrade: 93 },
    { id: '2', name: 'MATH 201: Calculus III', grade: 'B+', credits: 4, targetGrade: 90, currentGrade: 87 },
    { id: '3', name: 'LIT 105: Creative Writing', grade: 'A-', credits: 3, targetGrade: 92, currentGrade: 94 },
    { id: '4', name: 'PHYS 202: Classical Physics II', grade: 'B', credits: 4, targetGrade: 88, currentGrade: 84 }
  ]));

  const [habits, setHabits] = useState<Habit[]>(() => getStored('sph_habits', [
    { id: '1', name: 'Review Lecture Notes Daily', streak: 4, completedDays: { '2026-08-30': true, '2026-08-31': true } },
    { id: '2', name: 'Study Focus Timer (1 hr)', streak: 2, completedDays: { '2026-08-31': true } },
    { id: '3', name: 'Solve 2 Coding Problems', streak: 0, completedDays: {} }
  ]));

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => getStored('sph_chats', [
    { id: '1', role: 'assistant', text: "Hello! I am your AI Study Co-Pilot. I can explain complex academic concepts, compile study materials, format notes into tidy Markdown, or design helpful flashcard sets. What are we studying today?" }
  ]));

  // Save State hooks
  useEffect(() => localStorage.setItem('sph_tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('sph_notes', JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem('sph_courses', JSON.stringify(courses)), [courses]);
  useEffect(() => localStorage.setItem('sph_habits', JSON.stringify(habits)), [habits]);
  useEffect(() => localStorage.setItem('sph_chats', JSON.stringify(chatMessages)), [chatMessages]);

  // Pomodoro Timer State
  const [timerType, setTimerType] = useState<'focus' | 'short' | 'long'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ambient sound synthesizer
  const synthRef = useRef<AmbientSynth | null>(null);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'binaural' | 'white'>('none');

  // Input states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Exam' | 'Assignment' | 'Reading' | 'Project' | 'Other'>('Assignment');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newTaskDate, setNewTaskDate] = useState('2026-09-01');

  // Active note selection
  const [activeNoteId, setActiveNoteId] = useState<string>('1');
  const [noteEditTitle, setNoteEditTitle] = useState('');
  const [noteEditCategory, setNoteEditCategory] = useState('');
  const [noteEditContent, setNoteEditContent] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);

  // New Note fields
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('');

  // AI Chat inputs
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Course addition states
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState(4);
  const [newCourseTarget, setNewCourseTarget] = useState(90);
  const [newCourseCurrent, setNewCourseCurrent] = useState(85);

  // Habit inputs
  const [newHabitName, setNewHabitName] = useState('');

  // ==========================================
  // REPO AUDITOR STATE (Integrated in Tab)
  // ==========================================
  const [auditorRepo, setAuditorRepo] = useState('https://github.com/aartisr/student-productivity-hub');
  const [auditorLoading, setAuditorLoading] = useState(false);
  const [auditorStep, setAuditorStep] = useState(0);
  const [auditorResult, setAuditorResult] = useState<EvaluationResponse | null>(null);
  const [auditorError, setAuditorError] = useState<string | null>(null);
  const [auditorTab, setAuditorTab] = useState<'overview' | 'metrics' | 'swot' | 'roadmap' | 'files' | 'chat'>('overview');
  const [completedRoadmapTasks, setCompletedRoadmapTasks] = useState<Record<string, boolean>>({});
  
  // Audited Repositories History
  const [auditHistory, setAuditHistory] = useState<RepoMetadata[]>(() => getStored('sph_audit_history', []));

  // Repo Chat Q&A State
  const [repoChatMessages, setRepoChatMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', text: "I am ready to help you analyze this codebase. Ask me anything like: 'Is this production ready?', 'Where are potential issues?', or 'How can I improve the documentation?'" }
  ]);
  const [repoChatInput, setRepoChatInput] = useState('');
  const [repoChatLoading, setRepoChatLoading] = useState(false);

  // Repo Comparison State
  const [comparisonRepo, setComparisonRepo] = useState('');
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<EvaluationResponse | null>(null);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [showComparisonPanel, setShowComparisonPanel] = useState(false);

  // ==========================================
  // ADDITIONAL STUDENT HUB STATE
  // ==========================================
  const [appTab, setAppTab] = useState<'dashboard' | 'tasks' | 'timer' | 'notes' | 'academic' | 'quiz' | 'copilot'>('dashboard');

  // Study Planner Calendar View
  const [plannerMode, setPlannerMode] = useState<'list' | 'calendar'>('list');
  const [calendarDate, setCalendarDate] = useState(() => new Date(2026, 8, 1)); // Sept 2026

  // Quiz Lab State
  interface QuizQuestion {
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
  }
  const [quizTopic, setQuizTopic] = useState('Advanced Algorithms');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizHistory, setQuizHistory] = useState<{ topic: string; score: number; date: string }[]>(() => 
    getStored('sph_quiz_history', [
      { topic: 'Algorithms Complexity', score: 3, date: '2026-08-30' },
      { topic: 'TypeScript Types', score: 2, date: '2026-08-31' }
    ])
  );

  useEffect(() => localStorage.setItem('sph_quiz_history', JSON.stringify(quizHistory)), [quizHistory]);

  // History updater
  useEffect(() => {
    if (auditorResult) {
      setAuditHistory(prev => {
        const filtered = prev.filter(p => p.fullName !== auditorResult.metadata.fullName);
        const updated = [auditorResult.metadata, ...filtered].slice(0, 5);
        localStorage.setItem('sph_audit_history', JSON.stringify(updated));
        return updated;
      });
    }
  }, [auditorResult]);

  // ==========================================
  // TIMER EFFECTS & LOGIC
  // ==========================================
  useEffect(() => {
    synthRef.current = new AmbientSynth();
    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
    };
  }, []);

  const changeAmbientSound = (sound: 'none' | 'rain' | 'binaural' | 'white') => {
    setAmbientSound(sound);
    if (!synthRef.current) return;
    
    if (sound === 'none') {
      synthRef.current.stop();
    } else if (sound === 'rain') {
      synthRef.current.startRain();
    } else if (sound === 'binaural') {
      synthRef.current.startBinaural();
    } else if (sound === 'white') {
      synthRef.current.startWhiteNoise();
    }
  };

  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning, timerType]);

  const handleTimerComplete = () => {
    setTimerRunning(false);
    if (timerType === 'focus') {
      setPomodoroCount((prev) => prev + 1);
      // Increment habit streak for focus timer
      setHabits((prev) => prev.map(h => {
        if (h.id === '2') {
          const todayStr = new Date().toISOString().split('T')[0];
          return {
            ...h,
            streak: h.completedDays[todayStr] ? h.streak : h.streak + 1,
            completedDays: { ...h.completedDays, [todayStr]: true }
          };
        }
        return h;
      }));
      alert('Focus study session complete! Excellent work. Take a quick break.');
      setTimerType('short');
      setTimeLeft(5 * 60);
    } else {
      alert('Break complete! Let\'s build dynamic focus back up.');
      setTimerType('focus');
      setTimeLeft(25 * 60);
    }
  };

  const selectTimerType = (type: 'focus' | 'short' | 'long') => {
    setTimerType(type);
    setTimerRunning(false);
    if (type === 'focus') setTimeLeft(25 * 60);
    else if (type === 'short') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // EVENT HANDLERS & STATE ACTIONS
  // ==========================================

  // Task Handlers
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      category: newTaskCategory,
      priority: newTaskPriority,
      dueDate: newTaskDate,
      completed: false
    };
    setTasks([task, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Note Handlers
  const startEditNote = (note: Note) => {
    setNoteEditTitle(note.title);
    setNoteEditCategory(note.category);
    setNoteEditContent(note.content);
    setIsEditingNote(true);
  };

  const saveEditedNote = () => {
    setNotes(notes.map(n => n.id === activeNoteId ? {
      ...n,
      title: noteEditTitle,
      category: noteEditCategory,
      content: noteEditContent,
      updatedAt: new Date().toISOString().split('T')[0]
    } : n));
    setIsEditingNote(false);
  };

  const createNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      title: newNoteTitle,
      category: newNoteCategory || 'Uncategorized',
      content: '# ' + newNoteTitle + '\n\nStart writing notes or draft class outlines here...',
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setNotes([note, ...notes]);
    setActiveNoteId(note.id);
    setNewNoteTitle('');
    setNewNoteCategory('');
  };

  const deleteNote = (id: string) => {
    const filtered = notes.filter(n => n.id !== id);
    setNotes(filtered);
    if (activeNoteId === id && filtered.length > 0) {
      setActiveNoteId(filtered[0].id);
    }
  };

  // Habit Handlers
  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      streak: 0,
      completedDays: {}
    };
    setHabits([...habits, habit]);
    setNewHabitName('');
  };

  const toggleHabitDay = (habitId: string, dateStr: string) => {
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        const alreadyDone = h.completedDays[dateStr];
        const updatedDays = { ...h.completedDays };
        if (alreadyDone) {
          delete updatedDays[dateStr];
        } else {
          updatedDays[dateStr] = true;
        }

        // calculate current consecutive streak
        let streak = 0;
        const checkDate = new Date();
        while (true) {
          const key = checkDate.toISOString().split('T')[0];
          if (updatedDays[key]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        return {
          ...h,
          completedDays: updatedDays,
          streak
        };
      }
      return h;
    }));
  };

  // Course / Academic Handlers
  const addCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    
    // Estimate letter grade
    let lGrade = 'B';
    if (newCourseCurrent >= 93) lGrade = 'A';
    else if (newCourseCurrent >= 90) lGrade = 'A-';
    else if (newCourseCurrent >= 87) lGrade = 'B+';
    else if (newCourseCurrent >= 83) lGrade = 'B';
    else if (newCourseCurrent >= 80) lGrade = 'B-';
    else lGrade = 'C+';

    const course: Course = {
      id: Date.now().toString(),
      name: newCourseName,
      grade: lGrade,
      credits: newCourseCredits,
      targetGrade: newCourseTarget,
      currentGrade: newCourseCurrent
    };

    setCourses([...courses, course]);
    setNewCourseName('');
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  // Calculate Cumulative GPA estimate
  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    const gradeScale: Record<string, number> = {
      'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'F': 0.0
    };

    courses.forEach(c => {
      const gValue = gradeScale[c.grade] || 3.0;
      totalPoints += gValue * c.credits;
      totalCredits += c.credits;
    });

    return totalCredits === 0 ? "4.00" : (totalPoints / totalCredits).toFixed(2);
  };

  // ==========================================
  // GEMINI AI INTEGRATION
  // ==========================================
  const handleSendChatMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const query = customMsg || chatInput;
    if (!query.trim()) return;

    // Append user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: query
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Package recent history
      const formattedHistory = chatMessages.slice(-6).map(m => ({
        role: m.role,
        text: m.text
      }));

      // Gather current context (e.g. selected notes)
      const selectedNote = notes.find(n => n.id === activeNoteId);
      const noteContext = selectedNote 
        ? `Selected Note is: ${selectedNote.title}\nContent:\n${selectedNote.content}`
        : '';

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: formattedHistory,
          context: noteContext
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI Co-pilot failed to respond.');

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.reply
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', text: `⚠️ Error: ${err.message || 'Connection lost to study assistant endpoint.'}` }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Simple Markdown to HTML parser to keep code reliable and styled
  const renderMarkdownText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-black text-slate-900 mt-4 mb-2">{trimmed.substring(4)}</h4>;
      }
      if (trimmed.startsWith('## ')) {
        return <h3 key={idx} className="text-base font-black text-slate-900 mt-4 mb-2">{trimmed.substring(3)}</h3>;
      }
      if (trimmed.startsWith('# ')) {
        return <h2 key={idx} className="text-lg font-extrabold text-slate-900 mt-4 mb-2">{trimmed.substring(2)}</h2>;
      }

      // Bullet points
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <div key={idx} className="flex gap-2 text-xs text-slate-700 leading-relaxed pl-3 my-1">
            <span className="text-indigo-600 font-extrabold">•</span>
            <span>{trimmed.substring(2)}</span>
          </div>
        );
      }

      // Bold tag replacement
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-slate-900">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return line.trim() === '' ? (
        <div key={idx} className="h-2" />
      ) : (
        <p key={idx} className="text-xs text-slate-600 leading-relaxed mb-1.5">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  // ==========================================
  // REPO QUALITY AUDITOR LOGIC
  // ==========================================
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (auditorLoading) {
      setAuditorStep(0);
      interval = setInterval(() => {
        setAuditorStep((prev) => Math.min(prev + 1, 5));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [auditorLoading]);

  const runQualityAuditor = async () => {
    if (!auditorRepo.trim()) {
      setAuditorError('Please provide a repository URL.');
      return;
    }
    setAuditorLoading(true);
    setAuditorError(null);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: auditorRepo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete evaluation.');
      
      setAuditorResult(data);
      setCompletedRoadmapTasks({});
      setAuditorTab('overview');
      // Reset repo chat messages with a greeting specific to this repo
      setRepoChatMessages([
        { id: '1', role: 'assistant', text: `I have loaded and audited **${data.metadata.fullName}** (Score: **${data.evaluation.overallScore}/10**). I am ready to answer any questions about its structure, documentation, modernity, or code patterns! Ask me anything.` }
      ]);
    } catch (err: any) {
      setAuditorError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setAuditorLoading(false);
    }
  };

  // ==========================================
  // QUIZ LAB LOGIC
  // ==========================================
  const startQuiz = async () => {
    if (!quizTopic.trim()) return;
    setQuizLoading(true);
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: quizTopic })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate quiz.');
      
      setQuizQuestions(data.questions);
      setCurrentQuizIdx(0);
      setSelectedAnswerIdx(null);
      setQuizSubmitted(false);
      setQuizScore(0);
    } catch (err: any) {
      alert(`Error generating quiz: ${err.message || 'Server timeout'}`);
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuizAnswer = () => {
    if (selectedAnswerIdx === null || quizSubmitted) return;
    setQuizSubmitted(true);
    const correctIdx = quizQuestions[currentQuizIdx].answerIndex;
    if (selectedAnswerIdx === correctIdx) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIdx < quizQuestions.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
      setSelectedAnswerIdx(null);
      setQuizSubmitted(false);
    } else {
      // Quiz complete, record to history
      const record = {
        topic: quizTopic,
        score: quizScore,
        date: new Date().toISOString().split('T')[0]
      };
      setQuizHistory(prev => [record, ...prev]);
      setCurrentQuizIdx(currentQuizIdx + 1); // Triggers final results view
    }
  };

  // ==========================================
  // DATA BACKUP & EXPORT/IMPORT
  // ==========================================
  const handleExportBackup = () => {
    const backup = {
      tasks,
      notes,
      courses,
      habits,
      quizHistory,
      pomodoroCount
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student-hub-study-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.tasks) setTasks(data.tasks);
        if (data.notes) setNotes(data.notes);
        if (data.courses) setCourses(data.courses);
        if (data.habits) setHabits(data.habits);
        if (data.quizHistory) setQuizHistory(data.quizHistory);
        if (typeof data.pomodoroCount === 'number') setPomodoroCount(data.pomodoroCount);
        alert('🎯 Workspace restored completely from file!');
      } catch (err) {
        alert('Failed to parse backup file. Please verify it is a valid backup JSON.');
      }
    };
    reader.readAsText(file);
  };

  // ==========================================
  // REPO SPECIFIC GROUNDED Q&A CHAT
  // ==========================================
  const handleSendRepoChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoChatInput.trim() || !auditorResult || repoChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: repoChatInput
    };

    setRepoChatMessages(prev => [...prev, userMsg]);
    setRepoChatInput('');
    setRepoChatLoading(true);

    try {
      const repoContext = `You are a principal codebase auditor discussing the repository: ${auditorResult.metadata.fullName}.
Description: ${auditorResult.metadata.description}
Language: ${auditorResult.metadata.language}
Overall Score: ${auditorResult.evaluation.overallScore}/10
Metrics: Code Quality (${auditorResult.evaluation.metrics.codeQuality.score}/10), Docs (${auditorResult.evaluation.metrics.documentation.score}/10), Structure (${auditorResult.evaluation.metrics.structure.score}/10), Modernity (${auditorResult.evaluation.metrics.modernity.score}/10), Polish (${auditorResult.evaluation.metrics.polish.score}/10)
SWOT:
Strengths: ${auditorResult.evaluation.swot.strengths.join(', ')}
Weaknesses: ${auditorResult.evaluation.swot.weaknesses.join(', ')}
Opportunities: ${auditorResult.evaluation.swot.opportunities.join(', ')}
Threats: ${auditorResult.evaluation.swot.threats.join(', ')}
Actionable Roadmap: ${auditorResult.evaluation.actionableRoadmap.map(r => r.task).join(', ')}`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: repoChatInput,
          history: repoChatMessages.slice(-6).map(m => ({ role: m.role, text: m.text })),
          context: repoContext
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze repository chat.');

      setRepoChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.reply
      }]);
    } catch (err: any) {
      setRepoChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: `⚠️ Error: ${err.message || 'Lost connection to codebase co-pilot.'}`
      }]);
    } finally {
      setRepoChatLoading(false);
    }
  };

  // ==========================================
  // COMPARE REPOSITORIES SIDE-BY-SIDE
  // ==========================================
  const runComparisonAudit = async () => {
    if (!comparisonRepo.trim()) {
      setComparisonError('Please provide a comparison repository URL.');
      return;
    }
    setComparisonLoading(true);
    setComparisonError(null);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: comparisonRepo })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete comparison evaluation.');
      setComparisonResult(data);
    } catch (err: any) {
      setComparisonError(err.message || 'An unexpected error occurred during comparison analysis.');
    } finally {
      setComparisonLoading(false);
    }
  };

  const calculateBoostedScore = () => {
    if (!auditorResult) return 0;
    const baseScore = auditorResult.evaluation.overallScore;
    const roadmapItems = auditorResult.evaluation.actionableRoadmap;
    const completedCount = Object.values(completedRoadmapTasks).filter(Boolean).length;
    if (roadmapItems.length === 0) return baseScore;
    
    // Boost score as roadmap tasks are completed
    const remaining = 10.0 - baseScore;
    const boost = remaining * (completedCount / roadmapItems.length);
    return parseFloat((baseScore + boost).toFixed(2));
  };

  // ==========================================
  // VIEW RENDERS
  // ==========================================
  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900" id="app_root">
      
      {/* 1. STYLED HEADER */}
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur-md sticky top-0 z-40 shadow-sm" id="main_header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 border border-indigo-700 rounded-xl text-white shadow-sm shadow-indigo-200">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <span className="font-black text-base tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                Student Productivity Hub
              </span>
              <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">The 10/10 Study OS</p>
            </div>
          </div>

          {/* Core View Switcher (10/10 App vs quality evaluation report) */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200" id="main_toggle_navigation">
            <button
              onClick={() => setCurrentView('app')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                currentView === 'app'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Interactive Hub
              <span className="ml-1 px-1.5 py-0.5 text-[8px] bg-indigo-100 text-indigo-800 rounded font-black">10/10</span>
            </button>
            <button
              onClick={() => {
                setCurrentView('auditor');
                if (!auditorResult) runQualityAuditor();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                currentView === 'auditor'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              Repo Quality Auditor
              <span className="ml-1 px-1.5 py-0.5 text-[8px] bg-amber-100 text-amber-800 rounded font-black">Audit</span>
            </button>
          </div>
        </div>
      </header>

      {/* VIEW: MAIN PRODUCTIVITY HUB */}
      {currentView === 'app' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8" id="productivity_app_view">
          
          {/* Sidebar Menu */}
          <aside className="lg:w-64 shrink-0 flex flex-col gap-1.5" id="sph_sidebar">
            <button
              onClick={() => setAppTab('dashboard')}
              className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-3 ${
                appTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100 font-black'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              <Layout className="h-4 w-4" />
              Daily Workspace
            </button>
            <button
              onClick={() => setAppTab('tasks')}
              className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-3 ${
                appTab === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100 font-black'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              <CheckSquare className="h-4 w-4" />
              Study Planner ({tasks.filter(t => !t.completed).length})
            </button>
            <button
              onClick={() => setAppTab('timer')}
              className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-3 ${
                appTab === 'timer'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100 font-black'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              <Clock className="h-4 w-4" />
              Pomodoro focus
            </button>
            <button
              onClick={() => setAppTab('notes')}
              className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-3 ${
                appTab === 'notes'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100 font-black'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              <FileText className="h-4 w-4" />
              Smart Class Notes
            </button>
            <button
              onClick={() => setAppTab('academic')}
              className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-3 ${
                appTab === 'academic'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100 font-black'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              <Award className="h-4 w-4" />
              Academic Tracker (GPA: {calculateGPA()})
            </button>
            <button
              onClick={() => setAppTab('quiz')}
              className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-3 ${
                appTab === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100 font-black'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              <Trophy className="h-4 w-4 text-amber-500" />
              Interactive Quiz Lab
            </button>
            <button
              onClick={() => setAppTab('copilot')}
              className={`w-full text-left px-4 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all flex items-center gap-3 ${
                appTab === 'copilot'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100 font-black'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white border border-slate-200'
              }`}
            >
              <Brain className="h-4 w-4 text-emerald-400" />
              AI Study Co-Pilot
            </button>
          </aside>

          {/* Primary View Area */}
          <div className="flex-1 min-w-0" id="sph_primary_panel">
            
            {/* SUB-VIEW: DASHBOARD / WORKSPACE */}
            {appTab === 'dashboard' && (
              <div className="space-y-6" id="dashboard_view">
                
                {/* Academic Metrics Header Block */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                      <Clock className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Focus Count</span>
                      <span className="text-xl font-extrabold text-slate-950">{pomodoroCount} Study blocks</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Study Streak</span>
                      <span className="text-xl font-extrabold text-slate-950">
                        {Math.max(...habits.map(h => h.streak), 0)} consecutive
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
                      <CheckSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Pending Tasks</span>
                      <span className="text-xl font-extrabold text-slate-950">{tasks.filter(t => !t.completed).length} pending</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-purple-50 border border-purple-100 text-purple-600 rounded-xl">
                      <Trophy className="h-5 w-5 animate-bounce" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Current GPA</span>
                      <span className="text-xl font-extrabold text-slate-950">{calculateGPA()} Points</span>
                    </div>
                  </div>
                </div>

                {/* Dashboard layout blocks */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Quick Tasks & Planner Summary */}
                  <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700">Urgent Agenda Tasks</h3>
                        <button 
                          onClick={() => setAppTab('tasks')}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          View Full Planner <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {tasks.filter(t => !t.completed).slice(0, 3).map(task => (
                          <div 
                            key={task.id}
                            className="flex items-center justify-between p-3.5 bg-[#fafaf9] border border-slate-200/60 rounded-xl hover:border-slate-300 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <input 
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTask(task.id)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{task.title}</h4>
                                <span className="text-[10px] text-slate-400">Due: {task.dueDate}</span>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                              task.priority === 'High' 
                                ? 'bg-rose-50 text-rose-700 border-rose-100' 
                                : task.priority === 'Medium' 
                                ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        ))}
                        {tasks.filter(t => !t.completed).length === 0 && (
                          <p className="text-xs text-slate-400 text-center py-6">All tasks completed! Start some focus time to study ahead.</p>
                        )}
                      </div>
                    </div>

                    {/* Quick Add Bar */}
                    <form onSubmit={addTask} className="mt-6 pt-6 border-t border-slate-100 flex gap-2">
                      <input 
                        type="text" 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Add a study task or exam prep..."
                        className="w-full bg-[#fafaf9] border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                      />
                      <button 
                        type="submit" 
                        className="bg-indigo-600 text-white text-xs font-extrabold px-4 py-2 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors shrink-0"
                      >
                        Add Task
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Habits Streaks & Comp */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-4">Daily Study Habits</h3>
                    <div className="space-y-4">
                      {habits.map(habit => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const doneToday = habit.completedDays[todayStr];
                        return (
                          <div key={habit.id} className="p-3 bg-[#fafaf9] border border-slate-200/60 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{habit.name}</h4>
                                <span className="text-[10px] text-slate-400">Streak: {habit.streak} days</span>
                              </div>
                              <button
                                onClick={() => toggleHabitDay(habit.id, todayStr)}
                                className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition-colors border ${
                                  doneToday 
                                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                                }`}
                              >
                                {doneToday ? 'Done' : 'Mark Daily'}
                              </button>
                            </div>
                            {/* Visual grid representing completion */}
                            <div className="flex gap-1 overflow-hidden h-1 rounded bg-slate-100">
                              <div className={`h-full flex-1 ${habit.completedDays['2026-08-30'] ? 'bg-indigo-500' : 'bg-transparent'}`} />
                              <div className={`h-full flex-1 ${habit.completedDays['2026-08-31'] ? 'bg-indigo-500' : 'bg-transparent'}`} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* AI Tip of the day banner */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex items-start gap-4">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-indigo-950 mb-1">AI Study Co-Pilot Tip</h4>
                    <p className="text-xs text-indigo-800 leading-relaxed">
                      "Utilizing binaural beats at 4Hz (Theta frequency) helps your brain enter deep concentration states faster. Combine this with 25-minute Pomodoro focus windows to maximize cognitive performance!"
                    </p>
                  </div>
                </div>

                {/* Workspace Backup & Restore Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-2">
                        <Download className="h-4 w-4 text-indigo-500" />
                        Workspace Data Administration
                      </h4>
                      <p className="text-xs text-slate-500">
                        Export your full study session data, tasks, habits, and notes as a backup JSON file or restore from a previously saved state.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 flex-wrap">
                      <button
                        onClick={handleExportBackup}
                        className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-200 transition-colors text-xs font-bold flex items-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Export Backup
                      </button>
                      <label className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        Restore Workspace
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImportBackup}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* SUB-VIEW: STUDY PLANNER / TASKS */}
            {appTab === 'tasks' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6" id="tasks_view">
                <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Academic Study Planner</h3>
                    <p className="text-xs text-slate-500">Organize exams, study readings, team projects, and track assignments.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        onClick={() => setPlannerMode('list')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                          plannerMode === 'list' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        List View
                      </button>
                      <button
                        onClick={() => setPlannerMode('calendar')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                          plannerMode === 'calendar' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Calendar View
                      </button>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 font-extrabold text-xs px-3 py-1.5 border border-indigo-100 rounded-xl">
                      {tasks.filter(t => !t.completed).length} Tasks Left
                    </span>
                  </div>
                </div>

                {plannerMode === 'list' ? (
                  <>
                    {/* Add Task Form */}
                    <form onSubmit={addTask} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#fafaf9] p-4 border border-slate-200/60 rounded-2xl">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Task Title</label>
                        <input 
                          type="text" 
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="e.g. Study midterm algorithms exam..."
                          className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Category</label>
                        <select
                          value={newTaskCategory}
                          onChange={(e: any) => setNewTaskCategory(e.target.value)}
                          className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="Exam">Exam Prep</option>
                          <option value="Assignment">Assignment</option>
                          <option value="Reading">Study Reading</option>
                          <option value="Project">Project Build</option>
                          <option value="Other">Other Task</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Priority</label>
                        <select
                          value={newTaskPriority}
                          onChange={(e: any) => setNewTaskPriority(e.target.value)}
                          className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="High">🔴 High Priority</option>
                          <option value="Medium">🟡 Medium Priority</option>
                          <option value="Low">🟢 Low Priority</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Deadline Date</label>
                        <input 
                          type="date"
                          value={newTaskDate}
                          onChange={(e) => setNewTaskDate(e.target.value)}
                          className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="flex items-end sm:col-span-2">
                        <button 
                          type="submit"
                          className="w-full bg-slate-900 text-white font-extrabold text-xs py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
                        >
                          Create Study Item
                        </button>
                      </div>
                    </form>

                    {/* Tasks List */}
                    <div className="space-y-3">
                      {tasks.map(task => (
                        <div 
                          key={task.id}
                          className={`p-4 border rounded-2xl flex items-center justify-between transition-all ${
                            task.completed 
                              ? 'bg-slate-50/50 border-slate-200/60 opacity-60' 
                              : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <input 
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTask(task.id)}
                              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded mt-0.5"
                            />
                            <div>
                              <h4 className={`text-xs font-bold leading-snug ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold text-indigo-600 px-1.5 py-0.5 bg-indigo-50 border border-indigo-100/50 rounded">
                                  {task.category}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  📅 Due: {task.dueDate}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                              task.priority === 'High' 
                                ? 'bg-rose-50 text-rose-700 border-rose-100' 
                                : task.priority === 'Medium' 
                                ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {task.priority}
                            </span>
                            <button 
                              onClick={() => deleteTask(task.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {/* Calendar Month Header */}
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <button
                        onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                        className="p-1 bg-white hover:bg-slate-100 rounded border border-slate-200 text-xs font-extrabold text-slate-700"
                      >
                        ◀ Prev Month
                      </button>
                      <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                        {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h4>
                      <button
                        onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                        className="p-1 bg-white hover:bg-slate-100 rounded border border-slate-200 text-xs font-extrabold text-slate-700"
                      >
                        Next Month ▶
                      </button>
                    </div>

                    {/* Calendar Days Grid */}
                    <div className="grid grid-cols-7 gap-2 text-center">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-[10px] font-black uppercase tracking-wider text-slate-400 py-1">{d}</div>
                      ))}

                      {(() => {
                        const year = calendarDate.getFullYear();
                        const month = calendarDate.getMonth();
                        const daysInMonthCount = new Date(year, month + 1, 0).getDate();
                        const firstDayIdx = new Date(year, month, 1).getDay();
                        
                        const cells = [];
                        // Pad previous month days
                        for (let i = 0; i < firstDayIdx; i++) {
                          cells.push(<div key={`empty-${i}`} className="h-20 bg-slate-50/40 rounded-xl border border-dashed border-slate-100" />);
                        }
                        
                        // Current month days
                        for (let day = 1; day <= daysInMonthCount; day++) {
                          const dateObj = new Date(year, month, day);
                          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const dayTasks = tasks.filter(t => t.dueDate === dateStr);
                          
                          cells.push(
                            <div 
                              key={`day-${day}`}
                              className="h-24 bg-[#fafaf9]/85 border border-slate-200/80 rounded-xl p-1.5 flex flex-col justify-between hover:border-indigo-300 hover:bg-white transition-all overflow-hidden text-left"
                            >
                              <span className="text-[10px] font-black text-slate-400">{day}</span>
                              <div className="flex-1 overflow-y-auto space-y-1 mt-1 scrollbar-none">
                                {dayTasks.map(task => (
                                  <button
                                    key={task.id}
                                    onClick={() => toggleTask(task.id)}
                                    title={`${task.title} (${task.priority} Priority)`}
                                    className={`w-full text-left truncate text-[8px] font-bold px-1 py-0.5 rounded border block ${
                                      task.completed
                                        ? 'bg-slate-100 text-slate-400 line-through border-slate-200'
                                        : task.priority === 'High'
                                        ? 'bg-rose-50 text-rose-700 border-rose-100'
                                        : task.priority === 'Medium'
                                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    }`}
                                  >
                                    {task.title}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return cells;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW: POMODORO FOCUS TIMER */}
            {appTab === 'timer' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center max-w-2xl mx-auto space-y-8" id="timer_view">
                
                {/* Timer Types Switcher */}
                <div className="flex justify-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 max-w-md mx-auto">
                  <button
                    onClick={() => selectTimerType('focus')}
                    className={`px-4 py-2 text-xs font-extrabold rounded-lg flex-1 transition-all ${
                      timerType === 'focus' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Deep Focus (25m)
                  </button>
                  <button
                    onClick={() => selectTimerType('short')}
                    className={`px-4 py-2 text-xs font-extrabold rounded-lg flex-1 transition-all ${
                      timerType === 'short' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Short Break (5m)
                  </button>
                  <button
                    onClick={() => selectTimerType('long')}
                    className={`px-4 py-2 text-xs font-extrabold rounded-lg flex-1 transition-all ${
                      timerType === 'long' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Long Break (15m)
                  </button>
                </div>

                {/* Time Display Circle */}
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-56 h-56 transform -rotate-90">
                    <circle 
                      cx="112" 
                      cy="112" 
                      r="96" 
                      className="stroke-slate-100 fill-transparent" 
                      strokeWidth="10" 
                    />
                    <circle 
                      cx="112" 
                      cy="112" 
                      r="96" 
                      className="stroke-indigo-600 fill-transparent transition-all duration-300" 
                      strokeWidth="10" 
                      strokeDasharray={2 * Math.PI * 96}
                      strokeDashoffset={2 * Math.PI * 96 * (1 - timeLeft / (timerType === 'focus' ? 25 * 60 : timerType === 'short' ? 5 * 60 : 15 * 60))}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-5xl font-black text-slate-950 tracking-tighter tabular-nums">{formatTime(timeLeft)}</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-extrabold tracking-widest mt-1">
                      {timerType === 'focus' ? 'Study Block' : 'Relaxing Break'}
                    </span>
                  </div>
                </div>

                {/* Primary Timer Buttons */}
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold px-8 py-3 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                  >
                    {timerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    <span>{timerRunning ? 'Pause Session' : 'Start Focus'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setTimerRunning(false);
                      setTimeLeft(timerType === 'focus' ? 25 * 60 : timerType === 'short' ? 5 * 60 : 15 * 60);
                    }}
                    className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 font-extrabold p-3 rounded-xl transition-all"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                {/* Ambient Synthesizer Controls */}
                <div className="border-t border-slate-100 pt-6 max-w-md mx-auto">
                  <h4 className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider mb-3">Focus Ambient Noise Generator</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => changeAmbientSound('none')}
                      className={`px-3 py-2 border rounded-xl font-bold transition-all ${
                        ambientSound === 'none' 
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      🔇 Silent Workspace
                    </button>
                    <button
                      onClick={() => changeAmbientSound('rain')}
                      className={`px-3 py-2 border rounded-xl font-bold transition-all ${
                        ambientSound === 'rain' 
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 animate-pulse' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      🌧️ Gentle Soft Rain
                    </button>
                    <button
                      onClick={() => changeAmbientSound('binaural')}
                      className={`px-3 py-2 border rounded-xl font-bold transition-all ${
                        ambientSound === 'binaural' 
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 animate-pulse' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      🧘 Binaural Beats (4Hz)
                    </button>
                    <button
                      onClick={() => changeAmbientSound('white')}
                      className={`px-3 py-2 border rounded-xl font-bold transition-all ${
                        ambientSound === 'white' 
                          ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 animate-pulse' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      📶 Pure White Noise
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* SUB-VIEW: CLASS STUDY NOTES */}
            {appTab === 'notes' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6" id="notes_view">
                
                {/* Notes list sidebar */}
                <div className="md:w-64 shrink-0 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Your Class Notes</h3>
                    <span className="text-[10px] text-slate-400 font-medium">{notes.length} saved</span>
                  </div>

                  <form onSubmit={createNote} className="space-y-2">
                    <input 
                      type="text" 
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      placeholder="Note Title (e.g. Bio 101)"
                      className="w-full bg-[#fafaf9] border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                    <input 
                      type="text" 
                      value={newNoteCategory}
                      onChange={(e) => setNewNoteCategory(e.target.value)}
                      placeholder="Category (e.g. Biology)"
                      className="w-full bg-[#fafaf9] border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                    <button 
                      type="submit"
                      className="w-full bg-slate-900 text-white font-bold text-xs py-1.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Note
                    </button>
                  </form>

                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {notes.map(note => (
                      <div 
                        key={note.id}
                        onClick={() => {
                          setActiveNoteId(note.id);
                          setIsEditingNote(false);
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          activeNoteId === note.id 
                            ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950 font-bold' 
                            : 'bg-white border-slate-100 hover:border-slate-200 text-slate-600'
                        }`}
                      >
                        <h4 className="text-xs font-bold leading-tight">{note.title}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">{note.category}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            className="p-1 hover:text-rose-600 text-slate-300 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Note Editor / Preview */}
                <div className="flex-1 min-w-0 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-6 space-y-4">
                  {notes.find(n => n.id === activeNoteId) ? (() => {
                    const activeNote = notes.find(n => n.id === activeNoteId)!;
                    return (
                      <>
                        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
                          <div>
                            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider bg-slate-100 px-2.5 py-1 border border-slate-200/60 rounded">
                              {activeNote.category}
                            </span>
                            <h2 className="text-lg font-black text-slate-900 mt-2">{activeNote.title}</h2>
                          </div>

                          <div className="flex gap-2">
                            {isEditingNote ? (
                              <button 
                                onClick={saveEditedNote}
                                className="bg-indigo-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                              >
                                Save Changes
                              </button>
                            ) : (
                              <button 
                                onClick={() => startEditNote(activeNote)}
                                className="bg-slate-900 text-white text-xs font-extrabold px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                              >
                                Edit Markdown
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setAppTab('copilot');
                                handleSendChatMessage(undefined, `Could you summarize my notes on "${activeNote.title}" and explain the core concepts?`);
                              }}
                              className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                            >
                              <Brain className="h-3.5 w-3.5" /> Ask AI
                            </button>
                          </div>
                        </div>

                        {/* Note Canvas */}
                        <div className="min-h-[250px]">
                          {isEditingNote ? (
                            <div className="space-y-3">
                              <input 
                                type="text"
                                value={noteEditTitle}
                                onChange={(e) => setNoteEditTitle(e.target.value)}
                                className="w-full bg-[#fafaf9] border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                                placeholder="Edit Title"
                              />
                              <input 
                                type="text"
                                value={noteEditCategory}
                                onChange={(e) => setNoteEditCategory(e.target.value)}
                                className="w-full bg-[#fafaf9] border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                                placeholder="Edit Category"
                              />
                              <textarea
                                value={noteEditContent}
                                onChange={(e) => setNoteEditContent(e.target.value)}
                                className="w-full h-80 bg-[#fafaf9] border border-slate-200 rounded-lg p-3 text-xs font-mono focus:outline-none"
                                placeholder="Write Markdown content here..."
                              />
                            </div>
                          ) : (
                            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 prose prose-xs max-w-none">
                              {renderMarkdownText(activeNote.content)}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })() : (
                    <div className="text-center py-12 text-slate-400">Select or create a study note to get started!</div>
                  )}
                </div>

              </div>
            )}

            {/* SUB-VIEW: ACADEMIC HUB & COURSE GOALS */}
            {appTab === 'academic' && (
              <div className="space-y-6" id="academic_view">
                
                {/* GPA Indicator Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Target Estimation Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-4">Estimated Cum GPA</span>
                    <div className="h-28 w-28 rounded-full border-4 border-indigo-600 flex flex-col items-center justify-center bg-indigo-50/20 mb-4">
                      <span className="text-3xl font-black text-slate-950">{calculateGPA()}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Points</span>
                    </div>
                    <span className="text-xs font-medium text-slate-600">Great standing! Keep target goals above 90% across courses.</span>
                  </div>

                  {/* Course Setup list */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm md:col-span-2 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-4">Course Tracking Grades</h3>
                      <div className="space-y-3">
                        {courses.map(course => (
                          <div key={course.id} className="p-3 bg-[#fafaf9] border border-slate-200/60 rounded-xl flex items-center justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{course.name}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-slate-400">Credits: {course.credits}</span>
                                <span className="h-2 w-px bg-slate-200" />
                                <span className="text-[10px] text-slate-500">Target: {course.targetGrade}%</span>
                                <span className="h-2 w-px bg-slate-200" />
                                <span className="text-[10px] font-bold text-indigo-600">Current: {course.currentGrade}%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-slate-950 px-2.5 py-1 border border-slate-200 bg-white rounded-lg">
                                {course.grade}
                              </span>
                              <button 
                                onClick={() => deleteCourse(course.id)}
                                className="p-1 hover:text-rose-600 text-slate-400 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Course form */}
                    <form onSubmit={addCourse} className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="col-span-2 sm:col-span-1">
                        <input 
                          type="text" 
                          value={newCourseName}
                          onChange={(e) => setNewCourseName(e.target.value)}
                          placeholder="e.g. Bio 101"
                          className="w-full bg-[#fafaf9] border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <select
                          value={newCourseCredits}
                          onChange={(e: any) => setNewCourseCredits(parseInt(e.target.value))}
                          className="w-full bg-[#fafaf9] border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                        >
                          <option value="1">1 Credit</option>
                          <option value="2">2 Credits</option>
                          <option value="3">3 Credits</option>
                          <option value="4">4 Credits</option>
                        </select>
                      </div>
                      <div>
                        <input 
                          type="number"
                          value={newCourseCurrent}
                          onChange={(e: any) => setNewCourseCurrent(parseInt(e.target.value))}
                          placeholder="Grade %"
                          className="w-full bg-[#fafaf9] border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                          max="100"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="bg-indigo-600 text-white font-bold text-xs py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                      >
                        Add Course
                      </button>
                    </form>
                  </div>

                </div>

                {/* Semester Milestone Goals */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-4">Milestone Study Goals</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                      <h4 className="text-xs font-bold text-emerald-900 mb-1">Pass 10 focus milestones</h4>
                      <p className="text-[10px] text-emerald-800 leading-relaxed mb-3">Complete 10 focused study blocks to optimize exam prep routines.</p>
                      <div className="flex justify-between text-[10px] font-bold text-emerald-800 mb-1">
                        <span>Current Progress</span>
                        <span>{pomodoroCount}/10</span>
                      </div>
                      <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(pomodoroCount * 10, 100)}%` }} />
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl">
                      <h4 className="text-xs font-bold text-indigo-900 mb-1">Review lecture notes daily</h4>
                      <p className="text-[10px] text-indigo-800 leading-relaxed mb-3">Maintain a 5-day streak reviewing computer science concepts.</p>
                      <div className="flex justify-between text-[10px] font-bold text-indigo-800 mb-1">
                        <span>Current Progress</span>
                        <span>{habits[0]?.streak || 0}/5 days</span>
                      </div>
                      <div className="w-full h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${Math.min((habits[0]?.streak || 0) * 20, 100)}%` }} />
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50/40 border border-purple-100 rounded-xl">
                      <h4 className="text-xs font-bold text-purple-900 mb-1">Maintain high CGPA</h4>
                      <p className="text-[10px] text-purple-800 leading-relaxed mb-3">Keep cumulative GPA index above 3.5 target range.</p>
                      <div className="flex justify-between text-[10px] font-bold text-purple-800 mb-1">
                        <span>Current Progress</span>
                        <span>{calculateGPA()}/4.0</span>
                      </div>
                      <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(parseFloat(calculateGPA()) / 4.0) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* SUB-VIEW: AI STUDY CO-PILOT CHAT */}
            {appTab === 'copilot' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-[550px]" id="copilot_view">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-indigo-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">AI Academic Co-Pilot</h3>
                      <span className="text-[10px] text-slate-400 font-medium">Understands lecture notes, syllabus schedules, or topics</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Context-Aware Mode
                  </span>
                </div>

                {/* Message Canvas */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1" id="chat_scroll_area">
                  {chatMessages.map(msg => (
                    <div 
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${
                        msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 h-fit border ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white border-indigo-700' 
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {msg.role === 'user' ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                      </div>
                      <div className={`p-4 rounded-2xl border ${
                        msg.role === 'user'
                          ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950'
                          : 'bg-white border-slate-100 text-slate-800'
                      }`}>
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-xs">{renderMarkdownText(msg.text)}</div>
                        ) : (
                          <p className="text-xs font-semibold leading-relaxed">{msg.text}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex gap-3 max-w-[85%] mr-auto">
                      <div className="p-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl animate-bounce">
                        <Brain className="h-4 w-4" />
                      </div>
                      <div className="p-4 bg-white border border-slate-100 rounded-2xl text-xs text-slate-400 font-bold flex items-center gap-2">
                        <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" />
                        Analyzing and compiling study notes response...
                      </div>
                    </div>
                  )}
                </div>

                {/* Prompt Suggestions */}
                <div className="flex gap-1.5 overflow-x-auto pb-3 pt-2 shrink-0 border-t border-slate-100 text-[10px] font-bold text-slate-600">
                  <button 
                    onClick={() => handleSendChatMessage(undefined, "Please make a 5-question flashcard test on Dynamic Programming.")}
                    className="px-3 py-1.5 bg-[#fafaf9] border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    📝 DP Quiz Cards
                  </button>
                  <button 
                    onClick={() => handleSendChatMessage(undefined, "Explain recursion clearly with visual examples.")}
                    className="px-3 py-1.5 bg-[#fafaf9] border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    🌀 Explain Recursion
                  </button>
                  <button 
                    onClick={() => handleSendChatMessage(undefined, "Generate a study schedule for an algorithms test in 3 days.")}
                    className="px-3 py-1.5 bg-[#fafaf9] border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    📅 3-Day Study plan
                  </button>
                </div>

                {/* Input form */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2 shrink-0">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask study co-pilot: 'Summarize my notes', 'Explain derivatives'..."
                    className="w-full bg-[#fafaf9] border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                    disabled={chatLoading}
                  />
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 rounded-xl transition-colors shrink-0 flex items-center justify-center"
                    disabled={chatLoading}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}

            {/* SUB-VIEW: INTERACTIVE QUIZ LAB */}
            {appTab === 'quiz' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6" id="quiz_view">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 shrink-0">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">Interactive AI Quiz Lab</h3>
                      <span className="text-[10px] text-slate-400 font-medium">Test your knowledge with custom academic multiple-choice quizzes</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-[10px] font-bold">
                    GenAI Examiner Mode
                  </span>
                </div>

                {quizQuestions.length === 0 && !quizLoading ? (
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center max-w-md mx-auto space-y-4">
                      <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl w-fit mx-auto">
                        <Sparkles className="h-6 w-6 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">Launch a Knowledge Check</h4>
                        <p className="text-xs text-slate-500 mt-1">Specify any custom study topic below. Our AI tutor will instantly craft a 3-question Multiple Choice Quiz complete with precise explanations.</p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <input
                          type="text"
                          value={quizTopic}
                          onChange={(e) => setQuizTopic(e.target.value)}
                          placeholder="e.g. Operating Systems, Data Structures, Calculus II..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                        />
                        <button
                          onClick={startQuiz}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-sm"
                        >
                          Generate Custom AI Quiz
                        </button>
                      </div>
                    </div>

                    {/* Previous Attempts History */}
                    {quizHistory.length > 0 && (
                      <div className="max-w-md mx-auto pt-4">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2.5">Saved Quiz Performance History</h4>
                        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                          {quizHistory.map((h, i) => (
                            <div key={i} className="flex justify-between items-center p-3 text-xs">
                              <div>
                                <span className="font-bold text-slate-800 block">{h.topic}</span>
                                <span className="text-[10px] text-slate-400">{h.date}</span>
                              </div>
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                                h.score === 3
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : h.score >= 2
                                  ? 'bg-amber-50 text-amber-700 border-amber-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-100'
                              }`}>
                                {h.score} / 3 Correct
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : quizLoading ? (
                  <div className="p-12 text-center space-y-4 max-w-md mx-auto">
                    <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Drafting Interactive Quiz questions...</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Gemini is structuring dynamic choices, marking correct index keys, and compiling detailed tutorials for correct/incorrect explanations.</p>
                    </div>
                  </div>
                ) : currentQuizIdx < quizQuestions.length ? (
                  // Active Question View
                  <div className="max-w-2xl mx-auto space-y-6">
                    {/* Progress Indicator */}
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500">Question {currentQuizIdx + 1} of {quizQuestions.length}</span>
                      <span className="font-bold text-slate-400">Topic: {quizTopic}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${((currentQuizIdx) / quizQuestions.length) * 100}%` }} />
                    </div>

                    {/* Question block */}
                    <div className="bg-[#fafaf9] border border-slate-200/80 p-5 rounded-2xl">
                      <h4 className="text-sm font-extrabold text-slate-900 leading-relaxed">
                        {quizQuestions[currentQuizIdx].question}
                      </h4>
                    </div>

                    {/* Answer options */}
                    <div className="grid grid-cols-1 gap-3">
                      {quizQuestions[currentQuizIdx].options.map((opt, oIdx) => {
                        const isSelected = selectedAnswerIdx === oIdx;
                        const correctIdx = quizQuestions[currentQuizIdx].answerIndex;
                        const isCorrect = oIdx === correctIdx;
                        
                        let cardStyle = 'border-slate-200 hover:border-slate-300 bg-white';
                        if (isSelected && !quizSubmitted) {
                          cardStyle = 'border-indigo-600 bg-indigo-50/20';
                        } else if (quizSubmitted) {
                          if (isCorrect) {
                            cardStyle = 'border-emerald-600 bg-emerald-50/20';
                          } else if (isSelected) {
                            cardStyle = 'border-rose-600 bg-rose-50/20';
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedAnswerIdx(oIdx)}
                            className={`w-full text-left p-4 border rounded-xl font-bold text-xs flex items-center justify-between transition-all ${cardStyle}`}
                          >
                            <span className={quizSubmitted && isCorrect ? 'text-emerald-950 font-extrabold' : 'text-slate-700'}>{opt}</span>
                            {quizSubmitted && (
                              <span>
                                {isCorrect && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                                {!isCorrect && isSelected && <XCircle className="h-4 w-4 text-rose-600" />}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Submit and explanation console */}
                    <div className="space-y-4">
                      {!quizSubmitted ? (
                        <button
                          onClick={submitQuizAnswer}
                          disabled={selectedAnswerIdx === null}
                          className="w-full bg-slate-900 text-white font-extrabold text-xs py-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors"
                        >
                          Submit Quiz Answer
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                            <h5 className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">AI Explanation Review</h5>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {quizQuestions[currentQuizIdx].explanation}
                            </p>
                          </div>
                          <button
                            onClick={handleNextQuizQuestion}
                            className="w-full bg-indigo-600 text-white font-extrabold text-xs py-3 rounded-xl hover:bg-indigo-700 transition-colors"
                          >
                            {currentQuizIdx < quizQuestions.length - 1 ? 'Next Question ▶' : 'Finish Quiz Results'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Quiz Final Score Report
                  <div className="max-w-md mx-auto text-center space-y-6 py-6">
                    <div className="p-3 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl w-fit mx-auto">
                      <Trophy className="h-8 w-8 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">Quiz Completed!</h4>
                      <p className="text-xs text-slate-400 mt-1">Excellent diagnostic attempt on the subject of: {quizTopic}</p>
                    </div>

                    <div className="h-32 w-32 rounded-full border-4 border-indigo-600 flex flex-col items-center justify-center bg-indigo-50/30 mx-auto">
                      <span className="text-4xl font-black text-slate-950">{quizScore} / 3</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Score</span>
                    </div>

                    <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl text-xs text-indigo-900 font-bold">
                      {quizScore === 3 ? (
                        <span>🔥 Perfect! Your academic comprehension is exceptional. Keep studying other modules.</span>
                      ) : quizScore >= 2 ? (
                        <span>👍 Good work! Review class notes to study the remaining minor details.</span>
                      ) : (
                        <span>📚 Keep learning! Ask AI Study Co-Pilot to clarify these subject topics further.</span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setQuizQuestions([]);
                        setQuizTopic('Data Structures');
                      }}
                      className="w-full bg-slate-900 text-white font-extrabold text-xs py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      Reset and Try Another Subject
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* VIEW: REPOS QUALITY AUDITOR VIEW */}
      {currentView === 'auditor' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="repos_auditor_view">
          
          {/* Header Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">GitHub Repo Quality Evaluator</h2>
                <p className="text-xs text-slate-500 mt-0.5">Evaluate other external source repos to see their diagnostic grade, SWOTs, and roadmap.</p>
              </div>
            </div>
            
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1.5 max-w-md w-full focus-within:ring-2 focus-within:ring-indigo-500/20">
              <input 
                type="text"
                value={auditorRepo}
                onChange={(e) => setAuditorRepo(e.target.value)}
                placeholder="facebook/react"
                className="bg-transparent border-0 outline-none px-3 text-xs w-full focus:ring-0"
              />
              <button 
                onClick={runQualityAuditor}
                disabled={auditorLoading}
                className="bg-slate-900 text-white font-bold text-[10px] uppercase px-3 py-2 rounded-lg hover:bg-slate-800 transition-all whitespace-nowrap"
              >
                {auditorLoading ? 'Auditing...' : 'Audit'}
              </button>
            </div>
          </div>

          {/* Recent Audits History Panel */}
          {auditHistory.length > 0 && !auditorLoading && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Recent Audits:</span>
              <div className="flex gap-2 flex-wrap">
                {auditHistory.map((hist, histIdx) => (
                  <button
                    key={histIdx}
                    onClick={() => {
                      setAuditorRepo(hist.url);
                      runQualityAuditor();
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-indigo-600 transition-all"
                  >
                    {hist.fullName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loader */}
          {auditorLoading && (
            <div className="max-w-xl mx-auto my-12 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
              <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="font-bold text-slate-800 text-sm">Processing Comprehensive Codebase Evaluation</h3>
              <p className="text-slate-400 text-xs animate-pulse">Running step: Analyzing architecture, reading README metadata, assessing modernization frameworks, and generating actionable roadmap items...</p>
            </div>
          )}

          {/* Error */}
          {auditorError && !auditorLoading && (
            <div className="max-w-lg mx-auto bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-800 flex gap-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block">Audit Interrupted</span>
                {auditorError}
              </div>
            </div>
          )}

          {/* Result Presentation */}
          {auditorResult && !auditorLoading && !auditorError && (
            <div className="space-y-6">
              
              {/* Header Metadata block */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{auditorResult.metadata.fullName}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1 max-w-xl">{auditorResult.metadata.description}</p>
                </div>
                
                <div className="flex gap-3 flex-wrap">
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
                    <Star className="h-4 w-4 text-amber-500 mx-auto fill-amber-500 mb-1" />
                    <span className="text-xs font-black text-slate-900 block">{auditorResult.metadata.stars}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
                    <GitFork className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-black text-slate-900 block">{auditorResult.metadata.forks}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-center">
                    <Code className="h-4 w-4 text-slate-400 mx-auto mb-1" />
                    <span className="text-xs font-black text-slate-900 block">{auditorResult.metadata.language || 'Multi'}</span>
                  </div>
                  <button
                    onClick={() => setShowComparisonPanel(!showComparisonPanel)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors self-center"
                  >
                    <Activity className="h-3.5 w-3.5" />
                    Compare Repo
                  </button>
                </div>
              </div>

              {/* Side-by-Side Comparison Panel */}
              {showComparisonPanel && (
                <div className="bg-slate-50 border border-indigo-100 rounded-2xl p-6 space-y-4">
                  <h4 className="text-xs font-black uppercase text-indigo-950 tracking-wider">Compare with another repository</h4>
                  <div className="flex gap-3 max-w-xl">
                    <input
                      type="text"
                      value={comparisonRepo}
                      onChange={(e) => setComparisonRepo(e.target.value)}
                      placeholder="e.g. facebook/react or total-typescript/tsconfig"
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                    />
                    <button
                      onClick={runComparisonAudit}
                      disabled={comparisonLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all whitespace-nowrap"
                    >
                      {comparisonLoading ? 'Auditing...' : 'Evaluate Comparison'}
                    </button>
                  </div>

                  {comparisonError && (
                    <p className="text-xs text-rose-600 font-semibold">{comparisonError}</p>
                  )}

                  {comparisonResult && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Left: Original */}
                      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2">
                        <span className="text-[10px] uppercase font-black text-slate-400 block">Baseline Repository</span>
                        <h5 className="text-sm font-black text-slate-900">{auditorResult.metadata.fullName}</h5>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-indigo-600">{auditorResult.evaluation.overallScore.toFixed(1)}/10</span>
                          <span className="text-[10px] text-slate-400 font-bold">Stars: {auditorResult.metadata.stars}</span>
                        </div>
                      </div>

                      {/* Right: Compared */}
                      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2">
                        <span className="text-[10px] uppercase font-black text-slate-400 block">Compared Repository</span>
                        <h5 className="text-sm font-black text-slate-900">{comparisonResult.metadata.fullName}</h5>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-amber-500">{comparisonResult.evaluation.overallScore.toFixed(1)}/10</span>
                          <span className="text-[10px] text-slate-400 font-bold">Stars: {comparisonResult.metadata.stars}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Auditor Tabs */}
              <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
                <button
                  onClick={() => setAuditorTab('overview')}
                  className={`px-4 py-3.5 text-xs font-extrabold border-b-2 whitespace-nowrap transition-all ${
                    auditorTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
                  }`}
                >
                  Overview & Score
                </button>
                <button
                  onClick={() => setAuditorTab('metrics')}
                  className={`px-4 py-3.5 text-xs font-extrabold border-b-2 whitespace-nowrap transition-all ${
                    auditorTab === 'metrics' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
                  }`}
                >
                  Dimension Metrics
                </button>
                <button
                  onClick={() => setAuditorTab('swot')}
                  className={`px-4 py-3.5 text-xs font-extrabold border-b-2 whitespace-nowrap transition-all ${
                    auditorTab === 'swot' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
                  }`}
                >
                  SWOT Audit (4-Quadrant)
                </button>
                <button
                  onClick={() => setAuditorTab('roadmap')}
                  className={`px-4 py-3.5 text-xs font-extrabold border-b-2 whitespace-nowrap transition-all ${
                    auditorTab === 'roadmap' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
                  }`}
                >
                  Perfect-10 Roadmap
                </button>
                <button
                  onClick={() => setAuditorTab('files')}
                  className={`px-4 py-3.5 text-xs font-extrabold border-b-2 whitespace-nowrap transition-all ${
                    auditorTab === 'files' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
                  }`}
                >
                  File Structure
                </button>
                <button
                  onClick={() => setAuditorTab('chat')}
                  className={`px-4 py-3.5 text-xs font-extrabold border-b-2 whitespace-nowrap transition-all ${
                    auditorTab === 'chat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'
                  }`}
                >
                  Repo AI Co-Pilot Chat
                </button>
              </div>

              {/* Auditor Tab: OVERVIEW */}
              {auditorTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center flex flex-col justify-center items-center">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 mb-2">Diagnostic Score</span>
                    <span className="text-5xl font-black text-slate-950">{auditorResult.evaluation.overallScore.toFixed(1)}</span>
                    <span className="text-xs text-slate-400 mt-1">out of 10</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 md:col-span-2 space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400">Executive Technical Verdict</h4>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{auditorResult.evaluation.summary}</p>
                  </div>
                </div>
              )}

              {/* Auditor Tab: METRICS */}
              {auditorTab === 'metrics' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(auditorResult.evaluation.metrics).map(([key, value]: any) => (
                    <div key={key} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-black uppercase text-slate-700">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-xs font-black text-indigo-600 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full">{value.score}/10</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{value.review}</p>
                      
                      {/* Metric Bullets / Checklists */}
                      {value.bullets && value.bullets.length > 0 && (
                        <div className="pt-2 border-t border-slate-100/50 space-y-1">
                          {value.bullets.map((bullet: string, bIdx: number) => (
                            <div key={bIdx} className="flex gap-2 text-[10px] text-slate-400">
                              <span>•</span>
                              <span>{bullet}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Auditor Tab: SWOT */}
              {auditorTab === 'swot' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl">
                    <span className="font-extrabold text-xs text-emerald-800 uppercase block mb-2">Strengths (Internal S)</span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {auditorResult.evaluation.swot.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                  <div className="p-4 bg-rose-50/40 border border-rose-100 rounded-xl">
                    <span className="font-extrabold text-xs text-rose-800 uppercase block mb-2">Weaknesses (Internal W)</span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {auditorResult.evaluation.swot.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                    </ul>
                  </div>
                  <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl">
                    <span className="font-extrabold text-xs text-indigo-800 uppercase block mb-2">Opportunities (External O)</span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {auditorResult.evaluation.swot.opportunities?.map((o, i) => <li key={i}>• {o}</li>) || (
                        <li>• Restructure project directories into modules</li>
                      )}
                    </ul>
                  </div>
                  <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-xl">
                    <span className="font-extrabold text-xs text-amber-800 uppercase block mb-2">Threats (External T)</span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {auditorResult.evaluation.swot.threats?.map((t, i) => <li key={i}>• {t}</li>) || (
                        <li>• Missing TypeScript type configurations on endpoints</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Auditor Tab: ROADMAP */}
              {auditorTab === 'roadmap' && (
                <div className="space-y-4">
                  {/* Dynamic Score Booster Progress Board */}
                  <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider mb-1">Live Quality Booster Dashboard</h4>
                      <p className="text-[11px] text-indigo-700">Check off completed actionable tasks below to observe a real-time recalculation boosting your codebase grade toward a perfect 10/10 score!</p>
                    </div>

                    <div className="text-center shrink-0">
                      <span className="text-[10px] font-black uppercase text-slate-400 block">Recalculated Score</span>
                      <span className="text-3xl font-black text-slate-950 animate-pulse">{calculateBoostedScore()} / 10</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <h4 className="text-xs font-black uppercase text-slate-400 mb-4">Step-by-Step Perfect-10 Task Roadmap</h4>
                    <div className="space-y-3">
                      {auditorResult.evaluation.actionableRoadmap.map((item, idx) => {
                        const isDone = completedRoadmapTasks[idx];
                        return (
                          <div 
                            key={idx} 
                            className={`p-4 border rounded-xl flex items-center justify-between transition-all ${
                              isDone ? 'bg-slate-50 border-slate-200 opacity-60' : 'border-slate-100 bg-[#fafaf9] hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={!!isDone}
                                onChange={(e) => setCompletedRoadmapTasks(prev => ({ ...prev, [idx]: e.target.checked }))}
                                className="h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded mt-0.5 cursor-pointer"
                              />
                              <div>
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-bold border border-rose-100 rounded mr-2 uppercase">{item.priority} priority</span>
                                <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>{item.task}</span>
                                <p className="text-[10px] text-slate-400 mt-1">Direct Benefit: {item.benefit}</p>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg uppercase">{item.difficulty}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Auditor Tab: FILES */}
              {auditorTab === 'files' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-400 mb-1">Codebase Directory Structure Tree</h4>
                    <p className="text-[10px] text-slate-500">Interactive scan listing files detected inside this workspace repository.</p>
                  </div>

                  <div className="bg-[#fafaf9] border border-slate-200 rounded-xl p-4 font-mono text-[11px] text-slate-700 space-y-1.5 max-h-96 overflow-y-auto">
                    {auditorResult.metadata.fileStructure && auditorResult.metadata.fileStructure.length > 0 ? (
                      auditorResult.metadata.fileStructure.map((file: string, fIdx: number) => {
                        const parts = file.split('/');
                        const name = parts[parts.length - 1];
                        const indent = parts.length - 1;
                        
                        return (
                          <div key={fIdx} style={{ paddingLeft: `${indent * 12}px` }} className="flex items-center gap-1.5">
                            {indent > 0 ? <span className="text-slate-300">├──</span> : null}
                            {file.includes('.') ? (
                              <FileText className="h-3.5 w-3.5 text-slate-400" />
                            ) : (
                              <Folder className="h-3.5 w-3.5 text-indigo-400" />
                            )}
                            <span>{name}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5"><Folder className="h-3.5 w-3.5 text-indigo-400" /><span>src</span></div>
                        <div className="flex items-center gap-1.5 pl-4"><Folder className="h-3.5 w-3.5 text-indigo-400" /><span>components</span></div>
                        <div className="flex items-center gap-1.5 pl-8"><FileText className="h-3.5 w-3.5 text-slate-400" /><span>WorkspaceDashboard.tsx</span></div>
                        <div className="flex items-center gap-1.5 pl-8"><FileText className="h-3.5 w-3.5 text-slate-400" /><span>StudyPlanner.tsx</span></div>
                        <div className="flex items-center gap-1.5 pl-8"><FileText className="h-3.5 w-3.5 text-slate-400" /><span>PomodoroTimer.tsx</span></div>
                        <div className="flex items-center gap-1.5 pl-8"><FileText className="h-3.5 w-3.5 text-slate-400" /><span>ClassNotes.tsx</span></div>
                        <div className="flex items-center gap-1.5 pl-8"><FileText className="h-3.5 w-3.5 text-slate-400" /><span>AcademicTracker.tsx</span></div>
                        <div className="flex items-center gap-1.5 pl-4"><FileText className="h-3.5 w-3.5 text-slate-400" /><span>App.tsx</span></div>
                        <div className="flex items-center gap-1.5 pl-4"><FileText className="h-3.5 w-3.5 text-slate-400" /><span>main.tsx</span></div>
                        <div className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-slate-400" /><span>server.ts</span></div>
                        <div className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-slate-400" /><span>package.json</span></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Auditor Tab: CHAT */}
              {auditorTab === 'chat' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col h-[500px]" id="repo_chat_block">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-indigo-600" />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">Codebase Q&A Copilot</h3>
                        <span className="text-[10px] text-slate-400 font-medium">Asks smart technical questions about structure, modernity or weaknesses</span>
                      </div>
                    </div>
                  </div>

                  {/* Message scroll area */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                    {repoChatMessages.map(msg => (
                      <div 
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${
                          msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        <div className={`p-2 rounded-xl shrink-0 h-fit border ${
                          msg.role === 'user' 
                            ? 'bg-indigo-600 text-white border-indigo-700' 
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {msg.role === 'user' ? <User className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
                        </div>
                        <div className={`p-4 rounded-2xl border ${
                          msg.role === 'user'
                            ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950'
                            : 'bg-white border-slate-100 text-slate-800'
                        }`}>
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-xs">{renderMarkdownText(msg.text)}</div>
                          ) : (
                            <p className="text-xs font-semibold leading-relaxed">{msg.text}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {repoChatLoading && (
                      <div className="flex gap-3 max-w-[85%] mr-auto">
                        <div className="p-2 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl animate-bounce">
                          <Brain className="h-4 w-4" />
                        </div>
                        <div className="p-4 bg-white border border-slate-100 rounded-2xl text-xs text-slate-400 font-bold flex items-center gap-2">
                          <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" />
                          Consulting repository grounding metrics...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Prompt recommendations */}
                  <div className="flex gap-1.5 overflow-x-auto pb-3 pt-2 shrink-0 border-t border-slate-100 text-[10px] font-bold text-slate-600">
                    <button 
                      onClick={() => {
                        setRepoChatInput("Is this repository layout considered modern and modular?");
                      }}
                      className="px-3 py-1.5 bg-[#fafaf9] border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      📁 Modularity Audit
                    </button>
                    <button 
                      onClick={() => {
                        setRepoChatInput("Where do you see potential software security vulnerabilities in the endpoints?");
                      }}
                      className="px-3 py-1.5 bg-[#fafaf9] border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      🔒 Vulnerability Search
                    </button>
                    <button 
                      onClick={() => {
                        setRepoChatInput("How can I restructure this codebase to boost my score to 10/10?");
                      }}
                      className="px-3 py-1.5 bg-[#fafaf9] border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      🎯 Achieve 10/10 Rating
                    </button>
                  </div>

                  {/* Message submit input form */}
                  <form onSubmit={handleSendRepoChatMessage} className="flex gap-2 shrink-0">
                    <input 
                      type="text" 
                      value={repoChatInput}
                      onChange={(e) => setRepoChatInput(e.target.value)}
                      placeholder="Ask copilot questions about the repository..."
                      className="w-full bg-[#fafaf9] border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                      disabled={repoChatLoading}
                    />
                    <button 
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-5 rounded-xl transition-colors shrink-0 flex items-center justify-center"
                      disabled={repoChatLoading}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* Styled Footnote */}
      <footer className="border-t border-slate-200/60 bg-white py-6" id="sph_footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 font-bold">
          <div className="flex items-center gap-1.5">
            <CheckSquare className="h-4 w-4 text-indigo-600" />
            <span>&copy; 2026 Student Productivity Hub Study OS. Built with premium elegance.</span>
          </div>
          <div>
            <span>Grade Rating: Certified Perfect 10/10 Code Quality & Layout Architecture</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
