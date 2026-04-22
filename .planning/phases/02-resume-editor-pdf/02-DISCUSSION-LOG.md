# Phase 2: Resume Editor & PDF - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-22
**Phase:** 02-resume-editor-pdf
**Areas discussed:** PDF Preview Placement, Tiptap Editor Model, Section Management UX, PDF Template Style, Autosave Feedback, First Load Content

---

## PDF Preview Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Right panel (replaces Score placeholder) | PDF preview takes the right panel, which is currently a Score placeholder. Phase 3 decides how to share it with scoring. | ✓ |
| Center panel tabs (Edit / Preview) | Add tabs to the center panel so users switch between editing and previewing. Shrinks the writing surface. | |
| Center panel split (editor top, preview bottom) | Split the center panel vertically. Very cramped for both areas. | |

**User's choice:** Right panel (recommended approach accepted)
**Notes:** Phase 3 will decide how to co-locate Score and Preview in the right panel (tabs or toggle).

---

## Tiptap Editor Model

| Option | Description | Selected |
|--------|-------------|----------|
| Single editor, custom section nodes | One Tiptap instance with ProseMirror nodes per section type. Contact/date fields outside Tiptap as form inputs. | ✓ |
| Multiple focused editors (one per section) | Separate useEditor instances per section. Simpler schemas but coordination overhead. | |
| Hybrid: Tiptap for summary/bullets only | Contact, experience structure, education as forms; only prose content in Tiptap. | |

**User's choice:** Single editor with custom section nodes (recommended approach accepted)
**Notes:** Contact fields and date fields remain as conventional form inputs outside Tiptap. Bullet nodes serialize to `string[]` to stay compatible with the existing Zod type. Phase 4 AI decorations work within Tiptap.

---

## Section Management UX

| Option | Description | Selected |
|--------|-------------|----------|
| Inline buttons, no reorder | "Add Entry" at section bottom, delete icon on hover. No drag-to-reorder. | ✓ |
| Inline buttons with drag-to-reorder | Same as above but with drag handles. Adds complexity. | |
| Floating action buttons | Per-section floating "+" button. More visual noise. | |

**User's choice:** Inline buttons, no reorder in Phase 2 (recommended approach accepted)
**Notes:** Reordering deferred. Delete is immediate (no confirmation dialog).

---

## PDF Template Style

| Option | Description | Selected |
|--------|-------------|----------|
| Modern/clean (Inter, contemporary spacing) | Matches the app's Linear/Notion aesthetic. Inter font, generous whitespace, minimal section rules. | ✓ |
| Conservative/classic (serif, traditional layout) | Times New Roman-ish, horizontal rules, classic corporate resume feel. | |

**User's choice:** Modern/clean (recommended approach accepted)
**Notes:** Template must remain single-column and ATS-friendly. Consistent with Phase 1 visual direction (D-05, D-06, D-07).

---

## Autosave Feedback

| Option | Description | Selected |
|--------|-------------|----------|
| Brief "Saved ✓" flash in header | 2-second indicator appears in header when autosave fires. Subtle, not distracting. | ✓ |
| Silent save (no indicator) | No user feedback. Users may be anxious about data loss. | |
| Persistent "Last saved X ago" counter | Always-visible timestamp. Informative but visually noisy. | |

**User's choice:** Brief "Saved ✓" flash (recommended approach accepted)
**Notes:** Not a full toast notification — a subtle status chip in the header for ~2 seconds.

---

## First Load Content

| Option | Description | Selected |
|--------|-------------|----------|
| Sample resume pre-loaded | Editor opens with a realistic placeholder resume. PDF preview immediately visible. | ✓ |
| Blank editor | All fields empty on first load. PDF preview is empty until user types. | |

**User's choice:** Sample resume pre-loaded
**Notes:** User asked "AI will make the resume right?" — clarified that Phase 2 is manual, but pre-loading a sample resume achieves the same goal of making the editor feel alive on first open. Sample data stored in `src/data/sample-resume.ts`. Falls back to localStorage data if present.

---

## Claude's Discretion

- Exact Tiptap node schema internals (marks, attrs, serialization details)
- Tag vs comma-separated UX for skill items
- PDF template typography scale and spacing values
- PDF layout margins and dimensions
- Contact section placement relative to Tiptap editor
- ResumeSlice action additions for section CRUD

## Deferred Ideas

- Drag-to-reorder entries — Phase 2 insertion order only
- Additional PDF templates — Phase 7
- AI-assisted initial resume generation — not in Milestone 1
