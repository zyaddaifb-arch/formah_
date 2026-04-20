const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, '../constants/exerciseMapping.json');
const libraryPath = path.join(__dirname, '../store/exerciseLibrary.ts');

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
let libraryContent = fs.readFileSync(libraryPath, 'utf8');

// The library is an array of objects. We need to parse it out or reliably regex it.
// The easiest way is to match `{ id: '...', ... }` and check if that ID is valid in the mapping.

const exerciseRegex = /\{[^}]*id:\s*'([^']+)'[^}]*\}/g;

const newLibraryContent = libraryContent.replace(exerciseRegex, (match, id) => {
    // If the mapping exists and has a thumbnail, keep it. Otherwise, return almost nothing (we'll comment it out or remove it)
    if (mapping[id] && mapping[id].thumbnail) {
        return match;
    } else {
        // Return a special token or empty string, but since there are commas, it's safer to comment it out or return empty string with care.
        // Let's just return empty string, but we might leave trailing commas.
        return `/* REMOVED: ${id} */`;
    }
});

// Clean up trailing commas and multi-line gaps
const cleanedContent = newLibraryContent
    .replace(/\/\* REMOVED: [^]*? \*\/(,)?(\s*)/g, '')
    .replace(/,\s*,/g, ',') // double commas
    .replace(/\[\s*,/g, '[') // comma at start of array
    .replace(/,\s*\]/g, ']'); // comma at end of array

fs.writeFileSync(libraryPath, cleanedContent);
console.log('Cleaned up exercise library. Removed exercises without images.');
