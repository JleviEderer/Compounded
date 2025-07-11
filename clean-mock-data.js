
const fs = require('fs');
const path = require('path');

// Read the JSON file
const filePath = './client/src/fixtures/myMockData.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Function to recursively walk through the data and filter out "bad" state entries
function filterBadStates(obj) {
  if (Array.isArray(obj)) {
    return obj
      .filter(item => !(item && item.state === 'bad'))
      .map(item => filterBadStates(item));
  } else if (obj && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = filterBadStates(value);
    }
    return result;
  }
  return obj;
}

// Filter the data
const cleanedData = filterBadStates(data);

// Write back to the file
fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2));

console.log('✅ Successfully removed all "bad" state entries from myMockData.json');
console.log(`📊 Original logs: ${data.logs?.length || 0}`);
console.log(`📊 Cleaned logs: ${cleanedData.logs?.length || 0}`);
console.log(`📊 Removed: ${(data.logs?.length || 0) - (cleanedData.logs?.length || 0)} entries`);
