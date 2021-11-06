import { createComponent } from 'solid-js';
import { renderToStringAsync } from 'solid-js/web';
import DefaultApp from '../components/App';
import { MetaProvider } from '../meta';
import {
  GlobalRenderOptions,
  ErrorProps,
  AppRenderResult,
  TagDescription,
} from '../types';
import { getErrorPage } from './error-page';

export default async function renderError(
  global: GlobalRenderOptions,
  options: ErrorProps,
): Promise<AppRenderResult> {
  const CustomAppPage = global.app ?? DefaultApp;
  const CustomErrorPage = getErrorPage(options.statusCode, global);

  const tags: TagDescription[] = [];

  const html = await renderToStringAsync(() => (
    createComponent(MetaProvider, {
      tags,
      get children() {
        return (
          createComponent(CustomAppPage, {
            Component: () => (
              createComponent(CustomErrorPage, {
                statusCode: options.statusCode,
                error: options.error,
              })
            ),
          })
        );
      },
    })
  ));

  return {
    html,
    tags,
    errorProps: options,
  };
}
