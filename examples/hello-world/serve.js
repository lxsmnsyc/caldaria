const http = require('http');
const rigidity = require('rigidity');
const server = require('./.rigidity/development/server').default;

http.createServer((request, response) => {
  server(
    rigidity.createHTTPRequestAdapter(request),
    rigidity.createHTTPResponseAdapter(response),
  );
}).listen(3000).on('listening', () => {
  console.log('Listening at http://localhost:3000')
});