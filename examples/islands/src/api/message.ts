import { ServerSideContext } from 'caldaria/types';

export default function getMessage(ctx: ServerSideContext): Response {
  console.log(ctx);
  return new Response('Hello World', {
    status: 200,
  });
}
