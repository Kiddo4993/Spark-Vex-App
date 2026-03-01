// --- Constants ---
export const K = 32; // Rating variance multiplier
export const W = 0.7; // Weight for credit distribution (0.7 to stronger, 0.3 to weaker)
export const U_MATCH = 20; // Global uncertainty variance for random match errors
export const U_MIN = 10; // Minimum uncertainty floor
export const INITIAL_RATING = 100;
export const INITIAL_UNCERTAINTY = 50;
export const SKILLS_BONUS_DIVISOR = 5;
export const REGIME_CHANGE_THRESHOLD = 0.7;
export const SCOUT_NEEDED_THRESHOLD = U_MIN * 2.5; // 25

// --- Helper Utilities ---

/**
 * Error function approximation (Abramowitz and Stegun 7.1.26)
 * Max error: 1.5e-7
 */
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

/**
 * Normal Cumulative Distribution Function (CDF)
 * Formula: 0.5 * (1 + erf(x / sqrt(2)))
 */
export function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

/**
 * Calculate strenght score for credit distribution.
 * Sa = Ra / Ua
 */
export function botStrength(rating: number, uncertainty: number): number {
  if (uncertainty === 0) return rating; // Prevent division by zero, though U_MIN should prevent this
  return rating / uncertainty;
}

/**
 * Distribute credit/blame between two alliance partners based on their strength.
 * Stronger bots get more credit/blame.
 */
export function creditDistribution(
  rating1: number,
  uncertainty1: number,
  rating2: number,
  uncertainty2: number,
  w: number = W
): { credit1: number; credit2: number } {
  const sa = botStrength(rating1, uncertainty1);
  const sb = botStrength(rating2, uncertainty2);

  // Avoid division by zero if both strengths are 0 (unlikely with U_MIN)
  const sumS = sa + sb;
  if (sumS === 0) return { credit1: 0.5, credit2: 0.5 };

  const daBase = sa / sumS;
  const dbBase = sb / sumS;

  const da = w * daBase + (1 - w) / 2;
  const db = w * dbBase + (1 - w) / 2;

  return { credit1: da, credit2: db };
}

/**
 * Calculate alliance rating and uncertainty.
 * Uses 70/30 weighted average favoring the strongest and weakest teams (ignoring the middle if 3 teams, theoretically).
 
 * NOTE: This assumes 3 teams per alliance.
 */
export function allianceStats(teams: Array<{ rating: number; uncertainty: number }>): {
  rating: number;
  uncertainty: number;
} {
  // Sort by rating descending
  const sorted = [...teams].sort((a, b) => b.rating - a.rating);

  // Guard against < 3 teams just in case, though VEX is usually 2v2 or 3v3? User says 3v3 in prompt.
  // Actually VEX VRC is 2v2 usually. But prompt explicitly mentions "Red Team 1, Red Team 2, Red Team 3".
  // And the formula explicitly says "weakestRating = teams[2].rating".
  // So we assume 3 teams.
  // If fewer than 3, we adapt gracefully.
  
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const strongestRating = strongest.rating;
  const weakestRating = weakest.rating;

  const strongestVar = strongest.uncertainty * strongest.uncertainty;
  const weakestVar = weakest.uncertainty * weakest.uncertainty;

  const rating = 0.7 * strongestRating + 0.3 * weakestRating;
  const variance = 0.7 * 0.7 * strongestVar + 0.3 * 0.3 * weakestVar;
  const uncertainty = Math.sqrt(variance);

  return { rating, uncertainty };
}

/**
 * Calculate expected outcome (win probability 0-1).
 */
export function expectedOutcome(
  alliance1Rating: number,
  alliance1Uncertainty: number,
  alliance2Rating: number,
  alliance2Uncertainty: number,
  uMatch: number = U_MATCH
): number {
  const totalUncertainty = Math.sqrt(
    alliance1Uncertainty * alliance1Uncertainty +
    alliance2Uncertainty * alliance2Uncertainty +
    uMatch * uMatch
  );

  const ratingDiff = alliance1Rating - alliance2Rating;
  return normalCDF(ratingDiff / totalUncertainty);
}

/**
 * Update rating based on delta (Actual - Expected).
 */
export function updateTeamRating(
  currentRating: number,
  creditFactor: number,
  delta: number,
  k: number = K
): number {
  const newRating = currentRating + k * creditFactor * delta;
  return Math.max(0, newRating);
}

/**
 * Update uncertainty based on surprise.
 */
export function updateTeamUncertainty(
  currentUncertainty: number,
  creditFactor: number,
  surpriseFactor: number,
  k: number = 0.5,
  uMin: number = U_MIN
): number {
  // Regime change detection: if the result is a major surprise,
  // expand uncertainty to signal the model may need to recalibrate.
  if (surpriseFactor > REGIME_CHANGE_THRESHOLD) {
    return Math.min(INITIAL_UNCERTAINTY, currentUncertainty * 1.2);
  }
  const newUncertainty = currentUncertainty * (1 - k * creditFactor * surpriseFactor);
  return Math.max(uMin, newUncertainty);
}

/**
 * Calculate initial rating boost from skills.
 */
export function initialRatingWithSkillsBoost(
  driverSkillsScore: number | null,
  baseRating: number = INITIAL_RATING,
  divisor: number = SKILLS_BONUS_DIVISOR
): number {
  if (driverSkillsScore === null) return baseRating;
  return baseRating + driverSkillsScore / divisor;
}

/**
 * Convert uncertainty to 0-100 confidence percentage.
 */
export function confidenceFromUncertainty(
  uncertainty: number,
  baseUncertainty: number = INITIAL_UNCERTAINTY
): number {
  const normalized = Math.min(1, uncertainty / baseUncertainty);
  const confidence = 100 * (1 - normalized);
  return Math.round(confidence);
}

export interface BayesianTeamInput {
  id: string;
  rating: number;
  uncertainty: number;
}

export interface BayesianMatchUpdate {
  teamId: string;
  ratingBefore: number;
  ratingAfter: number;
  uncertaintyBefore: number;
  uncertaintyAfter: number;
  creditFactor: number;
  expectedOutcome: number;
  surpriseFactor: number;
}

/**
 *
 * For credit distribution with 3 teams:
 * Pair Strongest (0) with Middle (1) -> get credit for Middle
 * Pair Weakest (2) with Middle (1) -> get credit for Middle
 * Average the two credit factors for Middle?
 *

 *
 * Actually, credit distribution is usually between PAIRS of teams in standard implementations,
 * but here we are distributing the ALLIANCE's "Delta" to the individual teams.
 *
 * The `creditDistribution` function takes 2 teams.
 *
 */
export function computeBayesianMatchUpdate(
  winningTeams: BayesianTeamInput[], // Array of 3 teams
  losingTeams: BayesianTeamInput[],  // Array of 3 teams
  constants: { k: number; w: number; uMatch: number; uMin: number } = {
    k: K,
    w: W,
    uMatch: U_MATCH,
    uMin: U_MIN,
  }
): {
  winning: BayesianMatchUpdate[];
  losing: BayesianMatchUpdate[];
} {
  // 1. Alliance Stats
  const winStats = allianceStats(winningTeams);
  const loseStats = allianceStats(losingTeams);

  // 2. Expected Outcome
  // E for Winning alliance (A=1)
  const expectedWin = expectedOutcome(
    winStats.rating,
    winStats.uncertainty,
    loseStats.rating,
    loseStats.uncertainty,
    constants.uMatch
  );

  const actualWin = 1;
  const deltaWin = actualWin - expectedWin;
  const surpriseWin = Math.abs(deltaWin);

  // For Losing alliance (A=0), Expected is (1 - E_win) or calculated reverse
  // Note: normalCDF(-x) = 1 - normalCDF(x).
  // So expectedLose = 1 - expectedWin.
  // DeltaLose = 0 - expectedLose = 0 - (1 - E_win) = E_win - 1 = - (1 - E_win) = - deltaWin?
  // Let's explicitly calculate expectedLose.
  const expectedLose = expectedOutcome(
    loseStats.rating,
    loseStats.uncertainty,
    winStats.rating,
    winStats.uncertainty,
    constants.uMatch
  );
  const actualLose = 0;
  const deltaLose = actualLose - expectedLose;
  const surpriseLose = Math.abs(deltaLose);

  // 3. Process Winning Teams
  // We need to calculate credit factors.
  // Sort teams by rating to identify strongest/middle/weakest for credit calc logic
  // BUT we need to map back to original indices/IDs.
  const winningSorted = [...winningTeams].map((t, i) => ({ ...t, originalIndex: i }))
    .sort((a, b) => b.rating - a.rating);

  const winningCredits = new Map<string, number>();

  if (winningSorted.length === 2) {
    // 2-team alliance (VEX VRC 2v2)
    const cv = creditDistribution(winningSorted[0].rating, winningSorted[0].uncertainty, winningSorted[1].rating, winningSorted[1].uncertainty, constants.w);
    winningCredits.set(winningSorted[0].id, cv.credit1);
    winningCredits.set(winningSorted[1].id, cv.credit2);
  } else if (winningSorted.length >= 3) {
    // 3-team alliance
    const cv_Strong_Mid = creditDistribution(winningSorted[0].rating, winningSorted[0].uncertainty, winningSorted[1].rating, winningSorted[1].uncertainty, constants.w);
    const cv_Mid_Weak = creditDistribution(winningSorted[1].rating, winningSorted[1].uncertainty, winningSorted[2].rating, winningSorted[2].uncertainty, constants.w);
    winningCredits.set(winningSorted[0].id, cv_Strong_Mid.credit1);
    winningCredits.set(winningSorted[2].id, cv_Mid_Weak.credit2);
    winningCredits.set(winningSorted[1].id, (cv_Strong_Mid.credit2 + cv_Mid_Weak.credit1) / 2);
  } else {
    // 1-team alliance fallback
    winningCredits.set(winningSorted[0].id, 1);
  }

  const winningUpdates: BayesianMatchUpdate[] = winningTeams.map(team => {
    const da = winningCredits.get(team.id) || 0.33; // Fallback
    const rAfter = updateTeamRating(team.rating, da, deltaWin, constants.k);
    const uAfter = updateTeamUncertainty(team.uncertainty, da, surpriseWin, 0.5, constants.uMin);

    return {
      teamId: team.id,
      ratingBefore: team.rating,
      ratingAfter: rAfter,
      uncertaintyBefore: team.uncertainty,
      uncertaintyAfter: uAfter,
      creditFactor: da,
      expectedOutcome: expectedWin,
      surpriseFactor: surpriseWin
    };
  });

  // 4. Process Losing Teams
  const losingSorted = [...losingTeams].map((t, i) => ({ ...t, originalIndex: i }))
    .sort((a, b) => b.rating - a.rating);

  const losingCredits = new Map<string, number>();

  if (losingSorted.length === 2) {
    const cl = creditDistribution(losingSorted[0].rating, losingSorted[0].uncertainty, losingSorted[1].rating, losingSorted[1].uncertainty, constants.w);
    losingCredits.set(losingSorted[0].id, cl.credit1);
    losingCredits.set(losingSorted[1].id, cl.credit2);
  } else if (losingSorted.length >= 3) {
    const cl_Strong_Mid = creditDistribution(losingSorted[0].rating, losingSorted[0].uncertainty, losingSorted[1].rating, losingSorted[1].uncertainty, constants.w);
    const cl_Mid_Weak = creditDistribution(losingSorted[1].rating, losingSorted[1].uncertainty, losingSorted[2].rating, losingSorted[2].uncertainty, constants.w);
    losingCredits.set(losingSorted[0].id, cl_Strong_Mid.credit1);
    losingCredits.set(losingSorted[2].id, cl_Mid_Weak.credit2);
    losingCredits.set(losingSorted[1].id, (cl_Strong_Mid.credit2 + cl_Mid_Weak.credit1) / 2);
  } else {
    losingCredits.set(losingSorted[0].id, 1);
  }

  const losingUpdates: BayesianMatchUpdate[] = losingTeams.map(team => {
    const db = losingCredits.get(team.id) || 0.33;
    const rAfter = updateTeamRating(team.rating, db, deltaLose, constants.k); // deltaLose is negative usually
    const uAfter = updateTeamUncertainty(team.uncertainty, db, surpriseLose, 0.5, constants.uMin);

    return {
      teamId: team.id,
      ratingBefore: team.rating,
      ratingAfter: rAfter,
      uncertaintyBefore: team.uncertainty,
      uncertaintyAfter: uAfter,
      creditFactor: db,
      expectedOutcome: expectedLose,
      surpriseFactor: surpriseLose
    };
  });

  return { winning: winningUpdates, losing: losingUpdates };
}

/**
 * Compute Bayesian match update for a tie (A=0.5 for both alliances).
 * Returns a flat array of updates for all teams.
 */
export function computeBayesianTieUpdate(
  redTeams: BayesianTeamInput[],
  blueTeams: BayesianTeamInput[],
  constants: { k: number; w: number; uMatch: number; uMin: number } = {
    k: K, w: W, uMatch: U_MATCH, uMin: U_MIN,
  }
): BayesianMatchUpdate[] {
  const redStats = allianceStats(redTeams);
  const blueStats = allianceStats(blueTeams);

  const actual = 0.5; // Tie

  // Red's perspective
  const expectedRed = expectedOutcome(
    redStats.rating, redStats.uncertainty,
    blueStats.rating, blueStats.uncertainty,
    constants.uMatch
  );
  const deltaRed = actual - expectedRed;
  const surpriseRed = Math.abs(deltaRed);

  // Blue's perspective
  const expectedBlue = expectedOutcome(
    blueStats.rating, blueStats.uncertainty,
    redStats.rating, redStats.uncertainty,
    constants.uMatch
  );
  const deltaBlue = actual - expectedBlue;
  const surpriseBlue = Math.abs(deltaBlue);

  function processTeams(
    teams: BayesianTeamInput[],
    delta: number,
    surprise: number,
    expected: number
  ): BayesianMatchUpdate[] {
    const sorted = [...teams].map((t, i) => ({ ...t, originalIndex: i }))
      .sort((a, b) => b.rating - a.rating);
    const credits = new Map<string, number>();

    if (sorted.length === 2) {
      const cv = creditDistribution(sorted[0].rating, sorted[0].uncertainty, sorted[1].rating, sorted[1].uncertainty, constants.w);
      credits.set(sorted[0].id, cv.credit1);
      credits.set(sorted[1].id, cv.credit2);
    } else if (sorted.length >= 3) {
      const cv_SM = creditDistribution(sorted[0].rating, sorted[0].uncertainty, sorted[1].rating, sorted[1].uncertainty, constants.w);
      const cv_MW = creditDistribution(sorted[1].rating, sorted[1].uncertainty, sorted[2].rating, sorted[2].uncertainty, constants.w);
      credits.set(sorted[0].id, cv_SM.credit1);
      credits.set(sorted[2].id, cv_MW.credit2);
      credits.set(sorted[1].id, (cv_SM.credit2 + cv_MW.credit1) / 2);
    } else {
      credits.set(sorted[0].id, 1);
    }

    return teams.map(team => {
      const d = credits.get(team.id) || 0.33;
      const rAfter = updateTeamRating(team.rating, d, delta, constants.k);
      const uAfter = updateTeamUncertainty(team.uncertainty, d, surprise, 0.5, constants.uMin);
      return {
        teamId: team.id,
        ratingBefore: team.rating,
        ratingAfter: rAfter,
        uncertaintyBefore: team.uncertainty,
        uncertaintyAfter: uAfter,
        creditFactor: d,
        expectedOutcome: expected,
        surpriseFactor: surprise,
      };
    });
  }

  return [
    ...processTeams(redTeams, deltaRed, surpriseRed, expectedRed),
    ...processTeams(blueTeams, deltaBlue, surpriseBlue, expectedBlue),
  ];
}
