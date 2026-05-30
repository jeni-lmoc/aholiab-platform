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
  Sliders,
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

const STORAGE_KEY = "aholiab-checklist-state-v5";
const EVANGELISM_KEY = "aholiab-evangelism-toggle";
const FONT_SIZE_KEY = "aholiab-global-font-size";
const THEME_KEY = "aholiab-global-theme";

type AppTheme = "Dawn" | "Sunset" | "Twilight";

export function SermonChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isEvangelismSabbath, setIsEvangelismSabbath] = useState(false);
  const [fontSize, setFontSize] = useState<"S" | "M" | "L">("M");
  const [currentTheme, setCurrentTheme] = useState<AppTheme>("Twilight");
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
    if (savedTheme === "Dawn" || savedTheme === "Sunset" || savedTheme === "Twilight") setCurrentTheme(savedTheme as AppTheme);

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

  // --- COMPREHENSIVE CONFIGURABLE VISUAL DICTIONARY MAPS ---
  const themeStyles = {
    Twilight: {
      bg: "bg-[#0a0b1e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0b1e] to-black text-slate-100 selection:bg-sky-500/30",
      badge: "border-sky-400/30 bg-sky-400/5 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.1)]",
      badgeDot: "bg-sky-400",
      headerBlock: "bg-sky-500/5 border-sky-400/10 text-white shadow-xl shadow-black/20",
      dateLabel: "text-sky-400/80",
      cardBg: "border-slate-800/80 bg-slate-900/60 ring-1 ring-white/5 shadow-xl shadow-black/30",
      toggleBox: "bg-sky-400/5 border-sky-400/20 text-sky-100 shadow-xl shadow-black/20",
      toggleColor: "data-[state=checked]:bg-sky-400",
      progressBox: "bg-sky-400/5 border-sky-400/20 shadow-xl shadow-black/20",
      progressTitle: "text-sky-400/90",
      progressBar: "from-sky-600 via-blue-500 to-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]",
      tabUnselected: "border-slate-900 bg-slate-950/60 text-slate-400 shadow-inner",
      tabActive: "bg-sky-500/10 border-sky-400/50 text-white shadow-[0_0_20px_rgba(56,189,248,0.15)]",
      tabPhaseText: "text-slate-500 group-data-[state=active]:text-sky-400",
      tabMainText: "text-slate-200 group-data-[state=active]:text-white",
      workspaceCard: "bg-sky-950/10 border-sky-400/20 shadow-black/50",
      workspaceHeader: "text-sky-400 border-sky-400/10",
      taskItem: "bg-slate-950/40 border-slate-900 hover:border-purple-500/30 hover:bg-slate-950/80",
      taskItemChecked: "bg-sky-400/[0.02] border-transparent opacity-40",
      taskText: "text-white",
      taskDesc: "text-slate-400",
      checkboxBorder: "border-slate-400 group-hover/item:border-sky-400 data-[state=checked]:bg-sky-400 data-[state=checked]:border-sky-400",
      footerBox: "border-slate-900/60 text-slate-300 bg-white/[0.02]",
      footerRef: "text-slate-400"
    },
    Dawn: {
      bg: "bg-gradient-to-b from-[#e0f2fe] via-[#f1f5f9] to-[#fae8ff] text-slate-800 selection:bg-blue-200",
      badge: "border-blue-400/40 bg-blue-500/10 text-blue-700 shadow-sm",
      badgeDot: "bg-blue-600",
      headerBlock: "bg-white/80 border-blue-200 text-slate-900 shadow-md backdrop-blur-md",
      dateLabel: "text-blue-600/80",
      cardBg: "border-slate-200 bg-white/70 shadow-md backdrop-blur-md",
      toggleBox: "bg-white/70 border-slate-200 text-slate-800 shadow-md backdrop-blur-md",
      toggleColor: "data-[state=checked]:bg-blue-600",
      progressBox: "bg-white/70 border-slate-200 shadow-md backdrop-blur-md",
      progressTitle: "text-blue-600",
      progressBar: "from-blue-600 via-indigo-500 to-purple-600 shadow-none",
      tabUnselected: "border-slate-200/60 bg-slate-100/50 text-slate-400",
      tabActive: "bg-white border-purple-400/60 text-slate-900 shadow-lg shadow-purple-900/5",
      tabPhaseText: "text-slate-400 group-data-[state=active]:text-purple-600 font-extrabold",
      tabMainText: "text-slate-600 group-data-[state=active]:text-slate-950",
      workspaceCard: "bg-purple-500/[0.03] border-purple-400/20 shadow-xl shadow-purple-900/5 backdrop-blur-md",
      workspaceHeader: "text-purple-600 border-purple-400/10",
      taskItem: "bg-white border-slate-200 hover:border-purple-400/40 hover:bg-slate-50/50 hover:shadow-sm",
      taskItemChecked: "bg-slate-100/40 border-transparent opacity-40",
      taskText: "text-slate-800",
      taskDesc: "text-slate-500",
      checkboxBorder: "border-slate-300 group-hover/item:border-purple-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600",
      footerBox: "border-purple-200 text-slate-600 bg-purple-500/[0.02]",
      footerRef: "text-slate-500"
    },
    Sunset: {
      bg: "bg-[#1c121e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3a1c28] via-[#1c121e] to-[#0c080f] text-amber-100 selection:bg-rose-500/20",
      badge: "border-rose-400/30 bg-rose-400/5 text-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.1)]",
      badgeDot: "bg-rose-400",
      headerBlock: "bg-rose-950/20 border-rose-900/30 text-white shadow-xl shadow-black/30",
      dateLabel: "text-rose-400/80",
      cardBg: "border-rose-950/30 bg-[#251829]/80 ring-1 ring-white/5 shadow-xl shadow-black/30",
      toggleBox: "bg-rose-950/20 border-rose-900/30 text-rose-100 shadow-xl shadow-black/20",
      toggleColor: "data-[state=checked]:bg-amber-600",
      progressBox: "bg-rose-950/20 border-rose-900/30 shadow-xl shadow-black/20",
      progressTitle: "text-amber-400/90",
      progressBar: "from-amber-600 via-rose-500 to-rose-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
      tabUnselected: "border-[#170e1a] bg-[#140b17]/80 text-rose-300/40 shadow-inner",
      tabActive: "bg-rose-500/10 border-amber-500/50 text-white shadow-[0_0_20px_rgba(245,158,11,0.1)]",
      tabPhaseText: "text-rose-400/40 group-data-[state=active]:text-amber-400 font-extrabold",
      tabMainText: "text-rose-200/60 group-data-[state=active]:text-white",
      workspaceCard: "bg-rose-950/10 border-rose-400/20 shadow-black/50",
      workspaceHeader: "text-amber-400 border-rose-400/10",
      taskItem: "bg-[#180e1a]/60 border-[#28192c] hover:border-amber-500/30 hover:bg-[#1f1222]/80",
      taskItemChecked: "bg-rose-950/10 border-transparent opacity-40",
      taskText: "text-rose-50",
      taskDesc: "text-rose-300/60",
      checkboxBorder: "border-rose-400/40 group-hover/item:border-amber-400 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600",
      footerBox: "border-rose-950/40 text-rose-200/70 bg-white/[0.01]",
      footerRef: "text-rose-400/50"
    }
  }[currentTheme];

  // --- ACCESS MODE DYNAMIC FONT MAPS ---
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
      
      {/* Background Ambience Ambient Lights (Only in Twilight & Sunset Modes) */}
      {currentTheme === "Twilight" && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[120px] pointer-events-none" />
        </>
      )}
      {currentTheme === "Sunset" && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-600/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/5 blur-[120px] pointer-events-none" />
        </>
      )}
