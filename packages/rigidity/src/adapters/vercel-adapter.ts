import { VercelRequest, VercelResponse } from '@vercel/node';
import { RequestAdapter, ResponseAdapter } from '../adapter';

export function createVercelRequestAdapter(
  request: VercelRequest,
): RequestAdapter<VercelRequest> {
  return {
    getHeader(key) {
      return request.headers[key];
    },
    url: request.url,
    raw: request,
  };
}

export function createVercelResponseAdapter(
  response: VercelResponse,
): ResponseAdapter<VercelResponse> {
  return {
    setHeader(key, value) {
      response.setHeader(key, value);
    },
    setStatusCode(value) {
      response.statusCode = value;
    },
    getStatusCode() {
      return response.statusCode;
    },
    setContent(value) {
      response.end(value);
    },
    raw: response,
  };
}
