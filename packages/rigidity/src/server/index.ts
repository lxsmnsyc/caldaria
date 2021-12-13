import {
  API_URL,
  PUBLIC_URL,
  STATIC_URL,
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
  ServerFunction,
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

export default function createServer(
  serverOptions: ServerRenderOptions,
): ServerFunction {
  const pagesTree = createPageTree(serverOptions.pages);
  const apisTree = createAPITree(serverOptions.endpoints);

  return async (request) => {
    try {
      const host = request.headers.get('host');
      if (host && request.url) {
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
            const cacheControl: Record<string, string> = {};
            if (process.env.NODE_ENV === 'production') {
              cacheControl['Cache-Control'] = 'max-age=31536000';
            }
            console.log(`[${green('200')}] ${request.url ?? ''}`);

            return new Response(
              fs.createReadStream(targetFile) as unknown as ReadableStream,
              {
                headers: new Headers({
                  ...cacheControl,
                  'Content-Type': mimeType,
                }),
                status: 200,
              },
            );
          }
          throw new StatusCode(404);
        };
        const publicPrefix = `/${PUBLIC_URL}/`;
        if (request.url.startsWith(publicPrefix)) {
          return readStaticFile(publicPrefix, serverOptions.publicDir);
        }
        const staticPrefix = `/${STATIC_URL}/`;
        if (request.url.startsWith(staticPrefix)) {
          return readStaticFile(staticPrefix, serverOptions.buildDir);
        }
        const apiPrefix = `/${API_URL}`;
        if (request.url.startsWith(apiPrefix)) {
          const querystring = await import('querystring');

          const matchedNode = matchRoute(apisTree, url.pathname.substring(apiPrefix.length));

          if (matchedNode && matchedNode.value) {
            const response = await matchedNode.value.call({
              request,
              params: matchedNode.params,
              query: querystring.decode(url.search),
            });
            console.log(`[${green(`${response.status}`)}] ${request.url}`);
            return response;
          }
          throw new StatusCode(404, new Error(`"${request.url}" not found.`));
        }

        try {
          const matchedNode = matchRoute(pagesTree, url.pathname);

          if (matchedNode && matchedNode.value) {
            console.log(`[${green('200')}] ${request.url ?? ''}`);

            return new Response(
              await renderServer(serverOptions, {
                routes: pagesTree,
                pathname: url.pathname,
                search: url.search,
              }),
              {
                headers: new Headers({
                  'Content-Type': 'text/html',
                }),
                status: 200,
              },
            );
          }
          throw new StatusCode(404, new Error(`"${request.url}" not found.`));
        } catch (error) {
          if (error instanceof StatusCode) {
            throw error;
          } else {
            throw new StatusCode(500, error as Error);
          }
        }
      } else {
        throw new StatusCode(404);
      }
    } catch (error: any) {
      const statusCode = (error instanceof StatusCode) ? error.value : 500;
      const reason = (error instanceof StatusCode) ? error.reason : error;
      console.log(`[${red(`${statusCode}`)}] ${request.url ?? ''}`);
      console.error(reason);

      return new Response(
        await renderServerError(serverOptions, {
          statusCode,
          error: reason,
        }),
        {
          headers: new Headers({
            'Content-Type': 'text/html',
          }),
          status: statusCode,
        },
      );
    }
  };
}
