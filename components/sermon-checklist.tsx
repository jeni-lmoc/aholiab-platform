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
  phaseTitle: string; // The clear workflow phase title
  label: string;      // Original core label
  sublabel: string;   // Original sublabel
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
      {
        id: "backdrop",
        title: "Backdrops",
        description: "Get backdrops ready to display behind the pastor.",
      },
      {
        id: "theme",
        title: "Theme",
        description: "Establish the visual theme before any slides can be built.",
      },
    ],
  },
  {
    id: "verse-tech-beautification",
    phaseTitle: "Pre-Service",
    label: "Verse Tech & Beautification",
    sublabel: "Due Pre-Sabbath School",
    icon: <Sun className="h-4 w-4" />,
    items: [
      {
        id: "verse-tech",
        title: "Verse Tech",
        description:
          "Clean up the Pastor's raw outline and turn it into a raw slide presentation.",
      },
      {
        id: "beautify",
        title: "Beautification",
        description:
          "Format and beautify the raw slides so they are finalized for the Pastor's review.",
      },
    ],
  },
  {
    id: "study-guides-sites",
    phaseTitle: "During Service",
    label: "Study Guides & Sites",
    sublabel: "Due End of Service",
    icon: <BookOpen className="h-4 w-4" />,
    items: [
      {
        id: "afterglow-study",
        title: "Afterglow Study Guide",
        description: "Create the Afterglow study materials and slides.",
        isAfterglowRelated: true,
      },
      {
        id: "extended-study",
        title: "6-Day Extended Study Guide",
        description: "Create the extended study materials for the week.",
      },
      {
        id: "website",
        title: "Sites",
        description:
          "Upload the sermon video link, the main slide deck, the study guides, and the combined PDF to the site.",
      },
    ],
  },
  {
    id: "qr-codes",
    phaseTitle: "Post-Service",
    label: "QR Codes",
    sublabel: "Due Immediately Post-Service",
    icon: <Send className="h-4 w-4" />,
    items: [
      {
        id: "qr-code",
        title: "QR Codes",
        description: "Create PDFs, combine them, compress to under 20MB, upload, and generate QR code.",
      },
    ],
  },
];

const STORAGE_KEY = "aholiab-checklist-state";
const EVANGELISM_KEY = "aholiab-evangelism-toggle";
const FONT_SIZE_KEY = "aholiab-global-font-size";

export function SermonChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isEvangelismSabbath, setIsEvangelismSabbath] = useState(false);
  const [fontSize, setFontSize] = useState<"S" | "M" | "L">("M");
  const [targetDate, setTargetDate] = useState<string>("");
  const [isEditingDate, setIsEditingDate] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedChecked = localStorage.getItem(STORAGE_KEY);
    const savedEvangelism = localStorage.getItem(EVANGELISM_KEY);
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY);

    if (savedChecked) {
      setCheckedItems(JSON.parse(savedChecked));
    }
    if (savedEvangelism) {
      setIsEvangelismSabbath(JSON.parse(savedEvangelism));
    }
    if (savedFontSize === "S" || savedFontSize === "M" || savedFontSize === "L") {
      setFontSize(savedFontSize);
    }

    // Automatically calculate next upcoming Saturday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
    setTargetDate(nextSaturday.toISOString().split("T")[0]);

    setMounted(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems));
    }
  }, [checkedItems, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(EVANGELISM_KEY, JSON.stringify(isEvangelismSabbath));
    }
  }, [isEvangelismSabbath, mounted]);

  const handleFontSizeChange = (size: "S" | "M" | "L") => {
    setFontSize(size);
    localStorage.setItem(FONT_SIZE_KEY, size);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all tasks for this checklist?")) {
      setCheckedItems({});
      setIsEvangelismSabbath(false);
    }
  };

  const handleCheck = (id: string, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [id]: checked }));
  };

  const getTabProgress = (tab: WorkflowTab) => {
    const visibleItems = tab.items.filter(
      (item) => !(isEvangelismSabbath && item.isAfterglowRelated)
    );
    const completedCount = visibleItems.filter(
      (item) => checkedItems[item.id]
    ).length;
    const total = visibleItems.length;
    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    return { completed: completedCount, total, percentage };
  };

  const getMasterProgress = () => {
    let totalCompleted = 0;
    let totalItems = 0;
    workflowTabs.forEach((tab) => {
      const visibleItems = tab.items.filter(
        (item) => !(isEvangelismSabbath && item.isAfterglowRelated)
      );
      totalItems += visibleItems.length;
      totalCompleted += visibleItems.filter((item) => checkedItems[item.id]).length;
    });
    const percentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
    return { completed: totalCompleted, total: totalItems, percentage };
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
    const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", options);
  };

  const masterProgress = getMasterProgress();

  // Dynamic Page-Wide Font Sizing Maps
  const sizeClasses = {
    S: { base: "text-xs md:text-sm", title: "text-2xl md:text-3xl", subtitle: "text-xs md:text-sm", tabTitle: "text-[10px]", tabLabel: "text-xs", itemTitle: "text-sm", itemDesc: "text-xs" },
    M: { base: "text-sm md:text-base", title: "text-4xl md:text-5xl", subtitle: "text-base md:text-lg", tabTitle: "text-xs", tabLabel: "text-sm", itemTitle: "text-base", itemDesc: "text-sm" },
    L: { base: "text-base md:text-lg", title: "text-5xl md:text-6xl", subtitle: "text-lg md:text-xl", tabTitle: "text-sm", tabLabel: "text-base", itemTitle: "text-lg", itemDesc: "text-base" }
  }[fontSize];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0f24] flex items-center justify-center">
        <div className="animate-pulse space-y-2 text-center">
          <div className="h-8 w-32 bg-slate-800 rounded mx-auto" />
          <div className="text-sm text-slate-400 tracking-wide font-medium">Preparing Sanctuary Workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#0a0f24] to-[#1a102f] text-slate-200 relative selection:bg-purple-500/20 overflow-x-hidden ${sizeClasses.base}`}>
      
      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 space-y-6">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Safe Target Date Block */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-950/40 text-blue-400 text-xs font-semibold shadow-sm">
              <Calendar className="h-3.5 w-3.5" />
              <span>Target Service:</span>
              {isEditingDate ? (
                <input 
                  type="date" 
                  value={targetDate} 
                  onChange={(e) => setTargetDate(e.target.value)}
                  onBlur={() => setIsEditingDate(false)}
                  className="bg-slate-900 border border-purple-500/30 rounded px-1 text-slate-200 text-xs focus:outline-none"
                  autoFocus
                />
              ) : (
                <span className="text-slate-200">{formatDisplayDate(targetDate)}</span>
              )}
              <button onClick={() => setIsEditingDate(!isEditingDate)} className="hover:text-purple-400 transition-colors p-0.5">
                <Edit2 className="h-3 w-3" />
              </button>
            </div>

            {/* Renamed Identification Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-950/40 text-purple-400 text-xs font-semibold tracking-wider uppercase">
              <CheckCircle2 className="h-3.5 w-3.5" /> Slides Team Console
            </div>
          </div>

          <h1 className={`${sizeClasses.title} font-extrabold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent`}>
            Aholiab Sermon Workflow
          </h1>
          <p className={`${sizeClasses.subtitle} text-slate-400 max-w-xl mx-auto font-medium`}>
            Sabbath Slide Production Systems Management Interface
          </p>
        </div>

        {/* Controls Bar & Global Configuration */}
        <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-[0_0_30px_rgba(147,51,234,0.03)] ring-1 ring-white/5">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Cleaned Evangelism Toggle without extra subtitle */}
              <div className="flex items-center gap-4 bg-slate-950/40 px-4 py-2.5 rounded-xl border border-slate-800 shadow-inner">
                <Switch
                  id="evangelism-mode"
                  checked={isEvangelismSabbath}
                  onCheckedChange={setIsEvangelismSabbath}
                  className="data-[state=checked]:bg-amber-500"
                />
                <Label htmlFor="evangelism-mode" className="text-sm font-semibold cursor-pointer select-none text-slate-200">
                  Evangelism Sabbath Mode
                </Label>
              </div>

              {/* Preferences & Reset Row */}
              <div className="flex flex-wrap items-center gap-4 self-end sm:self-auto">
                {/* Clean Labelled SML Global Font Switcher */}
                <div className="flex items-center gap-2 bg-slate-950/50 p-1 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Font:</span>
                  {(["S", "M", "L"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleFontSizeChange(size)}
                      className={`px-2 py-0.5 text-xs font-black rounded transition-all ${
                        fontSize === size
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-900/20"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="gap-2 text-xs font-bold border-rose-950/40 bg-slate-950 hover:bg-rose-950/30 hover:border-rose-900/50 text-rose-400 shadow-sm transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Checklist
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Master Progress Monitor - Renamed */}
        <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-xl overflow-hidden ring-1 ring-white/5">
          <CardContent className="py-5">
            <div className="flex items-end justify-between mb-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Overall Weekly Progress
                </span>
                <span className="block text-2xl font-black tracking-tight text-white">
                  {masterProgress.percentage}% <span className="text-xs font-semibold text-slate-500 uppercase">Complete</span>
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-md border border-slate-800 shadow-sm">
                {masterProgress.completed} / {masterProgress.total} Tasks Remaining
              </span>
            </div>
            
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-700 ease-out rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 shadow-[0_0_12px_rgba(147,51,234,0.4)]`}
                style={{ width: `${masterProgress.percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Workflow Routing Area */}
        <Tabs defaultValue="backdrops-theme" className="w-full">
          {/* Enhanced Unmistakable Navigation Tabs */}
          <TabsList className="w-full mb-6 bg-slate-950/60 border border-slate-800/80 p-1.5 flex-wrap h-auto gap-1.5 rounded-xl shadow-inner backdrop-blur-sm">
            {workflowTabs.map((tab) => {
              const progress = getTabProgress(tab);
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex-1 min-w-[165px] py-2.5 px-3 flex-col items-start rounded-lg transition-all duration-300 select-none border border-transparent text-slate-400 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:border-purple-500/50 data-[state=active]:shadow-[0_0_15px_rgba(147,51,234,0.15)]"
                >
                  {/* Newly added top Phase Workflow headers */}
                  <span className={`${sizeClasses.tabTitle} font-black uppercase tracking-widest block mb-1 text-slate-500 data-[state=active]:text-purple-400`}>
                    {tab.phaseTitle}
                  </span>

                  <div className="flex items-center gap-2 w-full">
                    <div className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400">
                      {tab.icon}
                    </div>
                    <span className={`${sizeClasses.tabLabel} font-bold tracking-tight text-left`}>{tab.label}</span>
                  </div>

                  <div className="flex items-center justify-between w-full mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-500 font-medium">
                    <span>
                      {tab.sublabel} {tab.id === "backdrops-theme" && getWednesdayDateString()}
                    </span>
                    {progress.total > 0 && (
                      <span className={`font-bold px-1.5 py-0.5 rounded ${
                        progress.percentage === 100 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-slate-950 text-slate-300"
                      }`}>
                        {progress.completed}/{progress.total}
                      </span>
                    )}
                  </div>

                  {/* Restored Per-Phase Mini Visual Progress Indicators */}
                  <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden mt-2 border border-slate-900">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {workflowTabs.map((tab) => {
            const progress = getTabProgress(tab);
            const visibleItems = tab.items.filter(
              (item) => !(isEvangelismSabbath && item.isAfterglowRelated)
            );

            return (
              <TabsContent key={tab.id} value={tab.id} className="mt-0 space-y-4 focus-visible:outline-none focus-visible:ring-0">
                
                {/* Embedded Module Meta Headline Card */}
                {visibleItems.length > 0 && (
                  <div className="flex items-center justify-between px-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-300 tracking-tight">{tab.label} Checklist</span>
                      <span className="text-xs bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded-full text-purple-400 font-semibold">
                        Phase Progress: {progress.percentage}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Floating Workspace Card Module */}
                {visibleItems.length === 0 ? (
                  <Card className="border-dashed border-2 border-slate-800 bg-slate-900/30 backdrop-blur-md shadow-lg">
                    <CardContent className="py-16 text-center max-w-sm mx-auto space-y-2">
                      <div className="mx-auto w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800">
                        <CheckCircle2 className="h-5 w-5 text-slate-500" />
                      </div>
                      <p className="text-base font-bold text-slate-300">Operational Stage Deferred</p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        No parameters defined for this specific lifecycle during an Evangelism Sabbath.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-md shadow-2xl ring-1 ring-white/5 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.3),0_0_30px_rgba(147,51,234,0.02)]">
                    <CardContent className="p-3 sm:p-5">
                      <div className="space-y-2.5">
                        {visibleItems.map((item) => {
                          const isChecked = checkedItems[item.id] || false;

                          return (
                            <label
                              key={item.id}
                              className={`group flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 border border-transparent select-none ${
                                isChecked
                                  ? "bg-slate-950/20 opacity-50 hover:opacity-70 border-slate-950/10"
                                  : "bg-slate-950/40 hover:bg-slate-950/80 border-slate-900 hover:border-purple-500/30 hover:shadow-lg"
                              }`}
                            >
                              {/* Thicker, High-Contrast Empty Box States with Hover Effect */}
                              <div className="pt-0.5">
                                <Checkbox
                                  id={item.id}
                                  checked={isChecked}
                                  onCheckedChange={(checked) =>
                                    handleCheck(item.id, checked === true)
                                  }
                                  className="h-5 w-5 rounded-md border-slate-400 group-hover:border-purple-400 transition-all duration-200 group-hover:scale-105 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 data-[state=checked]:shadow-[0_0_10px_rgba(16,185,129,0.5)] bg-slate-900 stroke-[2.5]"
                                />
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div
                                  className={`${sizeClasses.itemTitle} font-bold tracking-tight transition-all duration-300 ${
                                    isChecked
                                      ? "text-slate-500 line-through"
                                      : "text-slate-200 group-hover:text-purple-400"
                                  }`}
                                >
                                  {item.title}
                                </div>
                                <div
                                  className={`${sizeClasses.itemDesc} leading-relaxed transition-all duration-300 font-medium ${
                                    isChecked
                                      ? "text-slate-600"
                                      : "text-slate-400 group-hover:text-slate-300"
                                  }`}
                                >
                                  {item.description}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Sacred Branding Footer */}
        <div className="mt-16 max-w-md mx-auto text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800 to-transparent h-[1px] top-0" />
          <div className="pt-8 space-y-3 px-4">
            <p className="text-sm italic text-slate-500 leading-relaxed tracking-wide antialiased font-serif">
              &quot;And I have filled him with the Spirit of God, in wisdom, and
              in understanding, and in knowledge...&quot;
            </p>
            <p className="text-xs font-bold tracking-widest text-slate-600 uppercase">
              — Exodus 31:3 <span className="font-medium text-slate-600/70">(Aholiab&apos;s calling)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
