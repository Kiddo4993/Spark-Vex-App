/**
 * Skills ranking calculation logic.
 * Ranks teams by combined/driver/auton skills and computes provincial + worldwide ranks.
 */

export interface SkillsInput {
  teamId: string;
  driverSkillsScore?: number | null;
  autonomousSkillsScore?: number | null;
  combinedSkillsScore?: number | null;
}

/**
 * Sort teams by combined skills (desc), then driver, then auton.
 * Returns array with rank (1-based) attached.
 */
export function rankByCombinedSkills(teams: SkillsInput[]): Array<SkillsInput & { rank: number }> {
  const sorted = [...teams].sort((a, b) => {
    const aComb = a.combinedSkillsScore ?? 0;
    const bComb = b.combinedSkillsScore ?? 0;
    if (bComb !== aComb) return bComb - aComb;
    const aDrv = a.driverSkillsScore ?? 0;
    const bDrv = b.driverSkillsScore ?? 0;
    if (bDrv !== aDrv) return bDrv - aDrv;
    const aAut = a.autonomousSkillsScore ?? 0;
    const bAut = b.autonomousSkillsScore ?? 0;
    return bAut - aAut;
  });
  return sorted.map((t, i) => ({ ...t, rank: i + 1 }));
}

/**
 * Compute worldwide and provincial ranks for all teams.
 * provinceState is optional; if provided, provincial rank is within that region.
 */
export function computeSkillsRanks(
  teams: Array<SkillsInput & { provinceState?: string | null }>
): Map<string, { worldwideRank: number; provincialRank: number | null }> {
  const worldwide = rankByCombinedSkills(teams);
  const byProvince = new Map<string, typeof teams>();
  for (const t of teams) {
    const key = t.provinceState ?? "";
    if (!byProvince.has(key)) byProvince.set(key, []);
    byProvince.get(key)!.push(t);
  }
  const provincialRanks = new Map<string, Map<string, number>>();
  byProvince.forEach((list, prov) => {
    const ranked = rankByCombinedSkills(list);
    const m = new Map<string, number>();
    ranked.forEach((r) => m.set((r as SkillsInput & { teamId: string }).teamId, (r as SkillsInput & { rank: number }).rank));
    provincialRanks.set(prov, m);
  });
  const result = new Map<string, { worldwideRank: number; provincialRank: number | null }>();
  worldwide.forEach((r) => {
    const teamId = (r as SkillsInput & { teamId: string }).teamId;
    const worldRank = (r as SkillsInput & { rank: number }).rank;
    const prov = teams.find((t) => t.teamId === teamId)?.provinceState ?? "";
    const provRank = provincialRanks.get(prov)?.get(teamId) ?? null;
    result.set(teamId, { worldwideRank: worldRank, provincialRank: provRank });
  });
  return result;
}
