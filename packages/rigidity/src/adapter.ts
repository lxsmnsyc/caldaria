export interface ResponseAdapter {
  setStatusCode(code: number): void;
  getStatusCode(): number;
  setHeader(key: string, value: string): void;
  write(value: string | Buffer): void;
}

export interface RequestAdapter {
  getHeader(key: string): string | string[] | undefined | null;
  url: string | undefined;
}

export function createResponseAdapter(value: ResponseAdapter): ResponseAdapter {
  return value;
}

export function createRequestAdapter(value: RequestAdapter): RequestAdapter {
  return value;
}
