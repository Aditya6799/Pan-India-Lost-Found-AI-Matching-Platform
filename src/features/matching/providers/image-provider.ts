/**
 * CLIP-compatible Vision Provider
 * Wraps external vision embedding APIs (e.g., CLIP, ViT, HuggingFace Inference API).
 * Strictly returns null and logs clearly when not configured — NEVER returns fake data.
 */

export interface VisionProvider {
  name: string;
  available: boolean;
  embedImageUrl(url: string): Promise<number[] | null>;
}

const imageEmbeddingCache = new Map<string, number[]>();

export class CLIPVisionProvider implements VisionProvider {
  public readonly name = 'clip-vision';
  public readonly available: boolean;
  private apiUrl?: string;
  private apiKey?: string;
  private hasLoggedWarning = false;

  constructor(apiUrl?: string, apiKey?: string) {
    this.apiUrl = apiUrl?.trim();
    this.apiKey = apiKey?.trim();
    this.available = Boolean(this.apiUrl && this.apiUrl.length > 0);
  }

  public async embedImageUrl(url: string): Promise<number[] | null> {
    if (!this.available || !this.apiUrl) {
      if (!this.hasLoggedWarning) {
        console.info(
          '[VisionProvider] VISION_EMBEDDING_API_URL not configured. Image embeddings disabled (vision unavailable).'
        );
        this.hasLoggedWarning = true;
      }
      return null;
    }

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return null;
    }

    const cached = imageEmbeddingCache.get(url);
    if (cached) {
      return cached;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(
          `[VisionProvider] Vision API responded with error status ${response.status}: ${errorText}`
        );
        return null;
      }

      const data = await response.json();
      // Handle various response envelopes: { embedding: [...] }, { vector: [...] }, or raw array [...]
      const vector: number[] =
        data?.embedding || data?.vector || (Array.isArray(data) ? data : null);

      if (!Array.isArray(vector) || vector.length === 0) {
        console.warn('[VisionProvider] Vision API returned invalid embedding structure.');
        return null;
      }

      // Normalize vector
      let norm = 0;
      for (let i = 0; i < vector.length; i++) {
        norm += vector[i] * vector[i];
      }
      norm = Math.sqrt(norm);

      const normalized = norm > 0 ? vector.map((v) => v / norm) : vector;
      imageEmbeddingCache.set(url, normalized);
      return normalized;
    } catch (err) {
      console.error('[VisionProvider] Network error communicating with Vision API:', err);
      return null;
    }
  }
}

/**
 * Unavailable vision provider fallback when vision is unconfigured
 */
export class NullVisionProvider implements VisionProvider {
  public readonly name = 'none';
  public readonly available = false;

  public async embedImageUrl(_url: string): Promise<number[] | null> {
    return null;
  }
}
