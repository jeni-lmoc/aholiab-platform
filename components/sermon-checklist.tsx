"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RotateCcw,
  Calendar,
  Sun,
  BookOpen,
  Send,
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
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg relative">
      {/* Texture overlay for depth */}
      <div className="texture-overlay" />

      <div className="max-w-4xl mx-auto px-4 py-10 relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-3">
            Aholiab Weekly Sermon Workflow
          </h1>
          <p className="text-lg text-muted-foreground">
            Weekly workflow tracker for the Sabbath Slide Production Team
          </p>
        </div>

        {/* Controls Bar - Always visible above tabs */}
        <Card className="mb-6 border-border bg-card shadow-lg shadow-black/10">
          <CardContent className="py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Button
                variant="destructive"
                onClick={handleReset}
                className="gap-2 text-base"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Checklist
              </Button>

              <div className="flex items-center gap-3">
                <Switch
                  id="evangelism-mode"
                  checked={isEvangelismSabbath}
                  onCheckedChange={setIsEvangelismSabbath}
                />
                <Label
                  htmlFor="evangelism-mode"
                  className="text-base font-medium cursor-pointer"
                >
                  Evangelism Sabbath{" "}
                  <span className="text-muted-foreground">(End of Month)</span>
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Master Progress Bar */}
        <Card className="mb-6 border-border bg-card shadow-lg shadow-black/10">
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-foreground">
                Overall Progress
              </span>
              <span className="text-base text-muted-foreground">
                {masterProgress.completed} of {masterProgress.total} tasks ({masterProgress.percentage}%)
              </span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${masterProgress.percentage === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                style={{ width: `${masterProgress.percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Workflow Tabs */}
        <Tabs defaultValue="backdrops-theme" className="w-full">
          <TabsList className="w-full mb-6 bg-card border border-border h-auto p-1 flex-wrap">
            {workflowTabs.map((tab) => {
              const progress = getTabProgress(tab);
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex-1 min-w-[140px] py-3 px-2 text-sm gap-1.5 flex-col items-center data-[state=active]:bg-zinc-300 data-[state=active]:text-zinc-900 data-[state=inactive]:bg-transparent"
                >
                  <div className="flex items-center gap-1.5">
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{tab.sublabel}</span>
                  {progress.total > 0 && (
                    <span className={`text-xs font-medium ${progress.percentage === 100 ? "text-emerald-500" : "text-muted-foreground"}`}>
                      {progress.completed}/{progress.total}
                    </span>
                  )}
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
              <TabsContent key={tab.id} value={tab.id} className="mt-0">
                {/* Tab Progress Bar */}
                <Card className="mb-6 border-border bg-card shadow-lg shadow-black/10">
                  <CardContent className="py-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-semibold text-foreground">
                        {tab.label} Progress
                      </span>
                      <span className="text-base text-muted-foreground">
                        {progress.completed} of {progress.total} tasks ({progress.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Tab Content */}
                {visibleItems.length === 0 ? (
                  <Card className="border-border bg-card shadow-lg shadow-black/10">
                    <CardContent className="py-12 text-center">
                      <p className="text-lg text-muted-foreground">
                        No tasks for this phase during Evangelism Sabbath.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-border bg-card shadow-lg shadow-black/10">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-secondary text-foreground">
                          {tab.icon}
                        </div>
                        <div>
                          <CardTitle className="text-xl font-semibold text-foreground">
                            {tab.label}
                          </CardTitle>
                          <p className="text-base text-muted-foreground mt-1">
                            {tab.sublabel}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {visibleItems.map((item) => {
                          const isChecked = checkedItems[item.id] || false;

                          return (
                            <label
                              key={item.id}
                              className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-secondary/70 ${
                                isChecked ? "bg-secondary/40" : ""
                              }`}
                            >
                              <Checkbox
                                id={item.id}
                                checked={isChecked}
                                onCheckedChange={(checked) =>
                                  handleCheck(item.id, checked === true)
                                }
                                className="mt-1 h-5 w-5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div
                                  className={`text-base font-medium transition-all duration-200 ${
                                    isChecked
                                      ? "text-muted-foreground line-through"
                                      : "text-foreground"
                                  }`}
                                >
                                  {item.title}
                                </div>
                                <div
                                  className={`text-base mt-1 leading-relaxed transition-all duration-200 ${
                                    isChecked
                                      ? "text-muted-foreground/50"
                                      : "text-muted-foreground"
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

        {/* Footer */}
        <div className="mt-12 text-center text-base text-muted-foreground">
          <p className="italic">
            &quot;And I have filled him with the Spirit of God, in wisdom, and
            in understanding, and in knowledge...&quot;
          </p>
          <p className="mt-2 font-medium">— Exodus 31:3 (Aholiab&apos;s calling)</p>
        </div>
      </div>
    </div>
  );
}
