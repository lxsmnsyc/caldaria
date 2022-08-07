import {
  renderToStream,
  renderToString,
  renderToStringAsync,
} from 'solid-js/web';
import stream from 'stream';
import {
  Root,
} from 'rigidity-root';
import {
  RenderResult,
  ErrorProps,
  GlobalRenderOptions,
} from 'rigidity-shared';
import renderApp, { RenderAppOptions } from '../common/render-app';
import renderError from '../common/render-error';

async function renderCore<T>(
  globalOptions: GlobalRenderOptions,
  pageResult: RenderResult<T>,
): Promise<string | stream.Readable | ReadableStream> {
  switch (globalOptions.ssrMode) {
    case 'async': {
      const documentResult = await renderToStringAsync(() => (
        <Root {...pageResult} document={globalOptions.root.Document} />
        // createComponent(Root, {
        //   ...pageResult,
        //   document: globalOptions.root.Document,
        // })
      ));

      return `<!DOCTYPE html>${documentResult}`;
    }
    case 'node-stream': {
      const writable = new stream.Transform({
        transform(chunk, encoding, callback) {
          this.push(chunk, encoding);
          callback();
        },
      });
      writable.write('<!DOCTYPE html>');
      renderToStream(() => (
        <Root {...pageResult} document={globalOptions.root.Document} />
        // createComponent(Root, {
        //   ...pageResult,
        //   document: globalOptions.root.Document,
        // })
      )).pipe(writable);
      return writable;
    }
    case 'web-stream': {
      const instance = new TransformStream();
      await instance.writable.getWriter().write('<!DOCTYPE html>');
      renderToStream(() => (
        <Root {...pageResult} document={globalOptions.root.Document} />
        // createComponent(Root, {
        //   ...pageResult,
        //   document: globalOptions.root.Document,
        // })
      )).pipeTo(instance.writable);
      return instance.readable;
    }
    case 'sync':
    default: {
      const documentResult = renderToString(() => (
        <Root {...pageResult} document={globalOptions.root.Document} />
        // createComponent(Root, {
        //   ...pageResult,
        //   document: globalOptions.root.Document,
        // })
      ));

      return `<!DOCTYPE html>${documentResult}`;
    }
  }
}

export async function renderServerError(
  globalOptions: GlobalRenderOptions,
  renderOptions: ErrorProps,
): Promise<string | stream.Readable | ReadableStream> {
  return renderCore(globalOptions, {
    isDev: globalOptions.env === 'development',
    mode: globalOptions.mode,
    assets: `${globalOptions.cdn ?? ''}/${globalOptions.assetsUrl}`,
    App: renderError(
      globalOptions,
      renderOptions,
    ),
    tags: [],
    data: {
      load: renderOptions,
    },
    isError: true,
  });
}

export async function renderServer<L, A = undefined>(
  globalOptions: GlobalRenderOptions,
  renderOptions: RenderAppOptions,
  loadData?: L,
  actionData?: A,
): Promise<string | stream.Readable | ReadableStream> {
  return renderCore(globalOptions, {
    isDev: globalOptions.env === 'development',
    mode: globalOptions.mode,
    assets: `${globalOptions.cdn ?? ''}/${globalOptions.assetsUrl}`,
    App: renderApp(
      globalOptions,
      renderOptions,
      loadData,
      actionData,
    ),
    tags: [],
    data: {
      load: loadData,
      action: actionData,
    },
    isError: false,
  });
}
