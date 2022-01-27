import { ServerSideContext } from 'rigidity';

export default function getMessage(ctx: ServerSideContext): Response {
  console.log(ctx);
  return new Response('Hello World', {
    status: 200,
  });
}
