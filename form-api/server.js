const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Database = require('better-sqlite3');
const https = require('https');
const path = require('path');

const app = express();
const PORT       = process.env.PORT        || 3737;
const GH_TOKEN   = process.env.GH_TOKEN   || '';
const GH_OWNER   = process.env.GH_OWNER   || 'autobb888';
const GH_REPO    = process.env.GH_REPO    || 'verus-wiki';
const GH_BASE    = process.env.GH_BASE    || 'main';
const DB_PATH    = path.join(__dirname, 'submissions.db');

// --- Database setup ---
const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    section    TEXT    NOT NULL,
    title      TEXT    NOT NULL,
    content    TEXT    NOT NULL,
    submitter  TEXT,
    ip         TEXT,
    status     TEXT    NOT NULL DEFAULT 'pending',
    pr_url     TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// Add pr_url column if upgrading from old schema
try { db.exec(`ALTER TABLE submissions ADD COLUMN pr_url TEXT`); } catch {}

// --- Middleware ---
app.use(express.json());

const allowedOrigins = [
  'https://wiki.autobb.app',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://127.0.0.1:5175',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  }
}));

// Rate limit: 5 submissions per IP per hour
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please wait an hour before trying again.' }
});

// --- Valid sections ---
const VALID_SECTIONS = [
  'Getting Started',
  'Command Reference',
  'Concepts',
  'How-To Guides',
  'Tutorials',
  'Developers',
  'For Agents',
  'Research',
  'Troubleshooting',
  'FAQ',
  'Other / New Section'
];

// --- GitHub API helper ---
function ghApi(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path:     `/repos/${GH_OWNER}/${GH_REPO}${endpoint}`,
      method,
      headers: {
        'Authorization': `Bearer ${GH_TOKEN}`,
        'Accept':        'application/vnd.github+json',
        'User-Agent':    'verus-wiki-bot/1.0',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function createPR(id, section, title, content, submitter) {
  if (!GH_TOKEN) return null;

  const slug  = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
  const branch = `wiki-suggestion/${id}-${slug}`;
  const filePath = `suggestions/${id}-${slug}.md`;

  const fileContent = [
    `# [Suggestion #${id}] ${title}`,
    '',
    `**Section:** ${section}`,
    `**Submitted by:** ${submitter || 'Anonymous'}`,
    `**Date:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    '---',
    '',
    content,
  ].join('\n');

  // 1. Get the SHA of the base branch tip
  const ref = await ghApi('GET', `/git/ref/heads/${GH_BASE}`);
  if (ref.status !== 200) throw new Error(`Could not get base ref: ${JSON.stringify(ref.body)}`);
  const baseSha = ref.body.object.sha;

  // 2. Create the new branch
  const branchRes = await ghApi('POST', '/git/refs', {
    ref: `refs/heads/${branch}`,
    sha: baseSha
  });
  if (branchRes.status !== 201) throw new Error(`Branch creation failed: ${JSON.stringify(branchRes.body)}`);

  // 3. Create the file on the branch
  const fileRes = await ghApi('PUT', `/contents/${filePath}`, {
    message: `wiki suggestion #${id}: ${title}`,
    content: Buffer.from(fileContent).toString('base64'),
    branch,
  });
  if (fileRes.status !== 201) throw new Error(`File creation failed: ${JSON.stringify(fileRes.body)}`);

  // 4. Open the PR — mention @claude so it auto-reviews
  const prBody = [
    `A community member suggested a wiki update via the [Suggest an Edit](https://wiki.autobb.app/contribute/suggest-edit/) form.`,
    '',
    `**Section:** ${section}`,
    `**Title:** ${title}`,
    `**Submitted by:** ${submitter || 'Anonymous'}`,
    '',
    '---',
    '',
    '## Suggested content',
    '',
    content,
    '',
    '---',
    '',
    `@claude please review this wiki suggestion. Check if the information is accurate for the Verus protocol, suggest any corrections or improvements, and let us know if this is ready to be incorporated into the wiki. If it looks good, approve the PR.`,
  ].join('\n');

  const prRes = await ghApi('POST', '/pulls', {
    title:  `[Wiki suggestion] ${title}`,
    body:   prBody,
    head:   branch,
    base:   GH_BASE,
  });
  if (prRes.status !== 201) throw new Error(`PR creation failed: ${JSON.stringify(prRes.body)}`);

  return prRes.body.html_url;
}

// --- Routes ---

app.get('/api/health', (req, res) => {
  res.json({ ok: true, github: !!GH_TOKEN });
});

// Submit a contribution suggestion
app.post('/api/submit', limiter, async (req, res) => {
  const { section, title, content, submitter } = req.body || {};

  if (!section || !VALID_SECTIONS.includes(section)) {
    return res.status(400).json({ error: 'Invalid section.' });
  }
  if (!title || title.trim().length < 3 || title.trim().length > 200) {
    return res.status(400).json({ error: 'Title must be 3–200 characters.' });
  }
  if (!content || content.trim().length < 20 || content.trim().length > 10000) {
    return res.status(400).json({ error: 'Content must be 20–10,000 characters.' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip;

  const { lastInsertRowid: id } = db.prepare(`
    INSERT INTO submissions (section, title, content, submitter, ip)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    section.trim(),
    title.trim(),
    content.trim(),
    (submitter || '').trim().slice(0, 100) || null,
    ip
  );

  // Fire-and-forget GitHub PR (don't block the response)
  res.json({ ok: true, message: 'Submission received. Thank you!' });

  if (GH_TOKEN) {
    createPR(id, section.trim(), title.trim(), content.trim(), (submitter || '').trim())
      .then(prUrl => {
        if (prUrl) {
          db.prepare('UPDATE submissions SET pr_url = ?, status = ? WHERE id = ?')
            .run(prUrl, 'pr_opened', id);
          console.log(`[#${id}] PR opened: ${prUrl}`);
        }
      })
      .catch(err => {
        console.error(`[#${id}] PR creation failed:`, err.message);
      });
  }
});

// List submissions (admin)
app.get('/api/submissions', (req, res) => {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const status = req.query.status || 'pending';
  const rows = status === 'all'
    ? db.prepare('SELECT * FROM submissions ORDER BY created_at DESC').all()
    : db.prepare('SELECT * FROM submissions WHERE status = ? ORDER BY created_at DESC').all(status);

  res.json(rows);
});

// Mark a submission reviewed
app.post('/api/submissions/:id/review', (req, res) => {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const { status } = req.body;
  const allowed = ['reviewed', 'rejected', 'done'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  db.prepare('UPDATE submissions SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Verus Wiki form API on http://127.0.0.1:${PORT}  |  GitHub PR: ${GH_TOKEN ? 'enabled' : 'disabled (set GH_TOKEN)'}`);
});
