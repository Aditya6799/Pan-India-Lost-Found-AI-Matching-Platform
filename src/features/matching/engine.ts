/**
 * AI Matching Engine
 * Re-exports core scoring routines, vision/text embedding providers,
 * and orchestration helpers for API routes & background workers.
 */

import { connectDB } from '@/lib/mongodb';
import ItemReport from '@/models/ItemReport';
import Match from '@/models/Match';
import type { IItemReport, IMatch, MatchResult } from '@/types';
import {
  scoreMatch,
  findMatchesForReport,
  getMatchesForUser,
  MATCH_WEIGHTS,
  RENORMALIZED_WEIGHTS_NO_IMAGE,
  type MatchScore,
} from '@/services/matching/matcher';

export {
  scoreMatch,
  findMatchesForReport,
  getMatchesForUser,
  MATCH_WEIGHTS,
  RENORMALIZED_WEIGHTS_NO_IMAGE,
  type MatchScore,
};

export {
  getEmbeddingProvider,
  cosineSimilarity,
  type EmbeddingProvider,
} from '@/services/ai/embedding';

export {
  getVisionProvider,
  type VisionProvider,
} from '@/services/ai/vision';

export {
  computeLexicalSimilarity,
  tokenize,
  buildTermFrequency,
  STOPWORDS,
} from '@/features/matching/providers/text-provider';

/**
 * Transforms a raw DB Match document into a clean, typed MatchResult for UI display.
 */
export function formatMatchForDisplay(
  match: any,
  currentUserId?: string
): {
  matchId: string;
  lostReport: any;
  foundReport: any;
  score: number;
  percentage: number;
  reasons: string[];
  confidence: 'high' | 'medium' | 'low';
  provider: 'semantic' | 'lexical' | 'hybrid';
  userRole?: 'lost_owner' | 'found_owner' | 'observer';
  createdAt: string;
} {
  const lostReport = match.lostReportId;
  const foundReport = match.foundReportId;

  let userRole: 'lost_owner' | 'found_owner' | 'observer' = 'observer';
  if (currentUserId) {
    const lostOwner = lostReport?.userId?.toString() || lostReport?.userId?._id?.toString();
    const foundOwner = foundReport?.userId?.toString() || foundReport?.userId?._id?.toString();
    if (lostOwner === currentUserId) {
      userRole = 'lost_owner';
    } else if (foundOwner === currentUserId) {
      userRole = 'found_owner';
    }
  }

  return {
    matchId: match._id?.toString() || '',
    lostReport,
    foundReport,
    score: match.finalScore || 0,
    percentage: Math.round((match.finalScore || 0) * 100),
    reasons: match.matchReasons || [],
    confidence: match.confidenceLevel || 'low',
    provider: match.matchingProvider || 'lexical',
    userRole,
    createdAt: match.createdAt ? new Date(match.createdAt).toISOString() : new Date().toISOString(),
  };
}

/**
 * Batch matching orchestration runner.
 * Scans active and approved reports to ensure matches are up to date.
 * Useful for cron jobs or admin triggers.
 */
export async function runBatchMatching(options?: {
  limit?: number;
}): Promise<{ processed: number; matchesFound: number }> {
  await connectDB();

  const maxReports = options?.limit || 100;
  const reports = await ItemReport.find({
    status: 'active',
    moderationStatus: 'approved',
  })
    .sort({ updatedAt: -1 })
    .limit(maxReports)
    .select('_id reportType')
    .lean();

  let processed = 0;
  for (const report of reports) {
    await findMatchesForReport(report._id.toString(), report.reportType);
    processed++;
  }

  const matchesFound = await Match.countDocuments();
  return { processed, matchesFound };
}
