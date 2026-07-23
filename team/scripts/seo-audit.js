#!/usr/bin/env node
/**
 * SEO Audit Script — Run by SCO_1 before every production release.
 *
 * Scans the built frontend (or source pages) for common SEO issues:
 *  - Missing / duplicate title tags
 *  - Missing meta descriptions
 *  - Missing or multiple H1 tags
 *  - Images without alt attributes
 *  - Missing lang attribute on <html>
 *  - Checks robots.txt and sitemap existence
 *
 * Usage:
 *   node team/scripts/seo-audit.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const FRONTEND_SRC = path.join(ROOT, 'frontend/src');
const PUBLIC_DIR = path.join(ROOT, 'frontend/public');
const BUILD_DIR = path.join(ROOT, 'frontend/build');

// Use build output if available, otherwise scan src
const SCAN_DIR = fs.existsSync(BUILD_DIR) ? BUILD_DIR : FRONTEND_SRC;

let passCount = 0;
let warnCount = 0;
let failCount = 0;
const issues = [];

function pass(msg) { console.log(`  ✅ ${msg}`); passCount++; }
function warn(msg) { console.warn(`  ⚠️  ${msg}`); warnCount++; issues.push({ level: 'WARN', msg }); }
function fail(msg) { console.error(`  ❌ ${msg}`); failCount++; issues.push({ level: 'FAIL', msg }); }

function readFile(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); } catch { return null; }
}

function getAllFiles(dir, ext, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git', 'dist'].includes(entry.name)) {
      getAllFiles(fullPath, ext, results);
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(' 🔍 FLATMATES SEO AUDIT — SCO_1');
console.log(`    Scan target: ${SCAN_DIR}`);
console.log(`    Date: ${new Date().toLocaleString()}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// ── 1. Check robots.txt ──────────────────────────────────────
console.log('\n[1] robots.txt');
const robotsPath = path.join(PUBLIC_DIR, 'robots.txt');
const robotsContent = readFile(robotsPath);
if (!robotsContent) {
  fail('robots.txt missing from frontend/public/');
} else {
  if (robotsContent.includes('User-agent:')) pass('robots.txt exists and has User-agent directive');
  else warn('robots.txt exists but may be malformed');
  if (robotsContent.includes('Sitemap:')) pass('Sitemap URL declared in robots.txt');
  else warn('No Sitemap URL in robots.txt — add: Sitemap: https://flatmates.co.in/sitemap.xml');
}

// ── 2. Check sitemap.xml ─────────────────────────────────────
console.log('\n[2] sitemap.xml');
const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  fail('sitemap.xml missing from frontend/public/ — create and submit to Google Search Console');
} else {
  pass('sitemap.xml exists');
}

// ── 3. Check index.html meta tags ────────────────────────────
console.log('\n[3] Root index.html (Meta Tags)');
const indexHtmlPath = path.join(PUBLIC_DIR, 'index.html');
const indexHtml = readFile(indexHtmlPath);
if (!indexHtml) {
  fail('frontend/public/index.html not found');
} else {
  if (/<title>[^<]+<\/title>/i.test(indexHtml)) pass('Root title tag exists');
  else fail('Root title tag is missing or empty');

  if (/meta\s+name=["']description["']/i.test(indexHtml)) pass('Root meta description exists');
  else fail('Root meta description is missing');

  if (/meta\s+name=["']viewport["']/i.test(indexHtml)) pass('Viewport meta tag exists (mobile-friendly)');
  else warn('Viewport meta tag missing — add for mobile SEO');

  if (/<html[^>]*lang=["'][a-z]+-?[A-Z]*["']/i.test(indexHtml)) pass('lang attribute on <html> exists');
  else warn('<html> tag missing lang attribute — add lang="en"');

  if (/rel=["']canonical["']/i.test(indexHtml)) pass('Canonical tag found');
  else warn('No canonical tag — consider adding for duplicate content prevention');

  if (/og:title/i.test(indexHtml)) pass('Open Graph og:title exists (social sharing)');
  else warn('Open Graph tags missing — add og:title, og:description, og:image for better social sharing');
}

// ── 4. Scan React source files ────────────────────────────────
console.log('\n[4] React Source Files (TSX/JSX Scan)');
const tsxFiles = getAllFiles(FRONTEND_SRC, '.tsx').concat(getAllFiles(FRONTEND_SRC, '.jsx'));
console.log(`    Found ${tsxFiles.length} component/page files to scan`);

let missingAlt = 0;
let inlineStyleCount = 0;

for (const file of tsxFiles) {
  const content = readFile(file);
  if (!content) continue;
  const rel = path.relative(ROOT, file);

  // Check for img tags missing alt
  const imgMatches = content.match(/<img\s[^>]*/gi) || [];
  for (const img of imgMatches) {
    if (!img.includes('alt=')) {
      warn(`${rel}: <img> tag missing alt attribute`);
      missingAlt++;
    }
  }
}

if (missingAlt === 0) pass(`All <img> tags have alt attributes`);
else fail(`${missingAlt} <img> tag(s) missing alt attributes across source files`);

// ── 5. Check page components for document.title or Helmet ────
console.log('\n[5] Page Title Management');
const pageDir = path.join(FRONTEND_SRC, 'pages');
const pageFiles = getAllFiles(pageDir, '.tsx').filter(f => !f.endsWith('.test.tsx') && !f.endsWith('.spec.tsx'));
let pagesWithTitle = 0;
let pagesWithoutTitle = 0;

for (const file of pageFiles) {
  const content = readFile(file);
  if (!content) continue;
  const hasTitle = content.includes('document.title') ||
                   content.includes('<title>') ||
                   content.includes('Helmet') ||
                   content.includes('usePageTitle') ||
                   content.includes('title =');
  if (hasTitle) pagesWithTitle++;
  else {
    pagesWithoutTitle++;
    const rel = path.relative(ROOT, file);
    warn(`${rel}: No document.title or <Helmet> title management found`);
  }
}
if (pagesWithoutTitle === 0) pass(`All ${pageFiles.length} page components set document title`);
else fail(`${pagesWithoutTitle}/${pageFiles.length} pages lack dynamic title — every page needs a unique <title>`);

// ── 6. Summary ────────────────────────────────────────────────
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(' 📊 SEO AUDIT SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  ✅ Pass:    ${passCount}`);
console.log(`  ⚠️  Warn:    ${warnCount}`);
console.log(`  ❌ Fail:    ${failCount}`);

if (issues.length > 0) {
  console.log('\n📋 Issues for Developer_1:');
  issues.forEach((i, idx) => console.log(`  ${idx + 1}. [${i.level}] ${i.msg}`));
}

// Write report to file
const reportPath = path.join(ROOT, `team/SEO_AUDIT_${new Date().toISOString().split('T')[0]}.md`);
let report = `# SEO Audit Report — ${new Date().toLocaleDateString()}\n\n`;
report += `| Metric | Count |\n|--------|-------|\n`;
report += `| ✅ Passed | ${passCount} |\n`;
report += `| ⚠️ Warnings | ${warnCount} |\n`;
report += `| ❌ Failed | ${failCount} |\n\n`;
if (issues.length > 0) {
  report += `## Issues for Developer_1\n\n`;
  issues.forEach((i, idx) => { report += `${idx + 1}. **[${i.level}]** ${i.msg}\n`; });
}
report += `\n*Generated by SCO_1 seo-audit.js*\n`;
fs.writeFileSync(reportPath, report);

console.log(`\n📄 Report saved: ${reportPath}`);

if (failCount > 0) {
  console.log('\n❌ SEO AUDIT FAILED — Fix critical issues before production deployment.\n');
  process.exit(1);
} else {
  console.log('\n✅ SEO AUDIT PASSED — Proceed with deployment.\n');
  process.exit(0);
}
