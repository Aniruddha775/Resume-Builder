# Phase 2: Resume Editor & PDF - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire up a Tiptap-based structured resume editor into the center panel, enable full CRUD for all resume sections (contact, summary, experience, education, skills), connect editor state to the Zustand `ResumeSlice`, render a live PDF preview in the right panel via `@react-pdf/renderer`, and provide one-click ATS-friendly PDF export. Pre-load a sample resume on first load so the PDF preview is immediately visible.

No JD parsing, no ATS scoring, no AI suggestions — those are Phases 3 and 4.

</domain>

<decisions>
## Implementation Decisions

### PDF Preview Placement
- **D-01:** PDF preview lives in the **right panel** (currently the Score placeholder). Phase 3 will decide how to share that panel between Score and Preview (tabs or toggle). Do not cramp the center editor panel with a split or tab.
- **D-02:** PDF preview panel heading changes from "ATS Score" to "Preview" for Phase 2. Phase 3 will revise when scoring is added.

### Tiptap Editor Model
- **D-03:** **Single Tiptap editor instance** with custom ProseMirror node extensions enforcing resume document structure. The Tiptap document is the source of truth for prose content.
- **D-04:** Top-level section nodes in the Tiptap schema: `SummarySection`, `ExperienceList` (contains `ExperienceEntry` nodes with bullet list nodes), `EducationList` (contains `EducationEntry` nodes), `SkillsSection` (contains `SkillGroup` nodes).
- **D-05:** **Contact fields and date fields are conventional form inputs outside Tiptap** — they are structured data, not prose. Contact info (name, email, phone, location, LinkedIn, website), experience dates (startDate, endDate, current), and education graduation date all use regular `<input>` fields wired directly to Zustand.
- **D-06:** Editor state flows one-directionally: Tiptap `onUpdate` → `editor.getJSON()` → parsed into Zustand `ResumeSlice`. Contact form fields update Zustand directly via `onChange`. (Implements EDIT-03.)
- **D-07:** `Experience.bullets` in the Zod schema are `string[]`. Tiptap bullet nodes serialize to plain strings on `getJSON()` — no rich text markup in bullet content. Phase 4 AI decorations will work within Tiptap without changing the serialized type.

### Section Management UX
- **D-08:** Each section has an **"Add Entry" button at the bottom** (experience: "Add Position", education: "Add Education", skills: "Add Skill Group").
- **D-09:** Each entry shows a **delete icon on hover** (trash icon, right-aligned). No confirmation dialog — delete is immediate (undo via browser history or autosave recovery).
- **D-10:** **No drag-to-reorder in Phase 2.** Entries maintain insertion order. Reordering is deferred.
- **D-11:** Skills section: each skill group has a category label input + comma-separated or tag-style skill items input. Claude's discretion on exact tag UX.

### PDF Template Style
- **D-12:** **Modern/clean template** — matches the app's Linear/Notion aesthetic. Inter font (or a close variable alternative available in @react-pdf/renderer), generous whitespace, minimal horizontal rules under section headings, no decorative elements.
- **D-13:** Single-column layout, all text selectable, standard section headings (Experience, Education, Skills), no images or icons in the PDF. ATS-friendly by design (per PDF-03).
- **D-14:** At least 1 polished template ready for export by end of Phase 2 (per PDF-04). Additional templates deferred to Phase 7.

### Autosave Feedback
- **D-15:** Brief **"Saved ✓"** indicator that appears in the app header for ~2 seconds when autosave fires (every 10 seconds per EDIT-07). Not a full toast — a subtle status chip. No persistent "last saved X ago" counter.

### First Load Content
- **D-16:** Editor pre-loads a **hardcoded sample resume** (realistic placeholder — e.g., "Alex Johnson, Software Engineer" with 2 experience entries, 1 education entry, skill groups). This makes the PDF preview immediately visible on first open, delivering the "wow moment" before the user types anything.
- **D-17:** Sample resume is stored in a static fixture file (e.g., `src/data/sample-resume.ts`). On first load (no data in localStorage), the store initializes from this fixture. If localStorage has data, load that instead.

### Claude's Discretion
- Exact Tiptap node schema internals (marks, attrs, serialization details)
- Tag vs comma-separated UX for skill items
- PDF template typography scale and spacing values
- Exact pixel dimensions and margins in the PDF layout
- Contact section layout within Tiptap (whether it lives inside or outside the editor)
- `ResumeSlice` action additions needed for section CRUD (beyond what Phase 1 defined)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project design
- `DESIGN.md` — Full design document: data model, ATS algorithm, wireframe, PDF requirements
- `DESIGN.md` §Core UX Flow — Three-panel layout wireframe showing panel roles
- `DESIGN.md` §PDF Stack — ATS-friendly PDF requirements and rendering approach

### Requirements
- `.planning/REQUIREMENTS.md` §Editor (EDIT) — EDIT-01 through EDIT-07 acceptance criteria
- `.planning/REQUIREMENTS.md` §PDF (PDF) — PDF-01 through PDF-05 acceptance criteria
- `.planning/PROJECT.md` §Constraints — ATS honesty, no paywall on PDF export, accessibility

### Tech stack
- `CLAUDE.md` §Technology Stack — Full version-pinned dependency list, Tiptap 3 and @react-pdf/renderer specifics
- `CLAUDE.md` §Key Configuration Notes — Tiptap 3: `immediatelyRender: false`, `shouldRerenderOnTransaction: true`, SSR hydration requirements
- `CLAUDE.md` §Key Configuration Notes — `BubbleMenu`/`FloatingMenu` import from `@tiptap/react/menus` in v3

### Existing Phase 1 code (on branch `feature/phase-01-foundation-layout`)
- `src/types/resume.ts` — `Resume`, `Experience`, `Education`, `Skills` Zod schemas and inferred types
- `src/lib/store/slices/resume-slice.ts` — Current `ResumeSlice` interface (needs CRUD action additions)
- `src/lib/store/index.ts` — `AppState` combining all slices
- `src/lib/storage/adapter.ts` — `StorageAdapter` interface
- `src/components/layout/desktop-layout.tsx` — 3-panel resizable layout; right panel is the PDF preview target
- `src/components/layout/mobile-layout.tsx` — Tabbed mobile layout; Preview tab to be added

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ResumeSlice` (resume-slice.ts): `resume | null`, `setResume()`, `updateBullet()`, `clearResume()` — needs extension with section CRUD actions (addExperience, removeExperience, addEducation, removeEducation, addSkillGroup, removeSkillGroup, updateContactInfo, updateSummary)
- `StorageAdapter` / `LocalStorageAdapter`: already wired, autosave can call `adapter.saveResume()` on a 10s interval
- `DesktopLayout`: right `ResizablePanel` (defaultSize=27) currently renders a Score placeholder — replace with `<PdfPreviewPanel />`
- `MobileLayout`: currently 3 tabs (JD, Editor, Score) — add Preview tab or repurpose Score tab for Phase 2
- `shadcn/ui` components available: resizable, tabs, separator, tooltip, button — use freely
- `lucide-react` icons available

### Established Patterns
- Zustand slices with immer middleware for nested state updates — follow existing pattern for new CRUD actions
- Zod schema as source of truth; TypeScript types inferred via `z.infer<>` — do not define manual interfaces
- `use-hydration.ts` hook for SSR-safe localStorage reads — use when initializing sample resume
- `use-media-query.ts` for responsive breakpoint detection (already used in EditorLayout)
- Light mode only, neutral gray chrome, color for functional indicators (no dark mode)

### Integration Points
- Tiptap editor mounts inside the center `ResizablePanel` in `DesktopLayout` and the Editor tab in `MobileLayout`
- PDF preview mounts inside the right `ResizablePanel` in `DesktopLayout`; mobile gets a Preview tab
- `ResumeSlice.resume` is the single source of truth — Tiptap and PDF preview both read from/write to it
- `StorageAdapter` already handles `saveResume()` / `getResume()` — autosave just needs a `useEffect` interval

</code_context>

<specifics>
## Specific Ideas

- Sample resume on first load: "Alex Johnson, Software Engineer" (or similar) with realistic content — makes the PDF preview panel immediately demonstrate value
- PDF template should feel like it came from the same design system as the app (Inter-based, clean, contemporary) — not a traditional Word-style resume
- Autosave indicator: subtle 2-second "Saved ✓" in header, not a full toast notification
- Phase 4 AI decorations will land on Tiptap bullet nodes — serialization to `string[]` must stay clean so Phase 4 can add marks without changing the Zod type

</specifics>

<deferred>
## Deferred Ideas

- Drag-to-reorder experience/education entries — Phase 2 uses insertion order only
- Additional PDF templates — Phase 7
- Dark mode — future polish phase (deferred from Phase 1)
- Keyboard shortcuts for section navigation — Phase 4 (accessibility)
- AI-assisted initial resume generation — not in Milestone 1 roadmap; valid future feature

</deferred>

---

*Phase: 02-resume-editor-pdf*
*Context gathered: 2026-04-22*
