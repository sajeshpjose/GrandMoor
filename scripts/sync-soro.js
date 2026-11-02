#!/usr/bin/env node
// Pull articles that Soro.ai writes for grandmoor.ca and save each one as
// content/blog/soro/<slug>.json. scripts/md-to-html.js then turns them into
// normal, crawlable pages at /blog/<slug> with the site header, schema and
// sitemap entry. Runs daily from .github/workflows/soro-sync.yml.
//
// Uses the same public embed endpoint the old /blog-widget page loaded in the
// browser, so no API key is needed. Requires Node 18+ (global fetch).

const fs = require('fs');
const path = require('path');

const API = 'https://app.trysoro.com';
const TOKEN = process.env.SORO_EMBED_TOKEN || 'ca878f2d-a1e5-469b-a6be-0701b3fcb1bf';
const OUT_DIR = path.join(__dirname, '..', 'content', 'blog', 'soro');
const REFRESH = process.argv.includes('--refresh'); // re-download articles already saved

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(url, as = 'text', tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'grandmoor-site-sync/1.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return as === 'json' ? res.json() : res.text();
    } catch (err) {
      if (i >= tries) throw new Error(`${url}: ${err.message}`);
      await sleep(1500 * i);
    }
  }
}

// Pull the SORO_ARTICLES array literal out of the embed script by scanning for
// its matching closing bracket (string-aware), then JSON.parse it.
function extractArticles(js) {
  const marker = js.indexOf('SORO_ARTICLES');
  if (marker === -1) throw new Error('SORO_ARTICLES not found in embed script');
  const start = js.indexOf('[', marker);
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < js.length; i++) {
    const c = js[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '[') depth++;
    else if (c === ']' && --depth === 0) return JSON.parse(js.slice(start, i + 1));
  }
  throw new Error('Could not find the end of SORO_ARTICLES');
}

function validSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9][a-z0-9-]{1,120}$/.test(slug);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const js = await get(`${API}/api/embed/${TOKEN}`);
  const list = extractArticles(js);
  console.log(`Soro lists ${list.length} article(s)`);

  let added = 0, kept = 0, failed = 0;
  for (const item of list) {
    if (!validSlug(item.slug) || !item.id || !item.title) {
      console.warn(`Skipping malformed entry: ${JSON.stringify(item).slice(0, 120)}`);
      failed++;
      continue;
    }
    const file = path.join(OUT_DIR, `${item.slug}.json`);
    if (fs.existsSync(file) && !REFRESH) { kept++; continue; }

    try {
      const detail = await get(`${API}/api/embed/${TOKEN}/article/${item.id}`, 'json');
      const content = detail && detail.content;
      if (!content || typeof content !== 'string') throw new Error('empty content');
      const record = {
        id: item.id,
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt || '',
        isoDate: item.isoDate,
        image: item.image || detail.image || null,
        content,
        source: 'soro',
      };
      fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n', 'utf-8');
      console.log(`+ ${item.slug}`);
      added++;
      await sleep(400);
    } catch (err) {
      console.warn(`! ${item.slug}: ${err.message}`);
      failed++;
    }
  }
  console.log(`Done: ${added} new, ${kept} already saved, ${failed} failed`);
  // Fail the run only if nothing could be fetched at all
  if (failed && !added && !kept) process.exit(1);
})().catch(err => { console.error(err.message); process.exit(1); });
