export interface ResponseAdapter<T> {
  setStatusCode(code: number): void;
  getStatusCode(): number;
  setHeader(key: string, value: string): void;
  setContent(value: string | Buffer): void;
  raw: T;
}

export interface RequestAdapter<T> {
  getHeader(key: string): string | string[] | undefined | null;
  url: string | undefined;
  raw: T;
}

export function createResponseAdapter<T>(value: ResponseAdapter<T>): ResponseAdapter<T> {
  return value;
}

export function createRequestAdapter<T>(value: RequestAdapter<T>): RequestAdapter<T> {
  return value;
}
