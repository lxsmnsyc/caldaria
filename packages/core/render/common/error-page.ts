import {
  DefaultErrorComponent,
} from 'caldaria-root';
import {
  GlobalRenderOptions,
  ErrorPage,
} from 'caldaria-shared';

export default function getErrorPage(
  statusCode: number,
  global: GlobalRenderOptions,
): ErrorPage {
  if (statusCode === 404 && global.root.Error404) {
    return global.root.Error404;
  }
  if (statusCode === 500 && global.root.Error500) {
    return global.root.Error500;
  }
  if (global.root.Error) {
    return global.root.Error;
  }
  return DefaultErrorComponent;
}
