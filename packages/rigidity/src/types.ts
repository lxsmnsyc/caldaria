import { IncomingMessage, ServerResponse } from 'http';
import * as esbuild from 'esbuild';
import { ParsedUrlQuery } from 'querystring';
import { JSX } from 'solid-js/jsx-runtime';
import { Metric } from 'web-vitals';
import { RouterParams } from './router';

export interface AppProps {
  Component: () => JSX.Element;
}

export type App = (props: AppProps) => JSX.Element;

export type WebVitalsMetric = Metric;

export interface AppPage {
  Component: App;
  reportWebVitals?: (metric: WebVitalsMetric) => void;
}

export interface AppRenderResult {
  head: JSX.Element[];
  tail: JSX.Element[];
  html: string;
}

export interface ErrorProps {
  statusCode: number;
  error?: Error;
}

export interface ErrorPage {
  onError?: (error: Error) => void;
  Component: (props: ErrorProps) => JSX.Element;
}

export interface GlobalRenderOptions {
  version: string;
  buildDir: string;
  publicDir: string;
  apiDir: string;
  enableCompression: string;
  app?: AppPage;
  document?: () => JSX.Element;
  error404?: ErrorPage;
  error500?: ErrorPage;
  error?: ErrorPage;
}

export type Params = RouterParams;
export type Query = ParsedUrlQuery;

export interface ServerSideContext<P extends Params = Params, Q extends Query = Query> {
  request: IncomingMessage;
  response: ServerResponse;
  params: P;
  query: Q;
}

export interface DirectoryOptions {
  api?: string;
  pages?: string;
  build?: string;
}

export interface BuildOptions {
  directories?: DirectoryOptions;
  esbuild?: esbuild.BuildOptions;
}

export type BundleType = 'server' | 'client';
