# Rese

## What This Is

Rese is an open source AI-powered resume builder that combines beautiful UI, genuinely smart AI, and live ATS scoring with a unique master resume + per-job variants workflow. Users paste a job description, edit their resume in a three-panel editor with real-time ATS score feedback, and export clean ATS-friendly PDFs. Nobody in the open source space offers this specific combination.

## Core Value

Live ATS scoring that updates as you type, powered by a two-stage engine (one-time LLM keyword extraction + local deterministic scoring), making resume optimization feel like a game instead of a chore.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Three-panel editor layout (JD input | resume editor | ATS score panel)
- [ ] Job description keyword extraction via LLM API (one-time call on paste)
- [ ] Resume editor with structured sections (contact, summary, experience, education, skills)
- [ ] Live ATS scoring engine (deterministic, local, <5ms per recomputation)
- [ ] ATS score display with keyword match breakdown (matched/missing indicators)
- [ ] AI-powered inline suggestions for missing keywords and achievement rewrites
- [ ] Live PDF preview of resume
- [ ] ATS-friendly PDF export (single column, text-selectable, standard headings)
- [ ] At least 1 polished professional template (Milestone 1)
- [ ] Graceful degradation without API key (manual editor + PDF export still work)
- [ ] Fuzzy keyword matching with alias dictionary (JS/JavaScript, React/React.js)
- [ ] Autosave every 10 seconds to localStorage
- [ ] User authentication and persistent storage (Milestone 2)
- [ ] Master resume + per-job variant system with dashboard (Milestone 2)
- [ ] Variant override via JSON Merge Patch with three-way merge on re-sync (Milestone 2)
- [ ] At least 3 polished professional templates (Milestone 2)
- [ ] Resume import: plain text paste, JSON import/export, PDF parse best-effort (Milestone 2)
- [ ] WCAG 2.1 AA accessibility compliance

### Out of Scope

- Cover letter generation — focus is "resume builder done perfectly," not a career suite
- Interview preparation features — same reason, depth over breadth
- Application tracking dashboard — not a job board
- LinkedIn profile optimization — separate product concern
- Job URL scraping / "shadow apply" mode — deferred to future exploration after core is proven
- Mobile app — web-first, responsive design sufficient for now

## Context

- Greenfield project, empty repo, no existing code
- Builder is working at a company (intrapreneurship potential) but building this as a personal open source project
- Full design document exists at `DESIGN.md` in project root with data model, scoring algorithm, tech stack, wireframes, and implementation roadmap
- Competitive landscape: Reactive Resume (open source, good UI, basic AI), ResumeLM (open source, AI+ATS), OpenResume (client-side, real-time PDF), Rezi (paid, live ATS scoring). None combine all three strengths.
- The multi-variant workflow is the key differentiator that justifies Rese's existence alongside these competitors
- 99% of Fortune 500 use ATS systems, 70%+ of resumes get auto-rejected. Real market pain.

## Constraints

- **License**: MIT or similar — must be truly open source
- **Cost**: Zero paywall on core features (editor, scoring, PDF export). No bait-and-switch pricing.
- **AI API**: User brings own API key for v1 (BYOK). Hosted option with credits deferred to monetization phase.
- **ATS honesty**: No fake "95% guaranteed" claims. Score reflects real keyword matching and formatting compliance.
- **Tech stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Tiptap editor, react-pdf. See DESIGN.md for full stack.
- **Accessibility**: WCAG 2.1 AA compliance. Keyboard navigable, screen reader friendly.
- **Milestone 1 = no backend**: All data in localStorage. Backend added in Milestone 2.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Two-stage ATS scoring (LLM extraction + local scoring) | Live score requires <300ms response. LLM calls take 2-5s. Separate the expensive call (once) from the fast computation (every keystroke). | — Pending |
| Tiptap for resume editor | Extensible, supports inline decorations for AI suggestions, good React integration. Better than Slate for structured content. | — Pending |
| JSON Merge Patch (RFC 7396) for variant overrides | Standard spec, well-understood semantics for partial updates. Three-way merge for conflict resolution on re-sync. | — Pending |
| BYOK for AI in v1 | Avoids infrastructure cost and API key management complexity. Non-technical users lose AI features but core editor still works. | — Pending |
| Approach B: Master Resume + Job Variants | The multi-variant workflow is what makes Rese worth existing. Without it, Rese is just another resume editor. Build A first as milestone toward B. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-10 after initialization*
