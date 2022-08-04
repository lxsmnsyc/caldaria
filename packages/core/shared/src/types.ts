import * as esbuild from 'esbuild';
import * as babel from '@babel/core';
import {
  JSX,
} from 'solid-js';
import {
  Metric,
} from 'web-vitals';
import { ParsedUrlQuery } from 'querystring';

export interface RouterParams {
  [key: string]: string | string[];
}

export interface RouterNode<T> {
  key: string;
  value?: T;
  normal: RouterNode<T>[];
  glob?: RouterNode<T>;
  named?: RouterNode<T>;
}

export interface RouterResult<T, P extends RouterParams = RouterParams> {
  value?: T;
  params: P;
}

export interface PageProps<L, A = undefined, P extends RouterParams = RouterParams> {
  data?: {
    load: L;
    action: A;
  };
  params: P;
}

export interface Page<T, A = undefined, P extends RouterParams = RouterParams> {
  (props: PageProps<T, A, P>): JSX.Element;
  load?: (request: Request, params: P) => T | Promise<T>;
  actions?: Record<string, (request: Request, params: P) => Response | Promise<Response>>;
}

export interface LazyPage<T, A = undefined> {
  (): JSX.Element;
  preload: () => Promise<Page<T, A>>;
}

export interface PageRoute {
  path: string;
  component: LazyPage<any>;
}

export type PageTree = RouterNode<LazyPage<any>>;

export type Params = RouterParams;
export type Query = ParsedUrlQuery;

export interface ServerSideContext<
  P extends Params = Params,
  Q extends Query = Query,
> {
  request: Request;
  params: P;
  query: Q;
}

export type APICallback = <
  P extends Params = Params,
  Q extends Query = Query,
>(ctx: ServerSideContext<P, Q>) => Response | Promise<Response>;

export interface APIRoute {
  path: string;
  call: APICallback;
}

export type APITree = RouterNode<APICallback>;

export type SSRMode = 'sync' | 'async' | 'node-stream' | 'web-stream';

export type ServerFunction = (request: Request) => Promise<Response>;

export interface AppProps {
  children: JSX.Element;
}

export type App = (props: AppProps) => JSX.Element;

export type WebVitalsMetric = Metric;

export interface ErrorProps {
  statusCode: number;
  error?: Error;
}

export type ErrorPage = Page<ErrorProps>;

export interface IslandsModeOptions {
  type: 'islands';
  enableHybridRouting?: boolean;
}

export type BuildMode = IslandsModeOptions;

export interface RenderResult<T> {
  isDev: boolean;
  mode?: BuildMode;
  assets: string;
  App: () => JSX.Element;
  tags: TagDescription[];
  data: T;
  isError: boolean;
}

export interface RigidityRoot {
  App?: App;
  Document?: () => JSX.Element;
  Error404?: ErrorPage;
  Error500?: ErrorPage;
  Error?: ErrorPage;
  reportWebVitals?: (metric: WebVitalsMetric) => void;
}

export interface GlobalRenderOptions {
  mode?: BuildMode;
  env?: 'production' | 'development';
  cdn?: string;
  assetsUrl: string;
  publicUrl: string;
  ssrMode: SSRMode;
  root: RigidityRoot;
  pages: PageRoute[];
  ws: number;
}

export interface ServerRenderOptions extends GlobalRenderOptions {
  enableStaticFileServing: boolean;
  version: string;
  buildDir: string;
  publicDir: string;
  apiDir: string;
  endpoints: APIRoute[];
}

export interface DirectoryOptions {
  api?: string;
  pages?: string;
  build?: string;
  public?: string;
}

export interface PathOptions {
  cdn?: string;
  public?: string;
  assets?: string;
  root?: string;
}

export interface BuildContext {
  isServer: boolean;
  isDev: boolean;
}

export interface BabelBuildOptions {
  presets: babel.PluginItem[] | ((context: BuildContext) => babel.PluginItem[]);
  plugins: babel.PluginItem[] | ((context: BuildContext) => babel.PluginItem[]);
}

export interface DevOptions {
  ws?: number;
}

export interface BuildOptions {
  mode?: BuildMode;
  env?: 'production' | 'development';
  adapter: Adapter<any>;
  ssrMode?: SSRMode;
  paths?: PathOptions;
  directories?: DirectoryOptions;
  esbuild?: esbuild.BuildOptions | ((context: BuildContext) => esbuild.BuildOptions);
  babel?: BabelBuildOptions;
  dev?: DevOptions;
}

export type BundleType = 'server' | 'client';

interface TagDescription {
  tag: string;
  props: Record<string, unknown>;
  id: string;
  name?: string;
  ref?: Element;
}

export interface Adapter<T> {
  enableStaticFileServing: boolean;
  generateScript: (config: string) => string;
  create: (fn: ServerFunction) => T;
}
