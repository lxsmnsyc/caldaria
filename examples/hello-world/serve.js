const http = require('http');
const server = require('./.rigidity/development/server');

http.createServer(server.default).listen(3000).on('listening', () => {
  console.log('Listening at http://localhost:300')
});