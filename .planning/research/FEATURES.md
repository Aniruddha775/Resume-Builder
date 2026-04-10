# Feature Landscape

**Domain:** AI-powered resume builder (open source, ATS-optimized, multi-variant workflow)
**Researched:** 2026-04-10
**Overall confidence:** HIGH (based on competitor analysis, market research, and project context)

---

## Table Stakes

Features users expect from any modern resume builder in 2026. Missing any of these and users leave for Reactive Resume, ResumeLM, or a paid alternative.

| # | Feature | Why Expected | Complexity | Notes |
|---|---------|--------------|------------|-------|
| T1 | Structured resume editor with standard sections (Contact, Summary, Experience, Education, Skills) | Every competitor has this. Users expect to fill in sections, not write raw text. | Medium | Tiptap provides the extensible foundation. Sections must be reorderable. |
| T2 | Real-time PDF preview | OpenResume's signature feature. Users expect to see what they get as they type. | Medium | react-pdf/@react-pdf/renderer. Must update within ~500ms of edits. |
| T3 | ATS-friendly PDF export (single column, text-selectable, standard headings) | The entire point of a resume builder. 43% of ATS rejections come from formatting issues. | Medium | Text-based PDF is critical. Must be parseable by Workday, Greenhouse, Lever, iCIMS. Validate with manual ATS scanner spot-checks. |
| T4 | At least 1 polished, professional template | Reactive Resume has 12+. Users judge tools by visual quality within 10 seconds. A single high-quality template beats 5 mediocre ones. | Medium | Start with a clean single-column ATS-safe design. Modern minimalist style is most popular for 2026. |
| T5 | AI-powered content generation (bullet point rewriting, summary generation) | "AI is now table stakes" per 2026 market analysis. Even free tiers include AI features. Reactive Resume and ResumeLM both have this. | Medium | LLM API call for bullet rewrites, achievement quantification, summary drafts. BYOK model. |
| T6 | Job description keyword extraction | Core to any ATS optimization claim. Rezi, ResumeLM, Teal, and Jobscan all do this. | Medium | One-time LLM call on JD paste. Extract hard requirements, preferred skills, tools, soft skills. |
| T7 | ATS score / match score display | Rezi (23 checkpoints), ResumeLM (scoring system), Teal (match score). Users expect a number. Without it, "ATS optimization" feels empty. | Medium | Weighted scoring: hard reqs (0.35), preferred (0.20), tools (0.15), soft skills (0.10), formatting (0.20). The two-stage architecture (LLM extraction + local scoring) is already designed. |
| T8 | Missing keyword indicators | Every ATS tool shows what is missing. Users need actionable gaps, not just a score. | Low | Red/amber indicators for unmatched keywords. Group by category. Show which section could include them. |
| T9 | Autosave | Canva, Google Docs, and every modern editor autosave. Losing work is unforgivable. | Low | localStorage every 10 seconds (M1). Database persistence (M2). Visual "saved" indicator. |
| T10 | Free PDF export (no paywall) | The #1 complaint about resume builders is paywalled downloads. Rezi, Zety, Resume.io all charge. Open source competitors (Reactive Resume, OpenResume) are free. This is a dealbreaker. | Low | Export is always free. This is a core constraint of the project. |
| T11 | Responsive design (works on tablet/laptop) | Users edit resumes on various devices. Does not need mobile-native, but must not break on smaller screens. | Low | Tailwind responsive utilities. Three-panel collapses to stacked on smaller viewports. |
| T12 | Undo / Redo | Standard editor expectation. Users in search results explicitly expect full-session undo stacks. | Low | Tiptap has built-in undo/redo for text. Extend to section-level operations. |
| T13 | Graceful degradation without API key | Not all users will have an OpenAI/Claude key. The editor and PDF export must work fully without AI. | Low | Already a project constraint. AI features show "add API key" prompt when not configured. Core editing, templates, and export always work. |

---

## Differentiators

Features that set Rese apart from competitors. Not expected, but these are the reasons a user would choose Rese over Reactive Resume or ResumeLM.

| # | Feature | Value Proposition | Complexity | Notes |
|---|---------|-------------------|------------|-------|
| D1 | **Master resume + per-job variants workflow** | Nobody in open source does this. Job seekers apply to 10-30 jobs simultaneously. Today they manually tweak one file, losing track of versions. Rese maintains one master and generates optimized variants per JD. This is THE differentiator. Teal does something similar (paid, $9/mo) but it is not open source. | High | JSON Merge Patch (RFC 7396) for overrides. Three-way merge for re-sync conflicts. Dashboard with score-per-variant overview. Milestone 2 feature. |
| D2 | **Live ATS score that updates as you type** | Rezi has this (paid). Nobody in open source does. The visual feedback of a number going up as you edit turns resume writing from a chore into a game. This is the emotional hook. | Medium | Two-stage architecture: one-time LLM extraction + local deterministic scoring (<5ms recomputation). 300ms debounce. Already designed. |
| D3 | **Three-panel editor layout (JD | Editor | ATS Score)** | Most builders are two-panel (editor + preview). The three-panel layout with JD context always visible is unique UX. Users see the job requirements while editing, with live score feedback. | Medium | Responsive collapse for smaller screens. Panels resizable. JD panel shows extracted keywords as color-coded chips. |
| D4 | **Variant dashboard with per-job scores** | "SE @ Stripe: 87%. Backend @ Shopify: 72% (missing: Go, distributed systems)." At-a-glance view of application readiness across all target jobs. No open source competitor has this. | Medium | Table/card view with score, status, missing keywords summary. Sort by score, date, or status. Milestone 2 feature. |
| D5 | **AI inline suggestions for missing keywords** | Not just showing what is missing, but suggesting exactly where and how to add it. "Add 'Kubernetes' to your Company X experience: 'Deployed microservices on Kubernetes clusters...'" | Medium | LLM generates contextual suggestions per missing keyword. Inline decorations in Tiptap. One-click accept/dismiss. |
| D6 | **Fuzzy keyword matching with alias dictionary** | "JavaScript" matches "JS", "React.js" matches "React", "PostgreSQL" matches "Postgres". Avoids false negatives in ATS scoring. Most tools do exact match only. | Low | Ship keyword-aliases.json with common mappings. LLM can suggest new aliases at runtime. User-extensible via PRs. |
| D7 | **Honest ATS scoring (no fake guarantees)** | Competitors make inflated claims ("95% guaranteed to pass ATS"). Rese is transparent: score reflects keyword matching and formatting compliance against this specific JD. Honesty builds trust in the open source community. | Low | Clear scoring methodology documented. Score tooltip explains each component. No "guaranteed to pass" language. |
| D8 | **Batch PDF export for all variants** | Export all variant PDFs at once when applying to multiple jobs. Small feature, big time saver for power users managing 10+ applications. | Low | Zip download with filenames like "Resume - Company - Role.pdf". Milestone 2 feature. |
| D9 | **Resume import (paste, JSON, PDF parse)** | Reduces onboarding friction. Users with existing resumes should not need to re-type everything. PDF parsing is hard but even best-effort with a correction UI is valuable. | Medium | Plain text paste (M1), JSON import/export (M1-M2), PDF parse best-effort with manual correction (M2). PDF parsing is the hardest part. |

---

## Anti-Features

Features to deliberately NOT build. Each of these has been considered and rejected for specific reasons.

| # | Anti-Feature | Why Avoid | What to Do Instead |
|---|--------------|-----------|-------------------|
| A1 | Cover letter generation | Scope creep. "Resume builder done perfectly" beats "career suite done poorly." Reactive Resume does not have it. ResumeLM added it and it dilutes focus. | Revisit post-Milestone 2 only if user demand is overwhelming. Keep the product laser-focused on resumes. |
| A2 | Interview preparation features | Different product entirely. Requires different AI patterns, different UX, different mental model. | Out of scope. Link to external resources if users ask. |
| A3 | Application tracking dashboard (CRM-style) | Teal does this well at $9/mo. Building a job tracker is a separate product. The variant dashboard shows application readiness, not application status. | Variant dashboard shows scores and readiness. Status tracking (applied, interview, rejected) can be a future lightweight addition but never a full CRM. |
| A4 | LinkedIn profile optimization | Completely separate product concern. Different formatting rules, different content strategy, different target systems. | Out of scope entirely. |
| A5 | Job URL scraping / "shadow apply" mode | Considered and explicitly deferred in design review. Legal gray area (terms of service violations). Complex infrastructure. Distracts from core. | Deferred to future exploration after core is proven. Users paste JD text manually. |
| A6 | Mobile-native app | Web-first is sufficient. Resume editing on a phone is a terrible experience. Responsive web handles tablet use cases. | Responsive web design. Three-panel collapses gracefully on smaller screens. |
| A7 | Gamification (badges, streaks, leaderboards) | The live ATS score already provides the "game feel." Adding explicit gamification would cheapen a professional tool and feel gimmicky. | The score going up IS the game. Green/red indicators and progress bars provide all the dopamine needed. |
| A8 | Social features (share resumes publicly, community templates) | Reactive Resume has public resume links and analytics. This adds complexity (content moderation, privacy concerns, infrastructure) for minimal value in an open source resume builder. | Keep it a personal productivity tool. Users can share PDFs. Public links are a maybe-later for Milestone 3+. |
| A9 | Multi-column or creative template layouts | Multi-column layouts cause 23% of ATS parsing failures. Creative designs look nice but actively harm job seekers. | All templates are single-column, ATS-safe. Beauty comes from typography, spacing, and polish, not layout tricks. |
| A10 | DOCX export as primary format | DOCX has marginally better ATS parsing rates, but in 2026 all major ATS systems parse text-based PDFs reliably. Adding DOCX export introduces Word-specific formatting complexity. | PDF is the primary (and initially only) export. DOCX can be considered as a future addition if user demand is significant. |
| A11 | "Guaranteed ATS pass" marketing | Dishonest. ATS systems vary wildly (Workday, Greenhouse, Lever, iCIMS). No tool can guarantee passing. Competitors who claim this erode trust. | Honest scoring with transparent methodology. "This score measures keyword match against this job description" not "you will pass the ATS." |

---

## Feature Dependencies

```
T1  (Structured editor)
 |-> T2  (PDF preview: needs editor content to render)
 |-> T3  (PDF export: needs editor content + template)
 |-> T5  (AI content generation: needs editor sections to target)
 |-> T12 (Undo/redo: needs editor operations to track)
 |-> D5  (AI inline suggestions: needs editor with decoration support)

T6  (JD keyword extraction)
 |-> T7  (ATS score: needs extracted keywords to score against)
 |-> T8  (Missing keyword indicators: needs keyword match results)
 |-> D2  (Live scoring: needs keyword extraction + local scoring engine)
 |-> D6  (Fuzzy matching: enhances keyword extraction matching)
 |-> D5  (AI suggestions: needs missing keywords to suggest for)

T4  (Template)
 |-> T3  (PDF export: needs template to render)
 |-> T2  (PDF preview: needs template for visual output)

T7  (ATS score)
 |-> D2  (Live scoring: ATS score + real-time recomputation)
 |-> D4  (Variant dashboard: needs per-variant ATS scores)

D1  (Master resume + variants) -- Milestone 2
 |-> D4  (Variant dashboard: needs variant system to display)
 |-> D8  (Batch export: needs variants to export)
 |-> D9  (Resume import: feeds into master resume creation)

T9  (Autosave) is independent, applies to all editing contexts
T10 (Free export) is a constraint, not a dependency
T11 (Responsive design) is a constraint, applies globally
T13 (Graceful degradation) is a constraint on all AI features
```

### Critical path for Milestone 1:
```
T1 (editor) -> T4 (template) -> T2 (preview) + T3 (export)
     |
     +-> T6 (JD extraction) -> T7 (ATS score) -> D2 (live scoring)
                                    |
                                    +-> T8 (missing keywords)
                                    +-> D5 (AI suggestions)
```

### Critical path for Milestone 2:
```
Auth + Database -> D1 (master + variants) -> D4 (dashboard) -> D8 (batch export)
                          |
                          +-> D9 (resume import)
```

---

## MVP Recommendation

### Milestone 1 MVP (ship fast, validate core experience)

**Must ship:**
1. T1 - Structured resume editor (Tiptap, structured sections)
2. T2 - Real-time PDF preview
3. T3 - ATS-friendly PDF export
4. T4 - 1 polished professional template
5. T6 - JD keyword extraction (LLM one-time call)
6. T7 - ATS score display with breakdown
7. T8 - Missing keyword indicators
8. T9 - Autosave to localStorage
9. T10 - Free PDF export (constraint, not a feature to build)
10. T12 - Undo/redo
11. T13 - Graceful degradation without API key
12. D2 - Live ATS scoring (the visual hook)
13. D3 - Three-panel layout (the UX differentiator)
14. D6 - Fuzzy keyword matching (avoids false negatives that would make scoring feel broken)
15. D7 - Honest scoring methodology

**Should ship (M1 if time permits, otherwise early M2):**
- T5 - AI content generation (bullet rewrites, summary generation)
- D5 - AI inline suggestions for missing keywords
- T11 - Responsive design

**Defer to Milestone 2:**
- D1 - Master resume + variants (the big differentiator, needs backend)
- D4 - Variant dashboard
- D8 - Batch PDF export
- D9 - Resume import (paste + JSON in late M1 or early M2, PDF parse in M2)

### Milestone 1 validates:
- Does the three-panel layout feel right?
- Does live ATS scoring create the "game feel" described in the design doc?
- Is the ATS scoring algorithm honest and useful?
- Can users go from JD paste to optimized PDF in under 10 minutes?

### Milestone 2 validates:
- Does the multi-variant workflow solve the "10-30 applications" pain point?
- Is the three-way merge conflict resolution usable or confusing?
- Does resume import (especially PDF parse) work well enough to reduce friction?

---

## Feature Prioritization Matrix

Scores 1-5 for each dimension. Total = Impact + Differentiation + Urgency - Complexity.

| Feature | Impact (1-5) | Differentiation (1-5) | Urgency (1-5) | Complexity (1-5) | Total | Priority |
|---------|-------------|----------------------|---------------|------------------|-------|----------|
| T1 Structured editor | 5 | 1 | 5 | 3 | 8 | P0 - M1 |
| T2 PDF preview | 4 | 2 | 5 | 3 | 8 | P0 - M1 |
| T3 PDF export | 5 | 1 | 5 | 3 | 8 | P0 - M1 |
| T4 Template (1) | 5 | 1 | 5 | 3 | 8 | P0 - M1 |
| T6 JD extraction | 5 | 2 | 5 | 3 | 9 | P0 - M1 |
| T7 ATS score display | 5 | 3 | 5 | 3 | 10 | P0 - M1 |
| D2 Live ATS scoring | 5 | 5 | 5 | 3 | 12 | P0 - M1 |
| D3 Three-panel layout | 4 | 4 | 5 | 2 | 11 | P0 - M1 |
| T8 Missing keywords | 4 | 2 | 4 | 1 | 9 | P0 - M1 |
| T9 Autosave | 3 | 1 | 4 | 1 | 7 | P0 - M1 |
| T12 Undo/redo | 3 | 1 | 4 | 1 | 7 | P0 - M1 |
| D6 Fuzzy matching | 3 | 3 | 4 | 2 | 8 | P0 - M1 |
| T5 AI content gen | 4 | 2 | 3 | 3 | 6 | P1 - M1/M2 |
| D5 AI suggestions | 4 | 4 | 3 | 3 | 8 | P1 - M1/M2 |
| T11 Responsive | 3 | 1 | 3 | 2 | 5 | P1 - M1/M2 |
| D1 Master + variants | 5 | 5 | 4 | 5 | 9 | P0 - M2 |
| D4 Variant dashboard | 4 | 5 | 4 | 3 | 10 | P0 - M2 |
| D9 Resume import | 3 | 2 | 3 | 4 | 4 | P1 - M2 |
| D8 Batch export | 2 | 3 | 2 | 2 | 5 | P2 - M2 |
| More templates (3+) | 3 | 1 | 2 | 3 | 3 | P1 - M2 |

---

## Competitor Feature Analysis

### Feature Matrix

| Feature | Reactive Resume | ResumeLM | OpenResume | Rezi (paid) | Teal (paid) | **Rese (planned)** |
|---------|----------------|----------|------------|-------------|-------------|-------------------|
| **Open source** | Yes | Yes | Yes | No | No | **Yes** |
| **Free PDF export** | Yes | Yes | Yes | No ($29/mo) | No ($9/mo) | **Yes** |
| **Templates** | 12+ | Multiple | 1 | Multiple | Multiple | **1 (M1), 3+ (M2)** |
| **Drag-drop sections** | Yes | No | No | Yes | No | **No (reorder UI)** |
| **AI content generation** | Yes (OpenAI) | Yes (multi-model) | No | Yes | Yes | **Yes (BYOK)** |
| **JD keyword extraction** | No | Yes | No | Yes | Yes | **Yes** |
| **ATS scoring** | No | Basic | No (parser only) | Yes (23 checks) | Yes (match %) | **Yes (5 components)** |
| **Live score updates** | No | No | No | Yes | No | **Yes** |
| **Multi-variant workflow** | No | No | No | No | Sort of (versions) | **Yes (M2)** |
| **Variant dashboard** | No | Dashboard exists | No | No | Job tracker | **Yes (M2)** |
| **Master resume concept** | Multiple resumes | Base resume | Single resume | Single resume | Multiple resumes | **Yes (M2)** |
| **Resume import (PDF)** | No | No | Yes (parser) | No | Chrome ext | **Yes (M2, best-effort)** |
| **Resume import (JSON)** | Yes (JSON Resume) | No | No | No | No | **Yes** |
| **Fuzzy keyword matching** | No | Unknown | No | Unknown | Unknown | **Yes** |
| **Self-hostable** | Yes (Docker) | Yes | Yes (static) | No | No | **Yes** |
| **Multi-language UI** | Yes | No | No | No | No | **No (English first)** |
| **Auth / accounts** | Yes | Yes | No | Yes | Yes | **Yes (M2)** |
| **Public resume links** | Yes | No | No | No | No | **No (anti-feature)** |
| **Cover letters** | No | Yes | No | Yes | No | **No (anti-feature)** |
| **WCAG accessibility** | Partial | Unknown | Unknown | Partial | Partial | **Yes (AA target)** |
| **DOCX export** | No | No | No | Yes | Yes | **No (PDF only)** |
| **Dark mode** | Yes | Unknown | No | No | No | **Yes** |

### Competitive Positioning Summary

**vs Reactive Resume (main open source competitor):**
Reactive Resume wins on template count (12+ vs 1), drag-and-drop customization, multi-language support, public resume links, and resume analytics. Rese wins on ATS scoring (Reactive Resume has none), live score feedback, JD-based optimization, and the multi-variant workflow. Rese competes where Reactive Resume is weakest: intelligent optimization.

**vs ResumeLM (closest open source competitor):**
ResumeLM has AI + basic ATS scoring + base resume concept (similar to master resume). Rese differentiates with live scoring (ResumeLM is not real-time), the three-panel editor UX, fuzzy keyword matching, and the full variant override system with three-way merge. ResumeLM is the closest competitor in concept but Rese aims for significantly better execution.

**vs OpenResume (simplicity benchmark):**
OpenResume is client-side, privacy-first, minimal. Good resume parser. No AI, no ATS scoring. Rese takes OpenResume's client-first philosophy (M1 is localStorage-only) but adds the AI and scoring layer. OpenResume's parser is architectural inspiration for resume import.

**vs Rezi (paid benchmark):**
Rezi is the paid gold standard: live ATS scoring, 23 checkpoints, AI writing. Rese's goal is to match Rezi's core experience (live scoring + AI) in open source, then exceed it with the multi-variant workflow Rezi does not have. Key risk: Rezi has years of scoring algorithm refinement.

**vs Teal (workflow benchmark):**
Teal combines resume building, job tracking, and version control at $9/mo. Their "resume syncing" feature is conceptually similar to master resume + variants but is not as structured. Rese's variant system with explicit JD linkage and per-variant ATS scoring is a more focused solution to the multi-application workflow.

---

## Sources

- [Reactive Resume (official site)](https://rxresu.me/)
- [Reactive Resume GitHub](https://github.com/AmruthPillai/Reactive-Resume)
- [ResumeLM (official site)](https://resumelm.ca/)
- [ResumeLM GitHub](https://github.com/olyaiy/resume-lm)
- [OpenResume (official site)](https://www.open-resume.com/)
- [OpenResume GitHub](https://github.com/xitanggg/open-resume)
- [Rezi (official site)](https://www.rezi.ai/)
- [Teal (official site)](https://www.tealhq.com/)
- [5 Open-Source Resume Builders for 2026 (DEV Community)](https://dev.to/srbhr/5-open-source-resume-builders-thatll-help-get-you-hired-in-2026-1b92)
- [Best AI Resume Builders 2026 (Zapier)](https://zapier.com/blog/best-resume-builder/)
- [ATS Optimization Hub 2026 (ResumeAdapter)](https://www.resumeadapter.com/blog/ats-optimization-hub)
- [ATS-Friendly Resume Guide 2026 (OwlApply)](https://owlapply.com/en/blog/ats-friendly-resume-guide-2026-format-keywords-score-and-fixes)
- [Resume PDF vs Word Format 2026 (ATSPro)](https://atsproresumebuilder.com/blog/resume-pdf-vs-word-format)
- [Teal Resume Syncing Feature](https://www.tealhq.com/post/manage-multiple-resumes)
- [Reddit-recommended resume builders 2026 (PitchMeAI)](https://pitchmeai.com/blog/best-ai-resume-builder-reddit)
