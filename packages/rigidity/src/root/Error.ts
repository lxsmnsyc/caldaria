import {
  getReasonPhrase,
} from 'http-status-codes';
import {
  createMemo,
  JSX,
} from 'solid-js';
import {
  createComponent,
  Dynamic,
} from 'solid-js/web';
import {
  Style,
  Title,
} from 'rigidity/meta';
import {
  ErrorProps,
  Page,
} from 'rigidity/types';

const ERROR_ROOT_STYLE = {
  color: '#000',
  background: '#fff',
  'font-family': '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',
  width: '100vw',
  height: '100vh',
  display: 'flex',
  'align-items': 'center',
  'justify-content': 'center',
};

const ERROR_STATUS_CODE_STYLE = {
  'font-size': '1.5rem',
  'line-height': '2rem',
  'font-weight': 'bold',
  'margin-right': '2rem',
};

const ERROR_REASON_STYLE = {
  'font-size': '1.25rem',
  'line-height': '1.75rem',
};

const DefaultErrorComponent: Page<ErrorProps> = (props): JSX.Element => (
  createMemo(() => {
    const currentData = props.data;
    if (!currentData) {
      return null;
    }
    return (
      createComponent(Dynamic, {
        component: 'div',
        style: ERROR_ROOT_STYLE,
        get children() {
          return [
            createComponent(Title, {
              get children() {
                return `${currentData.load.statusCode}: ${getReasonPhrase(currentData.load.statusCode)}`;
              },
            }),
            createComponent(Style, {
              get children() {
                return 'body { margin: 0 }';
              },
            }),
            createComponent(Dynamic, {
              component: 'span',
              style: ERROR_STATUS_CODE_STYLE,
              get children() {
                return currentData.load.statusCode;
              },
            }),
            createComponent(Dynamic, {
              component: 'span',
              style: ERROR_REASON_STYLE,
              get children() {
                return getReasonPhrase(currentData.load.statusCode);
              },
            }),
          ];
        },
      })
    );
  })
);

export default DefaultErrorComponent;
