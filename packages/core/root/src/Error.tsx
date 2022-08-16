import {
  getReasonPhrase,
} from 'http-status-codes';
import {
  createMemo,
  JSX,
} from 'solid-js';
import {
  Style,
  Title,
} from 'rigidity-meta';
import {
  ErrorProps,
  Page,
} from 'rigidity-shared';

const ERROR_ROOT_STYLE: JSX.CSSProperties = {
  color: '#000',
  background: '#fff',
  'font-family': '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',
  width: '100vw',
  height: '100vh',
  display: 'flex',
  'align-items': 'center',
  'justify-content': 'center',
};

const ERROR_STATUS_CODE_STYLE: JSX.CSSProperties = {
  'font-size': '1.5rem',
  'line-height': '2rem',
  'font-weight': 'bold',
  'margin-right': '2rem',
};

const ERROR_REASON_STYLE: JSX.CSSProperties = {
  'font-size': '1.25rem',
  'line-height': '1.75rem',
};

const DefaultErrorComponent: Page<ErrorProps> = (props): JSX.Element => (
  createMemo(() => {
    const currentData = props.data;
    if (!currentData) {
      return null;
    }
    const code = currentData.load.statusCode;
    const phrase = getReasonPhrase(code);
    return (
      <div style={ERROR_ROOT_STYLE}>
        <Title>{`${code}: ${phrase}`}</Title>
        <Style>{'body { margin: 0 }'}</Style>
        <span style={ERROR_STATUS_CODE_STYLE}>{code}</span>
        <span style={ERROR_REASON_STYLE}>{phrase}</span>
      </div>
    );
  })
);

export default DefaultErrorComponent;
