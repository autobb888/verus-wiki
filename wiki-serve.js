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
const STATIC    = path.join(__dirname, '.retype');

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
  '.xml':  'application/xml',
  '.webmanifest': 'application/manifest+json',
};

function proxyToApi(req, res) {
  const opts = {
    hostname: '127.0.0.1',
    port:     API_PORT,
    path:     req.url,
    method:   req.method,
    headers:  {
      ...req.headers,
      host: `127.0.0.1:${API_PORT}`,
      'x-forwarded-for': req.socket.remoteAddress,
    },
  };

  const proxy = http.request(opts, (apiRes) => {
    res.writeHead(apiRes.statusCode, apiRes.headers);
    apiRes.pipe(res);
  });

  proxy.on('error', () => {
    res.writeHead(502);
    res.end(JSON.stringify({ error: 'API unavailable' }));
  });

  req.pipe(proxy);
}

function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];

  // Retype uses trailing-slash directories → index.html
  const candidates = [
    path.join(STATIC, urlPath),
    path.join(STATIC, urlPath, 'index.html'),
    path.join(STATIC, urlPath.replace(/\/$/, ''), 'index.html'),
  ];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext  = path.extname(filePath).toLowerCase();
      const mime = MIME[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // 404 fallback
  const notFound = path.join(STATIC, '404.html');
  if (fs.existsSync(notFound)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(notFound).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    proxyToApi(req, res);
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`Wiki serving .retype/ on http://localhost:${PORT}`);
  console.log(`/api/* → http://127.0.0.1:${API_PORT}`);
});
