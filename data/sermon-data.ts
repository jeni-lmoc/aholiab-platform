// ==========================================
// CENTRAL ASSETS & SOURCE OF TRUTH MANAGER
// ==========================================
export const GLOBAL_LINKS = {
  trainingManual: "https://docs.google.com/document/d/1_Bt7oG56msLcRYvy2UqFG4DY8FkXiRbnLQuKi6SQb2U/edit?usp=drive_link",
  managingSlideLimits: "https://docs.google.com/document/d/1_Bt7oG56msLcRYvy2UqFG4DY8FkXiRbnLQuKi6SQb2U/edit?tab=t.ymklsy324605",
  weeklySermonTracker: "https://lmoc.slack.com/lists/T09C5S0VDK8/F0AT40A4ZDE",
  alternateExportOptions: "https://docs.google.com/document/d/1MjkCwoF0lJf-5jIlyzsTo7WIQrcc_gJlbFTtCoHSffE/edit?tab=t.f1e89nk8dsb8",
  adobeMerge: "https://www.adobe.com/acrobat/online/merge-pdf.html",
  qrGenerator: "https://login.qr-code-generator.com/"
};

export const MASTER_AI_PROMPT = `Clean and format the attached document into text format for input into Gamma.

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

export const ADDITIONAL_INSTRUCTIONS_PROMPT = `DO NOT Summarize, rephrase, or add sub-titles. DO NOT omit any input text or make up new content. All card titles must use heading level 1 (H1), be center-aligned, use the same theme color consistently, and remain consistent across all slides. All body text must use large text size, be center-aligned and remain consistent across all slides. DO NOT use Arrows, Stats, Circle stats, Pyramid, Funnel, Cycle, Circle, Ring, Semi-circle, and Flower to illustrate card content. Sparingly use Images or icons with text, Timeline, Bullets, Bar stats, Steps, and Staircase. No additional comments. Just the verse or the quote on each page. Nothing extra, just the text as provided.`;

export const AFTERGLOW_STUDY_PROMPT = `Create a discussion group study that includes one deep dive thought provoking question per slide. Make the questions conversational. Do not use obvious or surface level questions. Create one title slide, 3 slides with a discussion question at the bottom of each slide, and 1 final slide with a reflection question and a call to action. DO NOT use Arrows, Stats, Circle stats, Pyramid, Funnel, Cycle, Circle, Ring, Semi-circle, and Flower to illustrate card content. Sparingly use Images or icons with text, Timeline, Bullets, Bar stats, Steps, and Staircase.`;

export const EXTENDED_6DAY_PROMPT = `Create a 6 Day prayer plan and daily journaling prompts, prayer prompts and a deep dive discussion question. Do not use obvious or surface level questions. DO NOT use Arrows, Stats, Circle stats, Pyramid, Funnel, Cycle, Circle, Ring, Semi-circle, and Flower to illustrate card content. Sparingly use Images or icons with text, Timeline, Bullets, Bar stats, Steps, and Staircase. Put 1 Call to action, 1 journaling prompt, 1 deep dive question and 1 prayer on each page.`;

// ==========================================
// TYPE DEFINITIONS & DATA ARCHITECTURE
// ==========================================
export interface SubTask {
  id: string;
  title: string;
  customButton?: {
    label: string;
    actionType: "copy" | "link" | "gatekeeper-link" | "gatekeeper-export-link";
    payload: string;
  };
  nestedSubTasks?: string[];
  inlineButtonUnderNested?: {
    label: string;
    actionType: "copy" | "link" | "gatekeeper-link" | "gatekeeper-export-link";
    payload: string;
  };
}

export interface ProgressivePhase {
  phaseId: string;
  phaseName: string;
  subTasks: SubTask[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  isAfterglowRelated?: boolean;
  hasDynamicEvangelismMapping?: boolean;
  hasManualLink?: boolean;
  progressivePhases?: ProgressivePhase[];
  subTasks?: SubTask[]; 
}

export interface WorkflowTab {
  id: string;
  phaseTitle: string;
  label: string;
  sublabel: string;
  iconName: "Calendar" | "Sun" | "BookOpen" | "Globe";
  items: ChecklistItem[];
}

export const WORKFLOW_TABS: WorkflowTab[] = [
  {
    id: "backdrops-theme",
    phaseTitle: "Midweek Prep",
    label: "Backdrops & Theme",
    sublabel: "Due Wednesday",
    iconName: "Calendar",
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
    iconName: "Sun",
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
              { 
                id: "vt-p3-s1", 
                title: "Navigate to Page setup... inside Gamma and configure your core visual formatting layout settings:",
                nestedSubTasks: [
                  "Change Base font size to L (Large).",
                  "Turn ON Card backdrops checkbox parameter toggle.",
                  "Add the Theme logo to the lower right corner, slider set to S (Small).",
                  "At the top visibility filter, select Hide on first and last card."
                ]
              },
              { 
                id: "vt-p3-s2", 
                title: "Import the standard church media assets from your shared local directory folders:",
                nestedSubTasks: [
                  "Open the Current Sabbath folder on your active machine.",
                  "Launch the Social Media slide deck project inside Gamma.",
                  "Copy the second slide in that deck (the custom Social Media card).",
                  "Paste it cleanly at the very end of your active sermon deck filmstrip timeline."
                ]
              },
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
    iconName: "BookOpen",
    items: [
      { 
        id: "afterglow-study", 
        title: "Afterglow Study Guide", 
        description: "Create the Afterglow study materials and discussion slide deck.", 
        isAfterglowRelated: true,
        progressivePhases: [
          {
            phaseId: "ag-phase-1",
            phaseName: "Phase 1: Intake & Gamma Setup",
            subTasks: [
              { id: "ag-p1-s1", title: "Locate the Pastor's master Word document (downloaded during Verse Tech Phase 1) or copy the cleaned text outline straight from your Gemini container." },
              { id: "ag-p1-s2", title: "Open Gamma, ensure you are in the Pastor's workspace (Ivor Myers' workspace), click '+ Create New AI', and select 'Paste in Text'." },
              { id: "ag-p1-s3", title: "Paste your sermon content into the text window. Set the top creation type to Presentation, lock the formatting dropdown to Traditional, and under the destination objective question, check 'Summarize long text or document'." }
            ]
          },
          {
            phaseId: "ag-phase-2",
            phaseName: "Phase 2: Configuration & Generation",
            subTasks: [
              { 
                id: "ag-p2-s1", 
                title: "Click 'Continue to prompt editor' and match the generation options to these exact settings:",
                nestedSubTasks: [
                  "Verify Text Content is set to Condense",
                  "Verify Amount of text is set to Minimal",
                  "Verify Image Source is set to Don't Add Images",
                  "Verify Content Format is set to Freeform",
                  "Verify # of cards is set to 5 cards (Gamma will auto-generate a title card)."
                ]
              },
              { 
                id: "ag-p2-s2", 
                title: "Navigate to the Additional Instructions text box on the far right and paste our official Afterglow prompt.",
                customButton: { label: "📋 Copy Afterglow Prompt", actionType: "copy", payload: AFTERGLOW_STUDY_PROMPT }
              },
              { id: "ag-p2-s3", title: "Click Generate to cast your foundational discussion layout." }
            ]
          },
          {
            phaseId: "ag-phase-3",
            phaseName: "Phase 3: Visual Polish & Title Work",
            subTasks: [
              { id: "ag-p3-s1", title: "Format the Cover Slide layout: Add 'Afterglow:' as a separate H2 header line right before the sermon title, scale the main title to H1, delete the speaker's name, and scrub any remaining extra text." },
              { id: "ag-p3-s2", title: "Look at the upper-left file name header beside the Gamma icon. Click on the title string and manually type 'Afterglow: ' directly before the sermon title to ensure the global file name matches." },
              { id: "ag-p3-s3", title: "Select an accent image from the theme that aligns with the weekly sermon theme or title and drop it onto this cover slide as your study graphic." },
              { id: "ag-p3-s4", title: "Open Page Setup (3 dots icon) and configure global styles: Change Base font size to L (Large), turn ON card backdrops, go to headers & footers, add the Theme logo to the lower right corner at S (Small) size, and lock it to 'Hide on first card'." }
            ]
          },
          {
            phaseId: "ag-phase-4",
            phaseName: "Phase 4: Content Cleanup & Sermon Tracker Logging",
            subTasks: [
              { id: "ag-p4-s1", title: "Manually audit the content cards: Ensure all Bible book names are completely uniform (all full names or all 3-character shorts), and replace all long dashes (—) with proper punctuations." },
              { 
                id: "ag-p4-s2", 
                title: "Import the standard church media assets from your shared local directory folders:",
                nestedSubTasks: [
                  "Open the Current Sabbath folder on your active machine.",
                  "Launch the Social Media slide deck project inside Gamma.",
                  "Copy the third slide in that deck (the custom Phototheology card).",
                  "Paste it cleanly as the absolute final card in this slide deck."
                ]
              },
              { 
                id: "ag-p4-s3", 
                title: "Click 'Share' on the top menu bar, select 'Export' on the left menu, and click 'Export to PDF'. Open the file to verify text sizing. (If text shrinkage occurred, click the troubleshooting button below to open the Google Slides workaround).",
                customButton: { label: "⚠️ Alternate Export Options Guide", actionType: "gatekeeper-export-link", payload: GLOBAL_LINKS.alternateExportOptions }
              },
              { id: "ag-p4-s4", title: "Re-open that same 'Share' menu and copy your secure view-only link to your clipboard so it is the most recent item copied." },
              { 
                id: "ag-p4-s5", 
                title: "Complete your sermon tracker housekeeping log to finish the weekly loop:",
                nestedSubTasks: [
                  "Paste your view-only Gamma Link into the proper row track.",
                  "Upload your downloaded Study Guide PDF file directly into the calendar AGS PDF column.",
                  "Click the checkbox to mark the AGS Ready milestone as complete."
                ],
                inlineButtonUnderNested: { label: "💬 Open Weekly Sermon Tracker", actionType: "link", payload: GLOBAL_LINKS.weeklySermonTracker }
              }
            ]
          }
        ]
      },
      { 
        id: "extended-study", 
        title: "6-Day Extended Study Guide", 
        description: "Create the extended daily prayer tracking and devotional journaling materials.",
        progressivePhases: [
          {
            phaseId: "ex-phase-1",
            phaseName: "Phase 1: Intake & Gamma Setup",
            subTasks: [
              { id: "ex-p1-s1", title: "Locate the Pastor's master Word document or copy the cleaned text outline straight from your Gemini container." },
              { id: "ex-p1-s2", title: "Open Gamma, ensure you are in the Pastor's workspace, click '+ Create New AI', and select 'Paste in Text'." },
              { id: "ex-p1-s3", title: "Paste your sermon content into the text window. Set the top creation type to Presentation, lock the formatting dropdown to Traditional, and under the destination objective question, check 'Summarize long text or document'." }
            ]
          },
          {
            phaseId: "ex-phase-2",
            phaseName: "Phase 2: Configuration & Generation",
            subTasks: [
              { 
                id: "ex-p2-s1", 
                title: "Click 'Continue to prompt editor' and match the generation options to these exact settings:",
                nestedSubTasks: [
                  "Verify Text Content is set to Condense",
                  "Verify Amount of text is set to Concise",
                  "Verify Image Source is set to Don't Add Images",
                  "Verify Content Format is set to Freeform",
                  "Verify # of cards is set to 7 cards total."
                ]
              },
              { 
                id: "ex-p2-s2", 
                title: "Navigate to the Additional Instructions text box on the far right and paste our official 6-Day Extended prompt.",
                customButton: { label: "📋 Copy 6-Day Extended Prompt", actionType: "copy", payload: EXTENDED_6DAY_PROMPT }
              },
              { id: "ex-p2-s3", title: "Click Generate." }
            ]
          },
          {
            phaseId: "ex-phase-3",
            phaseName: "Phase 3: Visual Polish & Title Work",
            subTasks: [
              { id: "ex-p3-s1", title: "Format the Cover Slide layout: Add '6-Day Extended Study:' as a separate H2 header line right before the sermon title, scale the main title to H1, delete the speaker's name, and scrub any remaining extra text." },
              { id: "ex-p3-s2", title: "Look at the upper-left file name header beside the Gamma icon. Click on the title string and manually type '6-Day Extended Study: ' directly before the sermon title to ensure the global file name matches." },
              { id: "ex-p3-s3", title: "Select an accent image from the theme that aligns with the weekly sermon theme or title and drop it onto this cover slide as your study graphic." },
              { id: "ex-p3-s4", title: "Open Page Setup (3 dots icon) and configure global styles: Change Base font size to L (Large), turn ON card backdrops, go to headers & footers, add the Theme logo to the lower right corner at S (Small) size, and lock it to 'Hide on first card'." }
            ]
          },
          {
            phaseId: "ex-phase-4",
            phaseName: "Phase 4: Content Cleanup & Sermon Tracker Logging",
            subTasks: [
              { id: "ex-p4-s1", title: "Manually audit the content cards: Ensure all Bible book names are completely uniform, and replace all long dashes (—) with proper punctuations." },
              { 
                id: "ex-p4-s2", 
                title: "Import the standard church media assets from your shared local directory folders:",
                nestedSubTasks: [
                  "Open the Current Sabbath folder on your active machine.",
                  "Launch the Social Media slide deck project inside Gamma.",
                  "Copy the third slide in that deck (the custom Phototheology card).",
                  "Paste it cleanly as the absolute final card in this slide deck."
                ]
              },
              { 
                id: "ex-p4-s3", 
                title: "Click 'Share' on the top menu bar, select 'Export' on the left menu, and click 'Export to PDF'. Open the file to verify text sizing. (If text shrinkage occurred, click the troubleshooting button below to open the Google Slides workaround).",
                customButton: { label: "⚠️ Alternate Export Options Guide", actionType: "gatekeeper-export-link", payload: GLOBAL_LINKS.alternateExportOptions }
              },
              { id: "ex-p4-s4", title: "Re-open that same 'Share' menu and copy your secure view-only link to your clipboard so it is the most recent item copied." },
              { 
                id: "ex-p4-s5", 
                title: "Complete your sermon tracker housekeeping log to finish the weekly loop:",
                nestedSubTasks: [
                  "Paste your view-only Gamma Link into the proper row track.",
                  "Upload your downloaded Study Guide PDF file directly into the ExS PDF column.",
                  "Click the checkbox to mark the ExS Ready milestone as complete."
                ],
                inlineButtonUnderNested: { label: "💬 Open Weekly Sermon Tracker", actionType: "link", payload: GLOBAL_LINKS.weeklySermonTracker }
              }
            ]
          }
        ]
      },
      { 
        id: "qr-code", 
        title: "QR Code Update", 
        description: "Compile and publish the master QR code asset payload for attendee distribution.",
        progressivePhases: [
          {
            phaseId: "qr-phase-1",
            phaseName: "Phase 1: PDF Collection & Coordination",
            subTasks: [
              { 
                id: "qr-p1-s1", 
                title: "Open the Weekly Sermon Tracker in Slack to check your file payloads. If any PDFs are missing from the row, do not enter Gamma yourself—immediately alert your POC in the huddle so the creator can log it. Download the assets once present:",
                nestedSubTasks: [
                  "Verify and download the complete Sermon Slides PDF from the tracker list.",
                  "Verify and download the finished Afterglow Study Guide PDF from the tracker list.",
                  "Verify and download the finished 6-Day Extended Study Guide PDF from the tracker list."
                ]
              }
            ]
          },
          {
            phaseId: "qr-phase-2",
            phaseName: "Phase 2: Adobe Merge & Compression",
            subTasks: [
              { 
                id: "qr-p2-s1", 
                title: "Launch the file compilation interface and process the combined document track:",
                nestedSubTasks: [
                  "Drag and drop all three downloaded asset PDFs directly into the browser workspace panel.",
                  "Double-check and arrange the file index priority sequence: 1. Sermon Slides, 2. Afterglow Study, 3. 6-Day Extended Study.",
                  "Select 'Combine & Compress' from the tool settings and lock the parameter to 'Most Compression' to stay under 20MB.",
                  "Verify the file order layout looks complete in the live asset review preview, then click Download."
                ],
                inlineButtonUnderNested: { label: "📑 Open Adobe Merge Hub", actionType: "link", payload: GLOBAL_LINKS.adobeMerge }
              }
            ]
          },
          {
            phaseId: "qr-phase-3",
            phaseName: "Phase 3: QR Portal Configuration & Verification",
            subTasks: [
              { id: "qr-p3-s1", title: "Log in to the QR Code Generator portal and click on the very top QR code entry item listed in your account workspace (the upcoming sermon slot)." },
              { id: "qr-p3-s2", title: "Update the Text Title Field: Delete the generic label 'Sermon Slides', type in the actual active sermon title name, and make sure to preserve the date stamp already listed at the end." },
              { 
                id: "qr-p3-s3", 
                title: "Upload the Master Asset payload and bind your view assets to the active portal profile:",
                nestedSubTasks: [
                  "Click Details -> Click Edit -> Locate the PDF Upload category zone.",
                  "Click the blue Change button and drag-and-drop your compressed, merged PDF file into the upload window.",
                  "Note: Leave the Website link field and all other pre-configured profile fields completely unchanged.",
                  "Click Save Changes, wait for the processing confirmation banner, click Back, and review the live preview slot.",
                  "Confirm the thumbnail panel accurately displays page one of the sermon slides instead of 'Slides available after sermon'."
                ],
                inlineButtonUnderNested: { label: "🌐 Open QR Generator Portal", actionType: "link", payload: GLOBAL_LINKS.qrGenerator }
              }
            ]
          }
        ]
      },
      { 
        id: "website", 
        title: "Sites", 
        description: "Upload the sermon video link, the main slide deck, the study guides, and the combined PDF to the site.",
        hasDynamicEvangelismMapping: true 
      },
    ],
  },
  {
    id: "post-service",
    phaseTitle: "Post-Service",
    label: "Site Update",
    sublabel: "Due ASAP Post-Service",
    iconName: "Globe",
    items: [
      { 
        id: "youtube-swap", 
        title: "Site Update", 
        description: "Replace the live stream archive container with the finalized, edited sermon-only YouTube video link (typically 1-2 days post-service).",
        subTasks: [
          { id: "site-step-1", title: "Copy the new sermon-only YouTube link from your video manager channel." },
          { id: "site-step-2", title: "Open the sermon site editor page and click the three dots icon next to the video container." },
          { id: "site-step-3", title: "Delete the old livestream archive link and paste the new sermon link into the space." },
          { id: "site-step-4", title: "CRITICAL: Click the check mark icon next to the new link input container to save the Swap configuration edits." },
          { id: "site-step-5", title: "Click the Publish button in the upper right corner to push the updated page live." },
          { id: "site-step-6", title: "Open a live public sermon site incognito tab and verify the new video plays flawlessly." }
        ]
      },
    ],
  },
];

export const getDynamicWebsitePhases = (isEvangelismSabbath: boolean): ProgressivePhase[] => {
  return [
    {
      phaseId: "site-phase-1",
      phaseName: "Phase 1: Environment & Website Setup",
      subTasks: [
        {
          id: "site-p1-s1",
          title: "Open Gamma. On the left-hand navigation bar, click on Sites. Locate the project card named \"TEMPLATE Weekly Sermon Site\":",
          nestedSubTasks: [
            "Click on the three dots icon (...) positioned beside the project name box.",
            "Click Duplicate from the menu options.",
            "STOP & CHECK: Look at the upper-left title header. Confirm the text reads \"Copy of TEMPLATE Weekly Sermon Site\" before making any edits to ensure you are safe."
          ]
        },
        {
          id: "site-p1-s2",
          title: "Change the custom web address to match the sermon title:",
          nestedSubTasks: [
            "Look at the left sidebar menu under the Pages listing.",
            "Hover over Sermon Page Template, click on the three dots (...), and select Page settings and URL path...",
            "Click on Publishing & domains inside the menu window.",
            "Click the three dots (...) to the right of the domain block, and rename it to a clean, short version of today's sermon title.",
            "Click Save, then click the X icon in the upper right to close the window."
          ]
        },
        {
          id: "site-p1-s3",
          title: "Select the matching custom graphic theme for today's service:",
          nestedSubTasks: [
            "Click Theme in the top application menu bar.",
            "From the custom themes panel directory, click on the theme that matches today's date or sermon look.",
            "Click the close button to exit the theme panel."
          ]
        }
      ]
    },
    {
      phaseId: "site-phase-2",
      phaseName: "Phase 2: Page Titles, URL Paths, & Navigation Links",
      subTasks: [
        {
          id: "site-p2-s1",
          title: "Update Page Titles and URL Paths:",
          nestedSubTasks: [
            "From the pages on the left side, hover to the right of Sermon Page Template and click on the 3 dots.",
            "Select Page settings and URL path...",
            "Change the Title to a short version of the sermon title.",
            "Ensure that the URL path is exactly the word \"sermon\".",
            "Click General (inside that same pop-up window) and change the Gamma title to the name of the sermon."
          ]
        },
        ...(isEvangelismSabbath 
          ? [
              {
                id: "site-p2-s2-evangelism",
                title: "Archive Afterglow Page (Evangelism Sabbath Mode Triggered):",
                nestedSubTasks: [
                  "Click on the 3 dots next to Afterglow on the left menu.",
                  "Choose Archive this page and click Yes, Archive to confirm.",
                  "Click on the word Archived at the bottom of the menu (may take a minute to show up).",
                  "Click on the 3 dots and select Permanently Delete (confirm by clicking Permanently Delete again).",
                  "After updating the remaining page titles, click on the X in the upper right-hand corner to close the window."
                ]
              },
              {
                id: "site-p2-s3-evangelism",
                title: "Remove Afterglow Navigation Link (Evangelism Sabbath Mode Triggered):",
                nestedSubTasks: [
                  "Click on the Afterglow link on the top bar.",
                  "Click on Delete at the bottom of the dropdown window.",
                  "Click on the remaining navigation links, clear the URL path text, and select the correct matching pages from the drop-down to update them."
                ]
              }
            ]
          : [
              {
                id: "site-p2-s2-standard",
                title: "Update Dates on the Resource Pages:",
                nestedSubTasks: [
                  "Select the Slides page, hover to the right, click the 3 dots, select page settings, and change ONLY the date to the current sermon date.",
                  "Select the Afterglow page, hover to the right, click the 3 dots, select page settings, and change ONLY the date to the current sermon date.",
                  "Select the Extended Study page, hover to the right, click the 3 dots, select page settings, and change ONLY the date to the current sermon date.",
                  "After updating all of the page titles, click on the X in the upper right-hand corner to close the window."
                ]
              },
              {
                id: "site-p2-s3-standard",
                title: "Update Navigation Links:",
                nestedSubTasks: [
                  "Click on a navigation link (the page names on the top bar).",
                  "Click in the URL path, select and delete the text. You'll be able to see the drop-down of recent pages.",
                  "Select the correct page to match the text in the Navigation link.",
                  "Repeat to update all four links."
                ]
              }
            ]
        )
      ]
    },
    {
      phaseId: "site-phase-3",
      phaseName: "Phase 3: Update Sermon Page & Paste Content",
      subTasks: [
        {
          id: "site-p3-s1",
          title: "Update Sermon Page Video and Details:",
          nestedSubTasks: [
            "Go to YouTube and copy the link for the current Sabbath worship service.",
            "Click on your main sermon page on the left.",
            "Update the Sermon Title.",
            "If needed, update the speaker name.",
            "Update the date.",
            "Hover the mouse beside the upper left side of the picture of the video until the 3 dots display, and click them.",
            "Click in the link information box, delete the current link information, and replace it with the link for this week's worship service.",
            "CRITICAL: Click the checkmark or it won't save! Ensure that the proper video card loads."
          ]
        },
        {
          id: "site-p3-s2",
          title: "Paste Media Content (Pasting Window Protocol):",
          nestedSubTasks: [
            "Coordinate in your Zoom/Slack Huddle to ensure you are the only person pasting slides right now to prevent file corruption.",
            "Have the person who created the sermon slides copy their cards with Ctrl+A and Ctrl+C, open this master site copy, and paste them into the Slides page with Ctrl+V. Declare when you are clear.",
            "Have the study guide creators follow the same one-at-a-time rule to copy and paste their cards into the study guide pages sections.",
            "Note: You may need to turn off Page View in the upper left-hand corner, between the Gamma icon and the website name, so you can see film strip view."
          ]
        },
        {
          id: "site-p3-s3",
          title: "Add QR Code Alternative Button:",
          nestedSubTasks: [
            "Note: This step can only be performed after the QR code process is complete. If you do not have the master compressed PDF file, immediately ask your point of contact in the huddle to get it.",
            "Navigate to the main Sermon page.",
            "Click on the temporary placeholder button block located directly above the Sermon Name and delete it.",
            "Click or add a fresh blank line directly above the Sermon Name text.",
            "On the right-side menu bar, locate the icon that looks like a webpage (labeled “Embed apps & webpages”) and click it.",
            "Click on File upload from the menu options.",
            "Upload the same combined and compressed PDF file that was created during the QR code process.",
            "Once it finishes processing, click the X to close the Media panel.",
            "In the pop-up box beneath the uploaded file, click the dropdown arrow next to Preview and select Button.",
            "Center the button block. (Optional: You can adjust the button's style and appearance to your preference.)",
            "Click directly inside the button face and change the text to exactly: “Click here to download a PDF of this week's sermon resources.”"
          ]
        }
      ]
    },
    {
      phaseId: "site-phase-4",
      phaseName: "Phase 4: Site Publication & Sermon Tracker Logging",
      subTasks: [
        {
          id: "site-p4-s1",
          title: "Publish Weekly Site:",
          nestedSubTasks: [
            "At the top right corner of your weekly sermon site, click Publish (make sure you are standing on the main SERMON page while clicking this). This will make the site live and ready to be linked to the Master After Live website.",
            "A pop-up that says View site will display. Click on the link. (It will disappear in about 3 seconds—if you miss it, just click publish again and click the link).",
            "Review the opened tab to confirm the correct Sermon page displays properly."
          ]
        },
        {
          id: "site-p4-s2",
          title: "Sermon Tracker Housekeeping:",
          nestedSubTasks: [
            "Click Share on the top menu bar of your published Gamma site.",
            "Select Copy link from the sharing settings window panel.",
            "Open the Weekly Sermon Tracker in Slack, locate today's active row track list, and paste your copied view-only Gamma Site URL directly into the proper column track cell.",
            "Click the checkbox to mark the Website Live milestone as complete.",
            "Note: Keep this link on your clipboard! You will use it to link the title in Phase 5 below."
          ],
          inlineButtonUnderNested: { label: "💬 Open Weekly Sermon Tracker", actionType: "link", payload: GLOBAL_LINKS.weeklySermonTracker }
        }
      ]
    },
    {
      phaseId: "site-phase-5",
      phaseName: "Phase 5: Update the After Live! Master Site",
      subTasks: [
        {
          id: "site-p5-s1",
          title: "Open the After Live Master Site:",
          nestedSubTasks: [
            "Go into Gamma, and on the left sidebar navigation layout panel, click Sites.",
            "Locate the master website named \"After Live Slide Studies and Sermons Oh My!\" (Black and gold card block).",
            "Click it to open the site in edit workspace mode."
          ]
        },
        {
          id: "site-p5-s2",
          title: "Add the New Sermon to the Table of Contents:",
          nestedSubTasks: [
            "Scroll down to the Table of Contents section on the page.",
            "Add a clean new text line directly above the last sermon entry (newest sermons are always listed first).",
            "Type out the new service entry using this exact format: Sermon Name - MM.DD.YY (Month.Day.Year).",
            "Change the font color of the text you just typed to match the document theme color (Gold)."
          ]
        },
        {
          id: "site-p5-s3",
          title: "Link the Sermon Title & Execute Safety Check:",
          nestedSubTasks: [
            "Highlight the sermon title text line you just typed out.",
            "Click the Add Link option from the formatting toolbar.",
            "Paste your new weekly sermon site URL into the destination box link input slot.",
            "Note: If the link is no longer on your clipboard, open a new tab in Gamma -> Go to Sites -> Click your new weekly sermon site -> Click the three dots at the bottom -> click View Live Site, and copy the address.",
            "Click Publish at the top right header menu of the master After Live website to push your changes live to the public directory domain.",
            "CRITICAL AUDIT: Open an incognito browser pane, click through the new Table of Contents link, and verify it goes directly to the landing page flawlessly. IF it shows a pop-up saying 'You are now leaving Gamma', the hyperlink formatting is broken—STOP and contact your point of contact immediately to resolve it!"
          ]
        }
      ]
    }
  ];
};
