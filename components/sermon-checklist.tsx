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
  ChevronRight,
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
      { id: "website", title: "Sites", description: "Upload sermon media to the site." },
    ],
  },
  {
    id: "qr-codes",
    phaseTitle: "Post-Service",
    label: "QR Codes",
    sublabel: "Due Immediately Post-Service",
    icon: <Send className="h-4 w-4" />,
    items: [
      { id: "qr-code", title: "QR Codes", description: "Generate and upload the final PDF sermon package QR code." },
    ],
  },
];

const STORAGE_KEY = "aholiab-checklist-state-v2";
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

  const sizeClasses = {
    S: { base: "text-xs md:text-sm", title: "text-2xl md:text-3xl", date: "text-lg md:text-xl", tabTitle: "text-[9px]", tabLabel: "text-xs", itemTitle: "text-sm" },
    M: { base: "text-sm md:text-base", title: "text-4xl md:text-5xl", date: "text-2xl md:text-3xl", tabTitle: "text-[11px]", tabLabel: "text-sm", itemTitle: "text-base" },
    L: { base: "text-base md:text-lg", title: "text-5xl md:text-6xl", date: "text-3xl md:text-4xl", tabTitle: "text-xs", tabLabel: "text-base", itemTitle: "text-lg" }
  }[fontSize];

  if (!mounted) return <div className="min-h-screen bg-[#0a0f24]" />;

  return (
    <div className={`min-h-screen bg-[#0a0b1e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0b1e] to-black text-slate-100 selection:bg-sky-500/30 overflow-x-hidden transition-all duration-500 ${sizeClasses.base}`}>
      
      {/* Background Neon Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 space-y-8">
        
        {/* Header Section */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-400/30 bg-sky-400/5 text-sky-400 text-[10px] font-black tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(56,189,248,0.1)]">
             <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
             Slides Team Console
          </div>

          <h1 className={`${sizeClasses.title} font-black tracking-tighter text-white drop-shadow-2xl`}>
            Aholiab Sermon Workflow
          </h1>

          {/* Large Target Service Date Block */}
          <div className="flex flex-col items-center gap-1 group">
            <div className="flex items-center gap-3 text-sky-300">
               <span className="text-[10px] font-bold uppercase tracking-widest text-sky-500/70">Target Service Date</span>
               <button onClick={() => setIsEditingDate(true)} className="opacity-50 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="h-3 w-3" />
               </button>
            </div>
            
            {isEditingDate ? (
              <input 
                type="date" 
                value={targetDate} 
                onChange={(e) => setTargetDate(e.target.value)}
                onBlur={() => setIsEditingDate(false)}
                className="bg-sky-900/40 border border-sky-400/50 rounded-xl px-4 py-2 text-white text-xl focus:outline-none focus:ring-2 ring-sky-400/50"
                autoFocus
              />
            ) : (
              <div className={`${sizeClasses.date} font-bold text-white tracking-tight flex items-center gap-3`}>
                <Calendar className="h-6 w-6 text-sky-400/50" />
                {formatDisplayDate(targetDate)}
              </div>
            )}
          </div>
        </div>

        {/* Global Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 bg-sky-400/5 backdrop-blur-xl px-5 py-4 rounded-2xl border border-sky-400/20 shadow-xl shadow-black/20">
             <Switch id="evangelism-mode" checked={isEvangelismSabbath} onCheckedChange={setIsEvangelismSabbath} className="data-[state=checked]:bg-sky-400" />
             <Label htmlFor="evangelism-mode" className="text-sm font-bold text-sky-100 cursor-pointer">Evangelism Sabbath Mode</Label>
          </div>

          <div className="flex items-center justify-between gap-4 bg-white/5 backdrop-blur-xl px-5 py-4 rounded-2xl border border-white/10 shadow-xl shadow-black/20">
             <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mr-2">Font Scale</span>
                {["S", "M", "L"].map((s) => (
                  <button key={s} onClick={() => handleFontSizeChange(s as any)} className={`w-8 h-8 flex items-center justify-center rounded-lg font-black transition-all ${fontSize === s ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]" : "text-slate-500 hover:text-slate-200"}`}>{s}</button>
                ))}
             </div>
             <Button variant="ghost" onClick={handleReset} className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">Reset</Button>
          </div>
        </div>

        {/* Master Progress Monitor */}
        <div className="bg-sky-400/5 backdrop-blur-md rounded-3xl border border-sky-400/20 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500">Overall Weekly Progress</span>
            <span className="text-xl font-black text-white">{masterProgress.percentage}%</span>
          </div>
          <div className="h-3 bg-black/40 rounded-full border border-white/5 p-0.5">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-600 via-blue-500 to-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all duration-1000" style={{ width: `${masterProgress.percentage}%` }} />
          </div>
        </div>

        {/* Workflow Routing Area */}
        <Tabs defaultValue="backdrops-theme" className="w-full">
          <TabsList className="w-full h-auto flex flex-wrap gap-2 bg-transparent mb-8">
            {workflowTabs.map((tab) => {
              const progress = getTabProgress(tab);
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex-1 min-w-[140px] flex-col items-start gap-1 p-4 rounded-2xl border border-white/5 bg-white/[0.03] transition-all data-[state=active]:bg-sky-500/10 data-[state=active]:border-sky-400/50 data-[state=active]:shadow-[0_0_20px_rgba(56,189,248,0.1)]">
                   <span className={`${sizeClasses.tabTitle} font-black uppercase tracking-widest text-slate-500 group-data-[state=active]:text-sky-400`}>{tab.phaseTitle}</span>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-sky-500/40 data-[state=active]:bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
                      <span className={`${sizeClasses.tabLabel} font-black text-slate-100`}>{tab.label}</span>
                   </div>
                   <div className="w-full mt-3 h-1 bg-black/20 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400 transition-all" style={{ width: `${progress.percentage}%` }} />
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
                <Card className="bg-sky-900/10 backdrop-blur-2xl border border-sky-400/20 rounded-[2rem] overflow-hidden shadow-2xl">
                  <CardContent className="p-6 md:p-8 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="text-xs font-black uppercase tracking-widest text-sky-400">{tab.label} Checklist</h3>
                       <div className="text-[10px] font-bold text-sky-300 bg-sky-400/10 px-3 py-1 rounded-full">{progress.percentage}% Phase Goal</div>
                    </div>
                    {visibleItems.map((item) => (
                      <label key={item.id} className={`flex items-start gap-5 p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${checkedItems[item.id] ? "bg-sky-400/5 border-transparent opacity-40" : "bg-sky-400/5 border-sky-400/10 hover:border-sky-400/40 hover:bg-sky-400/10"}`}>
                        <div className="pt-1">
                          <Checkbox id={item.id} checked={checkedItems[item.id] || false} onCheckedChange={(c) => handleCheck(item.id, c === true)} className="w-6 h-6 rounded-lg border-2 border-sky-400/30 data-[state=checked]:bg-sky-400 data-[state=checked]:border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.2)]" />
                        </div>
                        <div className="space-y-1">
                           <div className={`${sizeClasses.itemTitle} font-black tracking-tight ${checkedItems[item.id] ? "text-slate-500 line-through" : "text-white"}`}>{item.title}</div>
                           <div className="text-xs font-medium text-slate-400 leading-relaxed">{item.description}</div>
                        </div>
                      </label>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Sacred Branding Footer */}
        <div className="pt-12 text-center opacity-30 group hover:opacity-100 transition-opacity">
           <p className="text-xs italic font-serif tracking-wide">&quot;And I have filled him with the Spirit of God, in wisdom, and in understanding...&quot;</p>
           <p className="text-[9px] font-black uppercase mt-2 tracking-[0.3em]">Exodus 31:3 • Systems Anchor</p>
        </div>

      </div>
    </div>
  );
}
