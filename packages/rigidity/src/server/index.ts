import { RequestListener } from 'http';
import { API_PATH, PUBLIC_PATH, STATIC_PATH } from '../constants';
import StatusCode from '../errors/StatusCode';
import { renderServer, renderServerError } from '../render/render-server';
import createAPITree from '../router/core/create-api-tree';
import createPageTree from '../router/core/create-page-tree';
import { matchRoute } from '../router/core/router';
import { ServerRenderOptions } from '../types';

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
): RequestListener {
  const pagesTree = createPageTree(serverOptions.pages);
  const apisTree = createAPITree(serverOptions.endpoints);

  return (request, response) => {
    function responseEnd(type: string, content: string | Buffer): void {
      response.setHeader('Content-Type', type);
      response.end(content);
    }
    async function errorHandler(error: Error) {
      const statusCode = (error instanceof StatusCode) ? error.value : 500;
      const reason = (error instanceof StatusCode) ? error.reason : error;
      console.error(error);
      response.statusCode = statusCode;
      responseEnd('text/html', await renderServerError(serverOptions, {
        statusCode,
        error: reason,
      }));
    }

    if (request.headers.host && request.url) {
      const url = new URL(request.url, `http://${request.headers.host}`);

      const readStaticFile = async (prefix: string, basePath: string) => {
        const fs = await import('fs-extra');
        const path = await import('path');
        const mime = await import('mime-types');

        const file = url.pathname.substring(prefix.length);
        const targetFile = path.join(basePath, file);

        console.log('Attempting to read', targetFile);
        const exists = await fileExists(targetFile);
        const mimeType = mime.contentType(path.basename(file));

        if (exists && mimeType) {
          const buffer = await fs.readFile(targetFile);

          console.log('Serving file', url.pathname);
          response.statusCode = 200;
          response.setHeader('Cache-Control', 'max-age=31536000');
          responseEnd(mimeType, buffer);
        } else {
          throw new StatusCode(404);
        }
      };
      const publicPrefix = `/${PUBLIC_PATH}/`;
      if (request.url.startsWith(publicPrefix)) {
        readStaticFile(publicPrefix, serverOptions.publicDir).catch(errorHandler);
        return;
      }
      const staticPrefix = `/${STATIC_PATH}/`;
      if (request.url.startsWith(staticPrefix)) {
        readStaticFile(staticPrefix, serverOptions.buildDir).catch(errorHandler);
        return;
      }
      const apiPrefix = `/${API_PATH}`;
      if (request.url.startsWith(apiPrefix)) {
        const readAPI = async () => {
          const querystring = await import('querystring');

          const matchedNode = matchRoute(apisTree, url.pathname.substring(apiPrefix.length));

          if (matchedNode && matchedNode.value) {
            console.log('Serving API', url.pathname, matchedNode.value.path);
            await matchedNode.value.call({
              request,
              response,
              params: matchedNode.params,
              query: querystring.decode(url.search),
            });
          } else {
            throw new StatusCode(404);
          }
        };

        readAPI().catch(errorHandler);
        return;
      }

      const getContent = async (): Promise<string> => {
        try {
          const matchedNode = matchRoute(pagesTree, url.pathname);

          if (matchedNode && matchedNode.value) {
            console.log('Serving', request.url);
            return renderServer(serverOptions, {
              routes: pagesTree,
              pathname: url.pathname,
              search: url.search,
            });
          }

          throw new StatusCode(404);
        } catch (error) {
          if (error instanceof StatusCode) {
            throw error;
          } else {
            throw new StatusCode(500, error as Error);
          }
        }
      };

      getContent().then((value) => {
        response.statusCode = 200;
        responseEnd('text/html', value);
      }, errorHandler);
    }
  };
}
