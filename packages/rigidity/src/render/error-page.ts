import DefaultErrorComponent from '../components/Error';
import { CUSTOM_404, CUSTOM_500, CUSTOM_ERROR } from '../constants';
import { GlobalRenderOptions, ErrorPage } from '../types';

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
  return DefaultErrorComponent;
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
