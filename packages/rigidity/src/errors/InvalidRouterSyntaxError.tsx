export default class InvalidRouterSyntaxError extends Error {
  constructor(received: string) {
    super(`
Invalid router syntax detected

Received: '${received}'
`);
  }
}
