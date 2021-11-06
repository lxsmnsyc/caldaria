import {
  renderToStringAsync as clientRenderToStringAsync,
  createComponent as createClientComponent,
  ErrorBoundary as ClientErrorBoundary,
  Dynamic as ClientDynamic,
  Portal as ClientPortal,
  HydrationScript as ClientHydrationScript,
} from 'solid-js/web';
import {
  renderToStringAsync as serverRenderToStringAsync,
  createComponent as createServerComponent,
  ErrorBoundary as ServerErrorBoundary,
  Dynamic as ServerDynamic,
  Portal as ServerPortal,
  HydrationScript as ServerHydrationScript,
} from 'solid-js/web/dist/server.cjs';

declare const RIGIDITY_SERVER: boolean;

export const isServer = typeof RIGIDITY_SERVER === 'boolean';

export const createComponent = typeof RIGIDITY_SERVER === 'boolean'
  ? createServerComponent
  : createClientComponent;

export const Dynamic = typeof RIGIDITY_SERVER === 'boolean'
  ? ServerDynamic
  : ClientDynamic;

export const Portal = typeof RIGIDITY_SERVER === 'boolean'
  ? ServerPortal
  : ClientPortal;

export const ErrorBoundary = typeof RIGIDITY_SERVER === 'boolean'
  ? ServerErrorBoundary
  : ClientErrorBoundary;

export const renderToStringAsync = typeof RIGIDITY_SERVER === 'boolean'
  ? serverRenderToStringAsync
  : clientRenderToStringAsync;

export const HydrationScript = typeof RIGIDITY_SERVER === 'boolean'
  ? ServerHydrationScript
  : ClientHydrationScript;
