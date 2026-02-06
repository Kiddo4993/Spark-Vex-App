/**
 * Chess-style ELO for VEX alliance matches.
 * - Each team starts at 100.
 * - Alliance rating = average of 3 team ratings.
 * - Expected score = 1 / (1 + 10^((opp - team)/400))
 * - K-factor configurable (default 32).
 */

export const DEFAULT_K_FACTOR = 32;
export const INITIAL_RATING = 100;
export const UNCERTAINTY_BASE = 50;

/**
 * Expected score for a team vs an opponent (alliance) rating.
 * Formula: 1 / (1 + 10^((opponentRating - teamRating) / 400))
 */
export function expectedScore(teamRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - teamRating) / 400));
}

/**
 * Average rating of an alliance (3 teams).
 */
export function allianceRating(ratings: [number, number, number]): number {
  return (ratings[0] + ratings[1] + ratings[2]) / 3;
}

/**
 * New rating after a match.
 * change = K * (actualScore - expectedScore)
 * actualScore: 1 = win, 0 = loss
 */
export function newRating(
  currentRating: number,
  expected: number,
  actualScore: number,
  kFactor: number = DEFAULT_K_FACTOR
): number {
  const change = kFactor * (actualScore - expected);
  return Math.max(0, currentRating + change);
}

/**
 * Uncertainty based on match count: base / sqrt(matchesPlayed).
 * Higher matches = lower uncertainty = more confidence.
 */
export function uncertainty(matchesPlayed: number, base: number = UNCERTAINTY_BASE): number {
  if (matchesPlayed <= 0) return base;
  return base / Math.sqrt(matchesPlayed);
}

/**
 * Confidence as a 0–100 value (inverse of normalized uncertainty).
 * More matches = higher confidence.
 */
export function confidenceFromUncertainty(uncertaintyValue: number, base: number = UNCERTAINTY_BASE): number {
  if (uncertaintyValue <= 0) return 100;
  const normalized = Math.min(1, uncertaintyValue / base);
  return Math.round(100 * (1 - normalized));
}

/**
 * Full ELO update for one alliance (3 teams) vs the other.
 * Returns array of { teamIndex, ratingBefore, ratingAfter, expectedScore, actualScore }.
 */
export interface EloUpdateResult {
  teamIndex: number;
  ratingBefore: number;
  ratingAfter: number;
  expectedScore: number;
  actualScore: number;
}

export function computeAllianceEloUpdates(
  winningRatings: [number, number, number],
  losingRatings: [number, number, number],
  kFactor: number = DEFAULT_K_FACTOR
): { winning: EloUpdateResult[]; losing: EloUpdateResult[] } {
  const winAllianceRating = allianceRating(winningRatings);
  const loseAllianceRating = allianceRating(losingRatings);

  const winning = winningRatings.map((r, i) => {
    const exp = expectedScore(r, loseAllianceRating);
    const newR = newRating(r, exp, 1, kFactor);
    return { teamIndex: i, ratingBefore: r, ratingAfter: newR, expectedScore: exp, actualScore: 1 };
  });

  const losing = losingRatings.map((r, i) => {
    const exp = expectedScore(r, winAllianceRating);
    const newR = newRating(r, exp, 0, kFactor);
    return { teamIndex: i, ratingBefore: r, ratingAfter: newR, expectedScore: exp, actualScore: 0 };
  });

  return { winning, losing };
}
