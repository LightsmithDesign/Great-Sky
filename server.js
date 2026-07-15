const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'great-sky-site');
const port = Number(process.env.PORT) || 4173;
const host = process.env.HOST || '0.0.0.0';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function resolveRequest(url) {
  const pathname = decodeURIComponent(url.split('?')[0]);
  const cleanPath = pathname === '/' ? '/index.html' : pathname.replace(/\/$/, '');
  const candidates = path.extname(cleanPath)
    ? [cleanPath]
    : [`${cleanPath}.html`, path.join(cleanPath, 'index.html')];

  for (const candidate of candidates) {
    const filePath = path.normalize(path.join(root, candidate));
    if (!filePath.startsWith(root)) return null;
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return filePath;
  }

  return null;
}

const server = http.createServer((req, res) => {
  const filePath = resolveRequest(req.url);

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, {
    'Content-Type': contentTypes[ext] || 'application/octet-stream'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, host, () => {
  console.log(`Great Sky site running at http://${host}:${port}`);
});
