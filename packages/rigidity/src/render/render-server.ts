import {
  createComponent,
  pipeToNodeWritable,
  pipeToWritable,
  renderToString,
  renderToStringAsync,
} from 'solid-js/web';
import { Readable } from 'stream';
import {
  Root,
} from '../components/Document';
import {
  RenderResult,
  ErrorProps,
  GlobalRenderOptions,
} from '../types';
import renderApp, { RenderAppOptions } from './render-app';
import renderError from './render-error';

async function renderCore<T>(
  globalOptions: GlobalRenderOptions,
  pageResult: RenderResult<T>,
): Promise<string | Readable | ReadableStream> {
  switch (globalOptions.ssrMode) {
    case 'async': {
      const documentResult = await renderToStringAsync(() => (
        createComponent(Root, {
          ...pageResult,
          document: globalOptions.document,
        })
      ));

      return `<!DOCTYPE html>${documentResult}`;
    }
    case 'node-stream': {
      const stream = await import('stream');
      const writable = new stream.Transform({
        transform(chunk, encoding, callback) {
          this.push(chunk, encoding);
          callback();
        },
      });
      pipeToNodeWritable(() => (
        createComponent(Root, {
          ...pageResult,
          document: globalOptions.document,
        })
      ), writable, {
        onReady({ write, startWriting }) {
          write('<!DOCTYPE html>');
          startWriting();
        },
      });
      return writable;
    }
    case 'web-stream': {
      const stream = new TransformStream();
      pipeToWritable(() => (
        createComponent(Root, {
          ...pageResult,
          document: globalOptions.document,
        })
      ), stream.writable, {
        onReady({ write, startWriting }) {
          write('<!DOCTYPE html>');
          startWriting();
        },
      });
      return stream.readable;
    }
    case 'sync':
    default: {
      const documentResult = renderToString(() => (
        createComponent(Root, {
          ...pageResult,
          document: globalOptions.document,
        })
      ));

      return `<!DOCTYPE html>${documentResult}`;
    }
  }
}

export async function renderServerError(
  globalOptions: GlobalRenderOptions,
  renderOptions: ErrorProps,
): Promise<string | Readable | ReadableStream> {
  return renderCore(globalOptions, {
    App: renderError(
      globalOptions,
      renderOptions,
    ),
    tags: [],
    data: renderOptions,
  });
}

export async function renderServer<T>(
  globalOptions: GlobalRenderOptions,
  renderOptions: RenderAppOptions,
  response?: T,
): Promise<string | Readable | ReadableStream> {
  return renderCore(globalOptions, {
    App: renderApp(
      globalOptions,
      renderOptions,
      response,
    ),
    tags: [],
    data: response,
  });
}
