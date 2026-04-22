# Phase 2: Resume Editor & PDF - Research

**Researched:** 2026-04-22
**Domain:** Structured rich-text editing (Tiptap 3) + live PDF preview/export (@react-pdf/renderer 4) in Next.js 16 App Router
**Confidence:** HIGH

## Summary

Phase 2 wires two well-understood libraries into the Phase 1 scaffold: Tiptap v3.22.4 for the structured resume editor in the center panel, and @react-pdf/renderer v4.5.1 for the live preview and export in the right panel. Both are installed from scratch — Phase 1 did not install them. Both support React 19 and Next.js 16 cleanly.

The three mechanical challenges that will shape the plan are: (1) keeping Tiptap SSR-safe in the App Router with `immediatelyRender: false` and `'use client'`, (2) rendering PDFs through the `usePDF` hook (or `pdf().toBlob()` imperatively) with an 800ms debounce so the editor stays responsive, and (3) registering the Inter font with react-pdf as TTF files from `/public` — react-pdf cannot use `next/font/google` or CSS variables. Everything else (structured sections, autosave, CRUD, sample resume) is application-level code on top of Phase 1's Zustand slice.

Tiptap's "single editor, custom node schema" decision (D-03, D-04) is the right call architecturally, but it has a sharp edge: the schema has to be drafted carefully so that Phase 4 AI decorations slot in without breaking `getJSON()` serialization to `string[]` bullets. Contact info and dates live outside Tiptap (D-05) which sidesteps the hardest schema question.

**Primary recommendation:** Build the Tiptap schema first (Wave A), wire it to the existing `ResumeSlice` with extended CRUD actions (Wave B), then layer the PDF preview + export with `usePDF` + 800ms debounce (Wave C), and close with autosave + sample resume fixture (Wave D). Don't ship the Tiptap editor and the PDF renderer in the same task — they have different integration risks.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**PDF Preview Placement**
- **D-01:** PDF preview lives in the **right panel** (currently the Score placeholder). Phase 3 will decide how to share that panel between Score and Preview (tabs or toggle). Do not cramp the center editor panel with a split or tab.
- **D-02:** PDF preview panel heading changes from "ATS Score" to "Preview" for Phase 2. Phase 3 will revise when scoring is added.

**Tiptap Editor Model**
- **D-03:** **Single Tiptap editor instance** with custom ProseMirror node extensions enforcing resume document structure. The Tiptap document is the source of truth for prose content.
- **D-04:** Top-level section nodes in the Tiptap schema: `SummarySection`, `ExperienceList` (contains `ExperienceEntry` nodes with bullet list nodes), `EducationList` (contains `EducationEntry` nodes), `SkillsSection` (contains `SkillGroup` nodes).
- **D-05:** **Contact fields and date fields are conventional form inputs outside Tiptap** — they are structured data, not prose. Contact info (name, email, phone, location, LinkedIn, website), experience dates (startDate, endDate, current), and education graduation date all use regular `<input>` fields wired directly to Zustand.
- **D-06:** Editor state flows one-directionally: Tiptap `onUpdate` → `editor.getJSON()` → parsed into Zustand `ResumeSlice`. Contact form fields update Zustand directly via `onChange`. (Implements EDIT-03.)
- **D-07:** `Experience.bullets` in the Zod schema are `string[]`. Tiptap bullet nodes serialize to plain strings on `getJSON()` — no rich text markup in bullet content. Phase 4 AI decorations will work within Tiptap without changing the serialized type.

**Section Management UX**
- **D-08:** Each section has an **"Add Entry" button at the bottom** (experience: "Add Position", education: "Add Education", skills: "Add Skill Group").
- **D-09:** Each entry shows a **delete icon on hover** (trash icon, right-aligned). No confirmation dialog — delete is immediate (undo via browser history or autosave recovery).
- **D-10:** **No drag-to-reorder in Phase 2.** Entries maintain insertion order. Reordering is deferred.
- **D-11:** Skills section: each skill group has a category label input + comma-separated or tag-style skill items input. Claude's discretion on exact tag UX.

**PDF Template Style**
- **D-12:** **Modern/clean template** — matches the app's Linear/Notion aesthetic. Inter font (or a close variable alternative available in @react-pdf/renderer), generous whitespace, minimal horizontal rules under section headings, no decorative elements.
- **D-13:** Single-column layout, all text selectable, standard section headings (Experience, Education, Skills), no images or icons in the PDF. ATS-friendly by design (per PDF-03).
- **D-14:** At least 1 polished template ready for export by end of Phase 2 (per PDF-04). Additional templates deferred to Phase 7.

**Autosave Feedback**
- **D-15:** Brief **"Saved ✓"** indicator that appears in the app header for ~2 seconds when autosave fires (every 10 seconds per EDIT-07). Not a full toast — a subtle status chip. No persistent "last saved X ago" counter.

**First Load Content**
- **D-16:** Editor pre-loads a **hardcoded sample resume** (realistic placeholder — e.g., "Alex Johnson, Software Engineer" with 2 experience entries, 1 education entry, skill groups). This makes the PDF preview immediately visible on first open, delivering the "wow moment" before the user types anything.
- **D-17:** Sample resume is stored in a static fixture file (e.g., `src/data/sample-resume.ts`). On first load (no data in localStorage), the store initializes from this fixture. If localStorage has data, load that instead.

### Claude's Discretion
- Exact Tiptap node schema internals (marks, attrs, serialization details)
- Tag vs comma-separated UX for skill items
- PDF template typography scale and spacing values
- Exact pixel dimensions and margins in the PDF layout
- Contact section layout within Tiptap (whether it lives inside or outside the editor)
- `ResumeSlice` action additions needed for section CRUD (beyond what Phase 1 defined)

### Deferred Ideas (OUT OF SCOPE)
- Drag-to-reorder experience/education entries — Phase 2 uses insertion order only
- Additional PDF templates — Phase 7
- Dark mode — future polish phase (deferred from Phase 1)
- Keyboard shortcuts for section navigation — Phase 4 (accessibility)
- AI-assisted initial resume generation — not in Milestone 1 roadmap; valid future feature
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EDIT-01 | User can edit resume in structured sections (contact, summary, experience, education, skills) via Tiptap v3 | §Standard Stack (Tiptap 3.22.4), §Architecture Patterns (Tiptap schema), §Code Examples (schema + editor mount) |
| EDIT-02 | Tiptap uses custom node extensions enforcing resume document structure | §Architecture Patterns (Tiptap custom Node.create), §Code Examples (ExperienceEntry node + ExperienceList group) |
| EDIT-03 | Editor state flows one-directionally to Zustand via onUpdate → getJSON() | §Architecture Patterns (sync direction), §Code Examples (onUpdate handler), §Common Pitfalls (setContent feedback loop) |
| EDIT-04 | User can add, edit, remove experience entries (company, title, dates, bullets) | §Architecture Patterns (CRUD actions on ResumeSlice), §Code Examples (immer slice actions) |
| EDIT-05 | User can add, edit, remove education entries | Same patterns as EDIT-04, separate slice actions |
| EDIT-06 | User can add, edit, remove skill categories and items | §Architecture Patterns (skill tag tokenization), §Code Examples |
| EDIT-07 | Autosave triggers every 10 seconds to localStorage | §Architecture Patterns (interval + debounce hybrid), §Code Examples (useAutosave hook), §Common Pitfalls (autosave during SSR) |
| PDF-01 | Live PDF preview renders beside editor, updating debounced 800ms | §Standard Stack (@react-pdf/renderer 4.5.1), §Architecture Patterns (usePDF hook), §Code Examples (debounced update) |
| PDF-02 | PDF rendered imperatively via pdf().toBlob() (not in React tree) | §Code Examples (pdf(Doc).toBlob() in useEffect, or usePDF hook), §Common Pitfalls (tree-rendering PDFViewer blocks main thread) |
| PDF-03 | User can export ATS-friendly PDF (single column, text-selectable, standard headings, no images) | §PDF Template Spec (from UI-SPEC §PDF Template Contract), §Don't Hand-Roll (use @react-pdf/renderer, not Puppeteer/HTML-to-PDF) |
| PDF-04 | At least 1 polished professional template | §Architecture Patterns (single `ModernCleanTemplate` component), §Code Examples |
| PDF-05 | PDF export is free with no paywall or watermark | §Architecture Patterns (direct blob download via object URL + anchor click); no gating logic |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

**These directives from `./CLAUDE.md` are as authoritative as locked decisions. The plan MUST comply with all of them.**

### Forbidden in Phase 2
- **No backend calls.** Milestone 1 has no backend. All data in localStorage. (CLAUDE.md §Key Architectural Rules)
- **No LLM calls in the scoring loop.** Phase 2 has no scoring, but also no LLM calls anywhere — AI work is Phase 3/4. (CLAUDE.md §Key Architectural Rules)
- **No Puppeteer / Playwright for PDF generation.** Use `@react-pdf/renderer` only. Puppeteer is reserved for Playwright E2E *testing*. (CLAUDE.md §What NOT to Use)
- **No images or icons inside the PDF.** ATS-parseable output requires single-column text-only. (CLAUDE.md §Key Architectural Rules + PDF-03)
- **No webpack-specific configuration.** Next.js 16 defaults to Turbopack; custom webpack config is ignored. (CLAUDE.md §Key Configuration Notes)
- **No `next lint`.** Run `eslint` directly. (CLAUDE.md §Next.js 16 Specifics)
- **No `tailwind.config.js`.** Tailwind v4 uses CSS-first config via `@theme`. (CLAUDE.md §Tailwind CSS 4 Specifics)
- **No paywall, no watermark on PDF export.** MIT-licensed, truly open source. (CLAUDE.md §Project Constraints)
- **No dark mode.** Light mode only for Phase 2 (deferred). (UI-SPEC + Phase 1 STATE)

### Required
- **Tiptap 3 SSR config:** `immediatelyRender: false` + `shouldRerenderOnTransaction: true` in `useEditor`. (CLAUDE.md §Tiptap 3 Specifics)
- **BubbleMenu/FloatingMenu imports from `@tiptap/react/menus`**, not `@tiptap/react`. (CLAUDE.md §Tiptap 3 Specifics) — Phase 2 probably won't use either, but if we add any, it's this path.
- **`'use client'` directive** on every file that uses Tiptap hooks, react-pdf components, or accesses `window` / `localStorage`.
- **Zod-inferred types** from existing `src/types/resume.ts`. Do not define manual interfaces. (CLAUDE.md §Conventions implied + Phase 1 STATE §Decisions)
- **shadcn/ui components via official registry only** (input, label, textarea, badge, checkbox). No third-party registries. (UI-SPEC §Registry Safety)
- **Accessibility WCAG 2.1 AA** — keyboard nav, ARIA labels, visible focus rings. (CLAUDE.md §Constraints)
- **pnpm** for all installs. Corporate SSL: `NODE_TLS_REJECT_UNAUTHORIZED=0` when calling `pnpm dlx shadcn`. (STATE.md §Execution Environment)
- **TDD** where possible: Vitest for pure logic (fixture parsing, slice actions, debounce wrappers). Editor + PDF render checks can be Testing Library smoke tests. (Phase 1 STATE §Decisions)

### File-write discipline
- `'use client'` must be on the FIRST line of any component file that uses Tiptap hooks or `@react-pdf/renderer` `usePDF`.
- Don't put Tiptap nodes / react-pdf Document components in Server Components.

## Standard Stack

### Core (verified installed versions)

| Library | Version | Purpose | Why Standard | Source |
|---------|---------|---------|--------------|--------|
| Next.js | 16.2.3 | Framework (already installed) | [VERIFIED: package.json] | Phase 1 `package.json` |
| React | 19.2.4 | UI library (already installed) | [VERIFIED: package.json] | Phase 1 `package.json` |
| TypeScript | ^5 | Type safety (already installed) | [VERIFIED: package.json] | Phase 1 `package.json` |
| Tailwind CSS | ^4 | Styling (already installed) | [VERIFIED: package.json] | Phase 1 `package.json` |
| Zustand | ^5.0.12 | State (already installed) | [VERIFIED: package.json] | Phase 1 `package.json` |
| Zod | ^4.3.6 | Schema validation (already installed) | [VERIFIED: package.json] | Phase 1 `package.json` |
| Immer | ^11.1.4 | Mutations (already installed) | [VERIFIED: package.json] | Phase 1 `package.json` |

### New installs this phase

| Library | Version | Purpose | Why Standard | Source |
|---------|---------|---------|--------------|--------|
| `@tiptap/react` | 3.22.4 | Tiptap React bindings | Standard React wrapper for Tiptap 3. Requires React 17+ (React 19 supported). | [VERIFIED: npm view @tiptap/react version = 3.22.4] |
| `@tiptap/pm` | 3.22.4 | ProseMirror peer dep bundle | Tiptap 3 splits ProseMirror into a single dep. Peer of `@tiptap/react`. | [VERIFIED: npm view @tiptap/react peerDependencies] |
| `@tiptap/starter-kit` | 3.22.4 | Base extensions (document, paragraph, text, history, bulletList, listItem, …) | Ships `doc`, `paragraph`, `text`, `history`/`undoRedo`, `bulletList`, `listItem`, `bold`, `italic`, `underline`, `link` and more. Configurable: disable unused extensions. | [VERIFIED: npm view @tiptap/starter-kit version = 3.22.4] |
| `@tiptap/extension-placeholder` | 3.22.4 | "Describe your impact…" placeholders in empty bullet/summary nodes | Standard Tiptap placeholder; needed for UI-SPEC copywriting contract (Summary placeholder + bullets placeholder). | [VERIFIED: npm view @tiptap/extension-placeholder version = 3.22.4] |
| `@react-pdf/renderer` | 4.5.1 | PDF rendering (preview + export) | Produces native PDF primitives (text-selectable), not HTML-to-PDF. Auto-opted-out of Next.js server bundling. React 19 compatible. | [VERIFIED: npm view @react-pdf/renderer version = 4.5.1; CITED: Next.js 16 `serverExternalPackages.md` includes `@react-pdf/renderer` in default list] |
| `uuid` + `@types/uuid` | 14.0.0 / latest | Generate UUIDs for new Experience/Education entries | Phase 1 `ExperienceSchema.id` is `z.string().uuid()`. Need a UUID generator in-browser for CRUD. | [VERIFIED: npm view uuid version = 14.0.0]. Alternative: `crypto.randomUUID()` (browser-native, no dep) — strongly recommend this instead; see §Don't Hand-Roll. |

### shadcn/ui components to add (no third-party registries)

| Component | Used For | Source |
|-----------|----------|--------|
| `input` | All text fields (contact, dates, company, title, etc.) | UI-SPEC §Registry Safety |
| `label` | Form labels adjacent to inputs | UI-SPEC §Registry Safety |
| `textarea` | (Optional) alternative to Tiptap for Summary if we decide not to use Tiptap there. UI-SPEC keeps Summary in Tiptap — but `textarea` is cheap and may be useful for error fallbacks. | UI-SPEC §Registry Safety |
| `badge` | Skill tag chips | UI-SPEC §Registry Safety |
| `checkbox` | "Current" checkbox on experience entries | UI-SPEC §Component Inventory |

**Install command** (from the Phase 2 worktree — NOT phase-01):

```bash
# Core libs
pnpm add @tiptap/react@3.22.4 @tiptap/pm@3.22.4 @tiptap/starter-kit@3.22.4 @tiptap/extension-placeholder@3.22.4
pnpm add @react-pdf/renderer@4.5.1

# shadcn components (SSL workaround for corporate proxy, per STATE.md)
NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm dlx shadcn@latest add input label textarea badge checkbox
```

No `uuid` package needed — use `crypto.randomUUID()` (browser-native, available in all modern browsers and Node 14.17+). [VERIFIED: MDN — `Crypto.randomUUID()` is available in secure contexts globally.]

### Alternatives Considered

| Instead of | Could Use | Tradeoff | Recommendation |
|------------|-----------|----------|----------------|
| Tiptap v3 | Lexical (Meta) / Slate.js | Lexical is optimized for social-media-style flat text; Slate has unstable API. Tiptap/ProseMirror's document schema is ideal for structured resume nodes. | **Stick with Tiptap** — already locked by CLAUDE.md and DESIGN.md |
| `@react-pdf/renderer` | Puppeteer HTML→PDF | 200MB+ headless browser, slow, server-only, ATS may fail to parse wrapped PDF. | **Stick with @react-pdf/renderer** — already locked by CLAUDE.md |
| `@react-pdf/renderer` | `jsPDF` | Manual coordinate positioning, no React components, poor maintainability. | Don't use |
| `@react-pdf/renderer` PDFViewer component | `usePDF` hook + object URL + `<iframe>` | PDFViewer uses its own iframe and blocks main thread on big docs. Hook gives us debounce control and smoother UX. | **Use `usePDF` hook**. PDFViewer is fine for greenfield demos; we need the 800ms debounce per PDF-01. |
| Inline Tiptap rendering inside entries | One global Tiptap + custom nodes for entries | One editor = one undo stack, one schema, one source of truth. Multiple editors = multiple selections, complex autosave. | **One editor, custom nodes** — per D-03/D-04 |
| `uuid` package | `crypto.randomUUID()` | `crypto.randomUUID()` is native, zero-dep, same behavior. | **Use `crypto.randomUUID()`** — see §Don't Hand-Roll |
| `lodash.debounce` | Hand-rolled debounce hook | Lodash adds 70KB for one function. A `useDebouncedValue` or `useDebouncedEffect` hook is ~15 lines. | **Hand-roll** — trivial to write, stays in repo |

## Architecture Patterns

### Recommended File Structure (phase 2 additions inside `src/`)

```
src/
├── app/
│   └── page.tsx                    # existing — renders EditorLayout (no change)
├── components/
│   ├── editor/                     # NEW
│   │   ├── resume-editor.tsx       # Tiptap editor host (center panel body)
│   │   ├── contact-form.tsx        # NEW — plain inputs, contact fields (D-05)
│   │   ├── experience-section.tsx  # NEW — list + entries + add button
│   │   ├── experience-entry.tsx    # NEW — single entry form (company, title, dates, bullets)
│   │   ├── education-section.tsx   # NEW
│   │   ├── education-entry.tsx     # NEW
│   │   ├── skills-section.tsx      # NEW
│   │   ├── skill-group.tsx         # NEW — category + chip tokenizer
│   │   ├── summary-section.tsx     # NEW — Tiptap-driven prose block
│   │   ├── add-entry-button.tsx    # NEW — shared ghost button
│   │   ├── delete-button.tsx       # NEW — shared trash-on-hover
│   │   └── saved-indicator.tsx     # NEW — autosave flash (lives in header)
│   ├── pdf/                        # NEW
│   │   ├── pdf-preview-panel.tsx   # Right panel host ('use client')
│   │   ├── pdf-preview.tsx         # 'use client' — uses usePDF hook
│   │   ├── export-pdf-button.tsx   # 'use client' — triggers blob download
│   │   └── templates/              # NEW
│   │       └── modern-clean-template.tsx  # The one template (PDF-04)
│   └── layout/
│       ├── desktop-layout.tsx      # UPDATE — right panel uses PdfPreviewPanel; center uses ResumeEditor
│       ├── mobile-layout.tsx       # UPDATE — rename "Score" tab to "Preview", mount PdfPreviewPanel
│       └── app-header.tsx          # UPDATE — mount SavedIndicator
├── data/                           # NEW
│   └── sample-resume.ts            # D-17 — realistic Alex Johnson fixture
├── hooks/
│   ├── use-debounced-value.ts      # NEW — tiny useEffect+setTimeout wrapper
│   └── use-autosave.ts             # NEW — interval + persistence trigger
├── lib/
│   ├── store/
│   │   └── slices/
│   │       └── resume-slice.ts     # UPDATE — extend with CRUD actions
│   ├── tiptap/                     # NEW
│   │   ├── extensions/             # Custom Node extensions (D-04)
│   │   │   ├── experience-entry-node.ts
│   │   │   ├── experience-list-node.ts
│   │   │   ├── education-entry-node.ts
│   │   │   ├── education-list-node.ts
│   │   │   ├── skill-group-node.ts
│   │   │   └── skills-section-node.ts
│   │   ├── schema.ts               # getSchema(...) assembly + JSON ↔ Zod mappers
│   │   └── extensions.ts           # StarterKit.configure() + placeholder + custom nodes
│   └── pdf/                        # NEW
│       ├── fonts.ts                # Font.register(...) — Inter from /public/fonts/
│       └── download.ts             # blob → anchor click helper (PDF-05)
└── types/
    └── resume.ts                   # NO CHANGE — Zod schemas remain source of truth
```

### Pattern 1: Tiptap SSR-Safe Mount

Tiptap 3 in Next.js 16 App Router requires the `'use client'` directive AND `immediatelyRender: false` to avoid hydration mismatches.

```typescript
// src/components/editor/resume-editor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { resumeExtensions } from '@/lib/tiptap/extensions'
import { useAppStore } from '@/lib/store'
import { tiptapJsonToSections, sectionsToTiptapJson } from '@/lib/tiptap/schema'

export function ResumeEditor() {
  const resume = useAppStore((s) => s.resume)
  const setResumeFromTiptap = useAppStore((s) => s.setResumeFromTiptap)

  const editor = useEditor({
    extensions: resumeExtensions,
    content: resume ? sectionsToTiptapJson(resume.sections) : undefined,
    immediatelyRender: false,                  // REQUIRED for Next.js SSR
    shouldRerenderOnTransaction: true,         // REQUIRED per CLAUDE.md
    editorProps: {
      attributes: {
        class: 'prose prose-sm outline-none focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      // EDIT-03: one-directional sync Tiptap → Zustand
      const json = editor.getJSON()
      setResumeFromTiptap(json)
    },
  })

  if (!editor) return null  // avoid rendering before client-side hydration

  return <EditorContent editor={editor} />
}
```

**Key SSR points** [CITED: tiptap.dev/docs/editor/getting-started/install/nextjs]:
- `'use client'` on every file using Tiptap hooks
- `immediatelyRender: false` prevents server-side editor init → no hydration mismatch
- Null-check `editor` before rendering (editor is `null` until client hydrates)
- `shouldRerenderOnTransaction: true` ensures React re-renders when the editor internal state changes (per CLAUDE.md)

### Pattern 2: Tiptap Custom Node Schema for Resume Structure

D-04 requires custom top-level nodes enforcing document structure. Use `Node.create` from `@tiptap/core`.

```typescript
// src/lib/tiptap/extensions/experience-entry-node.ts
import { Node } from '@tiptap/core'

export const ExperienceEntryNode = Node.create({
  name: 'experienceEntry',
  group: 'experienceBlock',
  content: 'bulletList',           // each entry holds one Tiptap bulletList
  defining: true,                  // content is semantically meaningful
  isolating: true,                 // selection can't escape this node
  addAttributes() {
    return {
      entryId: { default: null }, // UUID bridging to Zustand experience[].id
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-type="experience-entry"]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-type': 'experience-entry', ...HTMLAttributes }, 0]
  },
})
```

**Critical design choices** [CITED: tiptap.dev Node API docs]:
- `group:` lets the parent `ExperienceList` constrain content to `'experienceBlock+'`
- `content: 'bulletList'` — only a Tiptap `bulletList` is allowed inside (StarterKit provides this). The bullets inside are `listItem` nodes whose content is `paragraph+`. On `getJSON()`, each listItem paragraph is plain text → serializes to a single string per bullet. This satisfies D-07.
- `entryId` attribute is the bridge between Tiptap document and the Zustand Experience array: each entry node has an ID matching `Experience.id`. When Tiptap emits updates, we walk the doc, read entry IDs, and update the matching Zustand entry's `bullets[]` from its bulletList content.

```typescript
// src/lib/tiptap/extensions.ts
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { ExperienceListNode } from './extensions/experience-list-node'
import { ExperienceEntryNode } from './extensions/experience-entry-node'
// ...education + skills nodes

export const resumeExtensions = [
  StarterKit.configure({
    // disable everything we don't need — resumes have no headings, no blockquotes, no code
    heading: false,
    blockquote: false,
    codeBlock: false,
    code: false,
    horizontalRule: false,
    strike: false,
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'summarySection') return 'Write a 2-3 sentence professional summary...'
      if (node.type.name === 'listItem') return 'Describe your impact — use action verbs and metrics'
      return ''
    },
  }),
  ExperienceListNode,
  ExperienceEntryNode,
  // ...
]
```

**StarterKit behavior** [CITED: tiptap.dev/docs/editor/extensions/functionality/starterkit]:
- Ships: `doc`, `paragraph`, `text`, `bulletList`, `listItem`, `orderedList`, `bold`, `italic`, `underline`, `link`, `history` (renamed `undoRedo` in v3)
- We keep: `doc`, `paragraph`, `text`, `bulletList`, `listItem`, `bold`, `italic`, `history`
- We disable: `heading`, `blockquote`, `codeBlock`, `code`, `horizontalRule`, `strike` (keep the resume prose clean)
- We MUST NOT disable `paragraph` or `doc` — editor breaks

### Pattern 3: Zustand Slice Extension with Immer

Phase 1 shipped a minimal `ResumeSlice`. Phase 2 extends it with full CRUD. Use immer middleware (already wired in `src/lib/store/index.ts`) — no spread-operator gymnastics.

```typescript
// src/lib/store/slices/resume-slice.ts
import type { StateCreator } from 'zustand'
import type { AppState } from '../index'
import type { Resume, Experience, Education, Skills } from '@/types/resume'

export interface ResumeSlice {
  resume: Resume | null

  // existing
  setResume: (resume: Resume) => void
  updateBullet: (expIndex: number, bulletIndex: number, text: string) => void
  clearResume: () => void

  // NEW Phase 2
  updateContactInfo: (patch: Partial<Resume['sections']['contactInfo']>) => void
  updateSummary: (summary: string) => void

  addExperience: () => string  // returns new entry id
  updateExperience: (id: string, patch: Partial<Omit<Experience, 'id'>>) => void
  removeExperience: (id: string) => void
  setExperienceBullets: (id: string, bullets: string[]) => void

  addEducation: () => string
  updateEducation: (id: string, patch: Partial<Omit<Education, 'id'>>) => void
  removeEducation: (id: string) => void

  addSkillGroup: () => string  // returns category index marker
  updateSkillGroup: (index: number, patch: Partial<Skills>) => void
  removeSkillGroup: (index: number) => void

  // bulk Tiptap sync: called from editor onUpdate
  setResumeFromTiptap: (tiptapJson: unknown) => void
}

export const createResumeSlice: StateCreator<
  AppState,
  [['zustand/immer', never], ['zustand/devtools', never]],
  [],
  ResumeSlice
> = (set) => ({
  resume: null,
  // ... existing actions
  addExperience: () => {
    const newId = crypto.randomUUID()
    set((state) => {
      if (!state.resume) return
      state.resume.sections.experience.push({
        id: newId,
        company: '',
        title: '',
        startDate: '',
        endDate: null,
        current: true,
        bullets: [],
      })
      state.resume.updatedAt = new Date().toISOString()
    })
    return newId
  },
  // ... etc
})
```

**Key design choices:**
- Use entry `id` (string UUID) for lookup, not array index. Array index breaks under concurrent mutations and when Tiptap reorders. [VERIFIED: existing `ExperienceSchema.id = z.string().uuid()`]
- Always update `resume.updatedAt` in mutating actions — useful for debugging and for Phase 5 variant diffing.
- `setResumeFromTiptap` is the one place where Tiptap doc state bulk-updates the store. Keep the JSON→Zustand mapper in `src/lib/tiptap/schema.ts` as a pure, Vitest-testable function.

### Pattern 4: Imperative PDF Rendering with usePDF Hook

[CITED: react-pdf.org/hooks] `usePDF` hook signature: `const [instance, update] = usePDF({ document })`. Instance = `{ url, blob, loading, error }`. `update(newDoc)` manually triggers re-render. PDF-02 requires imperative (not tree-rendered) rendering — `usePDF` fits perfectly.

```typescript
// src/components/pdf/pdf-preview.tsx
'use client'

import { usePDF } from '@react-pdf/renderer'
import { useEffect, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { ModernCleanTemplate } from './templates/modern-clean-template'
import { Loader2 } from 'lucide-react'
import '@/lib/pdf/fonts'  // side-effect: Font.register once at module load

export function PdfPreview() {
  const resume = useAppStore((s) => s.resume)

  // PDF-01: debounce 800ms
  const debouncedResume = useDebouncedValue(resume, 800)

  const doc = useMemo(
    () => debouncedResume ? <ModernCleanTemplate resume={debouncedResume} /> : null,
    [debouncedResume]
  )

  const [instance, update] = usePDF({ document: doc })

  // Trigger re-render when debounced doc changes
  useEffect(() => {
    if (doc) update(doc)
  }, [doc, update])

  if (!instance.url) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <iframe
        src={instance.url}
        className="h-full w-full border-0"
        title="Resume preview"
      />
      {instance.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
```

**Export button** — simple imperative `pdf().toBlob()` + download anchor:

```typescript
// src/components/pdf/export-pdf-button.tsx
'use client'

import { pdf } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { ModernCleanTemplate } from './templates/modern-clean-template'
import { useState } from 'react'

export function ExportPdfButton() {
  const resume = useAppStore((s) => s.resume)
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!resume) return
    setIsExporting(true)
    try {
      const blob = await pdf(<ModernCleanTemplate resume={resume} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resume.sections.contactInfo.fullName.replace(/\s+/g, '-') || 'resume'}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)  // REQUIRED — avoid memory leak
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={isExporting || !resume} size="sm">
      <Download className="mr-1 h-4 w-4" />
      {isExporting ? 'Downloading...' : 'Export PDF'}
    </Button>
  )
}
```

### Pattern 5: Font Registration (Inter)

react-pdf does NOT use `next/font` or CSS. It only supports TTF/WOFF via `Font.register()`. Inter TTF files must live in `/public/fonts/` and be referenced by URL path (browser-loadable). [CITED: react-pdf.org/fonts; VERIFIED: GitHub issue #2223 pattern]

```bash
# Add Inter TTFs to /public/fonts/
# Source: rsms.me/inter or github.com/rsms/inter releases (Inter-Regular.ttf, Inter-SemiBold.ttf, Inter-Bold.ttf)
# Or use @fontsource/inter and copy files to /public/fonts/ as a build step
```

```typescript
// src/lib/pdf/fonts.ts
import { Font } from '@react-pdf/renderer'

Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Inter-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
  ],
})
```

Import `@/lib/pdf/fonts` as a side effect from any component that renders a PDF — it registers fonts once globally.

**Gotcha** [VERIFIED: GitHub issue #1075]: react-pdf cannot load Google Fonts CSS URLs. Must be direct TTF file. The existing `next/font/google` Inter loader in `layout.tsx` is for the APP UI only — it does not supply the PDF renderer.

### Pattern 6: Autosave (Interval + Hydration-Safe)

EDIT-07 requires autosave every 10 seconds. Best pattern: `setInterval` in a `'use client'` hook, gated by a hydration flag (already available: `use-hydration.ts`).

```typescript
// src/hooks/use-autosave.ts
'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { createStorageAdapter } from '@/lib/storage/adapter'

const AUTOSAVE_INTERVAL_MS = 10_000

export function useAutosave(onSaved?: () => void) {
  useEffect(() => {
    const adapter = createStorageAdapter()
    const intervalId = setInterval(() => {
      const resume = useAppStore.getState().resume
      if (resume) {
        adapter.saveResume(resume).then(() => onSaved?.())
      }
    }, AUTOSAVE_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [onSaved])
}
```

Notes:
- Uses `useAppStore.getState()` (not a selector) inside `setInterval` — avoids stale closures.
- `createStorageAdapter()` inside the effect — already exists (Phase 1). Its `saveResume()` is a JSON-serialize + localStorage write.
- The `onSaved` callback triggers the `SavedIndicator` flash in the header (D-15).
- Alternative: debounced save on every change. Rejected — EDIT-07 specifies "every 10 seconds," explicit interval semantics.

### Pattern 7: Sample Resume Fixture + Hydration Bootstrap

D-16/D-17: on first load (no localStorage data), seed from fixture; otherwise, load from localStorage.

```typescript
// src/data/sample-resume.ts
import type { Resume } from '@/types/resume'

export const SAMPLE_RESUME: Resume = {
  id: 'sample-alex-johnson',
  title: 'Software Engineer Resume',
  createdAt: '2026-04-22T00:00:00.000Z',
  updatedAt: '2026-04-22T00:00:00.000Z',
  sections: {
    contactInfo: {
      fullName: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      phone: '+1 (555) 012-3456',
      location: 'San Francisco, CA',
      linkedIn: 'https://linkedin.com/in/alexjohnson',
      website: 'https://alexjohnson.dev',
    },
    summary: 'Full-stack software engineer with 6+ years building web applications...',
    experience: [
      { id: '...', company: 'Acme Corp', title: 'Senior Software Engineer', ... },
      { id: '...', company: 'Startup Inc', title: 'Software Engineer', ... },
    ],
    education: [...],
    skills: [...],
  },
}
```

```typescript
// In a bootstrap component (e.g., app/page.tsx or a ClientBootstrap wrapper):
'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { createStorageAdapter } from '@/lib/storage/adapter'
import { SAMPLE_RESUME } from '@/data/sample-resume'

export function ResumeBootstrap({ children }: { children: React.ReactNode }) {
  const resume = useAppStore((s) => s.resume)
  const setResume = useAppStore((s) => s.setResume)

  useEffect(() => {
    if (resume) return  // already loaded (zustand/persist hydrated)
    const adapter = createStorageAdapter()
    adapter.listResumes().then((resumes) => {
      if (resumes.length > 0) {
        setResume(resumes[0]!)
      } else {
        setResume(SAMPLE_RESUME)
      }
    })
  }, [resume, setResume])

  return <>{children}</>
}
```

**Caveat:** Zustand's `persist` middleware (already wired in `store/index.ts` with key `rese-store`) already hydrates from localStorage. The bootstrap above may double-load. Verify during implementation: does `zustand/persist` beat the `listResumes()` call to setting `resume`? If so, only fall through to SAMPLE_RESUME when both are empty. The `use-hydration.ts` hook helps detect hydration completion.

### Anti-Patterns to Avoid

- **Don't use `EditorProvider` AND `useEditor` in the same tree** — choose one. [CITED: tiptap.dev FAQ] We use `useEditor` because we mount in a client component.
- **Don't render `<PDFViewer>` in the React tree for live preview** — it's synchronous and blocks on big docs. Use `usePDF` hook + iframe with object URL.
- **Don't call `editor.setContent(...)` on every Zustand update** — creates a feedback loop with `onUpdate`. One-directional Tiptap→Zustand (D-06). Zustand→Tiptap is ONLY on initial mount.
- **Don't put `Font.register` in a React component body** — it runs on every render. Put it in a side-effect module imported once.
- **Don't forget `URL.revokeObjectURL`** after export download — memory leak over long sessions.
- **Don't use array index as React key** on experience/education lists — use `entry.id`. Indexes break on delete/reorder.
- **Don't persist Zustand's `loading` / transient fields** — already handled in Phase 1 `partialize`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rich text editor with structured sections | Custom contenteditable div | Tiptap 3 with custom Node extensions | ProseMirror handles selection, IME, undo/redo, copy/paste normalization, accessibility. Building this from scratch = rewrite territory. |
| PDF generation | Custom `print()` or HTML-to-PDF | `@react-pdf/renderer` 4 | Produces native PDF primitives (text-selectable, ATS-parseable), not HTML wrapped in PDF. Free. No headless browser. |
| UUID generation | `Math.random().toString(36)` shims | `crypto.randomUUID()` | Browser-native since 2022 (Chromium 92, Firefox 95, Safari 15.4). Cryptographically random, RFC 4122 compliant, zero-dep. Works in Node 14.17+. [VERIFIED: MDN] |
| Debounce | Import `lodash.debounce` | 15-line custom hook `useDebouncedValue<T>(value, ms)` | Tree-shaking lodash for one function bloats bundle. Native `setTimeout`/`clearTimeout` in a `useEffect` works perfectly. |
| Tag/chip input (skills) | Custom chip component | `shadcn/ui` `<Badge variant="secondary">` + controlled `<Input>` | Already in dependency tree, matches design system. |
| Checkbox (Current position) | Custom `<input type="checkbox">` | `shadcn/ui checkbox` | Consistent with form inputs, accessible by default. |
| PDF download (blob → file) | Custom Service Worker | `URL.createObjectURL(blob)` + `<a download>` click | Standard browser API, works everywhere, no ServiceWorker needed. |
| Form validation (date format, email) | Manual regex checks | Defer to Phase 4 (per UI-SPEC — no inline validation in Phase 2) | UI-SPEC §Interaction States explicitly says "Phase 4 adds validation UX." Don't add validation now. |
| Base64 font embedding | Inline base64 strings | TTF files in `/public/fonts/` | Base64 bloats bundle; served TTFs are cached by browser. |
| localStorage adapter | Write another one | Existing `LocalStorageAdapter` (Phase 1) | Already supports `saveResume`, `getResume`, `listResumes`, `exportAll`. Reuse. |

**Key insight:** Most of the "expensive" engineering in Phase 2 (editor, PDF, state) is handled by libraries. What the plan has to focus on is *wiring* — the schema bridging Tiptap JSON to Zod-typed resume state, the one-directional sync, the font registration, and the ATS-friendly PDF template layout. Everything else is CRUD and UI.

## Runtime State Inventory

Phase 2 is primarily *greenfield* (adding new files, extending a slice). No renames, no migrations. However, two items touch stored state:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Phase 1 localStorage keys: `rese:resume:{id}`, `rese:schema-version`, `rese-store` (zustand persist) | No migration — the existing `ResumeSchema` is unchanged. Phase 2 adds actions that write the same shape. If the sample resume bootstraps with a fixed `id: 'sample-alex-johnson'`, this becomes a well-known key. |
| Live service config | None (no external services in M1) | None |
| OS-registered state | None | None |
| Secrets/env vars | None (BYOK key arrives in Phase 3) | None |
| Build artifacts | Installing `@react-pdf/renderer` pulls ~5MB of native-module-like code (`@react-pdf/pdfkit`, `@react-pdf/layout`). Next.js 16's `serverExternalPackages` auto-opts-out. | Verify first build works after `pnpm add @react-pdf/renderer`. See §Common Pitfalls. |

**Nothing found in OS-registered / Live service / Secrets categories — verified by absence of those systems in Milestone 1 scope.**

## Common Pitfalls

### Pitfall 1: Hydration Mismatch on Editor Mount
**What goes wrong:** Tiptap initializes differently on server vs. client → React throws "Text content did not match" or hydration errors.
**Why it happens:** Tiptap without `immediatelyRender: false` tries to render HTML on the server; on client, it initializes with ProseMirror view which produces slightly different DOM.
**How to avoid:** Always set `immediatelyRender: false` in `useEditor` AND `'use client'` at the file top. Guard the return with `if (!editor) return null`. [CITED: Tiptap issue #5856]
**Warning signs:** Dev console shows React hydration warnings; editor briefly flickers on mount.

### Pitfall 2: Tiptap setContent Feedback Loop
**What goes wrong:** On every Zustand update the component calls `editor.setContent(...)`, which fires `onUpdate`, which updates Zustand, which re-renders, which calls `setContent` again → infinite loop or cursor jumping.
**Why it happens:** Violating the one-directional sync rule (D-06).
**How to avoid:** Set initial content ONCE in `useEditor({ content: ... })`. After that, only Tiptap writes to Zustand, never the reverse. If you absolutely must programmatically update the editor (e.g., loading a new resume variant in Phase 5), call `editor.commands.setContent(newJson, { emitUpdate: false })` — the `emitUpdate: false` flag is critical. [CITED: tiptap setContent docs]
**Warning signs:** Cursor jumps to start on every keystroke; console "Maximum update depth" errors.

### Pitfall 3: Font.register Inside a React Component
**What goes wrong:** Fonts fail to load, or load repeatedly, or PDF renders with default fonts.
**Why it happens:** `Font.register` runs per-render, races with PDF rendering.
**How to avoid:** Put `Font.register(...)` in a side-effect module (`src/lib/pdf/fonts.ts`) and `import '@/lib/pdf/fonts'` from the component that renders the PDF. Module side effects run once at import.
**Warning signs:** PDF previews flash with Helvetica before showing Inter; `usePDF` stays in `loading: true` forever. [CITED: react-pdf issue #2675]

### Pitfall 4: @react-pdf/renderer in a Server Component
**What goes wrong:** Build errors like "Module not found: Can't resolve 'fs'" or runtime "window is not defined."
**Why it happens:** `@react-pdf/renderer` uses browser APIs (Blob, URL.createObjectURL) and Node.js modules; it cannot run in RSC.
**How to avoid:** Every file that imports `@react-pdf/renderer` MUST have `'use client'`. Thanks to Next.js 16 auto-opting-out `@react-pdf/renderer` in `serverExternalPackages` [VERIFIED: next.js docs], we don't need extra `next.config.ts` wiring. But the `'use client'` directive is still required on consuming files.
**Warning signs:** Build fails on production build (`pnpm build`); dev works fine because edges are blurred.

### Pitfall 5: 800ms Debounce Starves Export-Time Freshness
**What goes wrong:** User clicks "Export PDF" immediately after typing → exported PDF is stale by up to 800ms (doesn't include latest keystrokes).
**Why it happens:** The debounced state drives the preview. Export uses the same state.
**How to avoid:** Export button reads `useAppStore.getState().resume` directly (not the debounced value), and rebuilds the document inline: `await pdf(<ModernCleanTemplate resume={resume} />).toBlob()`. This gives the user what they SEE on screen in the form fields, not the preview snapshot.
**Warning signs:** Users complain their latest bullet didn't make it into the downloaded PDF.

### Pitfall 6: UUID Collisions on Entry ID Generation
**What goes wrong:** Two entries end up with the same ID (React key warning + CRUD chaos).
**Why it happens:** Not a real risk with `crypto.randomUUID()` (2^122 entropy), but a very real risk with `Date.now()` or `Math.random().toString(36).slice(2)`.
**How to avoid:** Use `crypto.randomUUID()`. Don't roll your own. [VERIFIED: MDN]
**Warning signs:** "Encountered two children with the same key" React warnings.

### Pitfall 7: Autosave During SSR
**What goes wrong:** Autosave interval tries to run on the server → `localStorage is not defined`.
**Why it happens:** Autosave hook imported transitively into a Server Component.
**How to avoid:** `useAutosave` must be in a `'use client'` file. Call it only from a Client Component (e.g., `AppHeader` if it's `'use client'`, or a dedicated `ClientBootstrap` component).
**Warning signs:** Hydration errors on refresh; SSR render fails.

### Pitfall 8: @react-pdf/renderer Pre-14.1.1 Next.js Server Crash
**What goes wrong:** Historical — pre-14.1.1 Next.js crashed on `@react-pdf/renderer` import.
**Why it happens:** N/A for us (we're on 16.2.3).
**How to avoid:** We're fine. Noting for future awareness if someone downgrades.
**Warning signs:** N/A.

### Pitfall 9: Tiptap Bullet Serialization Drift
**What goes wrong:** When AI decorations land in Phase 4 (marks on bullet text), `getJSON()` still needs to produce `string[]` bullets for `ExperienceSchema.bullets`.
**Why it happens:** Marks add structure (`text: "foo", marks: [...]`) that breaks a naive `textContent` mapper.
**How to avoid:** In `src/lib/tiptap/schema.ts`, the JSON-to-bullets mapper extracts `.text` from inline nodes and concatenates, ignoring marks. Write the mapper + unit tests NOW to guarantee Phase 4 doesn't break D-07.
**Warning signs:** Phase 4 lands, AI decorations appear, bullets become objects, Zod validation fails.

## Code Examples

### Verified: Tiptap 3 Next.js SSR Setup
```typescript
// Source: https://tiptap.dev/docs/editor/getting-started/install/nextjs
'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export function Tiptap() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World!</p>',
    immediatelyRender: false,
  })

  return <EditorContent editor={editor} />
}
```

### Verified: usePDF Hook Signature
```typescript
// Source: https://react-pdf.org/hooks
import { usePDF, Document, Page } from '@react-pdf/renderer'

const MyDoc = (
  <Document>
    <Page>{/* ... */}</Page>
  </Document>
)

const [instance, update] = usePDF({ document: MyDoc })
// instance: { url: string | null, blob: Blob | null, loading: boolean, error: string | undefined }
// update(newDocument): void — triggers re-render
```

### Verified: Imperative pdf().toBlob()
```typescript
// Source: https://react-pdf.org/advanced#on-the-fly-rendering
import { pdf } from '@react-pdf/renderer'

const blob = await pdf(<MyDoc />).toBlob()
```

### Verified: Font Registration
```typescript
// Source: https://react-pdf.org/fonts + GitHub issue #2223 confirmation
import { Font } from '@react-pdf/renderer'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Roboto-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 700 },
  ],
})
```

### Verified: Tiptap Node.create with content expression
```typescript
// Source: https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new/node
import { Node } from '@tiptap/core'

export const CustomNode = Node.create({
  name: 'customNode',
  group: 'block',
  content: 'block+',
  defining: true,
  parseHTML() {
    return [{ tag: 'div.custom' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'custom', ...HTMLAttributes }, 0]
  },
})
```

### Pattern: Debounced value hook
```typescript
// src/hooks/use-debounced-value.ts
'use client'
import { useEffect, useState } from 'react'

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}
```

### Pattern: ModernCleanTemplate skeleton
```typescript
// src/components/pdf/templates/modern-clean-template.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Resume } from '@/types/resume'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 10,
    lineHeight: 1.5,
    padding: 48,
    paddingHorizontal: 40,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  name: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  contactLine: { fontSize: 9, marginBottom: 16 },
  sectionHeading: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    borderBottom: '0.5pt solid #000',
    paddingBottom: 2,
    marginTop: 16,
    marginBottom: 8,
  },
  experienceHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  bullet: { marginLeft: 8, marginVertical: 1 },
})

export function ModernCleanTemplate({ resume }: { resume: Resume }) {
  const c = resume.sections.contactInfo
  const contactParts = [c.email, c.phone, c.location, c.linkedIn, c.website]
    .filter(Boolean)
    .join(' • ')

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.name}>{c.fullName}</Text>
        <Text style={styles.contactLine}>{contactParts}</Text>

        {resume.sections.summary && (
          <>
            <Text style={styles.sectionHeading}>Summary</Text>
            <Text>{resume.sections.summary}</Text>
          </>
        )}

        {resume.sections.experience.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Experience</Text>
            {resume.sections.experience.map((exp) => (
              <View key={exp.id} wrap={false}>
                <View style={styles.experienceHeader}>
                  <Text style={{ fontWeight: 600 }}>{exp.company} — {exp.title}</Text>
                  <Text style={{ fontSize: 9 }}>
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </Text>
                </View>
                {exp.bullets.map((b, i) => (
                  <Text key={i} style={styles.bullet}>• {b}</Text>
                ))}
              </View>
            ))}
          </>
        )}
        {/* Education, Skills: same pattern */}
      </Page>
    </Document>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tiptap v2 `BubbleMenu` from `@tiptap/react` | Tiptap v3 `@tiptap/react/menus` | v3.0 (2025) | If we add menus, imports change. Phase 2 may skip menus entirely. |
| Tiptap v2 `history` option | Tiptap v3 `undoRedo` option | v3.0 | Not directly affected unless we configure history |
| Next.js 14 `serverComponentsExternalPackages` (experimental) | Next.js 15+ `serverExternalPackages` (stable) | Next 15.0.0 | `@react-pdf/renderer` is auto-included in default list as of 15+ — no config needed |
| `lodash.debounce` in React apps | Native `useEffect` + `setTimeout` | Hook era | Stop shipping lodash for trivial utilities |
| `uuid` npm package | `crypto.randomUUID()` | ES2022 / Node 14.17+ | Drop the dep |

**Deprecated / outdated:**
- `middleware.ts` → now `proxy.ts` in Next.js 16 (but Phase 2 doesn't use middleware).
- `useFormState` → `useActionState` in React 19 (Phase 2 doesn't use server actions).
- `pdf-parse` → `unpdf` (Phase 2 doesn't import PDFs — that's Phase 7 Milestone 2).
- `next lint` → removed in 16; we already use `pnpm lint` = `eslint`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `crypto.randomUUID()` is available in all supported browsers | §Don't Hand-Roll | Low. Supported in all browsers from 2022+. If the app must support IE11 or Safari <15.4, add a `uuid` fallback. DESIGN.md does not specify a browser support matrix; if the target is "evergreen modern browsers," A1 holds. |
| A2 | react-pdf 4.5.1 works with React 19.2.4 in practice (beyond peer-dep declaration) | §Standard Stack | Low. Peer deps allow React 19 [VERIFIED: npm view]. Known community reports of successful React 19 usage. Full smoke test in Wave 1 will confirm. |
| A3 | The 800ms debounce is a good UX target | §Architecture Patterns | Medium. PDF-01 says "debounced 800ms" — but users on slow machines may perceive lag. Reasonable default; can be tuned later. |
| A4 | Inter TTF files are available to ship in `/public/fonts/` | §Architecture Patterns (Font Registration) | Low. Inter is SIL Open Font License, freely redistributable. Plan must include a task to obtain the TTFs. |
| A5 | Tiptap `getJSON()` output is stable across v3 patch releases | §Pattern 7 (bullet serialization) | Low. Tiptap JSON is documented as the stable format. |
| A6 | The existing `zustand/persist` `rese-store` key will not conflict with the per-resume `rese:resume:{id}` keys from `LocalStorageAdapter` | §Architecture Patterns (bootstrap) | Medium. They're distinct keys, BUT the store also persists `state.resume`, so we have two sources of truth for the same resume. The plan should pick ONE — either drop zustand/persist for `resume` (let `LocalStorageAdapter` own it) or drop `LocalStorageAdapter.saveResume` for now (let zustand/persist own it). Recommend: keep `LocalStorageAdapter` as the source of truth per DESIGN.md and Phase 1 intent; remove `resume` from `zustand/persist` partialize. |
| A7 | No Inter variable-font file is needed — static TTFs (Regular, SemiBold, Bold) suffice for the PDF template | §Standard Stack | Low. PDF template only uses weights 400, 600, 700. Variable fonts add complexity in react-pdf. |

## Open Questions

1. **Source of truth for resume state: zustand/persist vs. LocalStorageAdapter?**
   - What we know: Phase 1 wired both. `store/index.ts` persists `state.resume` via zustand/persist at key `rese-store`. `LocalStorageAdapter` saves to `rese:resume:{id}`.
   - What's unclear: Which one wins on hydration? What happens if both have data and they disagree?
   - Recommendation: The plan should resolve this in the first task. Recommend keeping `LocalStorageAdapter` as the source of truth (per DESIGN.md vision: "Storage adapter will swap to DB in Milestone 2" — AUTH-05). Remove `resume` from the `partialize` in `store/index.ts`. The bootstrap component calls `adapter.listResumes()` on mount and seeds the store.

2. **Sample resume ID: stable vs. per-session UUID?**
   - What we know: D-17 says "On first load (no data in localStorage), the store initializes from this fixture."
   - What's unclear: Should `SAMPLE_RESUME.id` be the fixed string `'sample-alex-johnson'` (idempotent, easy to identify) or a new UUID on each first-load?
   - Recommendation: Fixed string. Once the user edits, a new UUID is assigned on next save (or we leave the sample ID — the adapter is resume-keyed, not user-keyed in M1). The plan should specify.

3. **Does Summary really need to be in Tiptap?**
   - What we know: D-04 lists `SummarySection` as a top-level node. UI-SPEC says Summary is "Tiptap prose area, min 120px."
   - What's unclear: Summary is a single `string` in `ResumeSchema.summary`. Why not a plain `<textarea>`? A Tiptap node adds complexity (paragraph-in-node serialization) for ~1 field.
   - Recommendation: Keep Summary in Tiptap for consistency with the "one editor" model AND to allow Phase 4 AI decorations on summary text. But note the tradeoff in the plan — if implementation gets hairy, a `<textarea>` fallback is acceptable (D-05 already precedents taking things OUT of Tiptap).

4. **Does the PDF preview need to show page breaks visibly, or just "what you'd export"?**
   - What we know: UI-SPEC shows an iframe-style preview of the PDF.
   - What's unclear: If the resume is 2 pages, does the preview show both? `usePDF` generates the whole blob, so `<iframe src={url}>` will paginate natively via browser PDF viewer.
   - Recommendation: Browser's native iframe PDF viewer handles pagination. No extra work.

5. **Tiptap extensions to use beyond StarterKit — do we need Underline, Link, Highlight?**
   - What we know: UI-SPEC does not mention any inline formatting toolbar or bubble menu. Resume bullets are plain text (D-07).
   - What's unclear: Will the Summary field want bold or italic? The UI-SPEC doesn't provide any inline formatting UI.
   - Recommendation: No bold/italic/link in Phase 2. Summary is plain text per D-07 logic (serializes cleanly). Disable all inline marks from StarterKit. If bold turns up as desirable, add in Phase 4 when suggestion decorations land.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js 16 runtime | ✓ | 24.9.0 | — (≥20 required) |
| pnpm | Package manager | ✓ | 10.33.0 | npm (11.6.0) available but pnpm is project default |
| Git | Version control | ✓ | Working | — |
| Inter TTF files | PDF template font registration | ✗ | — | **Must be obtained and placed in `/public/fonts/`.** Sources: (a) rsms.me/inter direct download, (b) `@fontsource/inter` npm package with post-install copy step, or (c) Google Fonts archive (manual download). No fallback — font is specified in D-12. If blocked, Helvetica (PDF default) works but is ugly. |
| `@react-pdf/renderer` native deps | PDF rendering | Installs cleanly on Node 24 | — | None needed |
| Tiptap / ProseMirror | Editor | Installs cleanly | — | None needed |

**Missing dependencies with no fallback:**
- Inter TTF files — the plan must include a task to obtain and commit these (or add `@fontsource/inter` and a prebuild step). Blocking for PDF-04 (polished template).

**Missing dependencies with fallback:**
- None.

**Corporate SSL interception:** Per STATE.md, `NODE_TLS_REJECT_UNAUTHORIZED=0` must prefix `pnpm dlx shadcn` commands. Regular `pnpm add` works without this in the current bash shell configuration. Verified via Phase 1 execution log.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 (already installed, Phase 1) |
| Config file | `vitest.config.ts` (exists, jsdom + globals + path aliases + localStorage mock) |
| Quick run command | `pnpm test -- --run <file>` |
| Full suite command | `pnpm test` (= `vitest run`) |
| Coverage command | `pnpm test:coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EDIT-01 | Tiptap editor renders structured sections | component (Testing Library) | `pnpm test -- src/__tests__/editor/resume-editor.test.tsx` | ❌ Wave 0 |
| EDIT-02 | Custom Node extensions enforce schema | unit | `pnpm test -- src/__tests__/tiptap/schema.test.ts` | ❌ Wave 0 |
| EDIT-03 | onUpdate → getJSON → Zustand sync | integration | `pnpm test -- src/__tests__/editor/sync.test.tsx` | ❌ Wave 0 |
| EDIT-04 | Add/edit/remove experience | unit (slice actions) | `pnpm test -- src/__tests__/store/resume-slice.test.ts` | ❌ Wave 0 (extend existing) |
| EDIT-05 | Add/edit/remove education | unit | same file | — |
| EDIT-06 | Add/edit/remove skills | unit | same file | — |
| EDIT-07 | Autosave every 10s | unit (with `vi.useFakeTimers()`) | `pnpm test -- src/__tests__/hooks/use-autosave.test.ts` | ❌ Wave 0 |
| PDF-01 | Debounce 800ms | unit | `pnpm test -- src/__tests__/hooks/use-debounced-value.test.ts` | ❌ Wave 0 |
| PDF-02 | Imperative pdf().toBlob() | smoke/integration (calls real library; may need `happy-dom` for Blob) | `pnpm test -- src/__tests__/pdf/export.test.tsx` | ❌ Wave 0 — **manual verification acceptable** (smoke difficulty: react-pdf rendering in jsdom is shaky) |
| PDF-03 | ATS-friendly PDF (single column, selectable) | manual | Open exported PDF, verify text is selectable, no images | — (manual-only) |
| PDF-04 | Template renders without errors | smoke | `pnpm test -- src/__tests__/pdf/template.test.tsx` | ❌ Wave 0 — **manual visual verification also required** |
| PDF-05 | No paywall; free export | manual | Click export; verify downloaded PDF has no watermark, all content is present | — (manual-only; can be asserted by "no export-gating code exists" via grep) |

### Sampling Rate
- **Per task commit:** `pnpm test` (full suite; project is small)
- **Per wave merge:** `pnpm test` + `pnpm build` (ensure Turbopack prod build succeeds)
- **Phase gate:** Full suite green + manual visual verification of editor + PDF preview + exported PDF before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/tiptap/schema.test.ts` — pure JSON↔sections mapper tests; no Tiptap runtime needed
- [ ] `src/__tests__/store/resume-slice.test.ts` — extend Phase 1 tests with new CRUD action assertions
- [ ] `src/__tests__/hooks/use-debounced-value.test.ts` — `vi.useFakeTimers()` + setTimeout assertions
- [ ] `src/__tests__/hooks/use-autosave.test.ts` — fake timers + adapter mock
- [ ] `src/__tests__/editor/resume-editor.test.tsx` — Testing Library smoke (mount + no crash)
- [ ] `src/__tests__/editor/sync.test.tsx` — simulate onUpdate firing, assert Zustand updated
- [ ] `src/__tests__/pdf/template.test.tsx` — smoke that `<ModernCleanTemplate resume={SAMPLE_RESUME} />` does not throw when rendered by `pdf()`. Verify via blob size > 0.
- [ ] Manual verification checklist for PDF-03, PDF-05 (checkbox in SUMMARY.md gate)

*(No framework install needed — Vitest already in place.)*

## Security Domain

Phase 2 is client-only, no auth, no server-side code, no secrets, no external APIs. Security surface is minimal. Applicable ASVS categories:

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — (Milestone 2 concern) |
| V3 Session Management | no | — (no session yet) |
| V4 Access Control | no | — (single-user local app) |
| V5 Input Validation | partial | Zod schemas on boundaries (localStorage read, Tiptap JSON → sections). Phase 1 already validates `ResumeSchema.safeParse` on adapter reads. Defer form-field validation UX to Phase 4. |
| V6 Cryptography | no | — `crypto.randomUUID()` for IDs only, no cryptographic secrets |
| V7 Error Handling and Logging | minimal | Avoid leaking stack traces in UI. Phase 2 has no toast system — failed autosave silently drops (acceptable for M1 local-only). ERRH-03 (storage full) is Phase 4. |
| V14 Configuration | minimal | Only config is `next.config.ts` + shadcn; no secret config needed |

### Known Threat Patterns for stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via contenteditable | Tampering | Tiptap / ProseMirror sanitize by default — content is a ProseMirror doc, not HTML. User input cannot inject scripts because the schema only allows declared node types and marks. [CITED: Tiptap docs — ProseMirror schema-driven sanitization] |
| XSS via PDF text interpolation | Tampering | `@react-pdf/renderer` `<Text>` renders as PDF text primitives, not HTML. No interpolation-based XSS surface. |
| Local storage tampering | Tampering | Out of scope (attacker-with-DevTools can edit localStorage; this is a physical-device threat model Phase 2 doesn't solve). |
| Prototype pollution via JSON.parse | Tampering | All localStorage reads go through Zod `safeParse` — rejects malformed objects. [VERIFIED: `LocalStorageAdapter.getResume` already does this] |
| PDF export XSS | Tampering | Inter TTF URL is same-origin (`/fonts/...`) — no external font loading, no CORS risk. Contact fields rendered as `<Text>` (PDF text, not HTML). |
| ReDoS via regex input | DoS | No user-supplied regex. Only fuzzy-match regex is in Phase 3 (keyword aliases). |

**Security posture:** Phase 2 adds no new security-sensitive surface beyond Phase 1. All data stays client-side. Zod validation remains the trust boundary. No new mitigations needed.

## Sources

### Primary (HIGH confidence)
- [Tiptap Next.js installation docs](https://tiptap.dev/docs/editor/getting-started/install/nextjs) — `immediatelyRender: false` requirement, `'use client'` directive, code examples
- [Tiptap Node API](https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new/node) — `Node.create`, content expressions, atom property
- [Tiptap Schema docs](https://tiptap.dev/docs/editor/core-concepts/schema) — group, content, inline, defining, isolating attributes
- [Tiptap StarterKit extension](https://tiptap.dev/docs/editor/extensions/functionality/starterkit) — list of included extensions + how to disable
- [Tiptap setContent command](https://tiptap.dev/docs/editor/api/commands/content/set-content) — `emitUpdate` option
- [React-pdf hooks documentation](https://react-pdf.org/hooks) — `usePDF` hook signature, instance shape, `update` function
- [React-pdf advanced docs](https://react-pdf.org/advanced) — `pdf(doc).toBlob()`, `PDFDownloadLink`, `BlobProvider`, on-the-fly rendering
- [React-pdf fonts documentation](https://react-pdf.org/fonts) — `Font.register`, TTF/WOFF-only limitation, URL or absolute-path source
- [Next.js 16 serverExternalPackages docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages) — verified locally in `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/serverExternalPackages.md` — `@react-pdf/renderer` in default auto-opt-out list
- [Next.js 16 lazy loading docs](https://nextjs.org/docs/app/guides/lazy-loading) — `ssr: false` option, Client-Component-only constraint
- Phase 1 source code (verified via direct file reads) — `src/types/resume.ts`, `src/lib/store/slices/resume-slice.ts`, `src/lib/storage/local-storage.ts`, `src/components/layout/desktop-layout.tsx`, `src/hooks/use-hydration.ts`
- `CLAUDE.md` §Technology Stack and §Key Configuration Notes — all version pins and SSR notes verified

### Secondary (MEDIUM confidence)
- [Liveblocks Tiptap best practices](https://liveblocks.io/docs/guides/tiptap-best-practices-and-tips) — confirmed via WebSearch
- [GitHub issue #5856: Tiptap SSR immediatelyRender requirement](https://github.com/ueberdosis/tiptap/issues/5856) — community confirmation
- [GitHub issue #2223: react-pdf Font.register local fonts in Next.js](https://github.com/diegomura/react-pdf/issues/2223) — confirmed `/public/fonts/...` pattern works
- [GitHub issue #1075: react-pdf Google Fonts not supported](https://github.com/diegomura/react-pdf/issues/1075) — confirms TTF-only loading
- [GitHub issue #2675: Font.register inside component causes usePDF to hang](https://github.com/diegomura/react-pdf/issues/2675) — side-effect module pattern
- [Zustand debounce discussion #1179](https://github.com/pmndrs/zustand/discussions/1179) — debounce-with-subscribe pattern
- [Tiptap v2-to-v3 migration guide](https://tiptap.dev/docs/guides/upgrade-tiptap-v2) — `BubbleMenu` import path change, `history` → `undoRedo`

### Tertiary (LOW confidence — noted for validation during execution)
- [Medium: NextJS 14 and react-pdf integration](https://benhur-martins.medium.com/nextjs-14-and-react-pdf-integration-ccd38b1fd515) — community tutorial, not official

## Metadata

**Confidence breakdown:**
- Standard stack (versions, compatibility): HIGH — verified via `npm view` on every package + installed Next.js docs + React 19 peer dep declarations
- Architecture patterns (Tiptap SSR, usePDF hook, Font.register): HIGH — official docs + Phase 1 scaffold inspected in detail
- Code examples (ModernCleanTemplate, useDebouncedValue, slice actions): MEDIUM-HIGH — patterns are sound and well-tested in the ecosystem, but the Tiptap node schema is specific enough to this resume use case that it will need real-world iteration in implementation
- Common pitfalls: HIGH — multiple community sources agree on each pitfall (hydration mismatch, setContent feedback loop, Font.register placement, SSR import)
- Assumptions (A6 particularly — zustand/persist vs. LocalStorageAdapter source of truth): MEDIUM — flagged as an open question the plan must resolve

**Research date:** 2026-04-22
**Valid until:** 2026-05-22 (30 days — Tiptap 3.x and react-pdf 4.x both appear stable; Next.js 16.2.x is the current minor line)

---

*Phase: 02-resume-editor-pdf*
*Research complete: 2026-04-22*
