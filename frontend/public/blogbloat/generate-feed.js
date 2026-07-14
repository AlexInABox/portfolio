//////////////////////////////////////////////////////
///////      THIS IS 100% AI SLOP.            ////////
/////// I DIDNT WRITE A SINGLE LINE OF THIS!! ////////
//////////////////////////////////////////////////////

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { JSDOM } = require('jsdom');

// Set up DOMPurify for Node.js
const window = new JSDOM('').window;
global.window = window;
const createDOMPurify = require('dompurify');
const DOMPurify = createDOMPurify(window);

const dirPath = __dirname;
const jsonPath = path.join(dirPath, 'all.json');
const xmlPath = path.join(dirPath, 'atom.xml');
const publicDir = path.resolve(dirPath, '..');

// 1. Read all.json
if (!fs.existsSync(jsonPath)) {
  console.error(`Error: Could not find all.json at ${jsonPath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(rawData);

if (!data.entries || !Array.isArray(data.entries)) {
  console.error('Error: all.json is missing "entries" array.');
  process.exit(1);
}

// Helper to parse DD.MM.YYYY into Date object in UTC
function parseDateUTC(dateStr) {
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(Date.UTC(year, month, day));
  }
  return new Date(dateStr);
}

// 2. Sort entries by date descending (newest first)
data.entries.sort((a, b) => {
  return parseDateUTC(b.date) - parseDateUTC(a.date);
});

// Write the sorted entries back to all.json to keep it clean and ordered
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 4), 'utf8');
console.log('Successfully sorted and updated all.json');

// 3. Generate Atom feed XML
function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

const siteUrl = 'https://alexinabox.de/';
const feedUrl = `${siteUrl}blogbloat/atom.xml`;
const blogbloatUrl = `${siteUrl}blogbloat/`;

// Feed updated date should be the current time always
const feedUpdated = new Date().toISOString();

let xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>alexinabox.de</title>
  <link href="${escapeXml(feedUrl)}" rel="self" type="application/atom+xml"/>
  <link href="${escapeXml(siteUrl)}"/>
  <id>${escapeXml(blogbloatUrl)}</id>
  <updated>${feedUpdated}</updated>
  <author>
    <name>Alex</name>
    <email>webmaster@alexinabox.de</email>
  </author>
`;

data.entries.forEach(entry => {
  const entryDate = parseDateUTC(entry.date).toISOString();
  const entryAbsoluteUrl = `${siteUrl}${entry.path}`;
  const entryId = entryAbsoluteUrl;
  const currentIsoString = new Date().toISOString();

  // Process markdown file and generate HTML for feed content
  const mdPath = path.join(publicDir, entry.path);
  let htmlContent = '';

  if (fs.existsSync(mdPath)) {
    try {
      const markdownContent = fs.readFileSync(mdPath, 'utf8');
      htmlContent = DOMPurify.sanitize(marked.parse(markdownContent));
      console.log(`Successfully parsed ${entry.path} to HTML`);
    } catch (err) {
      console.error(`Error processing markdown file at ${mdPath}:`, err);
    }
  } else {
    console.warn(`Warning: Markdown file not found at ${mdPath}`);
  }

  xml += `  <entry>
    <title>${escapeXml(entry.title)}</title>
    <link href="https://alexinabox.de/#blogbloat"/>
    <id>${escapeXml(entryId)}</id>
    <updated>${currentIsoString}</updated>
    <published>${entryDate}</published>
    <summary type="html">${escapeXml(entry.description || '')}</summary>
    <content type="html">${escapeXml(htmlContent)}</content>
`;

  if (entry.tags && entry.tags.length > 0) {
    entry.tags.forEach(tag => {
      xml += `    <category term="${escapeXml(tag)}"/>\n`;
    });
  }

  xml += `  </entry>\n`;
});

xml += `</feed>\n`;

// 4. Write to atom.xml (overwriting old one)
fs.writeFileSync(xmlPath, xml, 'utf8');
console.log('Successfully generated and updated atom.xml');
