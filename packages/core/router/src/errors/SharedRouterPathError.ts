export default class SharedRouterPathError extends Error {
  constructor(received: string, existing: string) {
    super(`
Shared router path detected.

Received: '${received}'
Existing: '${existing}'
`);
  }
}
