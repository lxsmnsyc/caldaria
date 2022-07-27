import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import {
  API_URL,
  RIGIDITY_ACTION,
  RIGIDITY_DATA,
  RIGIDITY_REDIRECT_HEADER,
  ServerFunction,
  ServerRenderOptions,
  StatusCode,
  green,
  red,
  yellow,
} from 'rigidity-shared';
import {
  renderServer,
  renderServerError,
} from 'rigidity-render';
import {
  createAPITree,
  createPageTree,
  matchRoute,
} from 'rigidity-router';
import fsPromise from 'fs/promises';

async function fileExists(p: string): Promise<boolean> {
  try {
    const stat = await fsPromise.stat(p);

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

        if (serverOptions.enableStaticFileServing || !serverOptions.cdn) {
          const readStaticFile = async (prefix: string, basePath: string) => {
            const file = url.pathname.substring(prefix.length);
            const targetFile = path.join(basePath, file);
            const exists = await fileExists(targetFile);
            const mimeType = mime.contentType(path.basename(file));

            if (exists && mimeType) {
              const cacheControl: Record<string, string> = {};
              if (process.env.NODE_ENV === 'production') {
                cacheControl['Cache-Control'] = 'max-age=31536000';
              }
              console.log(`[${green('200')}][${yellow(request.method)}] ${url.pathname ?? ''}`);

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
          const publicPrefix = `/${serverOptions.publicUrl}/`;
          if (url.pathname.startsWith(publicPrefix)) {
            return await readStaticFile(publicPrefix, serverOptions.publicDir);
          }
          const staticPrefix = `/${serverOptions.assetsUrl}/`;
          if (url.pathname.startsWith(staticPrefix)) {
            return await readStaticFile(staticPrefix, serverOptions.buildDir);
          }
        }
        const apiPrefix = `/${API_URL}`;
        if (url.pathname.startsWith(apiPrefix)) {
          const matchedNode = matchRoute(apisTree, url.pathname.substring(apiPrefix.length));

          if (matchedNode && matchedNode.value) {
            const search = new URLSearchParams(url.search);
            const queries: Record<string, string> = {};
            search.forEach((value, key) => {
              queries[key] = value;
            });
            const response = await matchedNode.value({
              request,
              params: matchedNode.params,
              query: queries,
            });
            console.log(`[${green(`${response.status}`)}][${yellow(request.method)}] ${url.pathname}`);
            return response;
          }
          throw new StatusCode(404, new Error(`"${url.pathname}" not found.`));
        }

        try {
          const matchedNode = matchRoute(pagesTree, url.pathname);

          if (matchedNode && matchedNode.value) {
            const search = new URLSearchParams(url.search);
            const page = await matchedNode.value.preload();
            let actionData: any;

            // Read flags
            const dataOnly = search.has(RIGIDITY_DATA);
            const action = search.get(RIGIDITY_ACTION);
            if (action && page.actions && action in page.actions) {
              const result = await page.actions[action](request, matchedNode.params);

              // Check for redirect
              if (dataOnly) {
                console.log(`[${green(result.status.toString())}][${yellow(request.method)}] ${url.pathname ?? ''}`);
                if (result.status >= 300 && result.status < 400) {
                  const headers = new Headers(result.headers);
                  headers.set(RIGIDITY_REDIRECT_HEADER, headers.get('Location')!);
                  headers.delete('Location');
                  return new Response(null, {
                    status: 204,
                    headers,
                  });
                }
                return result;
              }
              if (result.status >= 300 && result.status < 400) {
                return result;
              }
              // Otherwise, parse the data
              actionData = await result.json();
            }
            const loadData = page.load ? await page.load(request, matchedNode.params) : null;
            if (dataOnly) {
              console.log(`[${green('200')}][${yellow(request.method)}] ${url.pathname ?? ''}`);
              return new Response(
                JSON.stringify(loadData),
                {
                  headers: new Headers({
                    'Content-Type': 'application/json',
                  }),
                  status: 200,
                },
              );
            }
            const result = await renderServer(serverOptions, {
              routes: pagesTree,
              pathname: url.pathname,
              search: url.search,
            }, loadData, actionData);
            console.log(`[${green('200')}][${yellow(request.method)}] ${url.pathname ?? ''}`);

            return new Response(
              result as BodyInit,
              {
                headers: new Headers({
                  'Content-Type': 'text/html',
                }),
                status: 200,
              },
            );
          }
          throw new StatusCode(404, new Error(`"${url.pathname}" not found.`));
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
      console.log(`[${red(`${statusCode}`)}][${yellow(request.method)}] ${request.url ?? ''}`);
      console.error(reason);

      return new Response(
        await renderServerError(serverOptions, {
          statusCode,
          error: reason,
        }) as BodyInit,
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
