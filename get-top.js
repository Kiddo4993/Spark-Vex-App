const fs = require('fs');
const { parse } = require('csv-parse/sync');

const hsLines = parse(fs.readFileSync('/Users/dylanduan/Downloads/skills-standings (5).csv'), { columns: true, skip_empty_lines: true });
const msLines = parse(fs.readFileSync('/Users/dylanduan/Downloads/skills-standings (3).csv'), { columns: true, skip_empty_lines: true });

const getTop = (lines, count) => {
    const unique = new Map();
    lines.forEach(l => {
        const raw = String(l['Team Number']);
        if (!raw || raw === 'undefined') return;
        const t = raw.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (!unique.has(t)) {
            unique.set(t, {
                teamNumber: t,
                score: parseInt(l.Score || '0', 10),
                auton: parseInt(l['Autonomous Coding Skills'] || '0', 10),
                driver: parseInt(l['Driver Skills'] || '0', 10)
            });
        }
    });
    return Array.from(unique.values()).sort((a, b) => b.score - a.score).slice(0, count);
};

console.log('Top HS:', JSON.stringify(getTop(hsLines, 6), null, 2));
console.log('Top MS:', JSON.stringify(getTop(msLines, 6), null, 2));
