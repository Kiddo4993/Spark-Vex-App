const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function parseTournament(filename) {
    const wb = XLSX.readFile(filename);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const matches = [];
    for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r || !r[1]) continue;
        const matchName = String(r[1]);
        if (matchName.startsWith('Practice')) continue;
        const redTeam1 = r[2], redTeam2 = r[3], blueTeam1 = r[4], blueTeam2 = r[5];
        const redScore = Number(r[6]) || 0;
        const blueScore = Number(r[7]) || 0;
        if (!redTeam1 || !blueTeam1) continue;
        matches.push({ matchName, redTeam1, redTeam2: redTeam2 || null, blueTeam1, blueTeam2: blueTeam2 || null, redScore, blueScore });
    }
    return matches;
}

function runBayesian(matches) {
    const ratings = {};
    function getR(t) {
        if (!ratings[t]) ratings[t] = { rating: 100, uncertainty: 50, matchCount: 0 };
        return ratings[t];
    }

    for (const m of matches) {
        const redTeams = [m.redTeam1, m.redTeam2].filter(Boolean);
        const blueTeams = [m.blueTeam1, m.blueTeam2].filter(Boolean);

        let redSum = 0;
        for (const t of redTeams) redSum += getR(t).rating;
        const redAvg = redSum / redTeams.length;

        let blueSum = 0;
        for (const t of blueTeams) blueSum += getR(t).rating;
        const blueAvg = blueSum / blueTeams.length;

        const diff = redAvg - blueAvg;
        const expectedRed = 1 / (1 + Math.pow(10, -diff / 100));
        const actualRed = m.redScore > m.blueScore ? 1 : m.redScore < m.blueScore ? 0 : 0.5;
        const surprise = Math.abs(actualRed - expectedRed);

        const totalScore = (m.redScore + m.blueScore) || 1;

        for (const t of redTeams) {
            const r = getR(t);
            const carry = m.redScore / (totalScore * redTeams.length);
            const K = Math.max(2, r.uncertainty / 5);
            r.rating += K * (actualRed - expectedRed) * (1 + carry);
            r.uncertainty = Math.max(1, r.uncertainty - (1 - surprise) * 2);
            r.matchCount++;
        }
        for (const t of blueTeams) {
            const r = getR(t);
            const carry = m.blueScore / (totalScore * blueTeams.length);
            const K = Math.max(2, r.uncertainty / 5);
            r.rating += K * ((1 - actualRed) - (1 - expectedRed)) * (1 + carry);
            r.uncertainty = Math.max(1, r.uncertainty - (1 - surprise) * 2);
            r.matchCount++;
        }
    }

    const sorted = Object.entries(ratings)
        .map(function (entry) {
            return {
                teamNumber: entry[0],
                performanceRating: Math.round(entry[1].rating * 10) / 10,
                ratingUncertainty: Math.round(entry[1].uncertainty * 10) / 10,
                matchCount: entry[1].matchCount
            };
        })
        .sort(function (a, b) { return b.performanceRating - a.performanceRating; });

    return sorted;
}

const root = path.resolve(__dirname, '..');

const files = [
    { file: path.join(root, 'Spacecity.xls'), label: 'Space City' },
    { file: path.join(root, 'mechamayhem.xls'), label: 'Mecha Mayhem' },
    { file: path.join(root, 'Southridge.xls'), label: 'Southridge' },
];

const result = files.map(function (f) {
    const matches = parseTournament(f.file);
    const ranked = runBayesian(matches);
    console.log(f.label + ': ' + matches.length + ' matches, ' + ranked.length + ' teams');
    // Take top 50 for the sample data, full list for the view-more page
    return {
        label: f.label,
        teams: ranked.map(function (t, i) { return { id: String(i + 1), ...t }; })
    };
});

const outPath = path.join(root, 'src', 'lib', 'tournamentData.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log('Written to ' + outPath);
