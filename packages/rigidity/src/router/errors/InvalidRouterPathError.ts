export default class InvalidRouterPathError extends Error {
  constructor(received: string) {
    super(`
Invalid router path detected

Received: '${received}'
`);
  }
}
