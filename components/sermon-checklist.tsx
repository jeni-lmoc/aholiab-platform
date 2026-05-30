"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  RotateCcw,
  Calendar,
  Sun,
  BookOpen,
  Send,
  CheckCircle2,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  isAfterglowRelated?: boolean;
}

interface WorkflowTab {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

const workflowTabs: WorkflowTab[] = [
  {
    id: "backdrops-theme",
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

export function SermonChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isEvangelismSabbath, setIsEvangelismSabbath] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedChecked = localStorage.getItem(STORAGE_KEY);
    const savedEvangelism = localStorage.getItem(EVANGELISM_KEY);

    if (savedChecked) {
      setCheckedItems(JSON.parse(savedChecked));
    }
    if (savedEvangelism) {
      setIsEvangelismSabbath(JSON.parse(savedEvangelism));
    }
    setMounted(true);
  }, []);

  // Save checked items to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems));
    }
  }, [checkedItems, mounted]);

  // Save evangelism toggle to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(EVANGELISM_KEY, JSON.stringify(isEvangelismSabbath));
    }
  }, [isEvangelismSabbath, mounted]);

  const handleReset = () => {
    setCheckedItems({});
    setIsEvangelismSabbath(false);
  };

  const handleCheck = (id: string, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [id]: checked }));
  };

  // Calculate progress for a specific tab
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

  // Calculate master progress across all tabs
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

  const masterProgress = getMasterProgress();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-2 text-center">
          <div className="h-8 w-32 bg-muted rounded mx-auto" />
          <div className="text-sm text-muted-foreground tracking-wide font-medium">Preparing Sanctuary Workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20 overflow-x-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none blur-3xl z-0" />
      <div className="texture-overlay absolute inset-0 opacity-20 pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {/* Header Section */}
        <div className="mb-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wider uppercase mb-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Production Console
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            Aholiab Sermon Workflow
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto font-medium">
            Sabbath Slide Production Systems Management Interface
          </p>
        </div>

        {/* Controls Bar & Global Configuration */}
        <Card className="mb-6 border-border/60 bg-card/60 backdrop-blur-md shadow-xl shadow-black/5 ring-1 ring-white/5">
          <CardContent className="py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4 bg-secondary/40 px-4 py-3 rounded-xl border border-border/50 shadow-inner">
                <Switch
                  id="evangelism-mode"
                  checked={isEvangelismSabbath}
                  onCheckedChange={setIsEvangelismSabbath}
                  className="data-[state=checked]:bg-amber-500"
                />
                <Label
                  htmlFor="evangelism-mode"
                  className="text-sm font-semibold cursor-pointer select-none space-y-0.5"
                >
                  <span className="block text-foreground text-sm">Evangelism Sabbath Mode</span>
                  <span className="block text-xs text-muted-foreground font-normal">Active for End-of-Month services</span>
                </Label>
              </div>

              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2 text-sm font-semibold border-destructive/20 hover:border-destructive/40 hover:bg-destructive/10 text-destructive shadow-sm self-end sm:self-auto transition-all"
              >
                <RotateCcw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-300" />
                Reset Checklist
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Master Progress Monitor */}
        <Card className="mb-8 border-border/60 bg-card/60 backdrop-blur-md shadow-xl shadow-black/5 overflow-hidden ring-1 ring-white/5">
          <CardContent className="py-6 relative">
            <div className="flex items-end justify-between mb-3 relative z-10">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-foreground/90 uppercase tracking-wider">
                  Global Blueprint Metrics
                </span>
                <span className="block text-2xl font-black tracking-tight">
                  {masterProgress.percentage}% <span className="text-xs font-semibold text-muted-foreground uppercase">Complete</span>
                </span>
              </div>
              <span className="text-sm font-semibold text-muted-foreground bg-secondary/60 px-2.5 py-1 rounded-md border border-border/30 shadow-sm">
                {masterProgress.completed} / {masterProgress.total} Tasks Remaining
              </span>
            </div>
            
            <div className="w-full h-2.5 bg-secondary/80 rounded-full overflow-hidden relative border border-black/5">
              <div
                className={`h-full transition-all duration-700 ease-out rounded-full bg-gradient-to-r ${
                  masterProgress.percentage === 100 
                    ? "from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]" 
                    : "from-blue-600 via-indigo-500 to-purple-500"
                }`}
                style={{ width: `${masterProgress.percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Workflow Routing Area */}
        <Tabs defaultValue="backdrops-theme" className="w-full">
          <TabsList className="w-full mb-8 bg-muted/60 border border-border/60 p-1.5 flex-wrap h-auto gap-1 rounded-xl shadow-inner backdrop-blur-sm">
            {workflowTabs.map((tab) => {
              const progress = getTabProgress(tab);
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex-1 min-w-[160px] py-3 px-3 text-xs gap-2 flex-col items-center rounded-lg transition-all duration-300 select-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:ring-1 data-[state=active]:ring-black/5"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-secondary/50 border border-border/20 text-muted-foreground group-data-[state=active]:text-primary">
                      {tab.icon}
                    </div>
                    <span className="font-bold tracking-tight">{tab.label}</span>
                  </div>
                  <div className="flex items-center justify-between w-full mt-2 pt-1.5 border-t border-border/20 text-[10px] text-muted-foreground/80 font-medium">
                    <span>{tab.sublabel}</span>
                    {progress.total > 0 && (
                      <span className={`font-bold px-1.5 py-0.5 rounded ${
                        progress.percentage === 100 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                          : "bg-secondary text-foreground"
                      }`}>
                        {progress.completed}/{progress.total}
                      </span>
                    )}
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
                {/* Embedded Module Meta Card */}
                {visibleItems.length > 0 && (
                  <div className="flex items-center justify-between px-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground/80 tracking-tight">{tab.label} Checklist</span>
                      <span className="text-xs bg-muted border border-border/40 px-2 py-0.5 rounded-full text-muted-foreground font-medium">
                        Phase Progress: {progress.percentage}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Main Content Processing Hub */}
                {visibleItems.length === 0 ? (
                  <Card className="border-dashed border-2 border-border/80 bg-card/40 backdrop-blur-md shadow-lg">
                    <CardContent className="py-16 text-center max-w-sm mx-auto space-y-2">
                      <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border/60">
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <p className="text-base font-bold text-foreground">Operational Stage Deferred</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        No parameters defined for this specific lifecycle during an Evangelism Sabbath.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-2xl shadow-black/5 ring-1 ring-white/5 overflow-hidden">
                    <CardContent className="p-3 sm:p-5">
                      <div className="space-y-2">
                        {visibleItems.map((item) => {
                          const isChecked = checkedItems[item.id] || false;

                          return (
                            <label
                              key={item.id}
                              className={`group flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 border border-transparent select-none ${
                                isChecked
                                  ? "bg-secondary/20 opacity-60 hover:opacity-80"
                                  : "bg-secondary/40 hover:bg-secondary/70 hover:border-border/60 hover:shadow-md"
                              }`}
                            >
                              <div className="pt-0.5">
                                <Checkbox
                                  id={item.id}
                                  checked={isChecked}
                                  onCheckedChange={(checked) =>
                                    handleCheck(item.id, checked === true)
                                  }
                                  className="h-5 w-5 rounded-md border-muted-foreground/40 transition-transform duration-200 group-hover:scale-105 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 data-[state=checked]:shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                />
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div
                                  className={`text-base font-bold tracking-tight transition-all duration-300 ${
                                    isChecked
                                      ? "text-muted-foreground line-through opacity-70"
                                      : "text-foreground group-hover:text-primary"
                                  }`}
                                >
                                  {item.title}
                                </div>
                                <div
                                  className={`text-sm leading-relaxed transition-all duration-300 font-medium ${
                                    isChecked
                                      ? "text-muted-foreground/40"
                                      : "text-muted-foreground/90"
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

        {/* Sacred Branding & Epilogue Anchor */}
        <div className="mt-16 max-w-md mx-auto text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border/40 to-transparent h-[1px] top-0" />
          <div className="pt-8 space-y-3 px-4">
            <p className="text-sm italic text-muted-foreground leading-relaxed tracking-wide antialiased font-serif">
              &quot;And I have filled him with the Spirit of God, in wisdom, and
              in understanding, and in knowledge...&quot;
            </p>
            <p className="text-xs font-bold tracking-widest text-foreground/60 uppercase">
              — Exodus 31:3 <span className="font-medium text-muted-foreground/60">(Aholiab&apos;s calling)</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
