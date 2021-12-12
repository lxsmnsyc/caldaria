import { RequestAdapter, ResponseAdapter } from '../adapter';
import {
  API_PATH,
  PUBLIC_PATH,
  STATIC_PATH,
} from '../constants';
import StatusCode from '../errors/StatusCode';
import {
  renderServer,
  renderServerError,
} from '../render/render-server';
import createAPITree from '../router/core/create-api-tree';
import createPageTree from '../router/core/create-page-tree';
import {
  matchRoute,
} from '../router/core/router';
import {
  ServerRenderOptions,
} from '../types';
import {
  green,
  red,
} from './colors';

async function fileExists(path: string): Promise<boolean> {
  const fs = await import('fs-extra');

  try {
    const stat = await fs.stat(path);

    return stat.isFile();
  } catch (error) {
    return false;
  }
}

export type RigidityServer<Request, Response>
  = (request: RequestAdapter<Request>, response: ResponseAdapter<Response>) => Promise<void>;

export default function createServer<Request, Response>(
  serverOptions: ServerRenderOptions,
): RigidityServer<Request, Response> {
  const pagesTree = createPageTree(serverOptions.pages);
  const apisTree = createAPITree(serverOptions.endpoints);

  return async (request, response) => {
    function responseEnd(type: string, content: string | Buffer): void {
      response.setHeader('Content-Type', type);
      response.setContent(content);
    }

    try {
      const host = request.getHeader('host');
      if (host && typeof host === 'string' && request.url) {
        const url = new URL(request.url, `http://${host}`);

        const readStaticFile = async (prefix: string, basePath: string) => {
          const fs = await import('fs-extra');
          const path = await import('path');
          const mime = await import('mime-types');

          const file = url.pathname.substring(prefix.length);
          const targetFile = path.join(basePath, file);
          const exists = await fileExists(targetFile);
          const mimeType = mime.contentType(path.basename(file));

          if (exists && mimeType) {
            const buffer = await fs.readFile(targetFile);
            response.setStatusCode(200);
            response.setHeader('Cache-Control', 'max-age=31536000');
            responseEnd(mimeType, buffer);
            console.log(`[${green('200')}] ${request.url ?? ''}`);
          } else {
            throw new StatusCode(404);
          }
        };
        const publicPrefix = `/${PUBLIC_PATH}/`;
        if (request.url.startsWith(publicPrefix)) {
          await readStaticFile(publicPrefix, serverOptions.publicDir);
          return;
        }
        const staticPrefix = `/${STATIC_PATH}/`;
        if (request.url.startsWith(staticPrefix)) {
          await readStaticFile(staticPrefix, serverOptions.buildDir);
          return;
        }
        const apiPrefix = `/${API_PATH}`;
        if (request.url.startsWith(apiPrefix)) {
          const querystring = await import('querystring');

          const matchedNode = matchRoute(apisTree, url.pathname.substring(apiPrefix.length));

          if (matchedNode && matchedNode.value) {
            await matchedNode.value.call({
              request: request.raw,
              response: response.raw,
              params: matchedNode.params,
              query: querystring.decode(url.search),
            });
            console.log(`[${green(`${response.getStatusCode()}`)}] ${request.url}`);
          } else {
            throw new StatusCode(404, new Error(`"${request.url}" not found.`));
          }
        }

        try {
          const matchedNode = matchRoute(pagesTree, url.pathname);

          if (matchedNode && matchedNode.value) {
            const value = await renderServer(serverOptions, {
              routes: pagesTree,
              pathname: url.pathname,
              search: url.search,
            });
            response.setStatusCode(200);
            console.log(`[${green('200')}] ${request.url ?? ''}`);
            responseEnd('text/html', value);
          }

          throw new StatusCode(404);
        } catch (error) {
          if (error instanceof StatusCode) {
            throw error;
          } else {
            throw new StatusCode(500, error as Error);
          }
        }
      }
    } catch (error: any) {
      const statusCode = (error instanceof StatusCode) ? error.value : 500;
      const reason = (error instanceof StatusCode) ? error.reason : error;
      console.log(`[${red(`${statusCode}`)}] ${request.url ?? ''}`);
      console.error(reason);
      response.setStatusCode(statusCode);
      responseEnd('text/html', await renderServerError(serverOptions, {
        statusCode,
        error: reason,
      }));
    }
  };
}
