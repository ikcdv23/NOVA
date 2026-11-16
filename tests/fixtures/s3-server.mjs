// Local protocol stub for integration tests, not a production storage provider.
import { createServer } from 'node:http';
const objects = new Map();
const server = createServer(async (req, res) => {
  const key = new URL(req.url, 'http://localhost').pathname;
  if (req.method === 'PUT') {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    objects.set(key, Buffer.concat(chunks));
    res.writeHead(200, { ETag: '"qa-object"' });
    res.end();
  } else if (req.method === 'DELETE') {
    objects.delete(key);
    res.writeHead(204);
    res.end();
  } else if ((req.method === 'GET' || req.method === 'HEAD') && objects.has(key)) {
    res.writeHead(200, { 'Content-Type': 'image/webp', 'Content-Length': objects.get(key).length });
    res.end(req.method === 'GET' ? objects.get(key) : undefined);
  } else {
    res.writeHead(404);
    res.end();
  }
});
server.listen(9000, '127.0.0.1', () => console.log('QA S3 protocol stub ready at 127.0.0.1:9000'));
