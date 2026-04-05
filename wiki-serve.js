/**
 * wiki-serve.js
 * Drop-in replacement for: npx serve .retype -l 5175
 *
 * - Serves .retype/ as static files
 * - Proxies /api/* to the form API on port 3737
 *
 * Usage:  node wiki-serve.js [port]
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT      = parseInt(process.env.PORT || process.argv[2] || '5175', 10);
const API_PORT  = 3737;
const STATIC    = path.resolve(__dirname, '.retype');
const MAX_PROXY_BODY = 1 * 1024 * 1024; // 1 MB

// Hop-by-hop headers that must not be forwarded to the backend
const HOP_BY_HOP = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailers', 'transfer-encoding', 'upgrade',
]);

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' translate.google.com translate.googleapis.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: translate.google.com www.google.com translate.googleapis.com; connect-src 'self' translate.googleapis.com; frame-src translate.google.com; object-src 'none'; base-uri 'self'",
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'Server': 'verus-wiki',
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.txt':  'text/plain',
  '.yaml': 'text/yaml',
  '.yml':  'text/yaml',
  '.xml':  'application/xml',
  '.gz':   'application/gzip',
  '.webmanifest': 'application/manifest+json',
};

// .well-known redirects for AI/bot discovery
const WELL_KNOWN = {
  '/.well-known/llms.txt':      '/llms.txt',
  '/.well-known/ai-plugin.json': '/ai-plugin.json',
};

function proxyToApi(req, res) {
  // Filter headers: only forward safe ones, strip hop-by-hop
  const fwdHeaders = {};
  for (const [key, val] of Object.entries(req.headers)) {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      fwdHeaders[key] = val;
    }
  }
  fwdHeaders['host'] = `127.0.0.1:${API_PORT}`;
  fwdHeaders['x-forwarded-for'] = req.socket.remoteAddress;

  const opts = {
    hostname: '127.0.0.1',
    port:     API_PORT,
    path:     req.url,
    method:   req.method,
    headers:  fwdHeaders,
  };

  const proxy = http.request(opts, (apiRes) => {
    // Add security headers to proxied responses too
    for (const [h, v] of Object.entries(SECURITY_HEADERS)) {
      apiRes.headers[h.toLowerCase()] = v;
    }
    res.writeHead(apiRes.statusCode, apiRes.headers);
    apiRes.pipe(res);
  });

  proxy.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API unavailable' }));
    }
  });

  // Enforce body size limit
  let received = 0;
  req.on('data', (chunk) => {
    received += chunk.length;
    if (received > MAX_PROXY_BODY) {
      proxy.destroy();
      if (!res.headersSent) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request body too large' }));
      }
    }
  });
  req.pipe(proxy);
}

function serveStatic(req, res) {
  // Reject non-GET/HEAD methods on static routes
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  let urlPath = req.url.split('?')[0];

  // Retype uses trailing-slash directories → index.html
  const candidates = [
    path.join(STATIC, urlPath),
    path.join(STATIC, urlPath, 'index.html'),
    path.join(STATIC, urlPath.replace(/\/$/, ''), 'index.html'),
  ];

  for (const candidate of candidates) {
    // Resolve to absolute and verify it stays within STATIC (path traversal protection)
    const filePath = path.resolve(candidate);
    if (!filePath.startsWith(STATIC + path.sep) && filePath !== STATIC) {
      break; // Escape attempt — fall through to 404
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext  = path.extname(filePath).toLowerCase();
      const mime = MIME[ext] || 'application/octet-stream';
      res.writeHead(200, {
        ...SECURITY_HEADERS,
        'Content-Type': mime,
        'X-Robots-Tag': 'index, follow',
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // 404 fallback
  const notFound = path.join(STATIC, '404.html');
  if (fs.existsSync(notFound)) {
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(notFound).pipe(res);
  } else {
    res.writeHead(404, SECURITY_HEADERS);
    res.end('Not found');
  }
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];

  if (urlPath.startsWith('/api/')) {
    proxyToApi(req, res);
  } else if (WELL_KNOWN[urlPath]) {
    res.writeHead(302, { Location: WELL_KNOWN[urlPath] });
    res.end();
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`Wiki serving .retype/ on http://localhost:${PORT}`);
  console.log(`/api/* → http://127.0.0.1:${API_PORT}`);
});
