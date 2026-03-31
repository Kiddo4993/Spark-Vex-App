// the core constants for the model: these values came from
// a paper on bayesian game rating. tweaked them a bit at regionals
// and they seemed to work well
export const K = 32;
export const W = 0.7; // 70% credit to the stronger bot
export const U_MATCH = 20; // noise from random match stuff
export const U_MIN = 10; // don't let uncertainty go below this
export const INITIAL_RATING = 100;
export const INITIAL_UNCERTAINTY = 50;
export const SKILLS_BONUS_DIVISOR = 5;
export const REGIME_CHANGE_THRESHOLD = 0.7;
export const SCOUT_NEEDED_THRESHOLD = U_MIN * 2.5; // 25 - this is when we flag teams for re-scout

// error function approximation from Abramowitz & Stegun
// grabbed this formula from wikipedia, max error around 1.5e-7 which is fine for us
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

// normal CDF - basically gives us win probability
export function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

// how "strong" a bot looks to the model - rating divided by uncertainty
// higher means we're more confident they're actually good
export function botStrength(rating: number, uncertainty: number): number {
  if (uncertainty === 0) return rating;
  return rating / uncertainty;
}

// splits credit between two partners based on who's stronger
// the better bot gets more blame/credit for how the match went
export function creditDistribution(
  rating1: number,
  uncertainty1: number,
  rating2: number,
  uncertainty2: number,
  w: number = W
): { credit1: number; credit2: number } {
  const sa = botStrength(rating1, uncertainty1);
  const sb = botStrength(rating2, uncertainty2);

  // shouldn't happen with U_MIN but just in case
  const sumS = sa + sb;
  if (sumS === 0) return { credit1: 0.5, credit2: 0.5 };

  const daBase = sa / sumS;
  const dbBase = sb / sumS;

  const da = w * daBase + (1 - w) / 2;
  const db = w * dbBase + (1 - w) / 2;

  return { credit1: da, credit2: db };
}

// combines the alliance into one rating + uncertainty
// weights it 70/30 between strongest and weakest team
// this worked pretty well - the middle bot doesn't matter as much
// for predicting alliance outcomes
export function allianceStats(teams: Array<{ rating: number; uncertainty: number }>): {
  rating: number;
  uncertainty: number;
} {
  const sorted = [...teams].sort((a, b) => b.rating - a.rating);

  // we handle 2v2 and 3v3 - VRC does both depending on the event format
  // the schema has 3 slots per alliance so we just handle whatever we get
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

// uses normal CDF to get win probability between two alliances
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

// the actual rating update - classic elo-style but with credit weighting
export function updateTeamRating(
  currentRating: number,
  creditFactor: number,
  delta: number,
  k: number = K
): number {
  const newRating = currentRating + k * creditFactor * delta;
  return Math.max(0, newRating);
}

// updates how uncertain we are about a team
// if the result was really surprising, we actually increase uncertainty
// because maybe something changed with their bot (regime change)
export function updateTeamUncertainty(
  currentUncertainty: number,
  creditFactor: number,
  surpriseFactor: number,
  k: number = 0.5,
  uMin: number = U_MIN
): number {
  // big surprise = maybe their bot changed, expand uncertainty
  if (surpriseFactor > REGIME_CHANGE_THRESHOLD) {
    return Math.min(INITIAL_UNCERTAINTY, currentUncertainty * 1.2);
  }
  const newUncertainty = currentUncertainty * (1 - k * creditFactor * surpriseFactor);
  return Math.max(uMin, newUncertainty);
}

// if a team has driver skills scores, give them a small initial bump
export function initialRatingWithSkillsBoost(
  driverSkillsScore: number | null,
  baseRating: number = INITIAL_RATING,
  divisor: number = SKILLS_BONUS_DIVISOR
): number {
  if (driverSkillsScore === null) return baseRating;
  return baseRating + driverSkillsScore / divisor;
}

// turns uncertainty into a 0-100 confidence percentage for the UI
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

// the big function - takes winning and losing teams from a match
// and computes how everyone's rating should change
//
// credit distribution for 3 teams works by pairing them:
//   strongest<->middle and middle<->weakest
//   then averaging the middle bot's credit from both pairs
// this was the part that took me the longest to figure out lol
export function computeBayesianMatchUpdate(
  winningTeams: BayesianTeamInput[],
  losingTeams: BayesianTeamInput[],
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
  // get combined alliance stats
  const winStats = allianceStats(winningTeams);
  const loseStats = allianceStats(losingTeams);

  // how likely was the winning alliance to win?
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

  // same thing from the losers' perspective
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

  // figure out credit for each winning team
  const winningSorted = [...winningTeams].map((t, i) => ({ ...t, originalIndex: i }))
    .sort((a, b) => b.rating - a.rating);

  const winningCredits = new Map<string, number>();

  if (winningSorted.length === 2) {
    const cv = creditDistribution(winningSorted[0].rating, winningSorted[0].uncertainty, winningSorted[1].rating, winningSorted[1].uncertainty, constants.w);
    winningCredits.set(winningSorted[0].id, cv.credit1);
    winningCredits.set(winningSorted[1].id, cv.credit2);
  } else if (winningSorted.length >= 3) {
    const cv_Strong_Mid = creditDistribution(winningSorted[0].rating, winningSorted[0].uncertainty, winningSorted[1].rating, winningSorted[1].uncertainty, constants.w);
    const cv_Mid_Weak = creditDistribution(winningSorted[1].rating, winningSorted[1].uncertainty, winningSorted[2].rating, winningSorted[2].uncertainty, constants.w);
    winningCredits.set(winningSorted[0].id, cv_Strong_Mid.credit1);
    winningCredits.set(winningSorted[2].id, cv_Mid_Weak.credit2);
    winningCredits.set(winningSorted[1].id, (cv_Strong_Mid.credit2 + cv_Mid_Weak.credit1) / 2);
  } else {
    winningCredits.set(winningSorted[0].id, 1);
  }

  const winningUpdates: BayesianMatchUpdate[] = winningTeams.map(team => {
    const da = winningCredits.get(team.id) || 0.33;
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

  // same process for losing teams
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
    const rAfter = updateTeamRating(team.rating, db, deltaLose, constants.k);
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

// handles ties - both alliances get deltaed toward 0.5
export function computeBayesianTieUpdate(
  redTeams: BayesianTeamInput[],
  blueTeams: BayesianTeamInput[],
  constants: { k: number; w: number; uMatch: number; uMin: number } = {
    k: K, w: W, uMatch: U_MATCH, uMin: U_MIN,
  }
): BayesianMatchUpdate[] {
  const redStats = allianceStats(redTeams);
  const blueStats = allianceStats(blueTeams);

  const actual = 0.5;

  // red's side
  const expectedRed = expectedOutcome(
    redStats.rating, redStats.uncertainty,
    blueStats.rating, blueStats.uncertainty,
    constants.uMatch
  );
  const deltaRed = actual - expectedRed;
  const surpriseRed = Math.abs(deltaRed);

  // blue's side
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
