if (!globalThis.fetch) {
  (async () => {
    const {
      default: fetch,
      Headers,
      Request,
      Response,
    } = await import('node-fetch');
    globalThis.fetch = fetch as unknown as typeof globalThis.fetch;
    globalThis.Headers = Headers as unknown as typeof globalThis.Headers;
    globalThis.Request = Request as unknown as typeof globalThis.Request;
    globalThis.Response = Response as unknown as typeof globalThis.Response;
  })();
}
