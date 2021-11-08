import { createComponent, JSX, useContext } from 'solid-js';
import DefaultApp from '../components/App';
import { DocumentContext } from '../components/Document';
import { MetaProvider } from '../meta';
import {
  GlobalRenderOptions,
  ErrorProps,
} from '../types';
import { getErrorPage } from './error-page';

export default function renderError(
  global: GlobalRenderOptions,
  options: ErrorProps,
): () => JSX.Element {
  const CustomAppPage = global.app ?? DefaultApp;
  const CustomErrorPage = getErrorPage(options.statusCode, global);
  return () => {
    const context = useContext(DocumentContext);
    return (
      createComponent(MetaProvider, {
        tags: context?.tags ?? [],
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
    );
  };
}
