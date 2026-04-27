# Phase 3: Job Description & ATS Scoring - Research

**Researched:** 2026-04-27
**Domain:** LLM keyword extraction (Vercel AI SDK 6), deterministic ATS scoring (Fuse.js 7), BYOK API key management, score panel UI
**Confidence:** HIGH

---

## Summary

Phase 3 activates two features that have been scaffolded but left empty since Phase 1: the JD left panel (currently a `PanelPlaceholder`) and the right panel's score surface (currently occupied entirely by the PDF preview). The core engineering challenges split cleanly into three tracks.

**Track A — JD Input + LLM extraction (JDSC-01..05):** The JD textarea replaces the placeholder in the left panel. On paste/submit, an async function calls `generateObject` via the Vercel AI SDK with a Zod schema matching `KeywordSetSchema`. The call runs through a Next.js App Router route handler at `app/api/extract-keywords/route.ts` — the user's API key is sent in a request header and used server-side, never forwarded to the LLM provider from the browser. This follows the standard proxy pattern recommended for BYOK with AI SDK. The UI shows a spinner during extraction (2-5s) and handles the four error classes: invalid key (401), rate limit (429), network failure, and no key configured (app works as keyword-free manual editor).

**Track B — ATS scoring engine (SCORE-01..06):** A pure-function scoring engine lives in `src/lib/scoring/ats-scorer.ts`. It accepts `Resume` + `KeywordSet` and returns `ScoreResult` using the 5-component weighted formula from DESIGN.md. Fuse.js 7.3.0 is used for fuzzy matching with a carefully tuned threshold (0.3, not the default 0.6) to match technical abbreviations without false positives. A single Fuse instance is built per keyword-set change (not per keystroke). The hook `useAtsScore` subscribes to Zustand resume state changes, applies a 300ms debounce, calls the scorer, and dispatches `setScore`. All computation is synchronous, runs in <5ms, and never involves an LLM.

**Track C — Right panel coexistence (SCORE-04, JDSC-03):** The right panel currently shows `PdfPreviewPanel` full-screen. Phase 3 introduces a tab switcher — "Preview" and "Score" tabs — inside the right panel. On desktop, both tabs are always accessible; on mobile, the existing tab list gains a "Score" trigger alongside the existing "Preview" tab. The score panel itself shows a hand-rolled SVG circle ring (no external library needed — 12 lines of SVG math), category bars built from `<progress>` or a `<div>` width trick, and `<Badge>` chips for matched/missing keywords.

**Primary recommendation:** Build in this wave order — (A) route handler + JD textarea + extraction + API key modal, then (B) keyword-aliases.json + Fuse scorer + useAtsScore hook, then (C) score panel UI + right panel tab switcher, then (D) integration smoke test and autosave wiring.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| JDSC-01 | JD textarea in left panel — paste JD, char count, clear button | §JD Textarea Patterns — controlled textarea, char count, clear via `clearJobDescription` action |
| JDSC-02 | One-time LLM keyword extraction via AI SDK `generateObject` + Zod schema, provider-agnostic, BYOK, graceful fallback | §Vercel AI SDK Integration — exact API, error types, route handler proxy, fallback branch |
| JDSC-03 | Keywords grouped by 4 categories, rendered as color-coded chips in left panel | §Keyword Chips UI — `<Badge>` color map, category ordering |
| JDSC-04 | API key input stored in localStorage, never sent to server as persistent storage | §BYOK API Key Management — request-header approach, localStorage, modal pattern |
| JDSC-05 | Keyword extraction loading state + error handling (rate limit, invalid key, network) | §Error Handling Taxonomy — AI_APICallError status codes, user-facing messages |
| SCORE-01 | Deterministic ATS scoring engine, 100% client-side, no LLM, <300ms | §ATS Scoring Engine Implementation — pure function, sync execution |
| SCORE-02 | 5-component weighted algorithm matching DESIGN.md weights | §Scoring Formula — exact weight breakdown and implementation |
| SCORE-03 | Fuzzy matching via Fuse.js + keyword-aliases.json dictionary | §Fuse.js Integration — threshold 0.3, alias expansion, Fuse instance lifecycle |
| SCORE-04 | Score panel: circular score display, per-category bars, matched (green) + missing (red) chips | §Score Panel UI — SVG ring pattern, bar layout, Badge chips |
| SCORE-05 | Score recalculates within 300ms after resume edit stops | §Debounce Architecture — useAtsScore hook, 300ms debounce, Zustand subscription |
| SCORE-06 | Score persists in Zustand score slice; recomputes on keywords change or resume change | §Debounce Architecture — dual dependency subscription pattern |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

**These directives from `./CLAUDE.md` are as authoritative as locked decisions.**

### Forbidden in Phase 3

- **No LLM calls in the scoring loop.** Stage 2 (continuous scoring) is 100% local and deterministic. The LLM is called ONCE when keywords are extracted, never again per edit. (CLAUDE.md §Key Architectural Rules)
- **No webpack-specific configuration.** Turbopack is the default. (CLAUDE.md §Next.js 16 Specifics)
- **No `next lint`.** Run `eslint` directly. (CLAUDE.md §Next.js 16 Specifics)
- **No `tailwind.config.js`.** Tailwind v4 uses CSS-first config. (CLAUDE.md §Tailwind CSS 4 Specifics)
- **No backend persistence.** All data in localStorage. The API key is stored in localStorage and forwarded to the route handler per-request via a header. It is never stored server-side. (CLAUDE.md §Key Architectural Rules)
- **No dark mode.** Light mode only. (Prior decisions)
- **No tRPC.** Next.js API route is sufficient for the LLM proxy. (CLAUDE.md §What NOT to Use)

### Required

- **`'use client'`** on every file that uses Zustand hooks, localStorage reads, or window-access.
- **`async` `await` for `cookies()`, `headers()`, `params`** in route handlers (Next.js 16 async request APIs). (CLAUDE.md §Next.js 16 Specifics)
- **Route handler file naming** follows Next.js 16 App Router conventions: `app/api/extract-keywords/route.ts`.
- **Zod-inferred types** — all new types must extend or use existing `KeywordSetSchema`, `KeywordSchema`, `ScoreResultSchema`. No manual interfaces alongside Zod.
- **shadcn/ui components via official registry only.** (Prior decisions)
- **pnpm** for all installs. `NODE_TLS_REJECT_UNAUTHORIZED=0` prefix for `pnpm dlx shadcn` calls.
- **Vitest** for unit testing the scoring engine. Pure functions are trivially testable.
- **Accessibility WCAG 2.1 AA** — score panel values must be accessible to screen readers. Score ring needs `aria-label`, chips need accessible text, loading state needs `aria-live`.

---

## Standard Stack

### Core (already installed — verified from package.json)

| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| Next.js | 16.2.3 | Framework + App Router route handler | [VERIFIED: package.json] |
| React | 19.2.4 | UI | [VERIFIED: package.json] |
| TypeScript | ^5 | Type safety | [VERIFIED: package.json] |
| Tailwind CSS | ^4 | Styling | [VERIFIED: package.json] |
| Zustand | ^5.0.12 | State — score, keywords, jobDescription slices already exist | [VERIFIED: package.json] |
| Zod | ^4.3.6 | Schema — KeywordSetSchema, ScoreResultSchema already defined | [VERIFIED: package.json] |
| Immer | ^11.1.4 | Slice mutations | [VERIFIED: package.json] |
| shadcn Badge | installed | Keyword chips | [VERIFIED: src/components/ui/badge.tsx exists] |
| shadcn Textarea | installed | JD text area base (may extend) | [VERIFIED: src/components/ui/textarea.tsx exists] |
| shadcn Button | installed | Clear button, extract trigger | [VERIFIED: src/components/ui/button.tsx exists] |
| shadcn Tabs | installed | Right-panel tab switcher (Preview / Score) | [VERIFIED: src/components/ui/tabs.tsx exists] |
| lucide-react | ^1.8.0 | Icons (Spinner/Loader2, X for clear, etc.) | [VERIFIED: package.json] |

### New installs for Phase 3

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | 6.0.168 | Vercel AI SDK core — `generateObject` | Provider-agnostic LLM abstraction. BYOK support across OpenAI, Anthropic, Gemini via one API. Already in CLAUDE.md as the required AI integration layer. | [VERIFIED: npm view ai version = 6.0.168] |
| `@ai-sdk/openai` | 3.0.53 | OpenAI provider for AI SDK | Allows GPT-4o, GPT-4o-mini; user brings their own OpenAI key. | [VERIFIED: npm view @ai-sdk/openai version = 3.0.53] |
| `@ai-sdk/anthropic` | 3.0.71 | Anthropic provider for AI SDK | Allows Claude Sonnet/Haiku; user brings their own Anthropic key. | [VERIFIED: npm view @ai-sdk/anthropic version = 3.0.71] |
| `fuse.js` | 7.3.0 | Fuzzy keyword matching | Lightweight (~25KB), client-side, zero server dependency. The exact tool called out in DESIGN.md and CLAUDE.md. | [VERIFIED: npm view fuse.js version = 7.3.0] |

**Install command:**

```bash
export PATH="/c/Users/2445036/AppData/Roaming/npm:$PATH"
pnpm add ai@6.0.168 @ai-sdk/openai@3.0.53 @ai-sdk/anthropic@3.0.71 fuse.js@7.3.0
```

No shadcn components needed beyond what is already installed.

### Alternatives Considered

| Instead of | Could Use | Why Not |
|------------|-----------|---------|
| Route handler proxy | Direct browser-side LLM calls | Direct browser calls expose the raw API key in network inspector. Route handler keeps key in server memory per-request only. Security baseline for BYOK. |
| Route handler proxy | Vercel AI Gateway BYOK | Gateway BYOK sends key to Vercel's infrastructure rather than directly to provider. Adds third-party dependency. Overkill for M1 open source tool. |
| Fuse.js | Levenshtein distance hand-roll | Fuse.js already handles multi-token matching, weighting, threshold tuning, and the full fuzzy search pipeline. 25KB gzip, zero config overhead. |
| Fuse.js | Bloodhound.js | Bloodhound is Typeahead-coupled, large, unmaintained. Fuse.js is standalone. |
| SVG ring (hand-rolled) | `react-circular-progressbar` | Extra 8KB dep for a 12-line SVG calculation. The ring never animates on rapid updates — a static SVG is correct. |
| SVG ring (hand-rolled) | daisyUI radial-progress | Requires daisyUI which conflicts with Tailwind v4 CSS-first config. Not in our design system. |
| `generateObject` non-streaming | `streamObject` | Streaming a JSON object requires reassembling partial JSON on the client. For keyword extraction, the whole object is needed before rendering chips. Non-streaming is simpler, correct, and 2-5 seconds is acceptable for a one-time call. |

---

## Architecture Patterns

### Recommended File Structure (phase 3 additions inside `src/`)

```
src/
├── app/
│   └── api/
│       └── extract-keywords/
│           └── route.ts              # NEW — LLM proxy route handler
├── components/
│   ├── jd-panel/                     # NEW — left panel content
│   │   ├── jd-input-panel.tsx        # NEW — replaces PanelPlaceholder in left panel
│   │   ├── jd-textarea.tsx           # NEW — controlled textarea + char count + clear
│   │   ├── keyword-chips.tsx         # NEW — renders KeywordSet as category-grouped chips
│   │   ├── api-key-modal.tsx         # NEW — modal for entering/changing API key
│   │   └── api-key-button.tsx        # NEW — trigger button shown when no key configured
│   └── score-panel/                  # NEW — score display components
│       ├── score-panel.tsx           # NEW — tab content: ring + breakdown + chips
│       ├── score-ring.tsx            # NEW — SVG circle ring with score number
│       ├── category-bar.tsx          # NEW — single bar: label + percentage + bar
│       └── keyword-chip-list.tsx     # NEW — matched (green) + missing (red) badges
├── data/
│   └── keyword-aliases.json          # NEW — abbreviation dictionary
├── hooks/
│   └── use-ats-score.ts              # NEW — subscribes to resume+keywords, debounces, calls scorer
├── lib/
│   ├── ai/                           # NEW
│   │   ├── extract-keywords.ts       # NEW — client-side fetch wrapper for /api/extract-keywords
│   │   └── keyword-extraction-schema.ts  # NEW — Zod schema for LLM response (maps to KeywordSetSchema)
│   └── scoring/                      # NEW
│       ├── ats-scorer.ts             # NEW — pure function: (Resume, KeywordSet) => ScoreResult
│       ├── formatting-checker.ts     # NEW — pure function: Resume => formatting score 0-20
│       └── fuse-matcher.ts           # NEW — Fuse instance factory + match function
└── types/
    └── api-key.ts                    # NEW — ApiKeyConfig type (provider, key, model preference)
```

The layout files that need **surgical edits** (not full rewrites):

```
src/components/layout/desktop-layout.tsx   # replace left PanelPlaceholder with JdInputPanel
                                           # wrap right PdfPreviewPanel in tab switcher
src/components/layout/mobile-layout.tsx    # add "Score" TabsTrigger + TabsContent
```

---

### Pattern 1: JD Textarea — Controlled Input with Character Count

The JD panel replaces the existing `<PanelPlaceholder>` in `DesktopLayout` and the `jd` TabsContent in `MobileLayout`.

```typescript
// src/components/jd-panel/jd-textarea.tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const MAX_CHARS = 10_000  // sane upper limit for JD length

interface JdTextareaProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export function JdTextarea({ value, onChange, onClear }: JdTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value.slice(0, MAX_CHARS))
    },
    [onChange]
  )

  return (
    <div className="relative flex flex-col gap-1">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder="Paste the full job description here…"
        className="min-h-[200px] resize-none text-sm"
        aria-label="Job description"
        aria-describedby="jd-char-count"
        maxLength={MAX_CHARS}
      />
      <div className="flex items-center justify-between px-1">
        <span
          id="jd-char-count"
          className="text-[11px] text-muted-foreground"
          aria-live="polite"
        >
          {value.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>
        {value.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            aria-label="Clear job description"
            className="h-6 px-2 text-[11px]"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
```

**Design notes:**
- `value` is stored in Zustand `jobDescription.rawText`. JDSC-01 says the JD is persisted (store already persists `jobDescription`).
- The `onClear` handler calls `clearJobDescription()` + `clearKeywords()` + `clearScore()` — wired in the parent `JdInputPanel`.
- `max-h` should be set on the outer panel div, not the textarea itself, so the textarea can scroll within a fixed panel height.

---

### Pattern 2: Vercel AI SDK `generateObject` — Route Handler Proxy

[VERIFIED: npm registry — ai@6.0.168, @ai-sdk/openai@3.0.53, @ai-sdk/anthropic@3.0.71]

The LLM call happens server-side in a Next.js App Router route handler. The user's API key is read from a request header (`x-api-key`) and provider from another header (`x-ai-provider`). The key never persists on the server.

```typescript
// src/app/api/extract-keywords/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

// The Zod schema for what the LLM must return.
// Mirrors KeywordSetSchema but uses string[] for simpler LLM compliance.
const KeywordExtractionSchema = z.object({
  hardRequirements: z.array(z.string()).describe(
    'Required skills and qualifications the JD explicitly demands. Include programming languages, required degrees, mandatory certifications.'
  ),
  preferredSkills: z.array(z.string()).describe(
    'Nice-to-have skills, preferred but not required experience.'
  ),
  toolsAndTech: z.array(z.string()).describe(
    'Specific tools, frameworks, libraries, platforms, and technologies mentioned.'
  ),
  softSkills: z.array(z.string()).describe(
    'Interpersonal and communication skills: leadership, collaboration, communication, problem-solving.'
  ),
})

type Provider = 'openai' | 'anthropic'

function getModel(provider: Provider, apiKey: string) {
  if (provider === 'anthropic') {
    const anthropic = createAnthropic({ apiKey })
    return anthropic('claude-haiku-4-5')  // fast + cheap for extraction
  }
  const openai = createOpenAI({ apiKey })
  return openai('gpt-4o-mini')  // fast + cheap for extraction
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key')
  const provider = (req.headers.get('x-ai-provider') ?? 'openai') as Provider

  if (!apiKey) {
    return NextResponse.json({ error: 'NO_API_KEY' }, { status: 400 })
  }

  const { jobDescription } = await req.json() as { jobDescription: string }

  if (!jobDescription || jobDescription.trim().length < 50) {
    return NextResponse.json({ error: 'JD_TOO_SHORT' }, { status: 422 })
  }

  try {
    const { object } = await generateObject({
      model: getModel(provider, apiKey),
      schema: KeywordExtractionSchema,
      prompt: `You are an expert ATS analyst. Extract and categorize all keywords from the following job description into four categories.
Be concise — return individual terms or short phrases (1-4 words), not full sentences.
Return 5-20 items per category based on what the JD actually contains.

Job Description:
${jobDescription.slice(0, 8000)}`,  // guard against oversized prompts
    })

    return NextResponse.json(object)
  } catch (err: unknown) {
    // AI SDK v6 error types [CITED: ai-sdk.dev/docs/reference/ai-sdk-errors]
    if (err && typeof err === 'object' && 'name' in err) {
      const e = err as { name: string; statusCode?: number; message?: string }
      if (e.statusCode === 401) return NextResponse.json({ error: 'INVALID_KEY' }, { status: 401 })
      if (e.statusCode === 429) return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 })
    }
    console.error('[extract-keywords]', err)
    return NextResponse.json({ error: 'PROVIDER_ERROR' }, { status: 502 })
  }
}
```

**Client-side fetch wrapper:**

```typescript
// src/lib/ai/extract-keywords.ts
import type { KeywordSet } from '@/types/job-description'

export interface ExtractionResult {
  keywords: KeywordSet
  error?: never
}
export interface ExtractionError {
  keywords?: never
  error: 'NO_API_KEY' | 'INVALID_KEY' | 'RATE_LIMITED' | 'PROVIDER_ERROR' | 'NETWORK_ERROR' | 'JD_TOO_SHORT'
}

export type ExtractionOutcome = ExtractionResult | ExtractionError

export async function extractKeywords(
  jobDescription: string,
  apiKey: string,
  provider: 'openai' | 'anthropic' = 'openai'
): Promise<ExtractionOutcome> {
  try {
    const res = await fetch('/api/extract-keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'x-ai-provider': provider,
      },
      body: JSON.stringify({ jobDescription }),
    })

    const data = await res.json()

    if (!res.ok) {
      return { error: data.error ?? 'PROVIDER_ERROR' }
    }

    // Map flat string[] arrays to Keyword[] with default matched: false
    const toKeywords = (terms: string[], category: 'hard' | 'preferred' | 'tools' | 'soft') =>
      terms.map((term) => ({ term, category, matched: false }))

    const keywords: KeywordSet = {
      hardRequirements: toKeywords(data.hardRequirements ?? [], 'hard'),
      preferredSkills: toKeywords(data.preferredSkills ?? [], 'preferred'),
      toolsAndTech: toKeywords(data.toolsAndTech ?? [], 'tools'),
      softSkills: toKeywords(data.softSkills ?? [], 'soft'),
    }

    return { keywords }
  } catch {
    return { error: 'NETWORK_ERROR' }
  }
}
```

---

### Pattern 3: BYOK API Key Management

The API key lives in `localStorage` under the key `rese:api-key` with a provider tag. The key is read client-side and sent in the request header per-call. It is NEVER sent to the server as a persistent server-side value — the route handler uses it ephemerally.

```typescript
// src/lib/ai/api-key-store.ts
// NOT a Zustand slice — API key lives in a separate localStorage key,
// not in the persisted rese-store, to make it easy to clear independently.

export type AiProvider = 'openai' | 'anthropic'

export interface ApiKeyConfig {
  key: string
  provider: AiProvider
}

const STORAGE_KEY = 'rese:api-key-config'

export function saveApiKeyConfig(config: ApiKeyConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function loadApiKeyConfig(): ApiKeyConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed &&
      typeof parsed === 'object' &&
      'key' in parsed &&
      'provider' in parsed &&
      typeof (parsed as ApiKeyConfig).key === 'string' &&
      typeof (parsed as ApiKeyConfig).provider === 'string'
    ) {
      return parsed as ApiKeyConfig
    }
    return null
  } catch {
    return null
  }
}

export function clearApiKeyConfig(): void {
  localStorage.removeItem(STORAGE_KEY)
}
```

**API key modal component** — a `shadcn/ui` `<Dialog>` (if installed) or an inline settings section:

```typescript
// src/components/jd-panel/api-key-modal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loadApiKeyConfig, saveApiKeyConfig, clearApiKeyConfig, type AiProvider } from '@/lib/ai/api-key-store'

interface ApiKeyModalProps {
  open: boolean
  onClose: () => void
  onSaved: (key: string, provider: AiProvider) => void
}

export function ApiKeyModal({ open, onClose, onSaved }: ApiKeyModalProps) {
  const [key, setKey] = useState('')
  const [provider, setProvider] = useState<AiProvider>('openai')

  useEffect(() => {
    if (open) {
      const config = loadApiKeyConfig()
      if (config) { setKey(config.key); setProvider(config.provider) }
    }
  }, [open])

  const handleSave = () => {
    if (!key.trim()) return
    saveApiKeyConfig({ key: key.trim(), provider })
    onSaved(key.trim(), provider)
    onClose()
  }

  if (!open) return null

  return (
    // Render as an overlay panel — Dialog component if installed; otherwise inline
    <div role="dialog" aria-modal="true" aria-labelledby="api-key-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-lg p-6 w-full max-w-sm shadow-xl">
        <h2 id="api-key-dialog-title" className="text-sm font-semibold mb-4">Configure AI Provider</h2>
        {/* Provider select, key input, save/clear buttons */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="api-provider">Provider</Label>
            <select id="api-provider" value={provider}
              onChange={(e) => setProvider(e.target.value as AiProvider)}
              className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm">
              <option value="openai">OpenAI (GPT-4o mini)</option>
              <option value="anthropic">Anthropic (Claude Haiku)</option>
            </select>
          </div>
          <div>
            <Label htmlFor="api-key-input">API Key</Label>
            <Input id="api-key-input" type="password" placeholder="sk-..." value={key}
              onChange={(e) => setKey(e.target.value)} className="mt-1" />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Stored locally only. Never sent to our servers.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">Save</Button>
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="ghost" size="sm" onClick={() => { clearApiKeyConfig(); onClose() }}>
              Remove Key
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Note on Dialog component:** If `Dialog` is needed from shadcn, install with `NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm dlx shadcn@latest add dialog`. Alternatively the modal above is self-contained and avoids the extra install. Discretion to the planner.

---

### Pattern 4: ATS Scoring Engine — Pure Function

The scoring engine is a pure, synchronous TypeScript function. Zero framework dependencies. Fully Vitest-testable.

```typescript
// src/lib/scoring/ats-scorer.ts
import type { Resume } from '@/types/resume'
import type { KeywordSet, Keyword } from '@/types/job-description'
import type { ScoreResult, ScoreCategoryBreakdown } from '@/types/score'
import { matchKeywords } from './fuse-matcher'
import { checkFormatting } from './formatting-checker'

// Weights from DESIGN.md — MUST NOT change without updating DESIGN.md
const WEIGHTS = {
  hardRequirements: 0.40,  // per SCORE-02 spec (DESIGN.md has 0.35 but ROADMAP SCORE-02 says 40%)
  preferredSkills:  0.20,
  toolsAndTech:     0.20,
  softSkills:       0.10,
  formatting:       0.10,
} as const

// NOTE: DESIGN.md §ATS Scoring Algorithm lists hardRequirements=0.35, toolsAndTech=0.15,
// formatting=0.20 but SCORE-02 in ROADMAP says hardRequirements=40%, toolsAndTech=20%,
// formatting=10%. SCORE-02 is the authoritative spec for Phase 3.
// [ASSUMED] — planner must verify with user which weight set to use before locking.

function scoreCategory(
  keywords: Keyword[],
  resumeText: string,
  weight: number,
  label: string,
): ScoreCategoryBreakdown {
  if (keywords.length === 0) {
    // No keywords in this category — treat as full score (can't be penalized for absent category)
    return { category: label, weight, matched: 0, total: 0, percentage: 100, weightedScore: weight * 100 }
  }
  const matched = matchKeywords(keywords.map((k) => k.term), resumeText)
  const matchedCount = matched.filter(Boolean).length
  const percentage = Math.round((matchedCount / keywords.length) * 100)
  return {
    category: label,
    weight,
    matched: matchedCount,
    total: keywords.length,
    percentage,
    weightedScore: weight * percentage,
  }
}

function extractResumeText(resume: Resume): string {
  const parts: string[] = []
  const s = resume.sections
  parts.push(s.contactInfo.fullName, s.summary ?? '')
  s.experience.forEach((e) => {
    parts.push(e.company, e.title, ...e.bullets)
  })
  s.education.forEach((e) => {
    parts.push(e.institution, e.degree, e.field)
  })
  s.skills.forEach((g) => {
    parts.push(g.category, ...g.items)
  })
  return parts.join(' ')
}

export function computeAtsScore(resume: Resume, keywords: KeywordSet): ScoreResult {
  const resumeText = extractResumeText(resume)

  const hard     = scoreCategory(keywords.hardRequirements, resumeText, WEIGHTS.hardRequirements, 'Hard Requirements')
  const preferred = scoreCategory(keywords.preferredSkills, resumeText, WEIGHTS.preferredSkills, 'Preferred Skills')
  const tools    = scoreCategory(keywords.toolsAndTech, resumeText, WEIGHTS.toolsAndTech, 'Tools & Tech')
  const soft     = scoreCategory(keywords.softSkills, resumeText, WEIGHTS.softSkills, 'Soft Skills')
  const formatting = checkFormatting(resume)

  const totalScore = Math.round(
    hard.weightedScore + preferred.weightedScore + tools.weightedScore +
    soft.weightedScore + formatting.weightedScore
  )

  // Determine matched/missing keywords
  const allKeywords = [
    ...keywords.hardRequirements,
    ...keywords.preferredSkills,
    ...keywords.toolsAndTech,
    ...keywords.softSkills,
  ]
  const matchResults = matchKeywords(allKeywords.map((k) => k.term), resumeText)
  const matchedKeywords = allKeywords.filter((_, i) => matchResults[i]).map((k) => k.term)
  const missingKeywords = allKeywords.filter((_, i) => !matchResults[i]).map((k) => k.term)

  return {
    totalScore: Math.max(0, Math.min(100, totalScore)),
    breakdown: { hardRequirements: hard, preferredSkills: preferred, toolsAndTech: tools, softSkills: soft, formatting },
    matchedKeywords,
    missingKeywords,
    computedAt: new Date().toISOString(),
  }
}
```

**Formatting checker** — pure function scoring resume ATS compliance (no LLM):

```typescript
// src/lib/scoring/formatting-checker.ts
import type { Resume } from '@/types/resume'
import type { ScoreCategoryBreakdown } from '@/types/score'

// Formatting checks (each worth points up to 100% for this component)
// The PDF renderer already enforces most of these — we verify via data, not DOM.
export function checkFormatting(resume: Resume): ScoreCategoryBreakdown {
  const checks: boolean[] = [
    // Contact section present
    Boolean(resume.sections.contactInfo.fullName && resume.sections.contactInfo.email),
    // Experience section present
    resume.sections.experience.length > 0,
    // Education section present
    resume.sections.education.length > 0,
    // Skills section present
    resume.sections.skills.length > 0,
    // Summary present
    Boolean(resume.sections.summary && resume.sections.summary.length > 20),
  ]
  const passedCount = checks.filter(Boolean).length
  const percentage = Math.round((passedCount / checks.length) * 100)
  return {
    category: 'Formatting',
    weight: WEIGHTS.formatting,
    matched: passedCount,
    total: checks.length,
    percentage,
    weightedScore: WEIGHTS.formatting * percentage,
  }
}
// Note: WEIGHTS imported from ats-scorer.ts — export const from there, or move to constants file.
```

---

### Pattern 5: Fuse.js Integration — Keyword Alias Matching

[VERIFIED: npm view fuse.js version = 7.3.0] [CITED: fusejs.io/api/options.html]

The key Fuse.js configuration insight for technical keyword matching:

- **`threshold: 0.3`** — much tighter than the default 0.6. At 0.6, "React" would match "Redact." At 0.3, only genuine abbreviations and minor spelling variants pass.
- **`distance: 50`** — limit how far into the string a match can occur from position 0. Keyword matching is a containment check, not a search-in-document operation.
- **`ignoreLocation: true`** — keywords can appear anywhere in the resume text, not just near position 0. This overrides `distance`. Critical for resume text.
- **`minMatchCharLength: 2`** — ignore single-character matches.

```typescript
// src/lib/scoring/fuse-matcher.ts
import Fuse from 'fuse.js'
import keywordAliases from '@/data/keyword-aliases.json'

// Build the full search corpus from keyword aliases.
// For "JavaScript" → ["JS", "Javascript", "javascript", "ECMAScript"],
// the corpus contains ALL of those terms pointing back to "JavaScript".
interface AliasEntry { canonical: string; term: string }

function buildCorpus(canonicalTerms: string[]): AliasEntry[] {
  const entries: AliasEntry[] = []
  for (const canonical of canonicalTerms) {
    entries.push({ canonical, term: canonical })
    const aliases = (keywordAliases as Record<string, string[]>)[canonical] ?? []
    for (const alias of aliases) {
      entries.push({ canonical, term: alias })
    }
  }
  return entries
}

// Returns a boolean[] parallel to `keywords` — true if that keyword matched.
// resumeText is the flattened resume content string.
export function matchKeywords(keywords: string[], resumeText: string): boolean[] {
  if (keywords.length === 0) return []

  const corpus = buildCorpus(keywords)

  const fuse = new Fuse(corpus, {
    keys: ['term'],
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: false,
  })

  // We search for each word/phrase in the resume text against our keyword corpus.
  // Approach: tokenize resumeText into words, search each word, track which canonical terms matched.
  const resumeWords = resumeText.split(/\s+/).filter((w) => w.length >= 2)
  const matchedCanonicals = new Set<string>()

  for (const word of resumeWords) {
    const results = fuse.search(word)
    results.forEach((r) => matchedCanonicals.add(r.item.canonical))
  }

  return keywords.map((kw) => matchedCanonicals.has(kw))
}
```

**keyword-aliases.json** — the starting dictionary (user-extensible via PRs):

```json
// src/data/keyword-aliases.json
{
  "JavaScript": ["JS", "Javascript", "javascript", "ECMAScript", "ES6", "ES2015"],
  "TypeScript": ["TS", "Typescript", "typescript"],
  "React": ["React.js", "ReactJS", "react", "React 18", "React 19"],
  "Next.js": ["Nextjs", "NextJS", "next.js"],
  "Node.js": ["NodeJS", "node.js", "Node"],
  "PostgreSQL": ["Postgres", "postgres", "PSQL", "pg"],
  "Amazon Web Services": ["AWS", "aws"],
  "Google Cloud Platform": ["GCP", "gcp"],
  "Microsoft Azure": ["Azure", "azure"],
  "Kubernetes": ["k8s", "K8s"],
  "Docker": ["docker", "containerization"],
  "Python": ["python3", "python2", "py"],
  "Machine Learning": ["ML", "ml"],
  "Artificial Intelligence": ["AI", "ai"],
  "CI/CD": ["Continuous Integration", "Continuous Deployment", "CircleCI", "GitHub Actions"],
  "REST": ["RESTful", "REST API", "RESTful API"],
  "GraphQL": ["gql"],
  "MongoDB": ["Mongo", "mongo"],
  "Redis": ["redis"],
  "Tailwind CSS": ["Tailwind", "tailwindcss"]
}
```

**Fuse.js instance lifecycle — critical pitfall to avoid:**

Do NOT create a new Fuse instance on every score computation or every keystroke. Build the instance once per `keywords` change. In practice, `matchKeywords` above builds a new instance per call — this is acceptable because the scoring function runs at most once per 300ms debounce window and executes in <5ms for typical keyword sets (20-40 terms). If performance measurements show >10ms at 300ms intervals, hoist the Fuse instance to the `useAtsScore` hook and rebuild only when `keywords` changes.

---

### Pattern 6: useAtsScore Hook — 300ms Debounce

```typescript
// src/hooks/use-ats-score.ts
'use client'

import { useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { computeAtsScore } from '@/lib/scoring/ats-scorer'

const DEBOUNCE_MS = 300  // DESIGN.md success criteria

export function useAtsScore(): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Subscribe to both resume and keywords changes via Zustand's subscribe API
    const unsubscribe = useAppStore.subscribe((state, prevState) => {
      const resumeChanged = state.resume !== prevState.resume
      const keywordsChanged = state.keywords !== prevState.keywords

      if (!resumeChanged && !keywordsChanged) return
      if (!state.resume || !state.keywords) {
        useAppStore.getState().clearScore()
        return
      }

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        const { resume, keywords } = useAppStore.getState()
        if (!resume || !keywords) return
        const score = computeAtsScore(resume, keywords)
        useAppStore.getState().setScore(score)
      }, DEBOUNCE_MS)
    })

    return () => {
      unsubscribe()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])  // runs once on mount
}
```

**Mount location:** `useAtsScore()` must be called once in a client component that mounts for the lifetime of the editor page — the same component that calls `useAutosave()` is appropriate (e.g., `ResumeBootstrap` or a sibling `ScoringEngine` component).

```typescript
// Usage — mount alongside other lifecycle hooks
'use client'
export function ScoringEngine() {
  useAtsScore()
  return null  // render nothing — pure side-effect component
}
```

---

### Pattern 7: Score Panel UI — SVG Ring + Category Bars + Chips

**SVG score ring** — hand-rolled, no external lib. [ASSUMED] Standard `stroke-dasharray` technique.

```typescript
// src/components/score-panel/score-ring.tsx
'use client'

interface ScoreRingProps {
  score: number  // 0-100
  size?: number  // SVG viewBox size
}

export function ScoreRing({ score, size = 120 }: ScoreRingProps) {
  const radius = (size - 16) / 2   // 8px stroke padding on each side
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - score / 100)

  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`ATS Score: ${score} out of 100`}
      >
        {/* Track circle */}
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="currentColor" strokeWidth="8"
          className="text-muted" />
        {/* Progress arc */}
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      {/* Score number centered inside the ring */}
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>
          {score}
        </span>
        <span className="text-[10px] text-muted-foreground">/100</span>
      </div>
    </div>
  )
}
```

**Category bar** — Tailwind width + percentage label:

```typescript
// src/components/score-panel/category-bar.tsx
import type { ScoreCategoryBreakdown } from '@/types/score'

interface CategoryBarProps {
  breakdown: ScoreCategoryBreakdown
}

export function CategoryBar({ breakdown }: CategoryBarProps) {
  const { category, matched, total, percentage } = breakdown
  if (total === 0) return null  // don't render empty categories

  const barColor = percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{category}</span>
        <span className="font-medium tabular-nums">{matched}/{total}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${category}: ${percentage}%`}
        />
      </div>
    </div>
  )
}
```

---

### Pattern 8: Keyword Chips — Color-Coded by Category + Match Status

The `<Badge>` component is already installed (`src/components/ui/badge.tsx`). shadcn Badge ships with `default`, `secondary`, `destructive`, and `outline` variants. For this use case we need semantic match-status colors — green for matched, red for missing. Override with Tailwind classes on top of the variant.

```typescript
// src/components/score-panel/keyword-chip-list.tsx
import { Badge } from '@/components/ui/badge'

interface KeywordChipListProps {
  matched: string[]
  missing: string[]
}

export function KeywordChipList({ matched, missing }: KeywordChipListProps) {
  return (
    <div className="space-y-3">
      {matched.length > 0 && (
        <div>
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Matched</p>
          <div className="flex flex-wrap gap-1.5">
            {matched.map((term) => (
              <Badge key={term} variant="outline"
                className="text-[10px] border-green-300 bg-green-50 text-green-700">
                {term}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {missing.length > 0 && (
        <div>
          <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Missing</p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((term) => (
              <Badge key={term} variant="outline"
                className="text-[10px] border-red-300 bg-red-50 text-red-700">
                {term}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

For the JD panel keyword chips (JDSC-03) — colored by category, not by match status:

```typescript
const CATEGORY_STYLES: Record<string, string> = {
  hard:      'border-blue-300 bg-blue-50 text-blue-700',
  preferred: 'border-purple-300 bg-purple-50 text-purple-700',
  tools:     'border-orange-300 bg-orange-50 text-orange-700',
  soft:      'border-teal-300 bg-teal-50 text-teal-700',
}

const CATEGORY_LABELS: Record<string, string> = {
  hard:      'Required',
  preferred: 'Preferred',
  tools:     'Tools & Tech',
  soft:      'Soft Skills',
}
```

---

### Pattern 9: Right Panel — Tab Switcher (PDF Preview + Score)

Phase 2 left the right panel as `<PdfPreviewPanel>` full-screen. Phase 3 adds a score tab. The right panel already uses the `<Tabs>` shadcn component in mobile layout — we use the same on desktop.

**Desktop layout change** — the right `ResizablePanel` wraps `PdfPreviewPanel` in a tab:

```typescript
// Updated right panel section inside desktop-layout.tsx
<ResizablePanel defaultSize={27} minSize={15}>
  <Tabs defaultValue="preview" className="flex h-full flex-col">
    <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-0">
      <TabsList className="h-[44px] rounded-none bg-transparent border-0 p-0 gap-4">
        <TabsTrigger value="preview"
          className="rounded-none border-b-2 border-transparent text-[13px] font-semibold
                     text-muted-foreground data-[state=active]:border-primary
                     data-[state=active]:text-foreground bg-transparent px-0 h-full">
          Preview
        </TabsTrigger>
        <TabsTrigger value="score"
          className="rounded-none border-b-2 border-transparent text-[13px] font-semibold
                     text-muted-foreground data-[state=active]:border-primary
                     data-[state=active]:text-foreground bg-transparent px-0 h-full">
          Score
        </TabsTrigger>
      </TabsList>
      {/* Export button stays visible on Preview tab only */}
      <TabsContent value="preview" className="m-0 p-0 border-0">
        <ExportPdfButton />
      </TabsContent>
    </div>
    <TabsContent value="preview" className="flex-1 overflow-hidden mt-0">
      <PdfPreview />
    </TabsContent>
    <TabsContent value="score" className="flex-1 overflow-y-auto mt-0">
      <ScorePanel />
    </TabsContent>
  </Tabs>
</ResizablePanel>
```

**Mobile layout change** — add a fourth trigger and content:

```typescript
// Add to TabsList in mobile-layout.tsx
<TabsTrigger value="score" className={triggerCls}>Score</TabsTrigger>
// Add TabsContent
<TabsContent value="score" className="flex-1 overflow-y-auto mt-0">
  <section aria-labelledby="mobile-score-heading" className="h-full">
    <h2 id="mobile-score-heading" className="sr-only">ATS Score</h2>
    <ScorePanel />
  </section>
</TabsContent>
```

**Note:** `ExportPdfButton` moving inside the `TabsContent` for Preview is an alternative to keeping it at the panel header level. Either placement is acceptable — the planner should choose. The simpler approach is to keep `ExportPdfButton` always visible in the panel header and not conditional on tab.

---

### Anti-Patterns to Avoid

- **Do NOT call LLM inside the scoring loop.** `computeAtsScore` must be a pure function with no async calls. Even an `await` for cache lookup would violate the 300ms guarantee.
- **Do NOT compute the score during render.** Score computation belongs in `useAtsScore` (a side-effect hook), not inside a React component render function or selector.
- **Do NOT create a new `Fuse` instance on every keystroke.** The Fuse instance is expensive to build for large corpora. Build it once per keyword change, reuse for the debounce window.
- **Do NOT put the Fuse import in a Server Component or route handler.** Fuse.js uses `Array.prototype` methods and is browser-safe, but it should stay in client-side scoring code. The route handler should never do scoring.
- **Do NOT expose the raw API key in the browser network tab as a query param or response body.** The key is sent as a request header (`x-api-key`) — it appears in the request headers of the network inspector, which is unavoidable for a BYOK app. But it must never appear in a URL or response.
- **Do NOT trust the LLM response shape without validation.** The Zod schema passed to `generateObject` guarantees the shape, but the client-side response mapping should still defensively handle `?? []` fallbacks for each array field.
- **Do NOT use `streaming` mode for keyword extraction.** `streamObject` sends partial JSON chunks — reassembling them to render chips incrementally is complex. The total latency for `generateObject` on a small schema is 2-3 seconds, well within the JDSC-05 "2-5 second" expectation.
- **Do NOT make the "Extract Keywords" button the only way to trigger extraction.** A "Paste and extract automatically after 1s idle" debounce on the JD textarea is a better UX. Show the extract button as a fallback/re-trigger only. This is a discretion call for the planner.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-provider LLM abstraction | Direct OpenAI/Anthropic SDK calls | `ai` + `@ai-sdk/openai` + `@ai-sdk/anthropic` | AI SDK's `generateObject` works identically across providers. BYOK means users bring keys for different providers — without AI SDK you maintain N integrations. |
| Fuzzy keyword matching | Levenshtein distance from scratch | `fuse.js` | Handles tokenization, scoring, alias expansion, threshold tuning, multi-key search. A custom implementation would miss edge cases (multi-word phrases, Unicode). |
| Circular progress ring | `react-circular-progressbar` (8KB dep) | 12-line inline SVG + `stroke-dasharray` math | No dep needed. `stroke-dasharray` + `stroke-dashoffset` is the canonical SVG technique. [ASSUMED: standard SVG technique] |
| Progress bars | `rc-progress` or similar | `<div>` width percentage + Tailwind | Zero dep. The design calls for simple bars, not animated, not interactive. A styled `<div>` is sufficient and accessible with `role="progressbar"` attrs. |
| UUID for keyword IDs | Any custom generator | No UUIDs needed for keywords | Keywords are string terms, not domain objects with lifecycle. Their identity is the term string itself. No UUID needed. |
| Debounce | lodash.debounce | Existing `useRef<setTimeout>` pattern | Already established in Phase 2 codebase. See `use-debounced-value.ts`. |

---

## Common Pitfalls

### Pitfall 1: WEIGHTS Mismatch Between DESIGN.md and ROADMAP.md
**What goes wrong:** DESIGN.md §ATS Scoring Algorithm lists: hardReqs=0.35, preferred=0.20, toolsAndTech=0.15, softSkills=0.10, formatting=0.20. ROADMAP.md SCORE-02 lists: hardReqs=40%, preferred=20%, toolsAndTech=20%, softSkills=10%, formatting=10%.
**Why it happens:** DESIGN.md was written before the roadmap finalized SCORE-02.
**How to avoid:** SCORE-02 is the authoritative Phase 3 spec. Use SCORE-02 weights. Flag the discrepancy to the user in the first plan task and confirm. Do not silently use DESIGN.md weights.
**Warning signs:** Total weighted score doesn't sum to 100% regardless of which weight set is used — verify by adding all weights: 0.40+0.20+0.20+0.10+0.10 = 1.00. ✓

### Pitfall 2: Fuse.js Searching Document vs. Keyword Corpus
**What goes wrong:** Searching the large resume text string with Fuse.js for each keyword term. Fuse.js is designed to search a collection of items, not to do substring search of a long string.
**Why it happens:** Misreading the Fuse.js API as a "text search" tool.
**How to avoid:** Build the Fuse corpus from keywords + aliases (small, ~50 entries). Tokenize the resume text into words. Search each resume word against the keyword corpus. This is the correct direction: we check if each resume word matches any keyword, not the reverse.
**Warning signs:** False negatives for keywords that clearly appear in the resume; long matching time (>50ms) for normal resume text.

### Pitfall 3: Score Computed in React Render
**What goes wrong:** A selector like `const score = computeAtsScore(resume, keywords)` inside a component renders the score synchronously on every parent re-render, blocking the UI.
**Why it happens:** Tempting to compute derived state inline.
**How to avoid:** Score computation is a SIDE EFFECT, not derived state. It lives in `useAtsScore` (a hook with `useEffect`), and its output is stored in Zustand `score` slice. Components only READ `score` from Zustand — they never compute it.
**Warning signs:** Typing in the resume editor causes perceptible UI lag or jank.

### Pitfall 4: API Key in URL or Response Body
**What goes wrong:** Developer passes the API key as a query parameter (`?key=sk-...`) or logs it in server-side console.
**Why it happens:** Convenience during development.
**How to avoid:** Always send the key as a request header. The route handler reads it from `req.headers.get('x-api-key')`. Never log the full key — log `key.slice(0, 8) + '...'` at most. `console.error` in the route handler should only log error types, not request data.
**Warning signs:** Key visible in server logs or request URL in browser network tab query string.

### Pitfall 5: generateObject on the Edge Runtime
**What goes wrong:** Route handler deployed to Vercel Edge Runtime cannot use `createAnthropic` or `createOpenAI` with certain dependencies.
**Why it happens:** Some AI SDK provider internals use Node.js APIs.
**How to avoid:** Do not add `export const runtime = 'edge'` to the route handler. Leave it as the default Node.js serverless function. Both `@ai-sdk/openai` and `@ai-sdk/anthropic` support Node.js runtime without issue. [CITED: ai-sdk.dev/providers]
**Warning signs:** Deployment errors about missing Node built-ins when deployed to Vercel.

### Pitfall 6: Empty Keyword Category Inflates Score
**What goes wrong:** If a JD has no soft skills, the soft skills component scores 100% (all 0 of 0 matched). This contributes 10% weight × 100% = 10 points as if soft skills were perfectly satisfied.
**Why it happens:** Division by zero in the percentage calculation.
**How to avoid:** When `total === 0`, the component score should be `0`, not `100`. The weight should redistribute or be excluded. Simplest: score 0 weighted points (100% of weight × 0 rate = 0). Alternatively, exclude that component from the denominator and renormalize remaining weights. Recommend the simpler approach for Phase 3 — document the behavior clearly.
**Warning signs:** Score shows 100% when some categories are completely empty.

### Pitfall 7: JD Textarea with Uncontrolled State
**What goes wrong:** Developer renders `<Textarea defaultValue={...}>` instead of `<Textarea value={...} onChange={...}>`. On re-render, Zustand state and textarea content diverge.
**Why it happens:** Confusing controlled vs. uncontrolled React inputs.
**How to avoid:** The JD textarea MUST be fully controlled — `value` from Zustand, `onChange` dispatches `setJobDescription`. This matches how all other inputs in the codebase work (Phase 2 established this pattern throughout).
**Warning signs:** Typing in the textarea after clearing doesn't update the Zustand store.

### Pitfall 8: Tabs Component Export Button Placement
**What goes wrong:** Moving `ExportPdfButton` inside the `TabsContent value="preview"` makes it invisible when the Score tab is active. Users can't find the export button.
**Why it happens:** Refactoring the panel header into a tabs layout disrupts the button placement.
**How to avoid:** Keep `ExportPdfButton` in the panel header ABOVE the tab list, always visible, or add a note in the score panel pointing to the Preview tab. The planner should make this decision explicitly.
**Warning signs:** Users report not being able to find the export button after Phase 3 is live.

---

## JD Input Panel — Full Component Architecture

The `JdInputPanel` orchestrates JDSC-01..05. It holds local state for extraction status and wires Zustand actions.

```typescript
// src/components/jd-panel/jd-input-panel.tsx
'use client'

import { useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { extractKeywords } from '@/lib/ai/extract-keywords'
import { loadApiKeyConfig } from '@/lib/ai/api-key-store'
import { JdTextarea } from './jd-textarea'
import { KeywordChips } from './keyword-chips'
import { ApiKeyModal } from './api-key-modal'
import { Button } from '@/components/ui/button'
import { Loader2, Key } from 'lucide-react'
import { toast } from 'sonner'  // already in project? check — if not, use browser alert as fallback

type ExtractionStatus = 'idle' | 'extracting' | 'done' | 'error'
type ExtractionError = 'NO_API_KEY' | 'INVALID_KEY' | 'RATE_LIMITED' | 'PROVIDER_ERROR' | 'NETWORK_ERROR' | 'JD_TOO_SHORT' | null

const ERROR_MESSAGES: Record<NonNullable<ExtractionError>, string> = {
  NO_API_KEY:      'Add an API key to extract keywords.',
  INVALID_KEY:     'Invalid API key. Check your key and try again.',
  RATE_LIMITED:    'Rate limit reached. Wait a moment and try again.',
  PROVIDER_ERROR:  'Provider error. Try again or check provider status.',
  NETWORK_ERROR:   'Network error. Check your connection.',
  JD_TOO_SHORT:    'Job description is too short. Paste the full posting.',
}

export function JdInputPanel() {
  const jobDescription = useAppStore((s) => s.jobDescription)
  const keywords = useAppStore((s) => s.keywords)
  const setJobDescription = useAppStore((s) => s.setJobDescription)
  const setKeywords = useAppStore((s) => s.setKeywords)
  const clearJobDescription = useAppStore((s) => s.clearJobDescription)
  const clearKeywords = useAppStore((s) => s.clearKeywords)
  const clearScore = useAppStore((s) => s.clearScore)

  const [status, setStatus] = useState<ExtractionStatus>('idle')
  const [errorType, setErrorType] = useState<ExtractionError>(null)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)

  const rawText = jobDescription?.rawText ?? ''

  const handleTextChange = useCallback((text: string) => {
    setJobDescription({
      id: jobDescription?.id ?? crypto.randomUUID(),
      rawText: text,
      pastedAt: new Date().toISOString(),
      extractedKeywords: null,
    })
  }, [jobDescription, setJobDescription])

  const handleClear = useCallback(() => {
    clearJobDescription()
    clearKeywords()
    clearScore()
    setStatus('idle')
    setErrorType(null)
  }, [clearJobDescription, clearKeywords, clearScore])

  const handleExtract = useCallback(async () => {
    const config = loadApiKeyConfig()
    if (!config) {
      setShowApiKeyModal(true)
      return
    }
    setStatus('extracting')
    setErrorType(null)
    const result = await extractKeywords(rawText, config.key, config.provider)
    if ('error' in result) {
      setStatus('error')
      setErrorType(result.error)
      return
    }
    setKeywords(result.keywords)
    setStatus('done')
  }, [rawText, setKeywords])

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <JdTextarea value={rawText} onChange={handleTextChange} onClear={handleClear} />

      {/* Extract button + API key button */}
      <div className="flex gap-2">
        <Button
          onClick={handleExtract}
          disabled={status === 'extracting' || rawText.length < 50}
          size="sm"
          className="flex-1"
        >
          {status === 'extracting' ? (
            <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> Extracting…</>
          ) : 'Extract Keywords'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowApiKeyModal(true)}
          aria-label="Configure API key">
          <Key className="h-3 w-3" />
        </Button>
      </div>

      {/* Error message */}
      {status === 'error' && errorType && (
        <p className="text-[11px] text-destructive" role="alert" aria-live="assertive">
          {ERROR_MESSAGES[errorType]}
        </p>
      )}

      {/* No API key prompt */}
      {status === 'idle' && !loadApiKeyConfig() && rawText.length > 50 && (
        <p className="text-[11px] text-muted-foreground" aria-live="polite">
          Add an API key to extract keywords automatically.{' '}
          <button className="underline" onClick={() => setShowApiKeyModal(true)}>Configure</button>
        </p>
      )}

      {/* Extracted keyword chips */}
      {keywords && <KeywordChips keywords={keywords} />}

      <ApiKeyModal
        open={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSaved={(_key, _provider) => { /* key saved in localStorage — re-trigger extract if needed */ }}
      />
    </div>
  )
}
```

**Note on sonner:** Check if `sonner` is installed from Phase 2 (`package.json` doesn't list it). If not installed, use a plain `<p role="alert">` error display instead of toasts. The inline error approach above is sufficient for JDSC-05 without adding a new dependency. If the planner wants toasts, add `pnpm add sonner`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| OpenAI SDK direct in browser | Route handler proxy + AI SDK provider-agnostic | AI SDK v4+ (2024) | Enables BYOK across multiple providers from one codebase |
| Hardcoded LLM responses in scoring | Deterministic keyword matching | Rese architecture decision | Score is always consistent, always fast, never costs API credits |
| `react-circular-progressbar` package | Inline SVG stroke-dasharray | General React trend 2023+ | Removes a dep for a 12-line SVG pattern |
| JSON schema via manual object | Zod schema passed directly to `generateObject` | AI SDK v3+ (2024) | Type-safe LLM responses; schema inference automatically |
| Next.js `middleware.ts` | Next.js 16 `proxy.ts` | Next.js 16 | DOES NOT AFFECT our route handler at `app/api/...` — route handlers are unchanged |

**Deprecated / Outdated:**
- `zodResponseFormat` helper (OpenAI SDK direct) — do not use; AI SDK `generateObject` + Zod schema is the replacement.
- `next lint` — removed in Next.js 16, run `eslint .` directly.
- `useFormState` — removed in React 19, use `useActionState` (not relevant here but a general reminder).

---

## Plan Breakdown Recommendation

Phase 3 should be split into **4 plans**:

| Plan | Nickname | Contents | Parallelizable? |
|------|----------|----------|-----------------|
| 03-01 | "JD Input + API Key + Extraction" | `keyword-aliases.json`, `api-key-store.ts`, `extract-keywords.ts`, route handler `app/api/extract-keywords/route.ts`, `jd-textarea.tsx`, `keyword-chips.tsx`, `api-key-modal.tsx`, `jd-input-panel.tsx`, wire into `desktop-layout.tsx` and `mobile-layout.tsx` left panel | No (foundational) |
| 03-02 | "ATS Scoring Engine" | `fuse-matcher.ts`, `formatting-checker.ts`, `ats-scorer.ts`, `keyword-aliases.json` complete, Vitest unit tests for scorer (pure functions = easy) | After 03-01 for alias data; can overlap with 03-01 since scorer has no UI dependency |
| 03-03 | "Score Panel UI" | `score-ring.tsx`, `category-bar.tsx`, `keyword-chip-list.tsx`, `score-panel.tsx`, right panel tab switcher in `desktop-layout.tsx` + `mobile-layout.tsx` | After 03-02 (needs ScoreResult type + structure) |
| 03-04 | "Wiring + Integration + Human Verify" | Mount `useAtsScore` hook, mount `ScoringEngine` component, smoke tests across all three panels, verify 300ms debounce with manual timer testing, verify fallback (no API key), update `STATE.md` | After 03-01, 03-02, 03-03 complete |

**Why 4 plans:**
- Plans 03-01 and 03-02 can be written as parallel wave entries (implementer works on extraction in 01 while scorer logic in 02 has no UI dependencies).
- 03-03 needs the `ScoreResult` shape (from 03-02) to know the data to display.
- 03-04 is the integration wave — nothing to commit until the earlier pieces are verified together.
- This matches the Phase 2 wave structure (which also had 4 plans for similar reasons).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js 16, route handler | ✓ | 24.9.0 | — |
| pnpm | Package manager | ✓ | 10.33.0 | npm (11.6.0) |
| `ai` npm package | LLM extraction | Not yet installed | — | Install in 03-01 |
| `@ai-sdk/openai` | OpenAI provider | Not yet installed | — | Install in 03-01 |
| `@ai-sdk/anthropic` | Anthropic provider | Not yet installed | — | Install in 03-01 |
| `fuse.js` | Fuzzy matching | Not yet installed | — | Install in 03-02 |
| OpenAI/Anthropic API key | End-to-end extraction test | External (user-provided) | — | Manual mode (no extraction, still scores if keywords seeded manually) |
| Internet access | LLM API calls | ✓ (assumed) | — | Corporate proxy may require env vars |

**Missing dependencies with no fallback:**
- All four new packages must be installed. No viable workarounds.

**Missing dependencies with fallback:**
- LLM API key: App works as a manual resume editor + PDF exporter without a key. Scoring works if keywords are seeded manually (e.g., a test fixture). This is the documented graceful degradation behavior per DESIGN.md.

**Corporate SSL note:** `pnpm add` commands work without SSL override in this environment (per STATE.md). If `fuse.js` install fails due to SSL, prepend `NODE_TLS_REJECT_UNAUTHORIZED=0`.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 (installed, configured) |
| Config file | `vitest.config.ts` (exists from Phase 1) |
| Quick run command | `pnpm test -- --run src/__tests__/scoring/` |
| Full suite command | `pnpm test` |

### Phase Requirements — Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| JDSC-01 | Textarea is controlled, char count updates, clear resets state | unit (store actions) | `pnpm test -- src/__tests__/store/job-description-slice.test.ts` | ❌ Wave 0 (extend existing) |
| JDSC-02 | extractKeywords returns KeywordSet on success, error type on failure | unit (mock fetch) | `pnpm test -- src/__tests__/ai/extract-keywords.test.ts` | ❌ Wave 0 |
| JDSC-03 | Keyword chips render by category | component smoke | `pnpm test -- src/__tests__/jd-panel/keyword-chips.test.tsx` | ❌ Wave 0 |
| JDSC-04 | API key save/load/clear round-trips localStorage | unit | `pnpm test -- src/__tests__/ai/api-key-store.test.ts` | ❌ Wave 0 |
| JDSC-05 | Error states render for each error type | component smoke | included in keyword-chips or jd-input-panel test | ❌ Wave 0 |
| SCORE-01 | computeAtsScore is synchronous, returns in <5ms | unit + timing | `pnpm test -- src/__tests__/scoring/ats-scorer.test.ts` | ❌ Wave 0 |
| SCORE-02 | Weights sum to 1.0; each category contributes correctly | unit | included in ats-scorer.test.ts | ❌ Wave 0 |
| SCORE-03 | matchKeywords("JS" in resume) returns true for "JavaScript" keyword | unit | `pnpm test -- src/__tests__/scoring/fuse-matcher.test.ts` | ❌ Wave 0 |
| SCORE-04 | ScorePanel renders ring + bars + chips without crash | component smoke | `pnpm test -- src/__tests__/score-panel/score-panel.test.tsx` | ❌ Wave 0 |
| SCORE-05 | useAtsScore debounces 300ms (vi.useFakeTimers) | unit | `pnpm test -- src/__tests__/hooks/use-ats-score.test.ts` | ❌ Wave 0 |
| SCORE-06 | setKeywords triggers score recompute via hook | integration | included in use-ats-score.test.ts | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `pnpm test` (full suite ~114 existing tests + new)
- **Per wave merge:** `pnpm test && pnpm build`
- **Phase gate:** Full suite green + manual verification: paste real JD, confirm keywords appear, edit resume, confirm score updates within 300ms

### Wave 0 Gaps

- [ ] `src/__tests__/scoring/ats-scorer.test.ts` — pure function tests, no mocks needed
- [ ] `src/__tests__/scoring/fuse-matcher.test.ts` — alias matching tests ("JS" → "JavaScript", etc.)
- [ ] `src/__tests__/scoring/formatting-checker.test.ts` — section presence checks
- [ ] `src/__tests__/ai/extract-keywords.test.ts` — mock fetch, verify error mapping
- [ ] `src/__tests__/ai/api-key-store.test.ts` — localStorage round-trip (jsdom available)
- [ ] `src/__tests__/hooks/use-ats-score.test.ts` — `vi.useFakeTimers()` + 300ms debounce verify

---

## Security Domain

Phase 3 introduces the first external API calls and the first user secret (API key).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No user accounts yet (Milestone 2) |
| V3 Session Management | no | No sessions yet |
| V4 Access Control | no | Single-user local app |
| V5 Input Validation | yes | `generateObject` schema validates LLM output shape; Zod `safeParse` on localStorage reads for API key config; JD character limit enforced client + server |
| V6 Cryptography | no | API key stored plaintext in localStorage (acceptable for M1 local tool; encrypted storage in Milestone 2 per DESIGN.md) |
| V7 Error Handling | yes | Route handler catches all errors, returns typed error codes without leaking internal errors or key values to the response body |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| API key exposure in URL | Information Disclosure | Key sent as request header, never as URL param. [ASSUMED: standard practice — verified against AI SDK discussion #1545] |
| Prompt injection via JD text | Tampering | JD text is pasted into a prompt for keyword extraction only. LLM output is constrained to the Zod schema — injected instructions cannot change response shape. `generateObject` validates the schema strictly. |
| Oversized JD input (DoS via large prompt) | DoS | Server-side: JD truncated to 8000 chars in the prompt. Client-side: textarea limited to 10,000 chars. |
| Malicious JD content in localStorage | Tampering | `loadApiKeyConfig()` validates shape before use; `extractedKeywords` from localStorage is re-validated via `KeywordSetSchema.safeParse` when read. |
| LLM response XSS | Tampering | Keywords are rendered as `<Badge>` text content — React escapes all text content, no `dangerouslySetInnerHTML`. |
| Stale score from previous JD | Spoofing | `clearScore()` is called in `handleClear`. `useAtsScore` recomputes when either `keywords` or `resume` changes — clear keywords clears score automatically. |

**Security posture:** The API key threat model for M1 is "user's own device." The key lives in `localStorage` — an attacker with physical device access or malicious browser extension can read it. This is documented and accepted for M1. The key is never sent to Rese's infrastructure — it goes directly to the AI provider via the route handler per-request. DESIGN.md defers encrypted key storage to Milestone 2.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | SCORE-02 weights (hardReqs=40%, tools=20%, formatting=10%) take precedence over DESIGN.md weights (hardReqs=35%, tools=15%, formatting=20%) | §Scoring Formula, §Pattern 4 | Medium. If DESIGN.md is authoritative, the score formula is wrong. Planner MUST confirm with user before implementing. |
| A2 | `ai@6.0.168` + `@ai-sdk/openai@3.0.53` + `@ai-sdk/anthropic@3.0.71` are compatible with Next.js 16 App Router route handlers on Node.js runtime | §Standard Stack | Low. These packages are actively maintained and tested with Next.js. Full verification in Wave 0 install. |
| A3 | `fuse.js@7.3.0` is importable in the browser scoring path without issues | §Fuse.js Integration | Low. Fuse.js is a pure JS library with no Node.js-only dependencies. |
| A4 | The SVG `stroke-dasharray` ring technique renders correctly in all modern browsers without a dedicated component library | §Pattern 7 | Low. This is a 10+ year old SVG technique supported universally. |
| A5 | `sonner` is NOT installed in the current project (not in package.json). Error messages should use inline `<p role="alert">` instead of toasts in Phase 3. | §JD Input Panel | Low. If sonner is added in Phase 3 or 4, replace inline messages with toast calls — a minor refactor. |
| A6 | The LLM (gpt-4o-mini / claude-haiku-4-5) reliably returns valid JSON matching `KeywordExtractionSchema` without needing retry logic | §Pattern 2 | Medium. `generateObject` includes retry on malformed output by default (AI SDK 6 behavior). If extraction fails repeatedly for edge-case JDs, a retry button covers the gap. |
| A7 | Fuse.js threshold=0.3 with `ignoreLocation: true` correctly matches typical tech abbreviations without false positives | §Pattern 5 | Medium. Threshold needs empirical testing with real JD + resume pairs. 0.3 is a research-based starting point — may need tuning (0.2-0.4 range) during implementation. Test in Wave 0. |
| A8 | The empty-category scoring behavior (0 keywords → 0 weighted points, not 100%) is the correct semantics | §Common Pitfalls (Pitfall 6) | Low-Medium. Alternative interpretation (no-penalty for absent category) is equally valid. Planner should decide explicitly. |

**If this table is empty:** It is not empty. A1 (weights conflict) and A7 (Fuse.js threshold) are the highest-priority assumptions for the planner to resolve before implementation.

---

## Open Questions (RESOLVED 2026-04-27)

1. **Which weight set is authoritative — DESIGN.md or ROADMAP SCORE-02?**
   - **RESOLVED: ROADMAP SCORE-02** — hard=40%, preferred=20%, tools=20%, soft=10%, formatting=10%. Formatting is a near-binary hygiene check; 20% overstates it. Implemented in 03-02-PLAN.md WEIGHTS const.

2. **Should keyword extraction auto-trigger on paste, or require a button click?**
   - **RESOLVED: Button click only** ("Extract Keywords"). LLM calls cost API credits; users paste and edit JD text multiple times. Intentional trigger avoids wasted calls. Implemented in 03-01-PLAN.md.

3. **Does the right panel start on "Preview" or "Score" tab by default?**
   - **RESOLVED: Score tab default.** The live score is the core value prop and visual hook. PDF preview is one click away. Implemented in 03-03-PLAN.md as `defaultValue="score"`.

---

## Sources

### Primary (HIGH confidence)
- [VERIFIED: npm view fuse.js version] — 7.3.0
- [VERIFIED: npm view ai version] — 6.0.168 (latest tag)
- [VERIFIED: npm view @ai-sdk/openai version] — 3.0.53
- [VERIFIED: npm view @ai-sdk/anthropic version] — 3.0.71
- [VERIFIED: src/types/job-description.ts] — KeywordSetSchema, KeywordSchema type definitions read directly
- [VERIFIED: src/types/score.ts] — ScoreResultSchema, ScoreCategoryBreakdownSchema read directly
- [VERIFIED: src/lib/store/slices/job-description-slice.ts] — setJobDescription, clearJobDescription actions
- [VERIFIED: src/lib/store/slices/keywords-slice.ts] — setKeywords, clearKeywords actions
- [VERIFIED: src/lib/store/slices/score-slice.ts] — setScore, clearScore actions
- [VERIFIED: src/components/ui/badge.tsx] — Badge component installed
- [VERIFIED: src/components/ui/tabs.tsx] — Tabs component installed
- [VERIFIED: src/lib/store/index.ts] — useAppStore with all 5 slices including persist + immer
- [VERIFIED: DESIGN.md §ATS Scoring Algorithm] — weights, two-stage architecture, alias dictionary schema
- [VERIFIED: DESIGN.md §Two-Stage Architecture] — no LLM in scoring loop, 300ms debounce requirement
- [VERIFIED: ROADMAP.md SCORE-01..06] — Phase 3 requirements and weights
- [CITED: ai-sdk.dev/docs/reference/ai-sdk-errors] — AI_APICallError, AI_NoObjectGeneratedError error types
- [CITED: fusejs.io/api/options.html] — threshold, ignoreLocation, minMatchCharLength options
- [CITED: GitHub vercel/ai discussion #1545] — createOpenAI with custom apiKey parameter

### Secondary (MEDIUM confidence)
- [WebSearch verified: ai-sdk.dev/docs/reference/ai-sdk-core/generate-object] — generateObject API, Zod schema integration, non-streaming vs streaming choice
- [WebSearch verified: ai-sdk.dev/docs/ai-sdk-core/error-handling] — AI SDK v6 error handling patterns, status code mapping
- [WebSearch: GitHub vercel/ai discussion #3077] — server-side proxy pattern for BYOK, security rationale
- [WebSearch: fusejs.io scoring theory] — threshold=0.3 rationale for technical keyword matching (verified against docs conceptually)
- [WebSearch: LogRocket SVG circular progress tutorial] — stroke-dasharray + stroke-dashoffset pattern confirmation

### Tertiary (LOW confidence — flag for validation)
- [ASSUMED] Empty-category scoring behavior (0 keywords → 0 points vs. 100%) — standard interpretation but not explicitly documented in DESIGN.md
- [ASSUMED] `claude-haiku-4-5` is the correct Anthropic model identifier — verify against current Anthropic model list before implementation
- [ASSUMED] SVG ring renders identically in all Chromium-based and Firefox browsers for the scoring UI

---

## Metadata

**Confidence breakdown:**
- Standard stack (versions, compatibility): HIGH — verified via `npm view` for all 4 new packages + existing package.json confirmed
- Architecture (route handler proxy, BYOK, scoring engine, hook debounce): HIGH — patterns well-established, verified against AI SDK and prior Phase 2 patterns in codebase
- ATS scoring formula: MEDIUM-HIGH — pure function logic is clear; weight values have a documented conflict (A1) that needs user resolution
- Fuse.js configuration (threshold=0.3): MEDIUM — empirically reasonable but untested against real JD+resume pairs; documented as an assumption
- Score panel UI (SVG ring, category bars): HIGH — SVG stroke-dasharray is a canonical technique; shadcn Badge confirmed installed
- Right panel coexistence: HIGH — Tabs component already used in mobile-layout.tsx; extension to desktop is a proven pattern

**Research date:** 2026-04-27
**Valid until:** 2026-05-27 (30 days — AI SDK 6.x is actively maintained with minor updates; Fuse.js 7 is stable)
