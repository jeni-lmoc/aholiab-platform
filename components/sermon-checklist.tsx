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

const STORAGE_KEY = "aholiab-checklist-state-v3";
const EVANGELISM_KEY = "aholiab-evangelism-toggle";
const FONT_SIZE_KEY = "aholiab-global-font-size";

export function SermonChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isEvangelismSabbath, setIsEvangelismSabbath] = useState(false);
  const [fontSize, setFontSize] = useState<"S" | "M" | "L">("M");
  const [targetDate, setTargetDate] = useState<string>("");
  const [isEditingDate, setIsEditingDate] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedChecked = localStorage.getItem(STORAGE_KEY);
    const savedEvangelism = localStorage.getItem(EVANGELISM_KEY);
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY);

    if (savedChecked) setCheckedItems(JSON.parse(savedChecked));
    if (savedEvangelism) setIsEvangelismSabbath(JSON.parse(savedEvangelism));
    if (savedFontSize === "S" || savedFontSize === "M" || savedFontSize === "L") setFontSize(savedFontSize);

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

  // Explicit global sizing style classes mapped strictly to S, M, or L selections
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
      dateLabel: "text-sm font-black text-sky-400",
      dateText: "text-3xl md:text-4xl font-black",
      toggleText: "text-lg md:text-xl font-black",
      btnText: "text-sm font-black tracking-wider",
      progressTitle: "text-sm font-black tracking-widest",
      progressPct: "text-3xl font-black",
      progressCounts: "text-sm font-bold",
      tabPhase: "text-xs font-black tracking-widest text-purple-300",
      tabMain: "text-lg md:text-xl font-black",
      tabSub: "text-sm font-bold text-slate-300",
      cardHeader: "text-xl font-black text-sky-300",
      taskTitle: "text-xl md:text-2xl font-black",
      taskDesc: "text-base md:text-lg font-semibold text-slate-300",
      footerScripture: "text-base md:text-lg font-bold",
      footerRef: "text-xs font-black tracking-widest",
    }
  }[fontSize];

  if (!mounted) return <div className="min-h-screen bg-[#0a0f24]" />;

  return (
    <div className="min-h-screen bg-[#0a0b1e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0b1e] to-black text-slate-100 selection:bg-sky-500/30 overflow-x-hidden transition-all duration-300">
      
      {/* Background Lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 space-y-6">
        
        {/* Top Centered Identity Badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-400/30 bg-sky-400/5 text-sky-400 text-[10px] font-black tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(56,189,248,0.1)]">
             <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
             Slides Team Console
          </div>
        </div>

        {/* Header Title Section */}
        <div className="space-y-4 text-center">
          <h1 className={`${fontStyles.pageTitle} font-black tracking-tighter text-white drop-shadow-2xl`}>
            Aholiab Sermon Workflow
          </h1>

          {/* Large Main Target Service Date Header */}
          <div className="flex flex-col items-center justify-center gap-1 group bg-sky-500/5 border border-sky-400/10 p-4 rounded-2xl max-w-xl mx-auto backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3">
               <span className={`${fontStyles.dateLabel} font-bold uppercase tracking-widest text-sky-400/80`}>Target Service Date</span>
               <button onClick={() => setIsEditingDate(true)} className="opacity-50 group-hover:opacity-100 transition-opacity text-sky-400">
                  <Edit2 className="h-3.5 w-3.5" />
               </button>
            </div>
            
            {isEditingDate ? (
              <input 
                type="date" 
                value={targetDate} 
                onChange={(e) => setTargetDate(e.target.value)}
                onBlur={() => setIsEditingDate(false)}
                className="bg-slate-900 border-2 border-sky-400 rounded-xl px-4 py-1.5 text-white text-xl focus:outline-none focus:ring-4 ring-sky-400/20"
                autoFocus
              />
            ) : (
              <div className={`${fontStyles.dateText} font-bold text-white tracking-tight flex items-center gap-3`}>
                <Calendar className="h-6 w-6 text-sky-400/60 shrink-0" />
                {formatDisplayDate(targetDate)}
              </div>
            )}
          </div>
        </div>

        {/* Core Settings Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 bg-sky-400/5 backdrop-blur-xl px-5 py-4 rounded-2xl border border-sky-400/20 shadow-xl">
             <Switch id="evangelism-mode" checked={isEvangelismSabbath} onCheckedChange={setIsEvangelismSabbath} className="data-[state=checked]:bg-sky-400 shadow-inner scale-110" />
             <Label htmlFor="evangelism-mode" className={`${fontStyles.toggleText} font-bold text-sky-100 cursor-pointer select-none`}>Evangelism Sabbath Mode</Label>
          </div>

          <div className="flex items-center justify-between gap-4 bg-white/5 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-xl">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mr-1">Font Scale</span>
                {["S", "M", "L"].map((s) => (
                  <button key={s} onClick={() => handleFontSizeChange(s as any)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-black transition-all ${fontSize === s ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]" : "text-slate-400 hover:text-slate-200"}`}>{s}</button>
                ))}
             </div>
             <Button variant="ghost" onClick={handleReset} className={`${fontStyles.btnText} h-9 px-4 font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all rounded-xl`}>Reset</Button>
          </div>
        </div>

        {/* Main Overall Progress Panel */}
        <div className="bg-sky-400/5 backdrop-blur-md rounded-2xl border border-sky-400/20 p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className={`${fontStyles.progressTitle} font-black uppercase tracking-[0.2em] text-sky-400/90`}>Overall Weekly Progress</span>
            <div className="flex items-baseline gap-2">
              <span className={`${fontStyles.progressPct} font-black text-white`}>{masterProgress.percentage}%</span>
              <span className={`${fontStyles.progressCounts} text-slate-400 font-medium`}>({masterProgress.completed}/{masterProgress.total} Tasks)</span>
            </div>
          </div>
          <div className="h-3 bg-black/40 rounded-full border border-white/5 p-0.5">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-600 via-blue-500 to-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all duration-1000" style={{ width: `${masterProgress.percentage}%` }} />
          </div>
        </div>

        {/* Navigation Tabs (Completely Fixed Text Wrapping & Spacing) */}
        <Tabs defaultValue="backdrops-theme" className="w-full">
          <TabsList className="w-full h-auto flex flex-col md:flex-row gap-2 bg-transparent mb-6 p-0">
            {workflowTabs.map((tab) => {
              const progress = getTabProgress(tab);
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="flex-1 w-full md:w-auto flex flex-col items-start p-4 rounded-xl border border-white/5 bg-white/[0.02] text-left transition-all whitespace-normal break-words data-[state=active]:bg-sky-500/10 data-[state=active]:border-sky-400/50 data-[state=active]:shadow-[0_0_20px_rgba(56,189,248,0.1)] group"
                >
                   {/* Restored Phase Heading label */}
                   <span className={`${fontStyles.tabPhase} font-black uppercase tracking-widest block mb-1 text-slate-500 group-data-[state=active]:text-sky-400`}>
                     {tab.phaseTitle}
                   </span>
                   
                   {/* Content Label Container with dynamic alignment & proper SVG icons */}
                   <div className="flex items-start gap-2 w-full">
                      <div className="mt-0.5 text-slate-400 group-data-[state=active]:text-sky-400 shrink-0">
                        {tab.icon}
                      </div>
                      <span className={`${fontStyles.tabMain} font-black text-slate-100 leading-tight`}>
                        {tab.label}
                      </span>
                   </div>

                   {/* Restored Deadlines, Calendars & Operational Counts */}
                   <div className="w-full mt-auto pt-3 flex items-center justify-between text-slate-400 font-semibold">
                      <span className={fontStyles.tabSub}>
                        {tab.sublabel} {tab.id === "backdrops-theme" && getWednesdayDateString()}
                      </span>
                      {progress.total > 0 && (
                        <span className={`${fontStyles.tabSub} font-black px-1.5 py-0.5 rounded ${
                          progress.percentage === 100 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-black/30 text-slate-300"
                        }`}>
                          {progress.completed}/{progress.total}
                        </span>
                      )}
                   </div>

                   {/* Retained Tab Mini Line Sliders */}
                   <div className="w-full mt-2 h-1 bg-black/30 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400 transition-all duration-500" style={{ width: `${progress.percentage}%` }} />
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
                {/* Glowing Tinted Frosted Glass Content Matrix */}
                <Card className="bg-sky-950/10 backdrop-blur-2xl border border-sky-400/20 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
                  <CardContent className="p-4 md:p-6 space-y-3">
                    
                    <div className="flex items-center justify-between mb-1 border-b border-sky-400/10 pb-3">
                       <h3 className={`${fontStyles.cardHeader} font-black uppercase tracking-widest text-sky-400`}>{tab.label} Checklist</h3>
                       <div className="text-[10px] font-black tracking-wider uppercase text-sky-300 bg-sky-400/10 px-3 py-1 rounded-full">{progress.percentage}% Completed</div>
                    </div>

                    {visibleItems.map((item) => (
                      <label 
                        key={item.id} 
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none group/item ${
                          checkedItems[item.id] 
                            ? "bg-sky-400/[0.02] border-transparent opacity-40 hover:opacity-60" 
                            : "bg-sky-400/5 border-sky-400/10 hover:border-sky-400/30 hover:bg-sky-400/[0.08] hover:shadow-md"
                        }`}
                      >
                        {/* Crisp, Bold Checkbox Interactivity */}
                        <div className="pt-0.5 shrink-0">
                          <Checkbox 
                            id={item.id} 
                            checked={checkedItems[item.id] || false} 
                            onCheckedChange={(c) => handleCheck(item.id, c === true)} 
                            className="w-5 h-5 rounded-md border-2 border-slate-400 group-hover/item:border-sky-400 transition-all data-[state=checked]:bg-sky-400 data-[state=checked]:border-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.1)] bg-slate-900" 
                          />
                        </div>
                        <div className="space-y-1 w-full">
                           <div className={`${fontStyles.taskTitle} font-black tracking-tight ${checkedItems[item.id] ? "text-slate-500 line-through" : "text-white group-hover/item:text-sky-300"}`}>{item.title}</div>
                           <div className={`${fontStyles.taskDesc} font-medium text-slate-400 leading-relaxed`}>{item.description}</div>
                        </div>
                      </label>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Clean Static Sacred Epilogue Vignette */}
        <div className="pt-8 text-center border-t border-slate-900/60 opacity-40">
           <p className={`${fontStyles.footerScripture} italic font-serif tracking-wide text-slate-300`}>
             &quot;And I have filled him with the Spirit of God, in wisdom, and in understanding, and in knowledge...&quot;
           </p>
           <p className={`${fontStyles.footerRef} font-black uppercase mt-2 tracking-[0.2em] text-slate-400`}>
             — Exodus 31:3 <span className="font-bold text-slate-500 font-sans ml-1">(Aholiab&apos;s calling)</span>
           </p>
        </div>

      </div>
    </div>
  );
}
