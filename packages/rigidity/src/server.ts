import { RequestListener } from 'http';
import {
  render,
  renderError,
  PageOptions,
} from './render';
import { addRoute, createRouterNode, matchRoute } from './router';
import { API_PATH, PUBLIC_PATH, STATIC_PATH } from './constants';
import { GlobalRenderOptions, ServerSideContext } from './types';
import { getErrorPage } from './components/Error';
import StatusCode from './errors/StatusCode';

export type ServerOptions = PageOptions[];
export type APICallback = (ctx: ServerSideContext) => void | Promise<void>;

interface API {
  path: string;
  call: APICallback;
}

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
  global: GlobalRenderOptions,
  pages: ServerOptions,
  endpoints: API[],
): RequestListener {
  const pageNode = createRouterNode<PageOptions>('');

  pages.forEach((page) => {
    addRoute(pageNode, page.path.split('/'), page);
  });

  const apiNode = createRouterNode<APICallback>('');

  endpoints.forEach((endpoint) => {
    addRoute(apiNode, endpoint.path.split('/'), endpoint.call);
  });

  return function requestListener(request, response): void {
    function getEncoding(): string | undefined {
      if (global.enableCompression) {
        const encoding = request.headers['accept-encoding'];
        if (encoding) {
          if (encoding.includes('br')) {
            return 'br';
          }
          if (encoding.includes('gzip')) {
            return 'gzip';
          }
          if (encoding.includes('deflate')) {
            return 'deflate';
          }
          //  else if (encoding.includes('compress')) {
          //   response.setHeader('Content-Encoding', 'compress');
          // }
        }
      }
      return undefined;
    }
    function responseEnd(type: string, content: string | Buffer): void {
      response.setHeader('Content-Type', type);
      response.end(content);
    }
    async function errorHandler(error: Error) {
      const statusCode = (error instanceof StatusCode) ? error.value : 500;
      const reason = (error instanceof StatusCode) ? error.reason : error;

      if (reason) {
        const { onError } = getErrorPage(statusCode, global);
        if (onError) {
          onError(reason);
        }
      }

      response.statusCode = statusCode;
      responseEnd('text/html', await renderError(global, {
        statusCode,
        error: reason,
      }));
    }

    const { host } = request.headers;
    const originalURL = request.url;

    if (host && originalURL) {
      console.log('Requesting', originalURL);
      const url = new URL(originalURL, `http://${host}`);

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
          const encoding = getEncoding();
          const buffer = encoding && prefix === `/${STATIC_PATH}/`
            ? await fs.readFile(`${targetFile}.${encoding}`)
            : await fs.readFile(targetFile);
          if (encoding) {
            response.setHeader('Content-Encoding', encoding);
          }

          console.log('Serving file', url.pathname);
          response.statusCode = 200;
          response.setHeader('Cache-Control', 'max-age=31536000');
          responseEnd(mimeType, buffer);
        } else {
          throw new StatusCode(404);
        }
      };
      const publicPrefix = `/${PUBLIC_PATH}/`;
      if (originalURL.startsWith(publicPrefix)) {
        readStaticFile(publicPrefix, global.publicDir).catch(errorHandler);
        return;
      }
      const staticPrefix = `/${STATIC_PATH}/`;
      if (originalURL.startsWith(staticPrefix)) {
        readStaticFile(staticPrefix, global.buildDir).catch(errorHandler);
        return;
      }

      const apiPrefix = `/${API_PATH}`;

      if (originalURL.startsWith(apiPrefix)) {
        const readAPI = async () => {
          const querystring = await import('querystring');

          const splitPath = url.pathname.replace(apiPrefix, '').split('/');

          const matchedNode = matchRoute(apiNode, splitPath);

          if (matchedNode && matchedNode.value) {
            console.log('Serving API', url.pathname);
            await matchedNode.value({
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
          const splitPath = url.pathname.split('/');

          const matchedNode = matchRoute(pageNode, splitPath);

          if (matchedNode && matchedNode.value) {
            const option = matchedNode.value;
            console.log('Serving', originalURL);
            return render(global, option);
          }

          throw new StatusCode(404);
        } catch (error) {
          if (error instanceof StatusCode) {
            throw error;
          } else {
            throw new StatusCode(500, error);
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
