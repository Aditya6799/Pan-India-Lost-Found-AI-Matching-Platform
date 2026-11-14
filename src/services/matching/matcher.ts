import { connectDB } from '@/lib/mongodb';
import { calculateDistance } from '@/lib/utils';
import ItemReport from '@/models/ItemReport';
import Match from '@/models/Match';
import Notification from '@/models/Notification';
import {
  getEmbeddingProvider,
  cosineSimilarity,
} from '@/services/ai/embedding';
import { getVisionProvider } from '@/services/ai/vision';
import {
  tokenize,
  extractBigrams,
  computeLexicalSimilarity,
} from '@/features/matching/providers/text-provider';
import type {
  IItemReport,
  ConfidenceLevel,
  MatchingProvider,
} from '@/types';

export const MATCH_WEIGHTS = {
  text: 0.35,
  attribute: 0.20,
  image: 0.20,
  location: 0.15,
  date: 0.10,
};

// Renormalized weights when image is null (35/80, 20/80, 15/80, 10/80)
export const RENORMALIZED_WEIGHTS_NO_IMAGE = {
  text: 0.4375,
  attribute: 0.25,
  location: 0.1875,
  date: 0.125,
};

export interface MatchScore {
  textScore: number;          // 0-1
  imageScore: number | null;  // 0-1 or null if vision unavailable
  attributeScore: number;     // 0-1
  locationScore: number;      // 0-1
  dateScore: number;          // 0-1
  finalScore: number;         // 0-1 (weighted, renormalized if image null)
  matchPercentage: number;    // 0-100
  matchReasons: string[];
  confidenceLevel: ConfidenceLevel;
  matchingProvider: MatchingProvider;
}

/**
 * Normalizes and extracts searchable text from an ItemReport
 */
function buildReportText(report: IItemReport): string {
  const parts = [
    report.itemName || '',
    report.description || '',
    report.brand || '',
    report.distinctiveFeatures || '',
    report.category || '',
    report.subcategory || '',
    report.color?.join(' ') || '',
  ];
  return parts.filter(Boolean).join(' ');
}

/**
 * Text Scoring (35% standard weight)
 * Combines semantic embeddings (OpenAI) or lexical token analysis + bigrams
 */
async function computeTextScore(
  lostReport: IItemReport,
  foundReport: IItemReport
): Promise<{ score: number; provider: MatchingProvider }> {
  const textLost = buildReportText(lostReport);
  const textFound = buildReportText(foundReport);

  const embeddingProvider = getEmbeddingProvider();

  if (embeddingProvider.name === 'openai') {
    try {
      const [embLost, embFound] = await Promise.all([
        embeddingProvider.embed(textLost),
        embeddingProvider.embed(textFound),
      ]);
      const semanticScore = cosineSimilarity(embLost, embFound);
      const lexicalScore = computeLexicalSimilarity(textLost, textFound);
      // Hybrid blend when semantic is available for extra robustness
      const combined = Math.min(1.0, semanticScore * 0.7 + lexicalScore * 0.3);
      return { score: combined, provider: 'semantic' };
    } catch (err) {
      console.warn('[Matcher] Semantic embedding failed, using lexical fallback:', err);
    }
  }

  // Lexical Provider scoring
  const lexicalScore = computeLexicalSimilarity(textLost, textFound);
  return { score: lexicalScore, provider: 'lexical' };
}

/**
 * Attribute Scoring (20% standard weight)
 * - Category match: 0.4
 * - Brand match (case-insensitive): 0.3
 * - Color overlap: (matching colors / union colors) * 0.3
 * Max 1.0
 */
function computeAttributeScore(
  lostReport: IItemReport,
  foundReport: IItemReport,
  reasons: string[]
): number {
  let score = 0;

  // 1. Category match (0.4)
  if (
    lostReport.category &&
    foundReport.category &&
    lostReport.category.toLowerCase().trim() === foundReport.category.toLowerCase().trim()
  ) {
    score += 0.4;
    reasons.push(`Matching category: ${lostReport.category}`);

    // Subcategory bonus if present
    if (
      lostReport.subcategory &&
      foundReport.subcategory &&
      lostReport.subcategory.toLowerCase().trim() === foundReport.subcategory.toLowerCase().trim()
    ) {
      reasons.push(`Exact subcategory match: ${lostReport.subcategory}`);
    }
  }

  // 2. Brand match (0.3)
  const brandLost = lostReport.brand?.toLowerCase().trim();
  const brandFound = foundReport.brand?.toLowerCase().trim();

  if (brandLost && brandFound) {
    if (brandLost === brandFound) {
      score += 0.3;
      reasons.push(`Matching brand: ${lostReport.brand}`);
    } else if (brandLost.includes(brandFound) || brandFound.includes(brandLost)) {
      score += 0.2;
      reasons.push(`Similar brand reference (${lostReport.brand} / ${foundReport.brand})`);
    }
  }

  // 3. Color overlap (0.3)
  const colorsLost = new Set<string>(
    (lostReport.color || [])
      .map((c) => c.toLowerCase().trim())
      .filter((c): c is string => Boolean(c))
  );
  const colorsFound = new Set<string>(
    (foundReport.color || [])
      .map((c) => c.toLowerCase().trim())
      .filter((c): c is string => Boolean(c))
  );

  if (colorsLost.size > 0 && colorsFound.size > 0) {
    let matchCount = 0;
    const matchingColorNames: string[] = [];
    for (const color of colorsLost) {
      if (colorsFound.has(color)) {
        matchCount++;
        matchingColorNames.push(color);
      }
    }
    const unionSize = new Set([...colorsLost, ...colorsFound]).size;
    if (unionSize > 0) {
      const colorScore = (matchCount / unionSize) * 0.3;
      score += colorScore;
      if (matchCount > 0) {
        reasons.push(`Matching color(s): ${matchingColorNames.join(', ')}`);
      }
    }
  }

  return Math.min(1.0, score);
}

/**
 * Location Scoring (15% standard weight)
 * - Lat/Lon Haversine distance:
 *     0km: 1.0, <=5km: 0.9, <=10km: 0.8, <=25km: 0.6, <=50km: 0.4, <=100km: 0.2, <=200km: 0.1, >200km: 0.0
 * - Else if same city: 0.7, same state: 0.3, different: 0.0
 */
function computeLocationScore(
  lostReport: IItemReport,
  foundReport: IItemReport,
  reasons: string[]
): number {
  const coordLost = lostReport.location?.coordinates;
  const coordFound = foundReport.location?.coordinates;

  // Check if both have valid GeoJSON coordinates [lon, lat]
  if (
    Array.isArray(coordLost) &&
    coordLost.length >= 2 &&
    Array.isArray(coordFound) &&
    coordFound.length >= 2 &&
    typeof coordLost[0] === 'number' &&
    typeof coordLost[1] === 'number' &&
    typeof coordFound[0] === 'number' &&
    typeof coordFound[1] === 'number'
  ) {
    const lon1 = coordLost[0];
    const lat1 = coordLost[1];
    const lon2 = coordFound[0];
    const lat2 = coordFound[1];

    const distKm = calculateDistance(lat1, lon1, lat2, lon2);

    let score = 0;
    if (distKm <= 0.1) score = 1.0;
    else if (distKm <= 5) score = 0.9;
    else if (distKm <= 10) score = 0.8;
    else if (distKm <= 25) score = 0.6;
    else if (distKm <= 50) score = 0.4;
    else if (distKm <= 100) score = 0.2;
    else if (distKm <= 200) score = 0.1;
    else score = 0.0;

    if (score >= 0.6) {
      reasons.push(`Locations within ${distKm}km of each other`);
    } else if (score > 0) {
      reasons.push(`Locations approximately ${distKm}km apart`);
    }

    return score;
  }

  // Fallback to City and State strings
  const cityLost = lostReport.city?.toLowerCase().trim();
  const cityFound = foundReport.city?.toLowerCase().trim();
  const stateLost = lostReport.state?.toLowerCase().trim();
  const stateFound = foundReport.state?.toLowerCase().trim();

  if (cityLost && cityFound && cityLost === cityFound) {
    reasons.push(`Reported in the same city: ${lostReport.city}`);
    return 0.7;
  }

  if (stateLost && stateFound && stateLost === stateFound) {
    reasons.push(`Reported in the same state: ${lostReport.state}`);
    return 0.3;
  }

  return 0.0;
}

/**
 * Date Scoring (10% standard weight)
 * dayDiff = |lostDate - foundDate| in days
 * 0 days: 1.0, 1 day: 0.9, 3 days: 0.7, 7 days: 0.5, 14 days: 0.3, 30 days: 0.1, >30: 0.0
 */
function computeDateScore(
  lostReport: IItemReport,
  foundReport: IItemReport,
  reasons: string[]
): number {
  if (!lostReport.lostFoundDate || !foundReport.lostFoundDate) {
    return 0;
  }

  const d1 = new Date(lostReport.lostFoundDate).getTime();
  const d2 = new Date(foundReport.lostFoundDate).getTime();

  if (isNaN(d1) || isNaN(d2)) {
    return 0;
  }

  const diffMs = Math.abs(d1 - d2);
  const dayDiff = diffMs / (1000 * 60 * 60 * 24);

  let score = 0;
  if (dayDiff <= 0.5) score = 1.0;
  else if (dayDiff <= 1) score = 0.9;
  else if (dayDiff <= 3) score = 0.7;
  else if (dayDiff <= 7) score = 0.5;
  else if (dayDiff <= 14) score = 0.3;
  else if (dayDiff <= 30) score = 0.1;
  else score = 0.0;

  if (dayDiff <= 1) {
    reasons.push('Items lost and found on or within 24 hours of each other');
  } else if (dayDiff <= 7) {
    reasons.push(`Reported within ${Math.ceil(dayDiff)} days of each other`);
  }

  return score;
}

/**
 * Image Scoring (20% standard weight)
 * Uses vision provider if available.
 * Returns null if vision provider is not available or either report lacks images.
 * NEVER fakes a score.
 */
async function computeImageScore(
  lostReport: IItemReport,
  foundReport: IItemReport,
  reasons: string[]
): Promise<number | null> {
  const visionProvider = getVisionProvider();
  if (!visionProvider.available) {
    return null;
  }

  const urlLost = lostReport.images?.[0]?.url;
  const urlFound = foundReport.images?.[0]?.url;

  if (!urlLost || !urlFound) {
    return null;
  }

  try {
    const [vecLost, vecFound] = await Promise.all([
      visionProvider.embedImageUrl(urlLost),
      visionProvider.embedImageUrl(urlFound),
    ]);

    if (!vecLost || !vecFound) {
      return null;
    }

    const sim = cosineSimilarity(vecLost, vecFound);
    if (sim >= 0.7) {
      reasons.push(`Strong visual resemblance between uploaded photos (${Math.round(sim * 100)}%)`);
    }
    return sim;
  } catch (err) {
    console.warn('[Matcher] Image embedding comparison failed:', err);
    return null;
  }
}

/**
 * Scores a match between a LOST report and a FOUND report.
 */
export async function scoreMatch(
  lostReport: IItemReport,
  foundReport: IItemReport
): Promise<MatchScore> {
  const reasons: string[] = [];

  // 1. Text scoring
  const { score: textScore, provider: matchingProvider } = await computeTextScore(
    lostReport,
    foundReport
  );
  if (textScore >= 0.5) {
    reasons.push(`High textual similarity in item description (${Math.round(textScore * 100)}%)`);
  }

  // 2. Attribute scoring
  const attributeScore = computeAttributeScore(lostReport, foundReport, reasons);

  // 3. Location scoring
  const locationScore = computeLocationScore(lostReport, foundReport, reasons);

  // 4. Date scoring
  const dateScore = computeDateScore(lostReport, foundReport, reasons);

  // 5. Image scoring
  const imageScore = await computeImageScore(lostReport, foundReport, reasons);

  // 6. Weighted Final Score
  let finalScore = 0;
  if (imageScore === null) {
    // Renormalize weights: text: 0.4375, attribute: 0.25, location: 0.1875, date: 0.125
    finalScore =
      textScore * RENORMALIZED_WEIGHTS_NO_IMAGE.text +
      attributeScore * RENORMALIZED_WEIGHTS_NO_IMAGE.attribute +
      locationScore * RENORMALIZED_WEIGHTS_NO_IMAGE.location +
      dateScore * RENORMALIZED_WEIGHTS_NO_IMAGE.date;
  } else {
    finalScore =
      textScore * MATCH_WEIGHTS.text +
      attributeScore * MATCH_WEIGHTS.attribute +
      imageScore * MATCH_WEIGHTS.image +
      locationScore * MATCH_WEIGHTS.location +
      dateScore * MATCH_WEIGHTS.date;
  }

  // Clamp and round
  finalScore = Math.min(1.0, Math.max(0.0, Math.round(finalScore * 1000) / 1000));
  const matchPercentage = Math.round(finalScore * 100);

  // Confidence level
  let confidenceLevel: ConfidenceLevel = 'low';
  if (finalScore >= 0.75) {
    confidenceLevel = 'high';
  } else if (finalScore >= 0.50) {
    confidenceLevel = 'medium';
  }

  // Deduplicate reasons
  const uniqueReasons = Array.from(new Set(reasons));

  return {
    textScore: Math.round(textScore * 100) / 100,
    imageScore: imageScore !== null ? Math.round(imageScore * 100) / 100 : null,
    attributeScore: Math.round(attributeScore * 100) / 100,
    locationScore: Math.round(locationScore * 100) / 100,
    dateScore: Math.round(dateScore * 100) / 100,
    finalScore,
    matchPercentage,
    matchReasons: uniqueReasons,
    confidenceLevel,
    matchingProvider,
  };
}

/**
 * Scans and finds matching candidates for a newly submitted or updated report.
 * Executed asynchronously (fire-and-forget from API, or awaited from background jobs).
 */
export async function findMatchesForReport(
  reportId: string,
  reportType?: 'LOST' | 'FOUND'
): Promise<void> {
  try {
    await connectDB();

    const currentReport = await ItemReport.findById(reportId);
    if (!currentReport) {
      console.warn(`[findMatchesForReport] Report ${reportId} not found.`);
      return;
    }

    if (currentReport.status !== 'active' || currentReport.moderationStatus === 'rejected') {
      return;
    }

    const effectiveType = reportType || (currentReport.reportType as 'LOST' | 'FOUND');
    const oppositeType = effectiveType === 'LOST' ? 'FOUND' : 'LOST';

    // Date range filter: +/- 60 days from lostFoundDate
    const refDate = new Date(currentReport.lostFoundDate);
    const minDate = new Date(refDate.getTime() - 60 * 24 * 60 * 60 * 1000);
    const maxDate = new Date(refDate.getTime() + 60 * 24 * 60 * 60 * 1000);

    // Candidates query prioritized by state, category, date
    const candidates = await ItemReport.find({
      reportType: oppositeType,
      status: 'active',
      moderationStatus: 'approved',
      lostFoundDate: { $gte: minDate, $lte: maxDate },
      // Exclude self if same report somehow
      _id: { $ne: currentReport._id },
    })
      .sort({
        // Match state & category first if possible
        category: currentReport.category ? 1 : -1,
        lostFoundDate: -1,
      })
      .limit(50)
      .lean();

    if (!candidates || candidates.length === 0) {
      return;
    }

    for (const candidate of candidates) {
      const lostReport = effectiveType === 'LOST' ? (currentReport.toObject() as IItemReport) : (candidate as unknown as IItemReport);
      const foundReport = effectiveType === 'FOUND' ? (currentReport.toObject() as IItemReport) : (candidate as unknown as IItemReport);

      const score = await scoreMatch(lostReport, foundReport);

      // Save match if score >= 0.30
      if (score.finalScore >= 0.30) {
        const matchDoc = await Match.findOneAndUpdate(
          {
            lostReportId: lostReport._id,
            foundReportId: foundReport._id,
          },
          {
            $set: {
              textScore: score.textScore,
              imageScore: score.imageScore,
              attributeScore: score.attributeScore,
              locationScore: score.locationScore,
              dateScore: score.dateScore,
              finalScore: score.finalScore,
              matchReasons: score.matchReasons,
              matchingProvider: score.matchingProvider,
              confidenceLevel: score.confidenceLevel,
            },
            $setOnInsert: {
              status: 'pending',
              notificationSent: false,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Notify both owners if score >= 0.50 and notification not yet sent
        if (score.finalScore >= 0.50 && matchDoc && !matchDoc.notificationSent) {
          const lostUserId = lostReport.userId?.toString();
          const foundUserId = foundReport.userId?.toString();

          const notificationPromises = [];

          if (lostUserId) {
            notificationPromises.push(
              Notification.create({
                userId: lostUserId,
                title: 'Potential Match Found!',
                message: `A potential match (${score.matchPercentage}%) was found for your lost item "${lostReport.itemName}".`,
                type: 'match_found',
                relatedReportId: lostReport._id,
                relatedMatchId: matchDoc._id,
                isRead: false,
              })
            );
          }

          if (foundUserId && foundUserId !== lostUserId) {
            notificationPromises.push(
              Notification.create({
                userId: foundUserId,
                title: 'Potential Match Found!',
                message: `A potential match (${score.matchPercentage}%) was found for the item you reported finding: "${foundReport.itemName}".`,
                type: 'match_found',
                relatedReportId: foundReport._id,
                relatedMatchId: matchDoc._id,
                isRead: false,
              })
            );
          }

          await Promise.all(notificationPromises);
          await Match.findByIdAndUpdate(matchDoc._id, { notificationSent: true });
        }
      }
    }
  } catch (err) {
    console.error(`[findMatchesForReport] Error matching report ${reportId}:`, err);
  }
}

/**
 * Retrieves paginated matches for a specific user across all reports they own.
 */
export async function getMatchesForUser(
  userId: string,
  page: number = 1,
  limit: number = 10
) {
  await connectDB();

  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(100, limit));
  const skip = (safePage - 1) * safeLimit;

  // Find all report IDs owned by this user
  const userReports = await ItemReport.find({ userId }).select('_id').lean();
  const reportIds = userReports.map((r: { _id: unknown }) => r._id);

  if (reportIds.length === 0) {
    return {
      matches: [],
      total: 0,
      page: safePage,
      limit: safeLimit,
      totalPages: 0,
    };
  }

  const query = {
    $or: [
      { lostReportId: { $in: reportIds } },
      { foundReportId: { $in: reportIds } },
    ],
  };

  const [total, matches] = await Promise.all([
    Match.countDocuments(query),
    Match.find(query)
      .sort({ finalScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('lostReportId')
      .populate('foundReportId')
      .lean(),
  ]);

  return {
    matches,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}
