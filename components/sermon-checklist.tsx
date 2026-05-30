"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RotateCcw,
  Calendar,
  Sun,
  BookOpen,
  Send,
  CheckCircle2,
  Edit2,
  Palette,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  isAfterglowRelated?: boolean;
}

interface WorkflowTab {
  id: string;
  phaseTitle: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

const workflowTabs: WorkflowTab[] = [
  {
    id: "backdrops-theme",
    phaseTitle: "Midweek Prep",
    label: "Backdrops & Theme",
    sublabel: "Due Wednesday",
    icon: <Calendar className="h-4 w-4" />,
    items: [
      { id: "backdrop", title: "Backdrops", description: "Get backdrops ready to display behind the pastor." },
      { id: "theme", title: "Theme", description: "Establish the visual theme before any slides can be built." },
    ],
  },
  {
    id: "verse-tech-beautification",
    phaseTitle: "Pre-Service",
    label: "Verse Tech & Beautification",
    sublabel: "Due Pre-Sabbath School",
    icon: <Sun className="h-4 w-4" />,
    items: [
      { id: "verse-tech", title: "Verse Tech", description: "Clean up the Pastor's raw outline and turn it into a raw slide presentation." },
      { id: "beautify", title: "Beautification", description: "Format and beautify the raw slides so they are finalized for the Pastor's review." },
    ],
  },
  {
    id: "study-guides-sites",
    phaseTitle: "During Service",
    label: "Study Guides & Sites",
    sublabel: "Due End of Service",
    icon: <BookOpen className="h-4 w-4" />,
    items: [
      { id: "afterglow-study", title: "Afterglow Study Guide", description: "Create the Afterglow study materials and slides.", isAfterglowRelated: true },
      { id: "extended-study", title: "6-Day Extended Study Guide", description: "Create the extended study materials for the week." },
      { id: "website", title: "Sites", description: "Upload the sermon video link, the main slide deck, the study guides, and the combined PDF to the site." },
    ],
  },
  {
    id: "qr-codes",
    phaseTitle: "Post-Service",
    label: "QR Codes",
    sublabel: "Due Immediately Post-Service",
    icon: <Send className="h-4 w-4" />,
    items: [
      { id: "qr-code", title: "QR Codes", description: "Create PDFs, combine them, compress to under 20MB, upload, and generate QR code." },
    ],
  },
];

const STORAGE_KEY = "aholiab-checklist-state-v4";
const EVANGELISM_KEY = "aholiab-evangelism-toggle";
const FONT_SIZE_KEY = "aholiab-global-font-size";
const THEME_KEY = "aholiab-global-theme";

type AppTheme = "Dawn" | "Cyber" | "Twilight";

export function SermonChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isEvangelismSabbath, setIsEvangelismSabbath] = useState(false);
  const [fontSize, setFontSize] = useState<"S" | "M" | "L">("M");
  const [currentTheme, setCurrentTheme] = useState<AppTheme>("Cyber");
  const [targetDate, setTargetDate] = useState<string>("");
  const [isEditingDate, setIsEditingDate] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedChecked = localStorage.getItem(STORAGE_KEY);
    const savedEvangelism = localStorage.getItem(EVANGELISM_KEY);
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedChecked) setCheckedItems(JSON.parse(savedChecked));
    if (savedEvangelism) setIsEvangelismSabbath(JSON.parse(savedEvangelism));
    if (savedFontSize === "S" || savedFontSize === "M" || savedFontSize === "L") setFontSize(savedFontSize);
    if (savedTheme === "Dawn" || savedTheme === "Cyber" || savedTheme === "Twilight") setCurrentTheme(savedTheme as AppTheme);

    const today = new Date();
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
    setTargetDate(nextSaturday.toISOString().split("T")[0]);

    setMounted(true);
  }, []);

  useEffect(() => { if (mounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems)); }, [checkedItems, mounted]);
  useEffect(() => { if (mounted) localStorage.setItem(EVANGELISM_KEY, JSON.stringify(isEvangelismSabbath)); }, [isEvangelismSabbath, mounted]);

  const handleFontSizeChange = (size: "S" | "M" | "L") => {
    setFontSize(size);
    localStorage.setItem(FONT_SIZE_KEY, size);
  };

  const handleThemeChange = (theme: AppTheme) => {
    setCurrentTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all tasks?")) {
      setCheckedItems({});
      setIsEvangelismSabbath(false);
    }
  };

  const handleCheck = (id: string, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [id]: checked }));
  };

  const getTabProgress = (tab: WorkflowTab) => {
    const visibleItems = tab.items.filter(item => !(isEvangelismSabbath && item.isAfterglowRelated));
    const completedCount = visibleItems.filter(item => checkedItems[item.id]).length;
    return { completed: completedCount, total: visibleItems.length, percentage: visibleItems.length > 0 ? Math.round((completedCount / visibleItems.length) * 100) : 0 };
  };

  const getMasterProgress = () => {
    let completed = 0, total = 0;
    workflowTabs.forEach((tab) => {
      const visible = tab.items.filter(item => !(isEvangelismSabbath && item.isAfterglowRelated));
      total += visible.length;
      completed += visible.filter(item => checkedItems[item.id]).length;
    });
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getWednesdayDateString = () => {
    if (!targetDate) return "";
    const sat = new Date(targetDate + "T00:00:00");
    const wed = new Date(sat);
    wed.setDate(sat.getDate() - 3);
    return `(${wed.getMonth() + 1}/${wed.getDate()})`;
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  const masterProgress = getMasterProgress();

  // --- THEME STYLE CONFIGURATION MAPS ---
  const themeStyles = {
    Cyber: {
      bg: "bg-[#0a0b1e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0b1e] to-black text-slate-100 selection:bg-sky-500/30",
      badge: "border-sky-400/30 bg-sky-400/5 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.1)]",
      badgeDot: "bg-sky-400",
      headerBlock: "bg-sky-500/5 border-sky-400/10 text-white shadow-xl",
      dateLabel: "text-sky-400/80",
      cardBg: "border-slate-800/80 bg-slate-900/60 ring-1 ring-white/5",
      toggleBox: "bg-sky-400/5 border-sky-400/20 text-sky-100",
      toggleColor: "data-[state=checked]:bg-sky-400",
      progressBox: "bg-sky-400/5 border-sky-400/20",
      progressTitle: "text-sky-400/90",
      progressBar: "from-sky-600 via-blue-500 to-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]",
      tabListBg: "",
      tabUnselected: "border-white/5 bg-white/[0.02] text-slate-400",
      tabActive: "bg-sky-500/10 border-sky-400/50 text-white shadow-[0_0_20px_rgba(56,189,248,0.1)]",
      tabPhaseText: "text-slate-500 group-data-[state=active]:text-sky-400",
      tabMainText: "text-slate-100",
      workspaceCard: "bg-sky-950/10 border-sky-400/20 shadow-black/40",
      workspaceHeader: "text-sky-400 border-sky-400/10",
      taskItem: "bg-slate-950/40 border-slate-900 hover:border-purple-500/30 hover:bg-slate-950/80",
      taskItemChecked: "bg-sky-400/[0.02] border-transparent opacity-40",
      taskText: "text-white",
      taskDesc: "text-slate-400",
      checkboxBorder: "border-slate-400 group-hover/item:border-sky-400 data-[state=checked]:bg-sky-400 data-[state=checked]:border-sky-400",
      footerBox: "border-slate-900/60 text-slate-300",
      footerRef: "text-slate-400"
    },
    Dawn: {
      bg: "bg-gradient-to-tr from-[#f3f0f7] via-[#e6edf8] to-[#f4f2f6] text-slate-800 selection:bg-blue-200",
      badge: "border-blue-400/40 bg-blue-500/10 text-blue-700 shadow-sm",
      badgeDot: "bg-blue-600",
      headerBlock: "bg-white border-blue-200 text-slate-900 shadow-md",
      dateLabel: "text-blue-600/80",
      cardBg: "border-slate-200 bg-white/90 shadow-lg shadow-slate-200/50",
      toggleBox: "bg-blue-500/5 border-blue-200 text-slate-800",
      toggleColor: "data-[state=checked]:bg-blue-600",
      progressBox: "bg-purple-500/5 border-purple-200",
      progressTitle: "text-purple-700/90",
      progressBar: "from-blue-600 via-indigo-600 to-purple-600 shadow-none",
      tabListBg: "",
      tabUnselected: "border-slate-200 bg-slate-100/60 text-slate-500",
      tabActive: "bg-slate-900 border-slate-900 text-white shadow-md",
      tabPhaseText: "text-slate-400 group-data-[state=active]:text-purple-300",
      tabMainText: "text-slate-800 group-data-[state=active]:text-white",
      workspaceCard: "bg-slate-900 border-slate-950 shadow-xl",
      workspaceHeader: "text-purple-300 border-slate-800",
      taskItem: "bg-slate-950 border-slate-800 hover:border-blue-400/40",
      taskItemChecked: "bg-slate-900/40 border-transparent opacity-40",
      taskText: "text-slate-100",
      taskDesc: "text-slate-400",
      checkboxBorder: "border-slate-500 group-hover/item:border-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500",
      footerBox: "border-slate-300 text-slate-700",
      footerRef: "text-slate-600"
    },
    Twilight: {
      bg: "bg-[#20273d] text-slate-100 selection:bg-purple-500/40",
      badge: "border-purple-400/40 bg-purple-500/10 text-purple-300 shadow-sm",
      badgeDot: "bg-purple-400",
      headerBlock: "bg-[#181d2f] border-purple-900/40 text-white shadow-xl",
      dateLabel: "text-purple-400/80",
      cardBg: "border-purple-900/30 bg-[#181d2f]/90 shadow-xl",
      toggleBox: "bg-purple-950/40 border-purple-900/40 text-purple-100",
      toggleColor: "data-[state=checked]:bg-purple-500",
      progressBox: "bg-purple-950/40 border-purple-900/40",
      progressTitle: "text-purple-400",
      progressBar: "from-purple-600 to-indigo-500 shadow-none",
      tabListBg: "",
      tabUnselected: "border-purple-950 bg-[#121625]/60 text-slate-400",
      tabActive: "bg-[#e8e1f5] border-[#e8e1f5] text-slate-900 shadow-lg",
      tabPhaseText: "text-slate-500 group-data-[state=active]:text-purple-700",
      tabMainText: "text-slate-200 group-data-[state=active]:text-slate-900",
      workspaceCard: "bg-[#edf1f9] border-slate-300 shadow-2xl",
      workspaceHeader: "text-indigo-900 border-indigo-100 pb-3",
      taskItem: "bg-white border-slate-200 hover:border-purple-400 hover:shadow-sm",
      taskItemChecked: "bg-slate-100/60 border-transparent opacity-50",
      taskText: "text-slate-900",
      taskDesc: "text-slate-500",
      checkboxBorder: "border-slate-400 group-hover/item:border-purple-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600",
      footerBox: "border-purple-950/40 text-slate-300",
      footerRef: "text-slate-400"
    }
  }[currentTheme];

  // --- GLOBAL ACCESSIBILITY SIZE MAPPINGS ---
  const fontStyles = {
    S: {
      pageTitle: "text-2xl md:text-3xl",
      dateLabel: "text-[10px]",
      dateText: "text-lg md:text-xl",
      toggleText: "text-xs md:text-sm",
      btnText: "text-[11px]",
      progressTitle: "text-[10px]",
      progressPct: "text-lg",
      progressCounts: "text-[11px]",
      tabPhase: "text-[9px]",
      tabMain: "text-xs",
      tabSub: "text-[10px]",
      cardHeader: "text-xs",
      taskTitle: "text-sm",
      taskDesc: "text-xs",
      footerScripture: "text-xs",
      footerRef: "text-[10px]",
    },
    M: {
      pageTitle: "text-4xl md:text-5xl",
      dateLabel: "text-xs",
      dateText: "text-2xl md:text-3xl",
      toggleText: "text-sm md:text-base",
      btnText: "text-xs",
      progressTitle: "text-xs",
      progressPct: "text-2xl",
      progressCounts: "text-xs",
      tabPhase: "text-[11px]",
      tabMain: "text-sm md:text-base",
      tabSub: "text-xs",
      cardHeader: "text-base",
      taskTitle: "text-base md:text-lg",
      taskDesc: "text-sm",
      footerScripture: "text-sm",
      footerRef: "text-xs",
    },
    L: {
      pageTitle: "text-5xl md:text-6xl",
      dateLabel: "text-sm font-black",
      dateText: "text-3xl md:text-4xl font-black",
      toggleText: "text-lg md:text-xl font-black",
      btnText: "text-sm font-black tracking-wider",
      progressTitle: "text-sm font-black tracking-widest",
      progressPct: "text-3xl font-black",
      progressCounts: "text-sm font-bold",
      tabPhase: "text-xs font-black tracking-widest",
      tabMain: "text-lg md:text-xl font-black",
      tabSub: "text-sm font-bold",
      cardHeader: "text-xl font-black",
      taskTitle: "text-xl md:text-2xl font-black",
      taskDesc: "text-base md:text-lg font-semibold",
      footerScripture: "text-base md:text-lg font-bold",
      footerRef: "text-xs font-black tracking-widest",
    }
  }[fontSize];

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-all duration-500 overflow-x-hidden ${themeStyles.bg} ${fontStyles.S}`}>
      
      {/* Background Ambience Lights (Only visible in Dark/Cyber mode) */}
      {currentTheme === "Cyber" && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] pointer-events-none" />
        </>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 space-y-6">
        
        {/* Dynamic Header Identity Badge */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${themeStyles.badge}`}>
             <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${themeStyles.badgeDot}`} />
             Slides Team Console
          </div>
        </div>

        {/* Master Titles Display */}
        <div className="space-y-4 text-center">
          <h1 className={`${fontStyles.pageTitle} font-black tracking-tighter drop-shadow-2xl transition-colors`}>
            Aholiab Sermon Workflow
          </h1>

          {/* Core Service Calendar Card Block */}
          <div className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl max-w-xl mx-auto backdrop-blur-sm transition-all duration-300 ${themeStyles.headerBlock}`}>
            <div className="flex items-center gap-3">
               <span className={`${fontStyles.dateLabel} font-bold uppercase tracking-widest`}>Target Service Date</span>
               <button onClick={() => setIsEditingDate(true)} className="opacity-60 hover:opacity-100 transition-opacity">
                  <Edit2 className="h-3.5 w-3.5" />
               </button>
            </div>
            
            {isEditingDate ? (
              <input 
                type="date" 
                value={targetDate} 
                onChange={(e) => setTargetDate(e.target.value)}
                onBlur={() => setIsEditingDate(false)}
                className="bg-slate-900 border-2 border-sky-400 rounded-xl px-4 py-1.5 text-white text-xl focus:outline-none"
                autoFocus
              />
            ) : (
              <div className={`${fontStyles.dateText} font-bold tracking-tight flex items-center gap-3`}>
                <Calendar className="h-6 w-6 shrink-0 opacity-60" />
                {formatDisplayDate(targetDate)}
              </div>
            )}
          </div>
        </div>

        {/* Configurations Dashboard Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Side: Evangelism Mode */}
          <div className={`flex items-center gap-4 backdrop-blur-xl px-5 py-4 rounded-2xl border transition-all duration-300 ${themeStyles.toggleBox}`}>
             <Switch id="evangelism-mode" checked={isEvangelismSabbath} onCheckedChange={setIsEvangelismSabbath} className={`scale-110 ${themeStyles.toggleColor}`} />
             <Label htmlFor="evangelism-mode" className={`${fontStyles.toggleText} font-bold cursor-pointer select-none`}>Evangelism Sabbath Mode</Label>
          </div>

          {/* Right Side: Accessibility & Reset Preferences */}
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl px-5 py-3 rounded-2xl border transition-all duration-300 ${themeStyles.cardBg}`}>
             
             {/* Font Sizer Control */}
             <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">Size</span>
                {["S", "M", "L"].map((s) => (
                  <button key={s} onClick={() => handleFontSizeChange(s as any)} className={`w-7 h-7 flex items-center justify-center rounded-lg font-black text-xs transition-all ${fontSize === s ? "bg-sky-500 text-white shadow-md" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"}`}>{s}</button>
                ))}
             </div>

             {/* Multi-Theme Selector Trigger */}
             <div className="flex items-center gap-1 border-l dark:border-slate-800 border-slate-200 pl-3">
                <Palette className="h-3.5 w-3.5 text-slate-400 mr-1" />
                {(["Dawn", "Cyber", "Twilight"] as const).map((t) => (
                  <button 
                    key={t} 
                    onClick={() => handleThemeChange(t)} 
                    className={`px-2 py-1 text-[10px] font-extrabold rounded-md transition-all uppercase tracking-wide ${
                      currentTheme === t 
                        ? "bg-purple-600 text-white shadow-sm" 
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
             </div>

             <Button variant="ghost" onClick={handleReset} className={`${fontStyles.btnText} h-8 px-2 font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-lg`}>Reset</Button>
          </div>
        </div>

        {/* Global Blueprint Metrics Meter */}
        <div className={`backdrop-blur-md rounded-2xl border p-5 transition-all duration-300 ${themeStyles.progressBox}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`${fontStyles.progressTitle} font-black uppercase tracking-[0.2em]`}>Overall Weekly Progress</span>
            <div className="flex items-baseline gap-2">
              <span className={`${fontStyles.progressPct} font-black`}>{masterProgress.percentage}%</span>
              <span className={`${fontStyles.progressCounts} opacity-60 font-medium`}>({masterProgress.completed}/{masterProgress.total} Tasks)</span>
            </div>
          </div>
          <div className="h-3 bg-black/30 rounded-full p-0.5 border border-white/5">
            <div className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ${themeStyles.progressBar}`} style={{ width: `${masterProgress.percentage}%` }} />
          </div>
        </div>

        {/* Main Checklists Matrix Module */}
        <Tabs defaultValue="backdrops-theme" className="w-full">
          {/* Dynamic Responsive Tab Items */}
          <TabsList className="w-full h-auto flex flex-col md:flex-row gap-2 bg-transparent mb-6 p-0">
            {workflowTabs.map((tab) => {
              const progress = getTabProgress(tab);
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className={`flex-1 w-full md:w-auto flex flex-col items-start p-4 rounded-xl border text-left whitespace-normal break-words transition-all duration-300 group ${themeStyles.tabUnselected} data-[state=active]:${themeStyles.tabActive}`}
                >
                   {/* Phase Title Category Label */}
                   <span className={`${fontStyles.tabPhase} font-black uppercase tracking-widest block mb-1 ${themeStyles.tabPhaseText}`}>
                     {tab.phaseTitle}
                   </span>
                   
                   {/* Central Identity Core Row */}
                   <div className="flex items-start gap-2 w-full">
                      <div className="mt-0.5 shrink-0 transition-colors">
                        {tab.icon}
                      </div>
                      <span className={`${fontStyles.tabMain} font-black leading-tight ${themeStyles.tabMainText}`}>
                        {tab.label}
                      </span>
                   </div>

                   {/* Count Metrics Rows & Dynamic Wed Math Display */}
                   <div className="w-full mt-auto pt-3 flex items-center justify-between font-semibold opacity-80 text-[11px]">
                      <span className={fontStyles.tabSub}>
                        {tab.sublabel} {tab.id === "backdrops-theme" && getWednesdayDateString()}
                      </span>
                      {progress.total > 0 && (
                        <span className={`${fontStyles.tabSub} font-black px-1.5 py-0.5 rounded transition-colors`}>
                          {progress.completed}/{progress.total}
                        </span>
                      )}
                   </div>

                   {/* Horizontal Status Line Rails */}
                   <div className="w-full mt-2 h-1 bg-black/20 rounded-full overflow-hidden">
                      <div className="h-full bg-current transition-all duration-500 opacity-60" style={{ width: `${progress.percentage}%` }} />
                   </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Focused Content Workspace Router */}
          {workflowTabs.map((tab) => {
            const progress = getTabProgress(tab);
            const visibleItems = tab.items.filter(item => !(isEvangelismSabbath && item.isAfterglowRelated));
            return (
              <TabsContent key={tab.id} value={tab.id} className="focus:outline-none">
                
                <Card className={`backdrop-blur-2xl border rounded-2xl overflow-hidden transition-all duration-500 shadow-2xl ${themeStyles.workspaceCard}`}>
                  <CardContent className="p-4 md:p-6 space-y-3">
                    
                    {/* Header Matrix label inside Module */}
                    <div className={`flex items-center justify-between mb-1 border-b pb-3 ${themeStyles.workspaceHeader}`}>
                       <h3 className={`${fontStyles.cardHeader} font-black uppercase tracking-widest`}>{tab.label} Checklist</h3>
                       <div className="text-[10px] font-black tracking-wider uppercase opacity-80">{progress.percentage}% Stage Score</div>
                    </div>

                    {/* Action Items Rows Container */}
                    {visibleItems.map((item) => (
                      <label 
                        key={item.id} 
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none group/item ${
                          checkedItems[item.id] 
                            ? themeStyles.checkboxBorder && themeStyles.taskItemChecked
                            : themeStyles.taskItem
                        }`}
                      >
                        {/* Interactive Checkbox Grid Anchor */}
                        <div className="pt-0.5 shrink-0">
                          <Checkbox 
                            id={item.id} 
                            checked={checkedItems[item.id] || false} 
                            onCheckedChange={(c) => handleCheck(item.id, c === true)} 
                            className={`w-5 h-5 rounded-md border-2 transition-all bg-slate-900 ${themeStyles.checkboxBorder}`} 
                          />
                        </div>
                        <div className="space-y-1 w-full">
                           <div className={`${fontStyles.taskTitle} font-black tracking-tight transition-all ${checkedItems[item.id] ? "text-slate-500 line-through opacity-60" : themeStyles.taskText}`}>
                             {item.title}
                           </div>
                           <div className={`${fontStyles.taskDesc} font-medium leading-relaxed ${checkedItems[item.id] ? "text-slate-600 opacity-40" : themeStyles.taskDesc}`}>
                             {item.description}
                           </div>
                        </div>
                      </label>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Dynamic, Migraine-Safe Adaptive Bible Verse Footer (Hover Disabled) */}
        <div className={`pt-6 mt-12 text-center border-t transition-all duration-500 px-4 py-6 rounded-2xl bg-white/[0.02] border-white/5 ${themeStyles.footerBox}`}>
           <p className={`${fontStyles.footerScripture} italic font-serif tracking-wide leading-relaxed`}>
             &quot;And I have filled him with the Spirit of God, in wisdom, and in understanding, and in knowledge...&quot;
           </p>
           <p className={`${fontStyles.footerRef} font-black uppercase mt-2 tracking-[0.2em] ${themeStyles.footerRef}`}>
             — Exodus 31:3 <span className="font-sans font-bold lowercase opacity-70 ml-1">(Aholiab&apos;s calling)</span>
           </p>
        </div>

      </div>
    </div>
  );
}
