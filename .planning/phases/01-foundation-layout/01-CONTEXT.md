# Phase 1: Foundation & Layout - Context

**Gathered:** 2026-04-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Scaffold the Next.js project, define TypeScript types and Zustand state management, implement a responsive three-panel layout (JD input | resume editor | ATS score panel), and create a localStorage-backed storage adapter. No editor, scoring, or AI features — just the structural foundation.

</domain>

<decisions>
## Implementation Decisions

### Panel proportions & resizing
- **D-01:** Weighted panel proportions — ~25-30% JD panel, ~40-45% editor panel, ~25-30% score panel. Editor gets the most space since users spend most time there.
- **D-02:** Resizable dividers using `react-resizable-panels`. Users can drag to adjust proportions (e.g., shrink JD panel after pasting a short description).

### Responsive strategy
- **D-03:** Tabbed navigation on mobile/tablet — three tabs (JD, Editor, Score) with the editor as default active tab. No vertical stacking (wastes height). Each tab shows one panel at full width.
- **D-04:** Breakpoint: desktop (3-panel side-by-side) vs tablet/mobile (tabbed). Exact breakpoint at Claude's discretion.

### Visual direction
- **D-05:** Light mode only for Phase 1. Clean, minimal, professional aesthetic (think Linear/Notion). Dark mode deferred to a later polish phase.
- **D-06:** Neutral gray chrome. Color reserved for functional indicators — green for matched keywords, red for missing keywords (per DESIGN.md wireframe).
- **D-07:** Professional tone — users are building resumes, not using a toy. No playful/casual styling.

### Placeholder content
- **D-08:** Instructional text in each panel — "Paste a job description here" (left), "Your resume editor will appear here" (center), "ATS score will display here" (right). Clear labels that communicate each panel's purpose.
- **D-09:** No sample/mock resume data and no skeleton loading states — just clean instructional placeholders.

### Claude's Discretion
- Exact breakpoint pixel values for desktop vs tablet/mobile
- Panel minimum/maximum width constraints for resizable dividers
- Zustand slice internal structure and cross-slice communication patterns
- Storage adapter interface design (sync vs async, migration strategy)
- TypeScript type field-level details beyond what DESIGN.md specifies
- shadcn/ui component selection for tabs, layout primitives
- Exact spacing, typography scale, and color palette values

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project design
- `DESIGN.md` — Complete design document with data model, ATS scoring algorithm, wireframe, project structure, and implementation roadmap
- `DESIGN.md` §Core UX Flow — Wireframe showing three-panel layout with content roles per panel
- `DESIGN.md` §Project Structure — Suggested directory layout for src/

### Requirements
- `.planning/REQUIREMENTS.md` §Foundation (FNDN) — FNDN-01 through FNDN-05 acceptance criteria
- `.planning/PROJECT.md` §Constraints — License, cost, tech stack, accessibility constraints

### Tech stack
- `CLAUDE.md` §Technology Stack — Full version-pinned dependency list with rationale and configuration notes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, no existing code

### Established Patterns
- None — patterns will be established by this phase

### Integration Points
- This phase creates the foundation that Phase 2 (editor), Phase 3 (scoring), and Phase 4 (AI) build on
- Zustand stores and TypeScript types defined here are consumed by all downstream phases
- Storage adapter interface defined here swaps to database in Phase 5

</code_context>

<specifics>
## Specific Ideas

- App should feel like Linear or Notion — clean, minimal, professional
- Resizable panels so users can customize their workspace after pasting a JD
- Tabbed mobile experience keeps focus on one task at a time (matches the paste-then-edit-then-review workflow)

</specifics>

<deferred>
## Deferred Ideas

- Dark mode — future polish phase
- Keyboard shortcuts for panel switching — consider in Phase 4 (accessibility)

</deferred>

---

*Phase: 01-foundation-layout*
*Context gathered: 2026-04-13*
