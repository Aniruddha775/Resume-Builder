# Requirements: Rese

**Defined:** 2026-04-10
**Core Value:** Live ATS scoring that updates as you type, making resume optimization feel like a game instead of a chore.

## v1 Requirements

Requirements for Milestone 1 (core editor) and Milestone 2 (variants + backend).

### Foundation (FNDN)

- [ ] **FNDN-01**: Project scaffolded with Next.js 16, TypeScript, Tailwind CSS v4
- [ ] **FNDN-02**: Three-panel layout renders responsively (JD input | editor | score panel)
- [ ] **FNDN-03**: Zustand store initialized with domain slices (resume, jobDescription, keywords, score, ui)
- [ ] **FNDN-04**: Storage adapter interface defined with localStorage implementation
- [ ] **FNDN-05**: TypeScript types defined for all data models (Resume, JobDescription, KeywordSet, Keyword, ScoreResult)

### Editor (EDIT)

- [ ] **EDIT-01**: User can edit resume in structured sections (contact, summary, experience, education, skills) via Tiptap v3
- [ ] **EDIT-02**: Tiptap uses custom node extensions enforcing resume document structure
- [ ] **EDIT-03**: Editor state flows one-directionally to Zustand store via onUpdate -> getJSON()
- [ ] **EDIT-04**: User can add, edit, and remove experience entries with company, title, dates, and bullet points
- [ ] **EDIT-05**: User can add, edit, and remove education entries
- [ ] **EDIT-06**: User can add, edit, and remove skill categories and items
- [ ] **EDIT-07**: Autosave triggers every 10 seconds to localStorage

### Job Description (JDSC)

- [ ] **JDSC-01**: User can paste a job description into the left panel
- [ ] **JDSC-02**: On paste, one-time LLM API call extracts and categorizes keywords (hard requirements, preferred, tools, soft skills)
- [ ] **JDSC-03**: Extracted keywords display as color-coded chips grouped by category
- [ ] **JDSC-04**: Keyword extraction uses Vercel AI SDK with BYOK provider support (OpenAI, Claude, etc.)
- [ ] **JDSC-05**: Loading spinner shown during keyword extraction (2-5 seconds)

### ATS Scoring (SCORE)

- [ ] **SCORE-01**: ATS score (0-100) computes locally using 5-component weighted algorithm (hard reqs 0.35, preferred 0.20, tools 0.15, soft skills 0.10, formatting 0.20)
- [ ] **SCORE-02**: Score recalculates within 300ms after user stops typing (debounced)
- [ ] **SCORE-03**: Score panel shows matched keywords (green) and missing keywords (red)
- [ ] **SCORE-04**: Score panel shows per-category breakdown percentages
- [ ] **SCORE-05**: Keyword matching uses fuzzy alias dictionary (src/data/keyword-aliases.json)
- [ ] **SCORE-06**: Formatting compliance checks: single column, standard headings, parseable dates, text-selectable

### AI Suggestions (AISG)

- [ ] **AISG-01**: User can click "Suggest Improvements" to get AI-powered inline suggestions
- [ ] **AISG-02**: Suggestions include missing keyword placement and achievement rewrites
- [ ] **AISG-03**: User can accept or dismiss individual suggestions
- [ ] **AISG-04**: Suggestion generation is async and non-blocking (does not affect live scoring)

### PDF (PDF)

- [ ] **PDF-01**: Live PDF preview renders below or beside the editor, updating on resume changes (debounced 800ms)
- [ ] **PDF-02**: PDF rendered imperatively via @react-pdf/renderer pdf().toBlob() (not in React tree)
- [ ] **PDF-03**: User can export resume as ATS-friendly PDF (single column, text-selectable, standard headings, no images)
- [ ] **PDF-04**: At least 1 polished professional template (classic single-column)
- [ ] **PDF-05**: PDF export is free with no paywall or watermark

### Error Handling (ERRH)

- [ ] **ERRH-01**: App works without API key (manual editor + PDF export), AI features disabled with prompt to add key
- [ ] **ERRH-02**: LLM API failure shows error toast, scoring still works if keywords already extracted
- [ ] **ERRH-03**: Browser storage full triggers warning with JSON export backup option
- [ ] **ERRH-04**: App never blocks user from editing regardless of API status

### Auth & Storage (AUTH) -- Milestone 2

- [ ] **AUTH-01**: User can create account and log in (Better Auth with email/password + OAuth)
- [ ] **AUTH-02**: User session persists across browser refresh
- [ ] **AUTH-03**: User API key stored encrypted in database
- [ ] **AUTH-04**: Resume data persists in PostgreSQL via Drizzle ORM
- [ ] **AUTH-05**: Storage adapter swaps from localStorage to database without UI code changes

### Variants (VARNT) -- Milestone 2

- [ ] **VARNT-01**: User can create a master resume containing all experience and skills
- [ ] **VARNT-02**: User can add multiple job descriptions to generate per-job variants
- [ ] **VARNT-03**: AI generates tailored variant per job (selects experience, adjusts keywords, rewrites bullets)
- [ ] **VARNT-04**: Dashboard shows all variants with individual ATS scores sorted by score
- [ ] **VARNT-05**: User can click into any variant to edit in the three-panel editor
- [ ] **VARNT-06**: Variants use JSON Merge Patch (RFC 7396) over frozen master snapshot
- [ ] **VARNT-07**: User can re-sync variant from updated master with three-way merge conflict resolution
- [ ] **VARNT-08**: User can export individual variant PDFs or batch-export all

### Templates (TMPL) -- Milestone 2

- [ ] **TMPL-01**: At least 3 polished professional templates available
- [ ] **TMPL-02**: All templates are ATS-friendly (single column, standard headings)
- [ ] **TMPL-03**: User can switch between templates with live preview

### Import (IMPT) -- Milestone 2

- [ ] **IMPT-01**: User can import resume by pasting plain text
- [ ] **IMPT-02**: User can import/export resume as JSON
- [ ] **IMPT-03**: User can import resume from PDF (best-effort parsing with manual correction UI, beta quality)

### Accessibility (A11Y)

- [ ] **A11Y-01**: All interactive elements are keyboard navigable
- [ ] **A11Y-02**: Screen reader support for editor, score panel, and suggestions
- [ ] **A11Y-03**: Color indicators supplemented with text/icons (not color-only)
- [ ] **A11Y-04**: WCAG 2.1 AA compliance verified

## v2 Requirements

### Advanced Features

- **ADV-01**: DOCX export option (some ATS systems parse DOCX marginally better than PDF)
- **ADV-02**: Resume version history with diff view
- **ADV-03**: Collaborative editing (share resume for feedback)
- **ADV-04**: Hosted option with included AI credits (free tier: 5 jobs/month)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cover letter generation | Focus is "resume builder done perfectly," not a career suite |
| Interview preparation | Depth over breadth -- not a career platform |
| Application tracking | Not a job board, would dilute focus |
| LinkedIn optimization | Separate product concern |
| Job URL scraping ("shadow apply") | Deferred to future exploration after core proven |
| Mobile app | Web-first, responsive design sufficient |
| Real-time collaborative editing (v1) | High complexity, not core value |
| Offline mode | localStorage provides basic persistence, full offline deferred |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FNDN-01 | Phase 1 | Pending |
| FNDN-02 | Phase 1 | Pending |
| FNDN-03 | Phase 1 | Pending |
| FNDN-04 | Phase 1 | Pending |
| FNDN-05 | Phase 1 | Pending |
| EDIT-01 | Phase 2 | Pending |
| EDIT-02 | Phase 2 | Pending |
| EDIT-03 | Phase 2 | Pending |
| EDIT-04 | Phase 2 | Pending |
| EDIT-05 | Phase 2 | Pending |
| EDIT-06 | Phase 2 | Pending |
| EDIT-07 | Phase 2 | Pending |
| JDSC-01 | Phase 3 | Pending |
| JDSC-02 | Phase 3 | Pending |
| JDSC-03 | Phase 3 | Pending |
| JDSC-04 | Phase 3 | Pending |
| JDSC-05 | Phase 3 | Pending |
| SCORE-01 | Phase 3 | Pending |
| SCORE-02 | Phase 3 | Pending |
| SCORE-03 | Phase 3 | Pending |
| SCORE-04 | Phase 3 | Pending |
| SCORE-05 | Phase 3 | Pending |
| SCORE-06 | Phase 3 | Pending |
| AISG-01 | Phase 4 | Pending |
| AISG-02 | Phase 4 | Pending |
| AISG-03 | Phase 4 | Pending |
| AISG-04 | Phase 4 | Pending |
| ERRH-01 | Phase 4 | Pending |
| ERRH-02 | Phase 4 | Pending |
| ERRH-03 | Phase 4 | Pending |
| ERRH-04 | Phase 4 | Pending |
| A11Y-01 | Phase 4 | Pending |
| A11Y-02 | Phase 4 | Pending |
| A11Y-03 | Phase 4 | Pending |
| A11Y-04 | Phase 4 | Pending |
| AUTH-01 | Phase 5 | Pending |
| AUTH-02 | Phase 5 | Pending |
| AUTH-03 | Phase 5 | Pending |
| AUTH-04 | Phase 5 | Pending |
| AUTH-05 | Phase 5 | Pending |
| VARNT-01 | Phase 6 | Pending |
| VARNT-02 | Phase 6 | Pending |
| VARNT-03 | Phase 6 | Pending |
| VARNT-04 | Phase 6 | Pending |
| VARNT-05 | Phase 6 | Pending |
| VARNT-06 | Phase 6 | Pending |
| VARNT-07 | Phase 6 | Pending |
| VARNT-08 | Phase 6 | Pending |
| TMPL-01 | Phase 7 | Pending |
| TMPL-02 | Phase 7 | Pending |
| TMPL-03 | Phase 7 | Pending |
| IMPT-01 | Phase 7 | Pending |
| IMPT-02 | Phase 7 | Pending |
| IMPT-03 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 59 total
- Mapped to phases: 59
- Unmapped: 0

---
*Requirements defined: 2026-04-10*
*Last updated: 2026-04-13 after roadmap creation*
