// loadTitles.js
// This script reads your titles.xlsx file and converts it to the
// JavaScript format that the React frontend understands.
// Run it with: node loadTitles.js

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ── Step 1: Read the Excel file ──────────────────────────────────────────────
const filePath = path.join(__dirname, 'titles.xlsx');

if (!fs.existsSync(filePath)) {
  console.error('❌  Could not find titles.xlsx in the server/ folder.');
  console.error('    Make sure the file is at: vibeshelf/server/titles.xlsx');
  process.exit(1);
}

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0]; // reads the first sheet
const sheet = workbook.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(sheet); // converts to array of objects

console.log(`✅  Found ${rows.length} rows in "${sheetName}" sheet`);

// ── Step 2: Validate and transform each row ──────────────────────────────────
const VALID_TYPES = ['book', 'film', 'game'];
const VALID_TAGS = [
  "Epic Fantasy", "Dark & Gritty", "Found Family", "Magic & Sorcery",
  "Coming of Age", "Cozy & Wholesome", "Mystery & Suspense", "Sci-Fi & Futuristic",
  "Romance", "Horror", "Action & Adventure", "Philosophical", "Historical",
  "Psychological", "Mythology", "Post-Apocalyptic", "Political Intrigue", "Heist",
];

const errors = [];
const titles = [];

rows.forEach((row, index) => {
  const rowNum = index + 2; // +2 because row 1 is headers
  const issues = [];

  // Check required fields
  if (!row.id)    issues.push('Missing "id" column');
  if (!row.title) issues.push('Missing "title" column');
  if (!row.type)  issues.push('Missing "type" column');
  if (!row.tags)  issues.push('Missing "tags" column');
  if (!row.blurb) issues.push('Missing "blurb" column');

  // Check type is valid
  if (row.type && !VALID_TYPES.includes(row.type.toLowerCase().trim())) {
    issues.push(`"type" must be book, film, or game — got "${row.type}"`);
  }

  // Parse and validate tags (comma-separated in Excel)
  let parsedTags = [];
  if (row.tags) {
    parsedTags = row.tags.split(',').map(t => t.trim()).filter(Boolean);
    const badTags = parsedTags.filter(t => !VALID_TAGS.includes(t));
    if (badTags.length > 0) {
      issues.push(`Unknown tags: ${badTags.join(', ')} — check spelling and capitalisation`);
    }
  }

  if (issues.length > 0) {
    errors.push(`Row ${rowNum} ("${row.title || 'unknown'}"): ${issues.join(' | ')}`);
    return; // skip this row
  }

  // Build the clean title object
  titles.push({
    id:    String(row.id).trim().toLowerCase().replace(/\s+/g, '-'),
    title: String(row.title).trim(),
    short: row.short ? String(row.short).trim() : String(row.title).trim().slice(0, 20),
    type:  String(row.type).trim().toLowerCase(),
    meta:  row.meta  ? String(row.meta).trim()  : '',
    genre: row.genre ? String(row.genre).trim() : '',
    tags:  parsedTags,
    blurb: String(row.blurb).trim(),
  });
});

// ── Step 3: Report any errors ────────────────────────────────────────────────
if (errors.length > 0) {
  console.warn('\n⚠️  The following rows had problems and were skipped:');
  errors.forEach(e => console.warn('   •', e));
}

if (titles.length === 0) {
  console.error('\n❌  No valid titles found. Fix the errors above and try again.');
  process.exit(1);
}

console.log(`\n✅  ${titles.length} titles processed successfully`);
console.log(`    📚 Books : ${titles.filter(t => t.type === 'book').length}`);
console.log(`    🎬 Films : ${titles.filter(t => t.type === 'film').length}`);
console.log(`    🎮 Games : ${titles.filter(t => t.type === 'game').length}`);

// ── Step 4: Write the output file ────────────────────────────────────────────
// Collect all unique tags across all titles (for the TAGS export)
const allTags = [...new Set(titles.flatMap(t => t.tags))].sort();

const outputContent = `// ============================================================
// AUTO-GENERATED FILE — DO NOT EDIT MANUALLY
// Generated from: titles.xlsx
// Generated on:   ${new Date().toLocaleString()}
// Total titles:   ${titles.length}
// ============================================================

export const TAGS = ${JSON.stringify(allTags, null, 2)};

export const TITLES = ${JSON.stringify(titles, null, 2)};

// These are AI-suggested extras shown in the "Beyond the shelf" section.
// Edit this manually if you want custom AI pool entries.
export const AI_POOL = [];
export const AI_GROUPS = [];

export const TYPE_COLOR = { book: '#D4A843', film: '#E05C7A', game: '#3BBFA3' };
export const TYPE_BG = {
  book: 'linear-gradient(135deg, #2D1F0A 0%, #1A1208 100%)',
  film: 'linear-gradient(135deg, #1F0A12 0%, #120812 100%)',
  game: 'linear-gradient(135deg, #0A1F1A 0%, #081212 100%)',
};
`;

const outputPath = path.join(__dirname, '..', 'client', 'src', 'data', 'titles.js');
fs.writeFileSync(outputPath, outputContent, 'utf8');

console.log(`\n🎉  Done! Written to: client/src/data/titles.js`);
console.log(`    Restart "npm run dev" in the client folder to see your changes.\n`);
