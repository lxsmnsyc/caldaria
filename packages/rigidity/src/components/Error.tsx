import { getReasonPhrase } from 'http-status-codes';
import { JSX } from 'solid-js/jsx-runtime';
import {
  renderToStringAsync,
  ErrorBoundary,
} from 'solid-js/web';
import { CUSTOM_404, CUSTOM_500, CUSTOM_ERROR } from '../constants';
import {
  ErrorPage,
  ErrorProps,
  GlobalRenderOptions,
  AppRenderResult,
} from '../types';

import Head, { HeadContext } from './Head';
import { TailContext } from './Tail';

export function DefaultErrorComponent(props: ErrorProps): JSX.Element {
  return (
    <div
      style={{
        color: '#000',
        background: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Head>
        <title>{`${props.statusCode}: ${getReasonPhrase(props.statusCode)}`}</title>
        <style innerHTML="body { margin: 0 }" />
      </Head>
      <span
        style={{
          fontSize: '1.5rem',
          lineHeight: '2rem',
          fontWeight: 'bold',
          marginRight: '2rem',
        }}
      >
        {props.statusCode}
      </span>
      <span
        style={{
          fontSize: '1.25rem',
          lineHeight: '1.75rem',
        }}
      >
        {getReasonPhrase(props.statusCode)}
      </span>
    </div>
  );
}

export const DefaultErrorPage: ErrorPage = {
  Component: DefaultErrorComponent,
};

export function getErrorPage(
  statusCode: number,
  global: GlobalRenderOptions,
): ErrorPage {
  if (statusCode === 404 && global.error404) {
    return global.error404;
  }
  if (statusCode === 500 && global.error500) {
    return global.error500;
  }
  if (global.error) {
    return global.error;
  }
  return DefaultErrorPage;
}

export function getErrorPath(
  statusCode: number,
  global: GlobalRenderOptions,
): string {
  if (statusCode === 404 && global.error404) {
    return CUSTOM_404;
  }
  if (statusCode === 500 && global.error500) {
    return CUSTOM_500;
  }
  return CUSTOM_ERROR;
}

export async function renderStaticError(
  global: GlobalRenderOptions,
  options: ErrorProps,
): Promise<AppRenderResult> {
  const CustomErrorPage = getErrorPage(options.statusCode, global);

  const head: JSX.Element[] = [];
  const tail: JSX.Element[] = [];

  const html = await renderToStringAsync(() => (
    <ErrorBoundary
      fallback={<DefaultErrorComponent statusCode={500} error={options.error} />}
    >
      <HeadContext.Provider value={head}>
        <TailContext.Provider value={tail}>
          <CustomErrorPage.Component
            statusCode={options.statusCode}
            error={options.error}
          />
        </TailContext.Provider>
      </HeadContext.Provider>
    </ErrorBoundary>
  ));

  return {
    html,
    head,
    tail,
  };
}
