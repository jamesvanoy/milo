const http = require('http');

const port = parseInt(process.env.PORT || '3000', 10);

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({
    status: 'ok',
    app: 'milo',
    timestamp: new Date().toISOString()
  }));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`MILO listening on port ${port}`);
});
