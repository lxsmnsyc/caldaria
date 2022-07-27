export default class DuplicateRouterPathError extends Error {
  constructor(key: string) {
    super(`
Duplicate router path detected.

Received: '${key}'
`);
  }
}
