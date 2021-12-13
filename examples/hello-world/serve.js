const http = require('http');
const rigidity = require('rigidity');
const server = require('./.rigidity/development/server').default;

http.createServer(rigidity.createHTTPAdapter(server)).listen(3000).on('listening', () => {
  console.log('Listening at http://localhost:3000')
});