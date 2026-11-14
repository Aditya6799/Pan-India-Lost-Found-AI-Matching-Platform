import {
  VisionProvider,
  CLIPVisionProvider,
  NullVisionProvider,
} from '@/features/matching/providers/image-provider';

export type { VisionProvider };

let visionProviderInstance: VisionProvider | null = null;

/**
 * Returns vision embedding provider.
 * Supports external CLIP-compatible API when VISION_EMBEDDING_API_URL is set.
 * Returns NullVisionProvider and logs clearly when not configured — NEVER pretends.
 */
export function getVisionProvider(): VisionProvider {
  const apiUrl = process.env.VISION_EMBEDDING_API_URL;
  const apiKey = process.env.VISION_EMBEDDING_API_KEY;

  if (apiUrl && apiUrl.trim().length > 0) {
    if (!visionProviderInstance || !visionProviderInstance.available) {
      visionProviderInstance = new CLIPVisionProvider(apiUrl, apiKey);
    }
    return visionProviderInstance;
  }

  if (!visionProviderInstance || visionProviderInstance.available) {
    visionProviderInstance = new NullVisionProvider();
  }
  return visionProviderInstance;
}
