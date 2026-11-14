import crypto from 'crypto';
import { LexicalProvider } from '@/features/matching/providers/text-provider';

export interface EmbeddingProvider {
  name: 'openai' | 'lexical';
  embed(text: string): Promise<number[]>;
  batchEmbed(texts: string[]): Promise<number[][]>;
}

/**
 * In-memory embedding cache keyed by SHA-256 hash of text
 */
const embeddingCache = new Map<string, number[]>();

function getHashKey(prefix: string, text: string): string {
  return `${prefix}:${crypto.createHash('sha256').update(text.trim()).digest('hex')}`;
}

/**
 * Cosine similarity between two float vectors.
 * Returns normalized value between 0 and 1.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  const sim = dotProduct / (normA * normB);
  // Clamp between 0 and 1 (allowing small floating point deviations)
  return Math.min(1.0, Math.max(0.0, sim));
}

/**
 * OpenAI text-embedding-3-small provider
 */
export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  public readonly name = 'openai' as const;
  private apiKey: string;
  private lexicalFallback: LexicalProvider;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.lexicalFallback = new LexicalProvider();
  }

  public async embed(text: string): Promise<number[]> {
    const trimmed = text.trim();
    if (!trimmed) {
      return this.lexicalFallback.embed(text);
    }

    const cacheKey = getHashKey('openai-small', trimmed);
    const cached = embeddingCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: trimmed,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[OpenAIEmbeddingProvider] API error (${response.status}): ${errorText}. Falling back to lexical provider.`);
        return this.lexicalFallback.embed(trimmed);
      }

      const data = await response.json();
      const embedding: number[] = data?.data?.[0]?.embedding;
      if (!Array.isArray(embedding)) {
        throw new Error('Invalid embedding vector returned from OpenAI');
      }

      embeddingCache.set(cacheKey, embedding);
      return embedding;
    } catch (err) {
      console.error('[OpenAIEmbeddingProvider] Network/parsing failure, falling back to lexical provider:', err);
      return this.lexicalFallback.embed(trimmed);
    }
  }

  public async batchEmbed(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    const uncachedTexts: { index: number; text: string }[] = [];

    // Pre-populate with cache where available
    for (let i = 0; i < texts.length; i++) {
      const t = texts[i].trim();
      const cacheKey = getHashKey('openai-small', t);
      const cached = embeddingCache.get(cacheKey);
      if (cached) {
        results[i] = cached;
      } else {
        uncachedTexts.push({ index: i, text: t });
      }
    }

    if (uncachedTexts.length === 0) {
      return results;
    }

    try {
      const inputs = uncachedTexts.map((item) => item.text);
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: inputs,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI batch embedding failed: ${response.statusText}`);
      }

      const data = await response.json();
      const apiEmbeddings: Array<{ embedding: number[]; index: number }> = data?.data || [];

      for (let k = 0; k < uncachedTexts.length; k++) {
        const originalIndex = uncachedTexts[k].index;
        const emb = apiEmbeddings[k]?.embedding;
        if (emb) {
          const cacheKey = getHashKey('openai-small', uncachedTexts[k].text);
          embeddingCache.set(cacheKey, emb);
          results[originalIndex] = emb;
        } else {
          // Fallback single item
          results[originalIndex] = await this.lexicalFallback.embed(uncachedTexts[k].text);
        }
      }
    } catch (err) {
      console.warn('[OpenAIEmbeddingProvider] Batch API error, falling back to lexical batch:', err);
      const fallbackVectors = await this.lexicalFallback.batchEmbed(
        uncachedTexts.map((u) => u.text)
      );
      for (let k = 0; k < uncachedTexts.length; k++) {
        results[uncachedTexts[k].index] = fallbackVectors[k];
      }
    }

    return results;
  }
}

/**
 * Returns OpenAI provider if OPENAI_API_KEY is configured, else LexicalProvider.
 */
let providerInstance: EmbeddingProvider | null = null;

export function getEmbeddingProvider(): EmbeddingProvider {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    if (!providerInstance || providerInstance.name !== 'openai') {
      providerInstance = new OpenAIEmbeddingProvider(apiKey.trim());
    }
    return providerInstance;
  }

  if (!providerInstance || providerInstance.name !== 'lexical') {
    providerInstance = new LexicalProvider();
  }
  return providerInstance;
}
