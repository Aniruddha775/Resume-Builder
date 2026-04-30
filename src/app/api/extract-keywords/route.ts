import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

// Zod schema for what the LLM must return.
// Intentionally uses string[] (not Keyword[]) — the client maps to Keyword[] with matched: false.
const KeywordExtractionSchema = z.object({
  hardRequirements: z.array(z.string()).describe(
    'Required skills and qualifications explicitly demanded. Include programming languages, required degrees, mandatory certifications. 5-20 items.'
  ),
  preferredSkills: z.array(z.string()).describe(
    'Nice-to-have skills, preferred but not required experience. 3-15 items.'
  ),
  toolsAndTech: z.array(z.string()).describe(
    'Specific tools, frameworks, libraries, platforms, and technologies mentioned. 3-15 items.'
  ),
  softSkills: z.array(z.string()).describe(
    'Interpersonal and communication skills: leadership, collaboration, communication, problem-solving. 2-10 items.'
  ),
})

type Provider = 'openai' | 'anthropic'

function getModel(provider: Provider, apiKey: string) {
  if (provider === 'anthropic') {
    const anthropic = createAnthropic({ apiKey })
    return anthropic('claude-haiku-4-5')
  }
  const openai = createOpenAI({ apiKey })
  return openai('gpt-4o-mini')
}

// Do NOT add `export const runtime = 'edge'` — AI SDK providers require Node.js runtime.
// Default (Node.js serverless) is correct.

export async function POST(req: NextRequest) {
  // Read key from request header — never from URL or body — per BYOK security pattern.
  const apiKey = req.headers.get('x-api-key')
  const providerHeader = req.headers.get('x-ai-provider') ?? 'openai'
  const provider: Provider = providerHeader === 'anthropic' ? 'anthropic' : 'openai'

  if (!apiKey) {
    return NextResponse.json({ error: 'NO_API_KEY' }, { status: 400 })
  }

  let body: { jobDescription?: string }
  try {
    body = (await req.json()) as { jobDescription?: string }
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 })
  }

  const { jobDescription } = body

  if (!jobDescription || jobDescription.trim().length < 50) {
    return NextResponse.json({ error: 'JD_TOO_SHORT' }, { status: 422 })
  }

  try {
    const { object } = await generateObject({
      model: getModel(provider, apiKey),
      schema: KeywordExtractionSchema,
      prompt: `You are an expert ATS analyst. Extract and categorize all keywords from this job description into four categories.
Return individual terms or short phrases (1-4 words), not full sentences.
Return 5-20 items per category based on what the JD actually contains.

Job Description:
${jobDescription.slice(0, 8000)}`,
    })

    return NextResponse.json(object)
  } catch (err: unknown) {
    if (err && typeof err === 'object') {
      const e = err as { name?: string; statusCode?: number; message?: string }
      // Do NOT log the full key — never log request data
      console.error('[extract-keywords] error name:', e.name, 'status:', e.statusCode)
      if (e.statusCode === 401) {
        return NextResponse.json({ error: 'INVALID_KEY' }, { status: 401 })
      }
      if (e.statusCode === 429) {
        return NextResponse.json({ error: 'RATE_LIMITED' }, { status: 429 })
      }
    }
    return NextResponse.json({ error: 'PROVIDER_ERROR' }, { status: 502 })
  }
}
