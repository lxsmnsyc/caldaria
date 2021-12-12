import * as rigidity from 'rigidity';
import server from './.rigidity/development/server';

export default async function (request, response) {
  await server(
    rigidity.createVercelRequestAdapter(request),
    rigidity.createVercelResponseAdapter(response),
  );
}
