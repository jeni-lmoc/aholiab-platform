import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  RotateCcw, 
  Sliders, 
  Layers, 
  Tv, 
  Calendar, 
  Edit2, 
  Volume2, 
  FileText, 
  Clock 
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface Phase {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  deadline: string;
  isMidweek?: boolean;
  tasks: Task[];
}

export default function ChurchChecklist() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState<string>('midweek');
  const [evangelismMode, setEvangelismMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'S' | 'M' | 'L'>('M');
  
  // Sabbath Date State (Defaults to upcoming Saturday)
  const [targetDate, setTargetDate] = useState<string>('');
  const [isEditingDate, setIsEditingDate] = useState<boolean>(false);

  // Core Checklist Data State
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: 'midweek',
      title: 'Midweek Prep',
      subtitle: 'Backdrops & Theme',
      deadline: 'Due Wednesday',
      isMidweek: true,
      icon: <Layers className="w-5 h-5" />,
      tasks: [
        { id: 'mw-1', text: 'Confirm sermon theme and scripture focus with Pastor', completed: false },
        { id: 'mw-2', text: 'Select and download high-resolution background graphics', completed: false },
        { id: 'mw-3', text: 'Coordinate worship song list with Music Director', completed: false },
        { id: 'mw-4', text: 'Build initial lower-third graphic templates', completed: false },
      ]
    },
    {
      id: 'pre-service',
      title: 'Pre-Service',
      subtitle: 'Morning Setup & Tests',
      deadline: '8:30 AM',
      icon: <Clock className="w-5 h-5" />,
      tasks: [
        { id: 'pre-1', text: 'Power on all projection systems and confidence monitors', completed: false },
        { id: 'pre-2', text: 'Import sermon notes and verify slide formatting/spelling', completed: false },
        { id: 'pre-3', text: 'Run full loop test of announcement rolling slides', completed: false },
        { id: 'pre-4', text: 'Verify live video feed overlay and lower-third sync', completed: false },
      ]
    },
    {
      id: 'during-service',
      title: 'During Service',
      subtitle: 'Live Execution',
      deadline: '10:45 AM',
      icon: <Tv className="w-5 h-5" />,
      tasks: [
        { id: 'dur-1', text: 'Track pastor closely for real-time scripture slide lookups', completed: false },
        { id: 'dur-2', text: 'Trigger custom lower-thirds during corporate prayer', completed: false },
        { id: 'dur-3', text: 'Fire specific media elements for dynamic sermon transitions', completed: false },
        { id: 'dur-4', text: 'Monitor live-stream output for text readability', completed: false },
      ]
    },
    {
      id: 'post-service',
      title: 'Post-Service',
      subtitle: 'Wrap Up & Archive',
      deadline: '1:00 PM',
      icon: <RotateCcw className="w-5 h-5" />,
      tasks: [
        { id: 'post-1', text: 'Save finalized presentation to church archives folder', completed: false },
        { id: 'post-2', text: 'Export sermon presentation graphics for social media team', completed: false },
        { id: 'post-3', text: 'Clear local temporary cache and stage folder templates', completed: false },
        { id: 'post-4', text: 'Power down primary console matrix hardware safely', completed: false },
      ]
    }
  ]);

  // --- INITIALIZATION EFFECTS ---
  useEffect(() => {
    // 1. Calculate next upcoming Saturday dynamically
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
    
    const formattedDate = nextSaturday.toISOString().split('T')[0];
    setTargetDate(formattedDate);

    // 2. Load preferred Font Size from Local Storage if it exists
    const savedFontSize = localStorage.getItem('slides-console-font-size');
    if (savedFontSize === 'S' || savedFontSize === 'M' || savedFontSize === 'L') {
      setFontSize(savedFontSize);
    }
  }, []);

  // --- HELPER FUNCTIONS ---
  const handleFontSizeChange = (size: 'S' | 'M' | 'L') => {
    setFontSize(size);
    localStorage.setItem('slides-console-font-size', size);
  };

  const toggleTask = (phaseId: string, taskId: string) => {
    setPhases(prevPhases => prevPhases.map(phase => {
      if (phase.id !== phaseId) return phase;
      return {
        ...phase,
        tasks: phase.tasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      };
    }));
  };

  const resetChecklist = () => {
    if (window.confirm('Are you sure you want to reset all tasks for this checklist?')) {
      setPhases(prevPhases => prevPhases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(task => ({ ...task, completed: false }))
      })));
    }
  };

  // Dynamically calculate the Wednesday date string based on target Saturday
  const getWednesdayDateString = () => {
    if (!targetDate) return '';
    const sat = new Date(targetDate + 'T00:00:00');
    const wed = new Date(sat);
    wed.setDate(sat.getDate() - 3);
    return `(${wed.getMonth() + 1}/${wed.getDate()})`;
  };

  // Format the main target date for user display
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', options);
  };

  // Progress calculations
  const totalTasks = phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const completedGlobalTasks = phases.reduce((acc, phase) => acc + phase.tasks.filter(t => t.completed).length, 0);
  const globalProgressPercent = totalTasks > 0 ? Math.round((completedGlobalTasks / totalTasks) * 100) : 0;

  // Font Size mapping classes
  const fontClasses = {
    S: { text: 'text-sm', title: 'text-base', label: 'text-xs' },
    M: { text: 'text-base', title: 'text-xl', label: 'text-sm' },
    L: { text: 'text-lg', title: 'text-2xl', label: 'text-base' }
  }[fontSize];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f24] to-[#1a102f] text-slate-200 p-4 md:p-8 font-sans antialiased selection:bg-purple-500/30">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* --- HEADER REGION --- */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-purple-500/10 pb-6 gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              {/* Dynamic Target Service Date Block */}
              <div className="flex items-center gap-2 bg-blue-950/40 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs md:text-sm text-blue-400 font-medium shadow-sm">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Target Service:</span>
                {isEditingDate ? (
                  <input 
                    type="date" 
                    value={targetDate} 
                    onChange={(e) => setTargetDate(e.target.value)}
                    onBlur={() => setIsEditingDate(false)}
                    className="bg-slate-900 border border-purple-500/30 rounded px-1 text-slate-200 focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                ) : (
                  <span className="text-slate-200">{formatDisplayDate(targetDate)}</span>
                )}
                <button 
                  onClick={() => setIsEditingDate(!isEditingDate)}
                  className="hover:text-purple-400 transition-colors ml-1 p-0.5"
                  title="Change Service Date"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Clarified Console Identity Badge */}
              <div className="flex items-center gap-1.5 bg-purple-950/40 border border-purple-500/20 px-3 py-1.5 rounded-lg text-xs md:text-sm text-purple-400 font-medium shadow-sm">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                Slides Team Console
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Sabbath Slide Production
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl">
              Systems management interface.
            </p>
          </div>

          {/* Control Actions / Preferences Container */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 border border-slate-800 p-3 rounded-xl backdrop-blur-sm self-start">
            {/* Font Size Resizer Switcher */}
            <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Font Size:</span>
              <div className="flex bg-slate-950 p-1 rounded-md border border-slate-800">
                {(['S', 'M', 'L'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleFontSizeChange(size)}
                    className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                      fontSize === size 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-900/20' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Core Global Action */}
            <button
              onClick={resetChecklist}
              className="flex items-center gap-1.5 bg-slate-950 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/50 text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg transition-all text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Checklist
            </button>
          </div>
        </header>

        {/* --- GLOBAL CONFIG & PROGRESS REGION --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-900/30 border border-slate-800/60 p-4 rounded-xl shadow-lg shadow-black/10 backdrop-blur-sm">
          {/* Streamlined Mode Configuration Switch */}
          <div className="flex items-center justify-between md:justify-start gap-4 bg-slate-950/40 border border-slate-800/80 p-3 rounded-lg md:col-span-1">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold tracking-wide text-slate-200">Evangelism Sabbath Mode</span>
            </div>
            <button
              onClick={() => setEvangelismMode(!evangelismMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                evangelismMode ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  evangelismMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Cleaned & Clarified Main Progress Matrix */}
          <div className="space-y-2 md:col-span-2 bg-slate-950/20 border border-slate-800/40 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Overall Weekly Progress
              </span>
              <span className="text-sm font-black text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/10">
                {globalProgressPercent}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-[2px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(147,51,234,0.4)]"
                style={{ width: `${globalProgressPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* --- MAIN TAB NAVIGATION REGION --- */}
        <nav className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {phases.map((phase) => {
            const completedCount = phase.tasks.filter(t => t.completed).length;
            const phasePercent = phase.tasks.length > 0 ? Math.round((completedCount / phase.tasks.length) * 100) : 0;
            const isActive = activeTab === phase.id;

            return (
              <button
                key={phase.id}
                onClick={() => setActiveTab(phase.id)}
                className={`relative flex flex-col p-4 rounded-xl text-left transition-all duration-300 group ${
                  isActive
                    ? 'bg-slate-900 border-2 border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.15)] ring-1 ring-purple-400/30'
                    : 'bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/60 shadow-md shadow-black/5'
                }`}
              >
                {/* Visual Accent Layer for Active States */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-t-lg" />
                )}

                {/* Newly Added Contextual Phase Titles */}
                <span className={`text-xs font-bold uppercase tracking-widest mb-1.5 transition-colors duration-300 ${
                  isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-400'
                }`}>
                  {phase.title}
                </span>

                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`p-1.5 rounded-lg border transition-colors ${
                    isActive ? 'bg-purple-950/50 border-purple-500/40 text-purple-400' : 'bg-slate-950 border-slate-800 text-slate-400 group-hover:text-slate-300'
                  }`}>
                    {phase.icon}
                  </div>
                  <span className={`font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {phase.subtitle}
                  </span>
                </div>

                <div className="mt-auto pt-2 border-t border-slate-800/60 flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-between text-xs font-medium">
                    {/* Appended Custom Wednesday Helper Math Display */}
                    <span className="text-slate-400">
                      {phase.deadline} {phase.isMidweek && getWednesdayDateString()}
                    </span>
                    <span className={`font-semibold ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                      {completedCount}/{phase.tasks.length}
                    </span>
                  </div>

                  {/* Restored Visual Phase Progress Slider Indicators */}
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${phasePercent}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* --- FLOATING WORKSPACE CARD MODULE --- */}
        <main className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3),0_0_30px_rgba(147,51,234,0.03)] overflow-hidden backdrop-blur-md">
          {phases.map((phase) => {
            if (phase.id !== activeTab) return null;

            return (
              <div key={phase.id} className="p-5 md:p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-wide">
                      {phase.title} Workflow Tasks
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Check items off as your team executes them.
                    </p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 text-xs text-slate-400 px-3 py-1.5 rounded-lg font-medium">
                    Phase Scope: <span className="text-white font-bold">{phase.tasks.length} Checkpoints</span>
                  </div>
                </div>

                {/* CHECKLIST ROW WORKSPACE */}
                <div className="space-y-2.5">
                  {phase.tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(phase.id, task.id)}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 group/row ${
                        task.completed
                          ? 'bg-purple-950/10 border-purple-500/20 text-slate-400'
                          : 'bg-slate-950/40 border-slate-800/80 hover:border-purple-500/30 text-slate-100 hover:bg-slate-950/80'
                      }`}
                    >
                      {/* Redesigned High-Contrast Box States */}
                      <div className="mt-0.5 shrink-0 transition-transform duration-200 group-hover/row:scale-110">
                        {task.completed ? (
                          <CheckCircle className="w-5 h-5 text-gradient bg-clip-text text-blue-400 fill-blue-500/10" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400 group-hover/row:text-purple-400 stroke-[2.5] fill-slate-900" />
                        )}
                      </div>

                      {/* Content Label Layer Adjusting with S/M/L Selection */}
                      <div className="flex flex-col gap-1 w-full">
                        <span className={`${fontClasses.text} font-medium tracking-wide transition-colors ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}>
                          {task.text}
                        </span>
                        {/* Optional Injection Mode Flags */}
                        {evangelismMode && !task.completed && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400/90 animate-fade-in bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-500/10 self-start">
                            + Evangelism Target Active
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </main>

        {/* FOOTER */}
        <footer className="text-center text-xs text-slate-600 pt-4 border-t border-slate-900">
          Slide Production Control System • Active & Localized Screen Layout
        </footer>
      </div>
    </div>
  );
}
