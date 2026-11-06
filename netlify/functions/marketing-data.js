// Admin marketing dashboard data endpoint (/admin/dashboard).
// Returns netlify/data/marketing.json only to signed-in admins:
//   - a GitHub token with push access to the site repo (the same login Decap CMS uses at /admin), or
//   - the shared password in the DASHBOARD_PASSWORD env var (optional, for partners without GitHub).
// Optional live form counts: set NETLIFY_API_TOKEN (personal access token) and, if needed,
// NETLIFY_SITE_ID. Without them the dashboard uses the weekly numbers in marketing.json.

const data = require('../data/marketing.json');

const REPO = 'sajeshpjose/GrandMoor';

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body)
});

async function hasRepoAccess(token) {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'grandmoor-admin-dashboard'
      }
    });
    if (!res.ok) return false;
    const repo = await res.json();
    return Boolean(repo.permissions && (repo.permissions.push || repo.permissions.admin));
  } catch (e) {
    return false;
  }
}

function passwordMatches(given) {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected || !given || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

async function liveFormCounts() {
  const token = process.env.NETLIFY_API_TOKEN;
  const siteId = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  if (!token || !siteId) return null;
  try {
    const res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/submissions?per_page=200`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const subs = await res.json();
    const now = Date.now();
    const counts = { last7: {}, last30: {}, total7: 0, total30: 0 };
    for (const s of subs) {
      const age = (now - new Date(s.created_at).getTime()) / 86400000;
      const name = s.form_name || 'unknown';
      if (age <= 30) { counts.last30[name] = (counts.last30[name] || 0) + 1; counts.total30++; }
      if (age <= 7) { counts.last7[name] = (counts.last7[name] || 0) + 1; counts.total7++; }
    }
    counts.asOf = new Date().toISOString();
    return counts;
  } catch (e) {
    return null;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed' });

  const auth = event.headers.authorization || event.headers.Authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const password = event.headers['x-dashboard-password'] || '';

  const allowed = passwordMatches(password) || (token && (await hasRepoAccess(token)));
  if (!allowed) {
    return json(401, { error: 'Not signed in', passwordEnabled: Boolean(process.env.DASHBOARD_PASSWORD) });
  }

  return json(200, { ...data, liveForms: await liveFormCounts() });
};
