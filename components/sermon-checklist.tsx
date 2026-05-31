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
  Globe,
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
    id: "qr-codes",
    phaseTitle: "During/Post Service",
    label: "QR Codes",
    sublabel: "Due Immediately Post-Service",
    icon: <Send className="h-4 w-4" />,
    items: [
      { id: "qr-code", title: "QR Codes", description: "Create PDFs, combine them, compress to under 20MB, upload, and generate QR code." },
    ],
  },
  {
    id: "site-update",
    phaseTitle: "Post-Service",
    label: "Site Update",
    sublabel: "Due ASAP Post-Service",
    icon: <Globe className="h-4 w-4" />,
    items: [
      { id: "website-resources", title: "Resource Uploads", description: "Upload the main slide deck, the study guides, and the combined PDF package to the site." },
      { id: "youtube-swap", title: "Sermon YouTube Link Update", description: "Replace the live stream archive container with the finalized, edited sermon-only YouTube video link (typically 1-2 days post-service)." },
    ],
  },
];

const STORAGE_KEY = "aholiab-checklist-state-v9";
const EVANGELISM_KEY = "aholiab-evangelism-toggle";
const FONT_SIZE_KEY = "aholiab-global-font-size";
const THEME_KEY = "aholiab-global-theme";

type AppTheme = "Light" | "Dark";

export function SermonChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isEvangelismSabbath, setIsEvangelismSabbath] = useState(false);
  const [fontSize, setFontSize] = useState<"S" | "M" | "L">("M");
  const [currentTheme, setCurrentTheme] = useState<AppTheme>("Dark");
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
    
    if (savedTheme === "Light" || savedTheme === "Dawn") setCurrentTheme("Light");
    else if (savedTheme === "Dark" || savedTheme === "Twilight" || savedTheme === "Cyber") setCurrentTheme("Dark");

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

  const themeStyles = {
    Dark: {
      bg: "bg-[#0a0b1e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0b1e] to-black text-slate-100 selection:bg-sky-500/30",
      badge: "border-sky-400/30 bg-sky-400/5 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.1)]",
      badgeDot: "bg-sky-400",
      headerBlock: "bg-sky-500/5 border-sky-400/10 text-white shadow-xl shadow-black/20",
      dateLabel: "text-sky-400/80",
      cardBg: "border-slate-800/80 bg-slate-900/60 ring-1 ring-white/5 shadow-xl shadow-black/30",
      btnUnselected: "bg-slate-950 text-slate-200 border-slate-800 hover:text-white",
      btnActive: "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-900/20",
      toggleBox: "bg-sky-400/5 border-sky-400/20 text-sky-100 shadow-xl shadow-black/20",
      toggleColor: "data-[state=checked]:bg-sky-400",
      progressBox: "bg-sky-400/5 border-sky-400/20 shadow-xl shadow-black/20",
      progressTitle: "text-sky-400/90",
      progressBar: "from-sky-600 via-blue-500 to-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]",
      
      tabUnselected: "border-slate-900 bg-slate-950/60 text-slate-400 shadow-inner",
      tabActive: "bg-[#0f1430] border-sky-400 text-white shadow-[0_0_25px_rgba(56,189,248,0.2)]",
      tabPhaseText: "text-slate-500 group-data-[state=active]:text-sky-400 font-extrabold",
      tabMainText: "text-slate-300 group-data-[state=active]:text-white",
      tabMetricsBox: "bg-black/40 group-data-[state=active]:bg-sky-950 group-data-[state=active]:text-sky-400 group-data-[state=active]:border-sky-800",
      tabProgressTrack: "bg-black/40",
      tabProgressBar: "bg-gradient-to-r from-purple-500 to-sky-400",
      
      workspaceCard: "bg-sky-950/10 border-sky-400/20 shadow-black/50",
      workspaceHeader: "text-sky-400 border-sky-400/10",
      taskItem: "bg-slate-950/40 border-slate-900 hover:border-sky-400/50 hover:bg-slate-950/80 hover:shadow-[0_0_15px_rgba(56,189,248,0.05)]",
      taskItemChecked: "bg-sky-400/[0.02] border-transparent opacity-40",
      taskText: "text-white",
      taskDesc: "text-slate-400",
      checkboxBorder: "border-slate-400 group-hover/item:border-sky-400 data-[state=checked]:bg-sky-400 data-[state=checked]:border-sky-400",
      footerBox: "border-slate-900/60 text-slate-300 bg-white/[0.02]",
      footerRef: "text-slate-400"
    },
    Light: {
      bg: "bg-gradient-to-b from-sky-300 via-[#f8fafc] to-[#fae8ff] text-slate-800 selection:bg-blue-200",
      badge: "border-blue-400/40 bg-blue-500/10 text-blue-700 shadow-sm",
      badgeDot: "bg-blue-600",
      headerBlock: "bg-white/90 border-blue-200 text-slate-900 shadow-md backdrop-blur-md",
      dateLabel: "text-blue-600/80",
      cardBg: "border-slate-300 bg-white shadow-md",
      btnUnselected: "bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200 font-bold",
      btnActive: "bg-blue-600 text-white shadow-md shadow-blue-900/20",
      toggleBox: "bg-white border-slate-300 text-slate-800 shadow-md",
      toggleColor: "data-[state=checked]:bg-blue-600",
      progressBox: "bg-white border-slate-300 shadow-md",
      progressTitle: "text-blue-600",
      progressBar: "from-blue-600 via-indigo-500 to-purple-600 shadow-none",
      
      tabUnselected: "border-slate-200 bg-slate-100 text-slate-400",
      tabActive: "bg-white border-blue-500 text-slate-950 shadow-lg shadow-blue-900/5",
      tabPhaseText: "text-slate-400 group-data-[state=active]:text-blue-600 font-extrabold",
      tabMainText: "text-slate-600 group-data-[state=active]:text-slate-950",
      tabMetricsBox: "bg-slate-200 group-data-[state=active]:bg-blue-100 group-data-[state=active]:text-blue-700 group-data-[state=active]:border-blue-300",
      tabProgressTrack: "bg-slate-200",
      tabProgressBar: "bg-blue-600",
      
      workspaceCard: "bg-white border-slate-300 shadow-2xl",
      workspaceHeader: "text-blue-600 border-slate-200",
      taskItem: "bg-white border-slate-200 hover:border-blue-500 hover:bg-blue-50/[0.3] hover:shadow-sm",
      taskItemChecked: "bg-slate-100/60 border-transparent opacity-40",
      taskText: "text-slate-800",
      taskDesc: "text-slate-500",
      checkboxBorder: "border-slate-400 group-hover/item:border-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600",
      footerBox: "border-slate-300 text-slate-600 bg-white/60 shadow-inner",
      footerRef: "text-slate-500"
    }
  }[currentTheme];

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
      footerScripture: "text-base font-bold",
      footerRef: "text-xs",
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
      footerScripture: "text-xl font-black leading-relaxed",
      footerRef: "text-sm",
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
      footerScripture: "text-3xl font-black leading-relaxed",
      footerRef: "text-base font-black tracking-widest",
    }
  }[fontSize];

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-all duration-500 overflow-x-hidden ${themeStyles.bg} ${fontStyles.S}`}>
      
      {currentTheme === "Dark" && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] pointer-events-none" />
        </>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 space-y-5">
        
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${themeStyles.badge}`}>
             <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${themeStyles.badgeDot}`} />
             Slides Team Console
          </div>
        </div>

        <div className="space-y-4 text-center">
          <h1 className={`${fontStyles.pageTitle} font-black tracking-tighter drop-shadow-2xl transition-colors`}>
            Aholiab Sermon Workflow
          </h1>

          <div className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl max-w-xl mx-auto border transition-all duration-300 ${themeStyles.headerBlock}`}>
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

        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${themeStyles.cardBg}`}>
          <div className="flex items-center gap-4">
             <Switch id="evangelism-mode" checked={isEvangelismSabbath} onCheckedChange={setIsEvangelismSabbath} className={`scale-110 ${themeStyles.toggleColor}`} />
             <Label htmlFor="evangelism-mode" className={`${fontStyles.toggleText} font-bold cursor-pointer select-none`}>Evangelism Sabbath Mode</Label>
          </div>
          <Button variant="ghost" onClick={handleReset} className={`${fontStyles.btnText} h-9 px-4 font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all`}>
            <RotateCcw className="h-4 w-4 mr-2" /> Reset Checklist
          </Button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${themeStyles.cardBg}`}>
          <div className="flex items-center justify-between md:justify-start gap-3 w-full">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-2">Font Scale:</span>
            <div className="flex gap-1.5 bg-black/20 p-1 rounded-lg border border-white/5">
              {["S", "M", "L"].map((s) => (
                <button 
                  key={s} 
                  onClick={() => handleFontSizeChange(s as any)} 
                  className={`w-9 h-8 flex items-center justify-center rounded-md font-black text-xs border transition-all ${
                    fontSize === s ? themeStyles.btnActive : themeStyles.btnUnselected
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-2">Console Theme:</span>
            <div className="flex gap-1.5 bg-black/20 p-1 rounded-lg border border-white/5">
              {(["Light", "Dark"] as const).map((t) => (
                <button 
                  key={t} 
                  onClick={() => handleThemeChange(t)} 
                  className={`px-4 h-8 flex items-center justify-center text-[10px] font-black rounded-md border transition-all uppercase tracking-wide ${
                    currentTheme === t ? themeStyles.btnActive : themeStyles.btnUnselected
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

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

        <Tabs defaultValue="backdrops-theme" className="w-full">
          {/* EQUAL HEIGHT BOX GRID */}
          <TabsList className="w-full h-auto grid grid-cols-1 md:grid-cols-4 gap-2 bg-transparent mb-6 p-0 items-stretch">
            {workflowTabs.map((tab) => {
              const progress = getTabProgress(tab);
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className={`w-full h-full flex flex-col items-start justify-between p-4 rounded-xl border text-left whitespace-normal break-words transition-all duration-200 group ${themeStyles.tabUnselected} data-[state=active]:${themeStyles.tabActive}`}
                >
                   <div className="w-full">
                     <span className={`text-[10px] font-black uppercase tracking-widest block mb-1.5 transition-colors ${themeStyles.tabPhaseText}`}>
                       {tab.phaseTitle}
                     </span>
                     
                     <div className="flex items-start gap-2 w-full mb-3">
                        <div className="mt-0.5 shrink-0 opacity-70 group-data-[state=active]:opacity-100">
                          {tab.icon}
                        </div>
                        <span className={`${fontStyles.tabMain} font-black leading-tight transition-colors ${themeStyles.tabMainText}`}>
                          {tab.label}
                        </span>
                     </div>
                   </div>

                   <div className="w-full mt-auto">
                     <div className="w-full pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between font-bold text-[11px] transition-colors">
                        <span className={`${fontStyles.tabSub} opacity-70`}>
                          {tab.sublabel} {tab.id === "backdrops-theme" && getWednesdayDateString()}
                        </span>
                        {progress.total > 0 && (
                          <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-md border transition-colors ${themeStyles.tabMetricsBox}`}>
                            {progress.completed}/{progress.total}
                          </span>
                        )}
                     </div>

                     <div className={`w-full mt-2.5 h-1.5 rounded-full overflow-hidden p-[1px] ${themeStyles.tabProgressTrack}`}>
                        <div className={`h-full rounded-full transition-all duration-500 ${themeStyles.tabProgressBar}`} style={{ width: `${progress.percentage}%` }} />
                     </div>
                   </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {workflowTabs.map((tab) => {
            const progress = getTabProgress(tab);
            const visibleItems = tab.items.filter(item => !(isEvangelismSabbath && item.isAfterglowRelated));
            return (
              <TabsContent key={tab.id} value={tab.id} className="focus:outline-none">
                
                <Card className={`backdrop-blur-2xl border rounded-2xl overflow-hidden transition-all duration-500 shadow-2xl ${themeStyles.workspaceCard}`}>
                  <CardContent className="p-4 md:p-6 space-y-3">
                    
                    <div className="flex items-center justify-between mb-1 border-b pb-3 ${themeStyles.workspaceHeader}`}>
                       <h3 className={`${fontStyles.cardHeader} font-black uppercase tracking-widest`}>{tab.label} Checklist</h3>
                       <div className="text-[10px] font-black tracking-wider uppercase opacity-80 bg-black/10 px-3 py-1 rounded-full">{progress.percentage}% Phase Progress</div>
                    </div>

                    {visibleItems.map((item) => (
                      <label 
                        key={item.id} 
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none group/item ${
                          checkedItems[item.id] 
                            ? themeStyles.checkboxBorder && themeStyles.taskItemChecked
                            : themeStyles.taskItem
                        }`}
                      >
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

        <div className={`mt-12 text-center border-t transition-all duration-500 px-6 py-10 rounded-2xl shadow-inner ${themeStyles.footerBox}`}>
           <p className={`${fontStyles.footerScripture} italic font-serif tracking-wide leading-relaxed`}>
             &quot;And I have filled him with the Spirit of God, in wisdom, and in understanding, and in knowledge...&quot;
           </p>
           <p className={`${fontStyles.footerRef} font-black uppercase mt-4 tracking-[0.25em] ${themeStyles.footerRef}`}>
             — Exodus 31:3 <span className="font-sans font-black lowercase opacity-80 ml-1">(Aholiab&apos;s calling)</span>
           </p>
        </div>

      </div>
    </div>
  );
}
