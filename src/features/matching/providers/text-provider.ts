/**
 * Lexical Similarity & Bag-of-Words Provider
 * Implements tokenization, stopword filtering, Term Frequency (TF),
 * Cosine Similarity, and Bigram overlap bonus.
 */

export const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'was', 'are', 'were', 'i', 'my', 'in', 'on', 'at', 'to',
  'for', 'of', 'and', 'or', 'but', 'with', 'this', 'that', 'it', 'its', 'from',
  'by', 'as', 'into', 'about', 'which', 'have', 'has', 'had', 'be', 'been', 'being',
  'do', 'did', 'does', 'not', 'no', 'nor', 'so', 'yet', 'both', 'either', 'neither',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very',
  'just', 'how', 'what', 'where', 'when', 'who', 'why', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought', 'used',
]);

/**
 * Tokenize a string into lowercase words without punctuation and stopwords.
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

/**
 * Extract word bigrams from token list.
 */
export function extractBigrams(tokens: string[]): string[] {
  if (tokens.length < 2) return [];
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]}_${tokens[i + 1]}`);
  }
  return bigrams;
}

/**
 * Build term frequency map.
 */
export function buildTermFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  return tf;
}

/**
 * Compute cosine similarity between two term frequency maps.
 */
export function tfCosineSimilarity(
  tfA: Map<string, number>,
  tfB: Map<string, number>
): number {
  if (tfA.size === 0 || tfB.size === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const val of tfA.values()) {
    normA += val * val;
  }
  for (const val of tfB.values()) {
    normB += val * val;
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  for (const [term, countA] of tfA.entries()) {
    const countB = tfB.get(term);
    if (countB) {
      dotProduct += countA * countB;
    }
  }

  return dotProduct / (normA * normB);
}

/**
 * Computes direct lexical similarity between two text strings using:
 * 1. TF Cosine similarity (80% base weight)
 * 2. Bigram overlap bonus (up to 20%)
 * Returns a normalized value between 0 and 1.
 */
export function computeLexicalSimilarity(textA: string, textB: string): number {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  if (tokensA.length === 0 || tokensB.length === 0) {
    return 0;
  }

  const tfA = buildTermFrequency(tokensA);
  const tfB = buildTermFrequency(tokensB);

  const baseCosine = tfCosineSimilarity(tfA, tfB);

  // Bigram bonus
  const bigramsA = extractBigrams(tokensA);
  const bigramsB = extractBigrams(tokensB);

  let bigramBonus = 0;
  if (bigramsA.length > 0 && bigramsB.length > 0) {
    const setB = new Set(bigramsB);
    const commonBigrams = bigramsA.filter((b) => setB.has(b)).length;
    const totalBigrams = new Set([...bigramsA, ...bigramsB]).size;
    if (totalBigrams > 0) {
      bigramBonus = (commonBigrams / totalBigrams) * 0.2;
    }
  }

  const rawScore = baseCosine * 0.8 + bigramBonus;
  return Math.min(1.0, Math.max(0.0, rawScore));
}

/**
 * Fixed-size hash projection for lexical embedding vectors (512 dimensions)
 * Uses Murmur/DJB2-style 32-bit hash to map vocabulary tokens to vector coordinates
 * with L2 normalization. This allows direct cosineSimilarity(a, b) in vector space.
 */
export const LEXICAL_VECTOR_DIM = 512;

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function createLexicalVector(text: string): number[] {
  const vector = new Array<number>(LEXICAL_VECTOR_DIM).fill(0);
  const tokens = tokenize(text);
  if (tokens.length === 0) return vector;

  // Unigrams
  for (const token of tokens) {
    const idx = hashString(token) % LEXICAL_VECTOR_DIM;
    vector[idx] += 1.0;
  }

  // Bigrams (weighted 0.5 to balance unigrams)
  const bigrams = extractBigrams(tokens);
  for (const bg of bigrams) {
    const idx = hashString(bg) % LEXICAL_VECTOR_DIM;
    vector[idx] += 0.5;
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < LEXICAL_VECTOR_DIM; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < LEXICAL_VECTOR_DIM; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}

/**
 * Lexical provider conforming to EmbeddingProvider interface
 */
export class LexicalProvider {
  public readonly name = 'lexical' as const;

  public async embed(text: string): Promise<number[]> {
    return createLexicalVector(text);
  }

  public async batchEmbed(texts: string[]): Promise<number[][]> {
    return texts.map((text) => createLexicalVector(text));
  }
}
