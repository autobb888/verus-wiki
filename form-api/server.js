const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
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
const DB_PATH    = process.env.DB_PATH || path.join(__dirname, 'submissions.db');

// Agent API keys — comma-separated list in env, e.g. "agent1:key1,agent2:key2"
// Format is "label:token" so you can track which agent submitted
const AGENT_API_KEYS = new Map(
  (process.env.AGENT_API_KEYS || '').split(',').filter(Boolean).map(entry => {
    const [label, token] = entry.split(':');
    return token ? [token, label] : [label, 'unknown'];
  })
);

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

db.exec(`
  CREATE TABLE IF NOT EXISTS agent_submissions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_label TEXT    NOT NULL,
    action      TEXT    NOT NULL DEFAULT 'new',
    file_path   TEXT    NOT NULL,
    title       TEXT    NOT NULL,
    content     TEXT    NOT NULL,
    summary     TEXT,
    status      TEXT    NOT NULL DEFAULT 'pending',
    pr_url      TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

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

// --- Search index (built from agent-index.json) ---
const SEARCH_INDEX = [];

function loadSearchIndex() {
  const indexPath = path.join(__dirname, '..', '.retype', 'agent-index.json');
  try {
    const data = JSON.parse(require('fs').readFileSync(indexPath, 'utf8'));
    SEARCH_INDEX.length = 0;
    for (const section of data.sections || []) {
      for (const page of section.pages || []) {
        SEARCH_INDEX.push({
          path: page.path,
          url: `${data.site}${page.path}`,
          title: page.title,
          description: page.description || '',
          tags: page.tags || [],
          section: section.title,
          sectionId: section.id,
          // Pre-compute lowercase searchable text
          _title: (page.title || '').toLowerCase(),
          _desc: (page.description || '').toLowerCase(),
          _tags: (page.tags || []).map(t => t.toLowerCase()),
        });
      }
    }
    console.log(`Search index loaded: ${SEARCH_INDEX.length} pages`);
  } catch (err) {
    console.error('Could not load search index:', err.message);
  }
}

loadSearchIndex();

function searchPages(query, limit = 10) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  const scored = SEARCH_INDEX.map(page => {
    let score = 0;
    for (const term of terms) {
      // Title matches (highest weight)
      if (page._title.includes(term)) score += 10;
      // Tag exact match
      if (page._tags.includes(term)) score += 8;
      // Tag partial match
      else if (page._tags.some(t => t.includes(term))) score += 4;
      // Description match
      if (page._desc.includes(term)) score += 3;
    }
    return { page, score };
  })
  .filter(r => r.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, limit);

  return scored.map(r => ({
    score: r.score,
    path: r.page.path,
    url: r.page.url,
    title: r.page.title,
    description: r.page.description,
    section: r.page.section,
    tags: r.page.tags,
  }));
}

// Rate limit for search: 30 per minute per IP
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many search requests. Please wait a moment.' }
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

// Public wiki search — no auth required
app.get('/api/search', searchLimiter, (req, res) => {
  const q = (req.query.q || '').trim().slice(0, 200);
  if (!q) {
    return res.status(400).json({
      error: 'Missing query parameter "q".',
      usage: 'GET /api/search?q=data+storage&limit=10',
    });
  }
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const results = searchPages(q, limit);
  res.json({
    query: q,
    count: results.length,
    results,
  });
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

// =============================================
// Agent API
// =============================================

// Auth middleware for agent endpoints
function agentAuth(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || !AGENT_API_KEYS.has(token)) {
    return res.status(401).json({ error: 'Invalid or missing API key.' });
  }
  req.agentLabel = AGENT_API_KEYS.get(token);
  next();
}

// Agent rate limit: 20 submissions per key per hour
const agentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.agentLabel || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Agent rate limit exceeded. Try again later.' }
});

// Valid target directories agents can write to
const VALID_DOCS_DIRS = [
  'command-reference', 'concepts', 'developers', 'faq', 'for-agents',
  'getting-started', 'how-to', 'introduction', 'research',
  'troubleshooting', 'tutorials'
];

// Discover sections and existing pages
app.get('/api/agent/sections', agentAuth, (req, res) => {
  res.json({
    sections: VALID_DOCS_DIRS,
    valid_form_sections: VALID_SECTIONS,
    usage: {
      endpoint: 'POST /api/agent/submit',
      headers: { 'Authorization': 'Bearer <your-api-key>', 'Content-Type': 'application/json' },
      body: {
        file_path: 'docs/<section>/<slug>.md  (required — target file path)',
        title: 'Page Title  (required)',
        content: 'Full markdown content  (required, 20–50000 chars)',
        summary: 'Brief description of what this adds/changes  (optional)',
        action: 'new | update  (optional, default: new)'
      }
    }
  });
});

// Agent submission → GitHub PR
app.post('/api/agent/submit', agentAuth, agentLimiter, async (req, res) => {
  const { file_path: filePath, title, content, summary, action } = req.body || {};

  // Validate action
  const validActions = ['new', 'update'];
  const act = action || 'new';
  if (!validActions.includes(act)) {
    return res.status(400).json({ error: `Invalid action. Must be one of: ${validActions.join(', ')}` });
  }

  // Validate file_path: must be under docs/ and end in .md
  if (!filePath || typeof filePath !== 'string') {
    return res.status(400).json({ error: 'file_path is required.' });
  }
  const cleanPath = filePath.replace(/^\/+/, '');
  if (!cleanPath.startsWith('docs/') || !cleanPath.endsWith('.md')) {
    return res.status(400).json({ error: 'file_path must start with "docs/" and end with ".md".' });
  }
  // Prevent path traversal
  if (cleanPath.includes('..') || cleanPath.includes('//')) {
    return res.status(400).json({ error: 'Invalid file_path.' });
  }
  const section = cleanPath.split('/')[1];
  if (!VALID_DOCS_DIRS.includes(section)) {
    return res.status(400).json({ error: `Invalid section "${section}". Valid: ${VALID_DOCS_DIRS.join(', ')}` });
  }

  // Validate title
  if (!title || title.trim().length < 3 || title.trim().length > 200) {
    return res.status(400).json({ error: 'Title must be 3–200 characters.' });
  }

  // Validate content (agents get a higher limit than humans)
  if (!content || content.trim().length < 20 || content.trim().length > 50000) {
    return res.status(400).json({ error: 'Content must be 20–50,000 characters.' });
  }

  // Store in DB
  const { lastInsertRowid: id } = db.prepare(`
    INSERT INTO agent_submissions (agent_label, action, file_path, title, content, summary)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    req.agentLabel,
    act,
    cleanPath,
    title.trim(),
    content.trim(),
    (summary || '').trim().slice(0, 500) || null
  );

  // Create PR
  if (!GH_TOKEN) {
    return res.json({ ok: true, id, message: 'Submission saved but GitHub PR is disabled (no GH_TOKEN).' });
  }

  try {
    const prUrl = await createAgentPR(id, req.agentLabel, act, cleanPath, title.trim(), content.trim(), (summary || '').trim());
    db.prepare('UPDATE agent_submissions SET pr_url = ?, status = ? WHERE id = ?')
      .run(prUrl, 'pr_opened', id);
    res.json({ ok: true, id, pr_url: prUrl });
  } catch (err) {
    console.error(`[agent #${id}] PR creation failed:`, err.message);
    res.status(502).json({ ok: false, id, error: 'Submission saved but PR creation failed.', detail: err.message });
  }
});

async function createAgentPR(id, agentLabel, action, filePath, title, content, summary) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
  const branch = `agent/${agentLabel}/${id}-${slug}`;

  // 1. Get base branch SHA
  const ref = await ghApi('GET', `/git/ref/heads/${GH_BASE}`);
  if (ref.status !== 200) throw new Error(`Could not get base ref: ${JSON.stringify(ref.body)}`);
  const baseSha = ref.body.object.sha;

  // 2. Create branch
  const branchRes = await ghApi('POST', '/git/refs', {
    ref: `refs/heads/${branch}`,
    sha: baseSha
  });
  if (branchRes.status !== 201) throw new Error(`Branch creation failed: ${JSON.stringify(branchRes.body)}`);

  // 3. If updating, check if file exists on the base branch (need its SHA for updates)
  let fileSha;
  if (action === 'update') {
    const existing = await ghApi('GET', `/contents/${filePath}?ref=${GH_BASE}`);
    if (existing.status === 200) {
      fileSha = existing.body.sha;
    }
  }

  // 4. Create/update the file on the branch
  const fileBody = {
    message: `${action === 'update' ? 'Update' : 'Add'} ${filePath} (agent: ${agentLabel})`,
    content: Buffer.from(content).toString('base64'),
    branch,
  };
  if (fileSha) fileBody.sha = fileSha;

  const fileRes = await ghApi('PUT', `/contents/${filePath}`, fileBody);
  if (fileRes.status !== 201 && fileRes.status !== 200) {
    throw new Error(`File creation failed: ${JSON.stringify(fileRes.body)}`);
  }

  // 5. Open PR
  const prBody = [
    `An agent (**${agentLabel}**) submitted a wiki ${action === 'update' ? 'update' : 'new page'} via the Agent API.`,
    '',
    `**Action:** ${action}`,
    `**File:** \`${filePath}\``,
    `**Title:** ${title}`,
    summary ? `**Summary:** ${summary}` : '',
    '',
    '---',
    '',
    '@claude please review this agent wiki submission. Check if the information is accurate for the Verus protocol, suggest any corrections or improvements, and let us know if this is ready to be incorporated into the wiki. If it looks good, approve the PR.',
  ].filter(Boolean).join('\n');

  const prRes = await ghApi('POST', '/pulls', {
    title: `[Agent: ${agentLabel}] ${action === 'update' ? 'Update' : 'Add'}: ${title}`,
    body: prBody,
    head: branch,
    base: GH_BASE,
  });
  if (prRes.status !== 201) throw new Error(`PR creation failed: ${JSON.stringify(prRes.body)}`);

  return prRes.body.html_url;
}

// Generate a new agent API key (admin only)
app.post('/api/agent/generate-key', (req, res) => {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const key = crypto.randomBytes(32).toString('hex');
  const { label } = req.body || {};
  if (!label || label.trim().length < 1) {
    return res.status(400).json({ error: 'Provide a "label" for this agent.' });
  }

  res.json({
    label: label.trim(),
    key,
    env_entry: `${label.trim()}:${key}`,
    instructions: 'Add this to your AGENT_API_KEYS env var (comma-separated) and restart the server.'
  });
});

// List agent submissions (admin)
app.get('/api/agent/submissions', (req, res) => {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  const status = req.query.status || 'all';
  const rows = status === 'all'
    ? db.prepare('SELECT * FROM agent_submissions ORDER BY created_at DESC').all()
    : db.prepare('SELECT * FROM agent_submissions WHERE status = ? ORDER BY created_at DESC').all(status);

  res.json(rows);
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Verus Wiki form API on http://127.0.0.1:${PORT}  |  GitHub PR: ${GH_TOKEN ? 'enabled' : 'disabled (set GH_TOKEN)'}  |  Agent keys: ${AGENT_API_KEYS.size}`);
});
