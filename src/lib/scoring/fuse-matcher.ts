import Fuse from 'fuse.js'
import keywordAliases from '@/data/keyword-aliases.json'

type AliasMap = Record<string, string[]>

interface CorpusEntry {
  canonical: string
  term: string
}

const fuseCache = new Map<string, Fuse<CorpusEntry>>()

function buildCorpus(canonicalTerms: string[]): CorpusEntry[] {
  const aliasMap = keywordAliases as AliasMap
  const entries: CorpusEntry[] = []
  for (const canonical of canonicalTerms) {
    entries.push({ canonical, term: canonical })
    const aliases = aliasMap[canonical] ?? []
    for (const alias of aliases) {
      entries.push({ canonical, term: alias })
    }
  }
  return entries
}

function getFuse(keywords: string[]): Fuse<CorpusEntry> {
  const cacheKey = keywords.slice().sort().join('\0')
  const cached = fuseCache.get(cacheKey)
  if (cached) return cached
  const corpus = buildCorpus(keywords)
  const fuse = new Fuse(corpus, {
    keys: ['term'],
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: false,
  })
  fuseCache.set(cacheKey, fuse)
  return fuse
}

export function matchKeywords(keywords: string[], resumeText: string): boolean[] {
  if (keywords.length === 0) return []
  if (!resumeText.trim()) return keywords.map(() => false)

  const fuse = getFuse(keywords)

  const resumeTokens = resumeText
    .split(/[\s,;:|/\\()\[\]{}<>'"]+/)
    .filter((w) => w.length >= 2)

  const matchedCanonicals = new Set<string>()

  for (const token of resumeTokens) {
    const results = fuse.search(token)
    for (const result of results) {
      matchedCanonicals.add(result.item.canonical)
    }
  }

  return keywords.map((kw) => matchedCanonicals.has(kw))
}
