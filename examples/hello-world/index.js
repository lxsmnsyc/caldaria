const rigidity = require('rigidity');
const server = require('./development/server').default;

module.exports = (request, response) => (
  server(
    rigidity.createVercelRequestAdapter(request),
    rigidity.createVercelResponseAdapter(response),
  )
);
