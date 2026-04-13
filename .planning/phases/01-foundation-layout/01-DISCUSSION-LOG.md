# Phase 1: Foundation & Layout - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-13
**Phase:** 01-foundation-layout
**Areas discussed:** Panel proportions & resizing, Responsive strategy, Visual direction, Placeholder content

---

## Panel proportions & resizing

| Option | Description | Selected |
|--------|-------------|----------|
| Equal thirds | Each panel gets ~33% width | |
| Weighted center (Recommended) | Editor ~40-45%, JD ~25-30%, Score ~25-30% | |
| Fixed widths | No resizing, static proportions | |

**User's choice:** Claude presented weighted center with resizable dividers as recommendation. User accepted ("lock them").
**Notes:** react-resizable-panels already in the tech stack. Users can shrink JD panel after pasting a short description.

---

## Responsive strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Stacked vertically | All three panels stack top-to-bottom | |
| Tabbed navigation (Recommended) | Three tabs with editor as default | |
| Collapsible sidebars | JD and score panels collapse to icons | |

**User's choice:** Tabbed navigation accepted. Editor is default active tab.
**Notes:** Stacking wastes height. Tabs match the natural workflow: paste JD, then edit, then check score.

---

## Visual direction

| Option | Description | Selected |
|--------|-------------|----------|
| Light mode, minimal (Recommended) | Clean professional look, Linear/Notion feel | |
| Dark mode default | Dark theme as primary | |
| Both modes from Phase 1 | Light + dark toggle | |

**User's choice:** Light mode only for Phase 1. Professional, minimal aesthetic.
**Notes:** Dark mode deferred. Color reserved for functional indicators (green matched, red missing per DESIGN.md).

---

## Placeholder content

| Option | Description | Selected |
|--------|-------------|----------|
| Instructional text (Recommended) | Clear labels describing each panel's purpose | |
| Sample resume data | Pre-filled mock data | |
| Empty shells | Blank panels with no content | |
| Skeleton loading states | Animated placeholder shapes | |

**User's choice:** Instructional text — communicates panel purpose without misleading.
**Notes:** No mock data (misleading), no empty shells (confusing).

---

## Claude's Discretion

- Exact breakpoint values, panel min/max constraints, Zustand internals, storage adapter design, TypeScript type details, shadcn/ui component selection, spacing/typography/colors

## Deferred Ideas

- Dark mode — future polish phase
- Keyboard shortcuts for panel switching — Phase 4 accessibility scope
