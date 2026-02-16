
import {
    botStrength,
    creditDistribution,
    allianceStats,
    expectedOutcome,
    computeBayesianMatchUpdate,
    K, W, U_MATCH, U_MIN
} from "../src/lib/bayesian";
import { strict as assert } from "assert";

console.log("Starting verification of Bayesian logic...");

// 1. Bot Strength
console.log("\n--- Testing Bot Strength ---");
const strength = botStrength(140, 20);
console.log(`botStrength(140, 20) = ${strength}`);
assert.equal(strength, 7, "Strength should be rating / uncertainty");

// 2. Credit Distribution
console.log("\n--- Testing Credit Distribution ---");
// Strong bot (140, 20) vs Weak bot (100, 50)
// Sa = 7, Sb = 2
// Base share = 7 / 9 approx 0.77
// Weighted share = 0.7 * 0.77 + 0.15 = 0.69
const credits = creditDistribution(140, 20, 100, 50, W);
console.log("Strong (140, 20) vs Weak (100, 50):", credits);
assert(credits.credit1 > credits.credit2, "Stronger bot should get more credit");

// 3. Alliance Stats
console.log("\n--- Testing Alliance Stats ---");
// Alliance with 3 teams: Strong, Med, Weak
const teams = [
    { rating: 150, uncertainty: 20 },
    { rating: 120, uncertainty: 30 },
    { rating: 90, uncertainty: 40 }
];
const stats = allianceStats(teams);
console.log("Alliance Stats:", stats);
// 150 * 0.7 + 90 * 0.3 = 105 + 27 = 132
assert.equal(Math.round(stats.rating), 132, "Alliance rating should be weighted towards strongest/weakest");

// 4. Expected Outcome
console.log("\n--- Testing Expected Outcome ---");
// Alliance A (132 rating) vs Alliance B (120 rating)
const prob = expectedOutcome(132, 30, 120, 30, U_MATCH);
console.log(`Expected Win % for A (132 vs 120): ${(prob * 100).toFixed(1)}%`);
assert(prob > 0.5, "Higher rated alliance should be favored");

// 5. Full Match Update
console.log("\n--- Testing Full Match Update ---");
const redTeams = [
    { id: "r1", rating: 150, uncertainty: 20 },
    { id: "r2", rating: 120, uncertainty: 30 },
    { id: "r3", rating: 90, uncertainty: 40 }
];
const blueTeams = [
    { id: "b1", rating: 100, uncertainty: 40 },
    { id: "b2", rating: 100, uncertainty: 40 },
    { id: "b3", rating: 100, uncertainty: 40 }
];

// Red wins (expected)
const updates = computeBayesianMatchUpdate(redTeams, blueTeams, { k: K, w: W, uMatch: U_MATCH, uMin: U_MIN });
console.log("Red Wins Updates:", updates);

// Check if Red ratings went up
updates.winning.forEach(u => {
    console.log(`Red Team ${u.teamId}: ${u.ratingBefore.toFixed(1)} -> ${u.ratingAfter.toFixed(1)} (+${(u.ratingAfter - u.ratingBefore).toFixed(1)})`);
    assert(u.ratingAfter > u.ratingBefore, "Winning team rating should increase");
});

// Check if Blue ratings went down
updates.losing.forEach(u => {
    console.log(`Blue Team ${u.teamId}: ${u.ratingBefore.toFixed(1)} -> ${u.ratingAfter.toFixed(1)} (${(u.ratingAfter - u.ratingBefore).toFixed(1)})`);
    assert(u.ratingAfter < u.ratingBefore, "Losing team rating should decrease");
});

console.log("\n✅ Verification Successful!");
