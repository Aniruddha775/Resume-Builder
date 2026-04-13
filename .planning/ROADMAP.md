# Roadmap: Rese

## Overview

Rese delivers in two milestones: Milestone 1 (Phases 1-4) builds the core three-panel editor with live ATS scoring, AI suggestions, and PDF export -- all client-side with no backend. Milestone 2 (Phases 5-7) adds authentication, persistent storage, the master resume + per-job variant workflow that differentiates Rese, additional templates, and resume import. Each phase delivers a coherent, verifiable capability that builds on the previous one.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Layout** - Scaffold project, define types and state, render three-panel layout
- [ ] **Phase 2: Resume Editor & PDF** - Structured resume editing with live PDF preview and export
- [ ] **Phase 3: Job Description & ATS Scoring** - Keyword extraction from job descriptions with live deterministic scoring
- [ ] **Phase 4: AI Suggestions, Error Handling & Accessibility** - AI inline suggestions, graceful degradation, and WCAG compliance
- [ ] **Phase 5: Auth & Persistent Storage** - User accounts with database-backed resume storage
- [ ] **Phase 6: Variants & Dashboard** - Master resume with per-job variants and score dashboard
- [ ] **Phase 7: Templates, Import & Launch** - Additional templates, resume import, and open source readiness

## Phase Details

### Phase 1: Foundation & Layout
**Goal**: Users see a responsive three-panel layout with all data models and state management in place for downstream features
**Depends on**: Nothing (first phase)
**Requirements**: FNDN-01, FNDN-02, FNDN-03, FNDN-04, FNDN-05
**Success Criteria** (what must be TRUE):
  1. Running `npm run dev` serves a Next.js app with three distinct panels visible (JD input, editor area, score panel) on desktop viewports
  2. Panels reflow responsively on smaller screens (stacked or tabbed) without content clipping
  3. Zustand store exists with domain slices (resume, jobDescription, keywords, score, ui) and components can read/write to them
  4. TypeScript types for Resume, JobDescription, KeywordSet, Keyword, and ScoreResult are defined and importable
  5. A storage adapter interface exists with a working localStorage implementation that persists and retrieves data across page reloads
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD
- [ ] 01-03: TBD

**UI hint**: yes

### Phase 2: Resume Editor & PDF
**Goal**: Users can compose a structured resume and see a live PDF preview that updates as they type, with PDF export
**Depends on**: Phase 1
**Requirements**: EDIT-01, EDIT-02, EDIT-03, EDIT-04, EDIT-05, EDIT-06, EDIT-07, PDF-01, PDF-02, PDF-03, PDF-04, PDF-05
**Success Criteria** (what must be TRUE):
  1. User can type in structured resume sections (contact, summary, experience, education, skills) via a Tiptap editor that enforces document structure
  2. User can add, edit, and remove experience entries (company, title, dates, bullets), education entries, and skill categories
  3. A live PDF preview renders below or beside the editor, updating within ~800ms after the user stops typing
  4. User can click "Export PDF" and download an ATS-friendly PDF (single column, text-selectable, standard headings, no images) with no paywall or watermark
  5. Resume data autosaves to localStorage every 10 seconds and survives page reloads
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD
- [ ] 02-03: TBD

**UI hint**: yes

### Phase 3: Job Description & ATS Scoring
**Goal**: Users paste a job description, see extracted keywords, and watch a live ATS score update as they edit their resume
**Depends on**: Phase 2
**Requirements**: JDSC-01, JDSC-02, JDSC-03, JDSC-04, JDSC-05, SCORE-01, SCORE-02, SCORE-03, SCORE-04, SCORE-05, SCORE-06
**Success Criteria** (what must be TRUE):
  1. User can paste a job description into the left panel and see a loading spinner while keywords are extracted (2-5 seconds)
  2. Extracted keywords appear as color-coded chips grouped by category (hard requirements, preferred, tools, soft skills)
  3. ATS score (0-100) recalculates within 300ms after user stops typing, using the 5-component weighted algorithm entirely client-side
  4. Score panel shows matched keywords (green) and missing keywords (red) with per-category breakdown percentages
  5. Keyword matching uses a fuzzy alias dictionary so "JS" matches "JavaScript", "React.js" matches "React", etc.
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

**UI hint**: yes

### Phase 4: AI Suggestions, Error Handling & Accessibility
**Goal**: Users get AI-powered improvement suggestions, the app degrades gracefully without an API key, and all interactions are accessible
**Depends on**: Phase 3
**Requirements**: AISG-01, AISG-02, AISG-03, AISG-04, ERRH-01, ERRH-02, ERRH-03, ERRH-04, A11Y-01, A11Y-02, A11Y-03, A11Y-04
**Success Criteria** (what must be TRUE):
  1. User can click "Suggest Improvements" and receive inline suggestions for missing keyword placement and achievement rewrites, which can be individually accepted or dismissed
  2. App works fully as a manual editor with PDF export when no API key is configured; AI features show a prompt to add a key instead of breaking
  3. LLM API failures display an error toast without blocking editing or scoring (if keywords were already extracted)
  4. All interactive elements are keyboard navigable, score panel and suggestions are screen-reader accessible, and color indicators are supplemented with text or icons
  5. Storage-full conditions trigger a warning with a JSON export backup option; editing is never blocked regardless of API or storage status
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

**UI hint**: yes

### Phase 5: Auth & Persistent Storage
**Goal**: Users can create accounts and have their resume data persist in a database across devices
**Depends on**: Phase 4
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. User can create an account with email/password or OAuth and log in
  2. User session persists across browser refreshes without re-authentication
  3. Resume data persists in PostgreSQL via Drizzle ORM and loads on login
  4. User's API key is stored encrypted in the database
  5. The storage adapter swap from localStorage to database happens transparently -- all existing UI and editor code works without changes
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD
- [ ] 05-03: TBD

### Phase 6: Variants & Dashboard
**Goal**: Users can maintain a master resume and generate optimized per-job variants with a dashboard showing all variants and scores
**Depends on**: Phase 5
**Requirements**: VARNT-01, VARNT-02, VARNT-03, VARNT-04, VARNT-05, VARNT-06, VARNT-07, VARNT-08
**Success Criteria** (what must be TRUE):
  1. User can create a master resume containing all experience and skills, then add multiple job descriptions to generate per-job variants
  2. AI generates a tailored variant per job that selects relevant experience, adjusts keywords, and rewrites bullets
  3. Dashboard displays all variants with individual ATS scores sorted by score, and user can click into any variant to edit in the three-panel editor
  4. Variants use JSON Merge Patch (RFC 7396) over a frozen master snapshot, and user can re-sync a variant from an updated master with three-way merge conflict resolution
  5. User can export individual variant PDFs or batch-export all variants
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD
- [ ] 06-03: TBD

**UI hint**: yes

### Phase 7: Templates, Import & Launch
**Goal**: Users have template variety, can import existing resumes, and the project is ready for open source launch
**Depends on**: Phase 6
**Requirements**: TMPL-01, TMPL-02, TMPL-03, IMPT-01, IMPT-02, IMPT-03
**Success Criteria** (what must be TRUE):
  1. At least 3 polished professional templates are available, all ATS-friendly (single column, standard headings)
  2. User can switch between templates and see a live preview of how their resume looks in each
  3. User can import a resume by pasting plain text, importing/exporting JSON, or uploading a PDF (best-effort parsing with manual correction)
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD
- [ ] 07-03: TBD

**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Layout | 0/3 | Not started | - |
| 2. Resume Editor & PDF | 0/3 | Not started | - |
| 3. Job Description & ATS Scoring | 0/3 | Not started | - |
| 4. AI Suggestions, Error Handling & Accessibility | 0/3 | Not started | - |
| 5. Auth & Persistent Storage | 0/3 | Not started | - |
| 6. Variants & Dashboard | 0/3 | Not started | - |
| 7. Templates, Import & Launch | 0/3 | Not started | - |
