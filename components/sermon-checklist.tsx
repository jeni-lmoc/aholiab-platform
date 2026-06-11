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
  Edit2,
  Globe,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";

// ==========================================
// CENTRAL ASSETS & SOURCE OF TRUTH MANAGER
// ==========================================
const GLOBAL_LINKS = {
  trainingManual: "https://docs.google.com/document/d/1_Bt7oG56msLcRYvy2UqFG4DY8FkXiRbnLQuKi6SQb2U/edit?usp=drive_link",
  managingSlideLimits: "https://docs.google.com/document/d/1_Bt7oG56msLcRYvy2UqFG4DY8FkXiRbnLQuKi6SQb2U/edit?tab=t.ymklsy324605",
  weeklySermonTracker: "https://lmoc.slack.com/lists/T09C5S0VDK8/F0AT40A4ZDE"
};

const MASTER_AI_PROMPT = `Clean and format the attached document into text format for input into Gamma.

Rules:
Extract every Bible verse, quotation, or referenced material in the exact order it appears.
This includes Scripture, books, articles, manuscripts, or any quoted paragraph.
Each distinct reference or quote becomes one text block .
Combine multi-verse Scripture passages into a single block.
Keep non-Bible quotes grouped exactly as they appear (do not split them unless clearly separated in the document).
Do not summarize, rephrase, or omit any text.
Do not add any extra commentary or words.

Formatting:
Start with the first text block as Slide 1:
 Slide 1 - Title: Sermon Title Body: Pastor Ivor Myers
Then continue numbering text blocks sequentially.
Use this exact format for every text block:
 Slide # - Title: [Reference or Source] Body: [Full text]

Title rules:
For Bible verses, use the full book name and verse reference.
For non-Bible material, use the most specific source available (book name, author, manuscript reference, etc.).
If no clear source is given or the source cannot be determined, begin the title with: DOUBLE CHECK – followed by a short descriptive label.
For images, use  Slide # - Title: Image Placeholder Body: Check original document for image

Additional rules:
Keep duplicate references only if they are separated in the document.
If duplicate references appear back-to-back, remove the duplicate.
Preserve the exact order of all content.

Quotation rules:
Remove unnecessary outer quotation marks that come from document formatting.
Preserve quotation marks that are part of the actual quoted material (especially non-Bible sources like Ellen G. White).
Do not add new quotation marks anywhere.

Output:
Plain text only
One text block per line
No bullet points
No extra formatting or commentary
Do NOT create a slide deck`;

const ADDITIONAL_INSTRUCTIONS_PROMPT = `DO NOT Summarize, rephrase, or add sub-titles. DO NOT omit any input text or make up new content. All card titles must use heading level 1 (H1), be center-aligned, use the same theme color consistently, and remain consistent across all slides. All body text must use large text size, be center-aligned and remain consistent across all slides. DO NOT use Arrows, Stats, Circle stats, Pyramid, Funnel, Cycle, Circle, Ring, Semi-circle, and Flower to illustrate card content. Sparingly use Images or icons with text, Timeline, Bullets, Bar stats, Steps, and Staircase. No additional comments. Just the verse or the quote on each page. Nothing extra, just the text as provided.`;

// ==========================================
// TYPE DEFINITIONS & DATA ARCHITECTURE
// ==========================================
interface SubTask {
  id: string;
  title: string;
  customButton?: {
    label: string;
    actionType: "copy" | "link" | "gatekeeper-link";
    payload: string;
  };
}

interface ProgressivePhase {
  phaseId: string;
  phaseName: string;
  subTasks: SubTask[];
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  isAfterglowRelated?: boolean;
  hasManualLink?: boolean;
  progressivePhases?: ProgressivePhase[];
  subTasks?: SubTask[]; 
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
      { 
        id: "verse-tech", 
        title: "Verse Tech", 
        description: "Process raw outlines, generate AI text formatting, build the raw slide decks within Gamma, and set global styles.",
        hasManualLink: true,
        progressivePhases: [
          {
            phaseId: "vt-phase-1",
            phaseName: "Phase 1: Intake & AI Prep",
            subTasks: [
              { id: "vt-p1-s1", title: "Locate the most recent sermon Word document in the Aholiab channel and download it to your machine." },
              { id: "vt-p1-s2", title: "Open Gemini (ensure you are on the church Graphics account) and drag-and-drop the downloaded document into the chat box." },
              { 
                id: "vt-p1-s3", 
                title: "Run the Master AI Prompt inside the Gemini container alongside your uploaded document.",
                customButton: { label: "Copy Master AI Prompt", actionType: "copy", payload: MASTER_AI_PROMPT }
              },
              { id: "vt-p1-s4", title: "Perform a quick accuracy scan of the generated plain-text output, then copy the clean text layout to your clipboard." }
            ]
          },
          {
            phaseId: "vt-phase-2",
            phaseName: "Phase 2: Gamma Slide Generation",
            subTasks: [
              { 
                id: "vt-p2-s1", 
                title: "In Gamma, click + Create New AI -> Paste in Text, paste your content, and set parameters to Presentation, Traditional (16:9), and 'Preserve this exact text'.",
                customButton: { label: "⚠️ Click here if you have more than 75 slides", actionType: "gatekeeper-link", payload: GLOBAL_LINKS.managingSlideLimits }
              },
              { 
                id: "vt-p2-s2", 
                title: "Click Continue, switch layout to Freeform with 'Don't Add Images', and paste our copied additional instructions into the box on the right.",
                customButton: { label: "Copy Additional Instructions", actionType: "copy", payload: ADDITIONAL_INSTRUCTIONS_PROMPT }
              },
              { id: "vt-p2-s3", title: "Click Generate. Once complete, run a swift visual scroll to confirm no rogue decorative shapes or graphic items leaked into the layout." },
              { id: "vt-p2-s4", title: "Open Custom Themes via the palette directory icon and apply the look matching the Sabbath Date or Sermon Title (Fallback: LMOC Brand)." }
            ]
          },
          {
            phaseId: "vt-phase-3",
            phaseName: "Phase 3: Finalizing & Hand-off",
            subTasks: [
              { id: "vt-p3-s1", title: "Navigate to Page setup... inside Gamma, change Base font size to L (Large), turn ON Card backdrops, add the Small Theme logo, and choose 'Hide on first and last card'." },
              { id: "vt-p3-s2", title: "Open the template directory, copy the second card from the Social Media Card deck, and paste it at the very end of your active sermon deck filmstrip." },
              { id: "vt-p3-s3", title: "Click 'Add a Card using AI' at the bottom of the filmstrip and paste the References Index prompt from the training manual. Verify that this generated card perfectly cross-checks with the real scripture used in the deck." },
              { id: "vt-p3-s4", title: "Click Share, set public parameters strictly to 'View' to lock all visual assets, and copy your secure view-only deck link." },
              { 
                id: "vt-p3-s5", 
                title: "Open the Weekly Sermon Tracker in Slack, set status to Draft, paste the Gamma URL, upload the backup files, and send a direct hand-off notification DM to your POC.",
                customButton: { label: "Open Weekly Sermon Tracker", actionType: "link", payload: GLOBAL_LINKS.weeklySermonTracker }
              },
              { id: "vt-p3-s6", title: "Stay synchronized on the Zoom/Slack audio huddle. If the Pastor requests last-minute slide changes, the POC will dictate the exact insertion point. If a Gamma sync bug corrupts formatting, notify the POC immediately to execute a clean backup fork." }
            ]
          }
        ]
      },
      { 
        id: "beautify", 
        title: "Beautification", 
        description: "Format and beautify the raw slides so they are finalized for the Pastor's review.",
        progressivePhases: [
          {
            phaseId: "b-phase-1",
            phaseName: "Phase 1: Layout & Typography Scans",
            subTasks: [
              { id: "b-p1-s1", title: "Scan the deck for 'hanging words' (a single word left entirely alone on its own text line at the end of a passage)." },
              { id: "b-p1-s2", title: "To mitigate hanging words, insert a balanced left or right side graphic container to compress the text column and re-flow text cleanly." },
              { id: "b-p1-s3", title: "Identify dense, multi-verse blocks or massive non-Bible quotes. If a slide creates an unreadable wall of text, split it across multiple consecutive cards to ensure clean legibility." },
              { id: "b-p1-s4", title: "Cross-check today's finished slide cards against the pastor's original downloaded Word document. Manually re-apply bold styling to any emphasis words or key phrases that were stripped during the AI import process." }
            ]
          },
          {
            phaseId: "b-phase-2",
            phaseName: "Phase 2: Visual Enhancements & Audit",
            subTasks: [
              { id: "b-p2-s1", title: "Locate cards where a verse is extremely brief. Add aesthetic interest by embedding an image at the top or applying an entire background graphic container, keeping text highly readable." },
              { id: "b-p2-s2", title: "Audit the full thumbnail timeline track. Ensure a balanced pacing of elements across the presentation, avoiding image clustering (e.g., three image slides stacked together followed by ten blank ones)." },
              { id: "b-p2-s3", title: "Verify that zero transitions or element motion animations have been added anywhere in the presentation—all slides must remain static for stable broadcast production." },
              { id: "b-p2-s4", title: "Confirm that every added visual asset strictly aligns with the spiritual context of the specific passage and honors the core custom theme palette." }
            ]
          }
        ]
      },
    ],
  },
  {
    id: "during-service",
    phaseTitle: "During Service",
    label: "Study Guides, QR Codes, & Sites",
    sublabel: "Due by the End of Service",
    icon: <BookOpen className="h-4 w-4" />,
    items: [
      { id: "afterglow-study", title: "Afterglow Study Guide", description: "Create the Afterglow study materials and slides.", isAfterglowRelated: true },
      { id: "extended-study", title: "6-Day Extended Study Guide", description: "Create the extended study materials for the week." },
      { id: "qr-code", title: "QR Code Update", description: "Create PDFs, combine them, compress to under 20MB, upload, and save." },
      { id: "website", title: "Sites", description: "Upload the sermon video link, the main slide deck, the study guides, and the combined PDF to the site." },
    ],
  },
  {
    id: "post-service",
    phaseTitle: "Post-Service",
    label: "Site Update",
    sublabel: "Due ASAP Post-Service",
    icon: <Globe className="h-4 w-4" />,
    items: [
      { 
        id: "youtube-swap", 
        title: "Site Update", 
        description: "Replace the live stream archive container with the finalized, edited sermon-only YouTube video link (typically 1-2 days post-service).",
        subTasks: [
          { id: "site-sub-1", title: "Copy the new sermon-only YouTube link, open the sermon site editor page, and click the three dots icon next to the video container." },
          { id: "site-sub-2", title: "Delete the old livestream link, paste the new sermon link into the space, and click the checkmark icon to save the swap." },
          { id: "site-sub-3", title: "Click the Publish button in the upper right corner to push the updated page live." },
          { id: "site-sub-4", title: "Open the live public sermon site and verify that the correct sermon-only video plays flawlessly." }
        ]
      },
    ],
  },
];

const STORAGE_KEY = "aholiab-checklist-state-v25";
const SUB_STORAGE_KEY = "aholiab-subchecklist-state-v25";
const EVANGELISM_KEY = "aholiab-evangelism-toggle";
const FONT_SIZE_KEY = "aholiab-global-font-size";
const THEME_KEY = "aholiab-global-theme";

type AppTheme = "Light" | "Dark";

export function SermonChecklist() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [checkedSubItems, setCheckedSubItems] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});
  const [copiedStatus, setCopiedStatus] = useState<Record<string, boolean>>({});
  
  const [isGatekeeperOpen, setIsGatekeeperOpen] = useState(false);
  const [pendingGatekeeperUrl, setPendingGatekeeperUrl] = useState("");

  const [isEvangelismSabbath, setIsEvangelismSabbath] = useState(false);
  const [fontSize, setFontSize] = useState<"S" | "M" | "L">("M");
  const [currentTheme, setCurrentTheme] = useState<AppTheme>("Dark");
  const [targetDate, setTargetDate] = useState<string>("");
  const [isEditingDate, setIsEditingDate] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedChecked = localStorage.getItem(STORAGE_KEY);
    const savedSubChecked = localStorage.getItem(SUB_STORAGE_KEY);
    const savedEvangelism = localStorage.getItem(EVANGELISM_KEY);
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY);

    if (savedChecked) setCheckedItems(JSON.parse(savedChecked));
    if (savedSubChecked) setCheckedSubItems(JSON.parse(savedSubChecked));
    if (savedEvangelism) setIsEvangelismSabbath(JSON.parse(savedEvangelism));
    if (savedFontSize === "S" || savedFontSize === "M" || savedFontSize === "L") setFontSize(savedFontSize);
    
    if (savedTheme === "Light") setCurrentTheme(savedTheme);
    else setCurrentTheme("Dark");

    const today = new Date();
    const currentDay = today.getDay(); 
    const targetSabbath = new Date(today);

    if (currentDay === 6) {
      targetSabbath.setDate(today.getDate());
    } else {
      const daysUntilSaturday = 6 - currentDay;
      targetSabbath.setDate(today.getDate() + daysUntilSaturday);
    }

    const localYear = targetSabbath.getFullYear();
    const localMonth = String(targetSabbath.getMonth() + 1).padStart(2, "0");
    const localDay = String(targetSabbath.getDate()).padStart(2, "0");
    
    setTargetDate(`${localYear}-${localMonth}-${localDay}`);
    setMounted(true);
  }, []);

  useEffect(() => { if (mounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems)); }, [checkedItems, mounted]);
  useEffect(() => { if (mounted) localStorage.setItem(SUB_STORAGE_KEY, JSON.stringify(checkedSubItems)); }, [checkedSubItems, mounted]);
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
      setCheckedSubItems({});
      setExpandedItems({});
      setExpandedPhases({});
      setIsEvangelismSabbath(false);
    }
  };

  const handleCheck = (id: string, checked: boolean) => {
    setCheckedItems((prev) => ({ ...prev, [id]: checked }));
    
    const item = workflowTabs.flatMap(t => t.items).find(i => i.id === id);
    if (!item) return;

    const subUpdates: Record<string, boolean> = {};
    if (item.progressivePhases) {
      item.progressivePhases.flatMap(p => p.subTasks).forEach(sub => { subUpdates[sub.id] = checked; });
    } else if (item.subTasks) {
      item.subTasks.forEach(sub => { subUpdates[sub.id] = checked; });
    }
    setCheckedSubItems(prev => ({ ...prev, ...subUpdates }));
  };

  const handleSubCheck = (parentId: string, subId: string, checked: boolean) => {
    const updatedSubItems = { ...checkedSubItems, [subId]: checked };
    setCheckedSubItems(updatedSubItems);

    const item = workflowTabs.flatMap(t => t.items).find(i => i.id === parentId);
    if (!item) return;

    const allSubTasks = item.progressivePhases 
      ? item.progressivePhases.flatMap(p => p.subTasks) 
      : (item.subTasks || []);

    if (allSubTasks.length > 0) {
      const allChecked = allSubTasks.every(sub => updatedSubItems[sub.id]);
      setCheckedItems(prev => ({ ...prev, [parentId]: allChecked }));
    }
  };

  const toggleAccordion = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleActionClick = (buttonSpec: any, subTaskId: string) => {
    if (buttonSpec.actionType === "gatekeeper-link") {
      setPendingGatekeeperUrl(buttonSpec.payload);
      setIsGatekeeperOpen(true);
    } else if (buttonSpec.actionType === "link") {
      window.open(buttonSpec.payload, "_blank", "noopener,noreferrer");
    } else if (buttonSpec.actionType === "copy") {
      navigator.clipboard.writeText(buttonSpec.payload);
      setCopiedStatus(prev => ({ ...prev, [subTaskId]: true }));
      setTimeout(() => {
        setCopiedStatus(prev => ({ ...prev, [subTaskId]: false }));
      }, 2000);
    }
  };

  const executeGatekeeperLink = () => {
    window.open(pendingGatekeeperUrl, "_blank", "noopener,noreferrer");
    setIsGatekeeperOpen(false);
    setPendingGatekeeperUrl("");
  };

  const getSubProgress = (item: ChecklistItem) => {
    const allSubTasks = item.progressivePhases 
      ? item.progressivePhases.flatMap(p => p.subTasks) 
      : (item.subTasks || []);

    if (allSubTasks.length === 0) return { completed: 0, total: 0, percentage: 0 };
    const completed = allSubTasks.filter(sub => checkedSubItems[sub.id]).length;
    return { completed, total: allSubTasks.length, percentage: Math.round((completed / allSubTasks.length) * 100) };
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
    const originalFormatted = new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    return originalFormatted.replace("Saturday", "Sabbath");
  };

  const masterProgress = getMasterProgress();

  const themeStyles = {
    Dark: {
      bg: "bg-[#bfdbfe] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc] text-slate-100 selection:bg-sky-500/30",
      pageTitle: "text-slate-800 drop-shadow-sm", 
      badge: "border-sky-500/20 bg-slate-900/60 text-sky-400 shadow-lg backdrop-blur-md",
      badgeDot: "bg-sky-400",
      headerBlock: "bg-slate-900/75 border-slate-800/80 text-white shadow-xl backdrop-blur-md",
      dateLabel: "text-sky-400/80",
      cardBg: "border-slate-800/80 bg-slate-900/75 ring-1 ring-white/5 shadow-xl backdrop-blur-md",
      
      btnUnselected: "bg-slate-950 text-slate-200 border-slate-800 hover:text-white hover:bg-rose-600 hover:border-rose-700 transition-colors duration-200",
      btnActive: "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-900/20",
      toggleBox: "bg-slate-900/75 border-slate-800/80 text-sky-100 shadow-xl backdrop-blur-md",
      toggleColor: "data-[state=checked]:bg-sky-400",
      progressBox: "bg-slate-900/75 border-slate-800/80 shadow-xl backdrop-blur-md",
      progressTitle: "text-sky-400/90",
      progressBar: "from-sky-600 via-blue-500 to-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]",
      
      tabUnselected: "border-slate-800/40 bg-slate-950/70 text-slate-400 shadow-inner backdrop-blur-sm",
      tabActive: "bg-slate-900/90 border-sky-400 text-white shadow-lg backdrop-blur-md",
      tabPhaseText: "text-slate-500 group-data-[state=active]:text-sky-400 font-extrabold",
      tabMainText: "text-slate-300 group-data-[state=active]:text-white",
      
      tabMetricsBox: "bg-black/40 group-data-[state=active]:bg-sky-950 group-data-[state=active]:text-sky-400 group-data-[state=active]:border-sky-800",
      tabProgressTrack: "bg-black/40",
      tabProgressBar: "bg-gradient-to-r from-purple-500 to-sky-400",
      
      workspaceCard: "bg-slate-900/75 border-slate-800/80 shadow-xl backdrop-blur-xl",
      workspaceHeader: "text-sky-400 border-slate-800/40",
      taskItem: "bg-slate-950/50 border-slate-900/80 hover:border-sky-400/50 hover:bg-slate-950/85 hover:shadow-[0_0_15px_rgba(56,189,248,0.05)]",
      taskItemChecked: "bg-sky-400/[0.02] border-transparent opacity-40",
      taskText: "text-white",
      taskDesc: "text-slate-400",
      checkboxBorder: "border-slate-400 group-hover/item:border-sky-400 data-[state=checked]:bg-sky-400 data-[state=checked]:bg-sky-400",
      
      footerBox: "border-slate-800/80 bg-slate-900/75 shadow-xl backdrop-blur-md text-slate-300",
      footerScripture: "italic font-serif tracking-wide leading-relaxed text-slate-300",
      footerRef: "text-white",

      modalOverlay: "bg-black/75 backdrop-blur-sm",
      modalContent: "bg-slate-900 border border-slate-800 text-slate-100",
      modalCancelBtn: "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
    },
    Light: {
      bg: "bg-gradient-to-b from-sky-300 via-[#f8fafc] to-[#fae8ff] text-slate-800 selection:bg-blue-200",
      pageTitle: "text-slate-800 drop-shadow-sm",
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
      taskDesc: "text-slate-700 font-bold",
      checkboxBorder: "border-slate-400 group-hover/item:border-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:bg-blue-600",
      footerBox: "border-slate-300 shadow-inner bg-white/60 text-slate-600",
      footerScripture: "italic font-serif tracking-wide leading-relaxed text-slate-600",
      footerRef: "text-slate-500",

      modalOverlay: "bg-slate-900/40 backdrop-blur-sm",
      modalContent: "bg-white border border-slate-200 text-slate-900 shadow-2xl",
      modalCancelBtn: "bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200"
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
      phaseHeader: "text-[10px] tracking-[0.15em]",
      subTaskTitle: "text-[11px] font-semibold",
      subTaskBtn: "text-[9px] h-6 px-2"
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
      phaseHeader: "text-[11px] tracking-[0.18em]",
      subTaskTitle: "text-xs md:text-sm font-semibold",
      subTaskBtn: "text-[10px] h-7 px-2.5"
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
      phaseHeader: "text-sm font-black tracking-[0.2em]",
      subTaskTitle: "text-base md:text-lg font-bold leading-normal",
      subTaskBtn: "text-xs h-9 px-4 font-black"
    }
  }[fontSize];

  if (!mounted) return null;

  return (
    <div className={`min-h-screen transition-all duration-500 overflow-x-hidden ${themeStyles.bg} ${fontStyles.S}`}>
      
      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 space-y-5">
        
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 ${themeStyles.badge}`}>
             <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${themeStyles.badgeDot}`} />
             Slides Team Console
          </div>
        </div>

        <div className="space-y-4 text-center">
          <h1 className={`${fontStyles.pageTitle} font-black tracking-tighter transition-colors ${themeStyles.pageTitle}`}>
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
          <Button variant="outline" onClick={handleReset} className={`${fontStyles.btnText} h-9 px-4 font-black uppercase tracking-widest rounded-xl transition-all ${themeStyles.btnUnselected}`}>
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
                    fontSize === s ? themeStyles.btnActive : "bg-slate-950 text-slate-200 border-slate-800 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-2">Console Style:</span>
            <div className="flex gap-1.5 bg-black/20 p-1 rounded-lg border border-white/5">
              {(["Light", "Dark"] as const).map((t) => (
                <button 
                  key={t} 
                  onClick={() => handleThemeChange(t)} 
                  className={`px-4 h-8 flex items-center justify-center text-[10px] font-black rounded-md border transition-all uppercase tracking-wide ${
                    currentTheme === t ? themeStyles.btnActive : "bg-slate-950 text-slate-200 border-slate-800 hover:text-white"
                  }`}
                >
                  {t === "Dark" ? "Sky Blue" : "Classic Light"}
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
                     <span className="inline-block mb-2 group-data-[state=active]:w-auto">
                       <span className={`text-[10px] font-black uppercase tracking-widest block transition-all ${
                         currentTheme === "Dark"
                           ? "group-data-[state=active]:bg-slate-950/90 group-data-[state=active]:border group-data-[state=active]:border-slate-800 group-data-[state=active]:px-2.5 group-data-[state=active]:py-1 group-data-[state=active]:rounded-md group-data-[state=active]:shadow-md group-data-[state=active]:text-sky-400 text-slate-500"
                           : "text-slate-400 group-data-[state=active]:text-blue-600"
                       }`}>
                         {tab.phaseTitle}
                       </span>
                     </span>
                     
                     <div className="flex items-start gap-2 w-full mb-3">
                        <div className="mt-0.5 shrink-0 opacity-70 group-data-[state=active]:opacity-100">
                          {tab.icon}
                        </div>
                        <span className={`font-black leading-tight transition-colors ${themeStyles.tabMainText}`}>
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
                    
                    <div className={`flex items-center justify-between mb-1 border-b pb-3 ${themeStyles.workspaceHeader}`}>
                       <h3 className={`${fontStyles.cardHeader} font-black uppercase tracking-widest`}>{tab.label} Checklist</h3>
                       <div className="text-[10px] font-black tracking-wider uppercase opacity-80 bg-black/10 px-3 py-1 rounded-full">{progress.percentage}% Phase Progress</div>
                    </div>

                    {visibleItems.map((item) => {
                      const subProgress = getSubProgress(item);
                      const hasSubTasks = (item.subTasks && item.subTasks.length > 0) || (item.progressivePhases && item.progressivePhases.length > 0);
                      const isExpanded = expandedItems[item.id] || false;

                      return (
                        <div 
                          key={item.id}
                          className={`flex flex-col rounded-xl border overflow-hidden transition-all duration-300 ${
                            checkedItems[item.id] 
                              ? themeStyles.taskItemChecked 
                              : "bg-slate-950/50 border-slate-900/80"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 group/item">
                            
                            <label className="flex items-start gap-4 cursor-pointer select-none w-full sm:max-w-md">
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

                            <div className="flex-1 px-2 sm:px-6 flex items-center gap-3 w-full min-w-[120px]">
                              {hasSubTasks && isExpanded && (
                                <>
                                  <div className="h-1.5 bg-black/40 rounded-full w-full overflow-hidden p-[1px] border border-white/5">
                                    <div 
                                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
                                      style={{ width: `${subProgress.percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-mono font-black tracking-tight text-sky-400 shrink-0">
                                    {subProgress.completed}/{subProgress.total} Steps
                                  </span>
                                </>
                              )}
                            </div>

                            <div className="shrink-0 flex justify-end">
                              {hasSubTasks && (
                                <Button
                                  variant="ghost"
                                  onClick={(e) => toggleAccordion(item.id, e)}
                                  className={`h-8 px-3 rounded-lg border text-[11px] font-black uppercase tracking-wider transition-all ${
                                    isExpanded 
                                      ? "bg-sky-500/10 text-sky-400 border-sky-500/30" 
                                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                                  }`}
                                >
                                  {isExpanded ? (
                                    <>Hide Steps <ChevronUp className="h-3 w-3 ml-1.5 shrink-0" /></>
                                  ) : (
                                    <>Show Steps <ChevronDown className="h-3 w-3 ml-1.5 shrink-0" /></>
                                  )}
                                </Button>
                              )}
                            </div>

                          </div>

                          {/* EXPANDABLE MASTER WORKSPACE CONSOLE */}
                          {hasSubTasks && isExpanded && (
                            <div className="border-t border-slate-900 bg-black/30 px-4 md:px-6 py-4 space-y-4 transition-all animate-in slide-in-from-top-2 duration-300">
                              
                              {item.hasManualLink && (
                                <div className="flex justify-end pb-1 border-b border-slate-900/60">
                                  <Button
                                    variant="link"
                                    onClick={() => window.open(GLOBAL_LINKS.trainingManual, "_blank", "noopener,noreferrer")}
                                    className="h-auto p-0 text-[10px] font-black tracking-widest uppercase text-sky-400 hover:text-sky-300 flex items-center gap-1.5"
                                  >
                                    <ExternalLink className="h-3 w-3" /> Open Full Verse Tech Manual
                                  </Button>
                                </div>
                              )}

                              {/* CONDITIONAL NESTED ACCORDION MATRIX ENGINE */}
                              {item.progressivePhases ? (
                                item.progressivePhases.map((phase) => {
                                  const isPhaseOpen = expandedPhases[phase.phaseId] || false;
                                  return (
                                    <Card key={phase.phaseId} className="border border-slate-900/60 bg-slate-950/40 rounded-xl overflow-hidden shadow-md">
                                      <Button
                                        variant="ghost"
                                        onClick={(e) => setExpandedPhases(p => ({ ...p, [phase.phaseId]: !isPhaseOpen }))}
                                        className={`w-full justify-between h-11 px-4 text-xs font-black uppercase tracking-widest rounded-none border-b border-slate-950 transition-colors ${
                                          isPhaseOpen ? "bg-sky-500/5 text-sky-400" : "bg-slate-950 text-slate-400 hover:text-slate-100"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className={`w-1 h-3 rounded-full bg-sky-400 transition-transform ${isPhaseOpen ? "scale-y-120" : "scale-y-50"}`} />
                                          <span className={`${fontStyles.phaseHeader} font-black uppercase`}>
                                            {phase.phaseName}
                                          </span>
                                        </div>
                                        {isPhaseOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                      </Button>

                                      {isPhaseOpen && (
                                        <div className="p-3 bg-black/10 space-y-2.5 animate-in slide-in-from-top-1 duration-200">
                                          {phase.subTasks.map((sub) => (
                                            <div 
                                              key={sub.id} 
                                              className={`flex flex-col p-3 rounded-lg border transition-all ${
                                                checkedSubItems[sub.id]
                                                  ? "bg-slate-950/20 border-transparent opacity-45"
                                                  : "bg-slate-950/50 border-slate-900/60 hover:border-sky-500/20 hover:bg-slate-950/80"
                                              }`}
                                            >
                                              <label className={`flex items-start gap-3.5 font-semibold cursor-pointer select-none ${fontStyles.subTaskTitle} ${checkedSubItems[sub.id] ? "line-through text-slate-500" : "text-slate-200"}`}>
                                                <div className="pt-0.5 shrink-0">
                                                  <Checkbox
                                                    id={sub.id}
                                                    checked={checkedSubItems[sub.id] || false}
                                                    onCheckedChange={(c) => handleSubCheck(item.id, sub.id, c === true)}
                                                    className="w-4 h-4 rounded border-slate-500 data-[state=checked]:bg-sky-400 data-[state=checked]:bg-sky-400"
                                                  />
                                                </div>
                                                <div className="leading-relaxed flex-1">
                                                  {sub.title}
                                                </div>
                                              </label>

                                              {sub.customButton && (
                                                <div className="pl-7.5 mt-2.5">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleActionClick(sub.customButton, sub.id)}
                                                    className={`rounded uppercase tracking-wider border-sky-500/20 text-sky-400 bg-sky-500/[0.02] hover:bg-sky-500/10 hover:text-sky-300 transition-all ${fontStyles.subTaskBtn} ${
                                                      sub.customButton.actionType === "copy" && copiedStatus[sub.id]
                                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                                        : ""
                                                    }`}
                                                  >
                                                    {sub.customButton.actionType === "copy" ? (
                                                      copiedStatus[sub.id] ? (
                                                        <><Check className="h-3 w-3 mr-1.5 shrink-0" /> Copied!</>
                                                      ) : (
                                                        <><Copy className="h-3 w-3 mr-1.5 shrink-0" /> {sub.customButton.label}</>
                                                      )
                                                    ) : (
                                                      <><ExternalLink className="h-3 w-3 mr-1.5 shrink-0" /> {sub.customButton.label}</>
                                                    )}
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </Card>
                                  );
                                })
                              ) : (
                                // STANDARD FLAT STRIP RE-RENDER
                                <div className="space-y-2.5">
                                  <div className="text-[10px] font-black uppercase tracking-[0.15em] text-sky-400/80 mb-1">
                                    Step-by-Step Training Breakdown
                                  </div>
                                  {item.subTasks?.map((sub) => (
                                    <label 
                                      key={sub.id}
                                      className={`flex items-start gap-3.5 p-3 rounded-lg border font-semibold cursor-pointer select-none transition-all ${fontStyles.subTaskTitle} ${
                                        checkedSubItems[sub.id]
                                          ? "bg-slate-950/20 border-transparent opacity-40 line-through text-slate-500"
                                          : "bg-slate-950/50 border-slate-900/60 text-slate-200 hover:border-sky-500/30 hover:bg-slate-950/80"
                                      }`}
                                    >
                                      <div className="pt-0.5 shrink-0">
                                        <Checkbox
                                          id={sub.id}
                                          checked={checkedSubItems[sub.id] || false}
                                          onCheckedChange={(c) => handleSubCheck(item.id, sub.id, c === true)}
                                          className="w-4 h-4 rounded border-slate-500 data-[state=checked]:bg-sky-400 data-[state=checked]:bg-sky-400"
                                        />
                                      </div>
                                      <div className="leading-relaxed">
                                        {sub.title}
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              )}

                            </div>
                          )}

                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>

        <div className={`mt-12 text-center border-t transition-all duration-500 px-6 py-10 rounded-2xl ${themeStyles.footerBox}`}>
           <p className={`${fontStyles.footerScripture} font-serif tracking-wide leading-relaxed`}>
             &quot;And I have filled him with the Spirit of God, in wisdom, and in understanding, and in knowledge...&quot;
           </p>
           <p className={`${fontStyles.footerRef} font-black uppercase mt-4 tracking-[0.25em]`}>
             — Exodus 31:3 <span className="font-sans font-black lowercase opacity-80 ml-1">(Aholiab&apos;s calling)</span>
           </p>
        </div>

      </div>

      {/* ==========================================
          VERTICAL STACKED INTERSTITIAL MODAL 
         ========================================== */}
      {isGatekeeperOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${themeStyles.modalOverlay}`}>
          <Card className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${themeStyles.modalContent}`}>
            <div className="flex flex-col items-center text-center space-y-4">
              
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30 text-amber-500">
                <AlertTriangle className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black uppercase tracking-wider">Are you sure?</h4>
                <p className="text-xs opacity-70 font-medium leading-relaxed">
                  You only need this guide if today&apos;s sermon contains more than 75 total slide blocks from Gemini.
                </p>
              </div>

              <div className="flex flex-col gap-2 w-full pt-2">
                <Button 
                  onClick={executeGatekeeperLink}
                  className="w-full text-xs font-black uppercase tracking-wider h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 shadow-md shadow-cyan-900/20"
                >
                  Yes, Open Guide
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { setIsGatekeeperOpen(false); setPendingGatekeeperUrl(""); }}
                  className={`w-full text-xs font-bold uppercase tracking-wide h-10 rounded-xl ${themeStyles.modalCancelBtn}`}
                >
                  Cancel
                </Button>
              </div>

            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
