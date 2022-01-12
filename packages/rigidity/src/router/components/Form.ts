import {
  createComponent,
  createEffect,
  createMemo,
  createSignal,
  JSX,
  mergeProps,
} from 'solid-js';
import {
  Dynamic,
} from 'solid-js/web';
import {
  omitProps,
} from 'solid-use';
import {
  RIGIDITY_ACTION,
  RIGIDITY_DATA,
  RIGIDITY_REDIRECT_HEADER,
} from '../../constants';
import StatusCode from '../../errors/StatusCode';
import {
  useDataContext,
} from './Data';
import {
  useRouter,
} from './Router';

type FormBasePros = JSX.IntrinsicElements['form'];

export type FormMethod = 'get' | 'post';
export type FormEncoding = 'application/x-www-form-urlencoded' | 'multipart/form-data';

export interface FormProps extends FormBasePros {
  action: string;
  method?: FormMethod;
  encoding?: FormEncoding;
}

export default function Form(props: FormProps): JSX.Element {
  const router = useRouter();
  const data = useDataContext();

  const actionUrl = createMemo(() => {
    const search = new URLSearchParams(router.search);
    search.set(RIGIDITY_ACTION, props.action);
    return `${router.pathname}?${search.toString()}`;
  });

  let formEl: HTMLFormElement;

  const [error, setError] = createSignal();

  createEffect(() => {
    const value = error();
    if (value) {
      throw value;
    }
  });

  createEffect(() => {
    formEl.addEventListener('submit', (ev) => {
      ev.preventDefault();

      const enc = props.encoding ?? props.enctype ?? 'application/x-www-form-urlencoded';
      const method = props.method ?? 'get';

      const formData = new FormData(formEl);
      let body: FormData | URLSearchParams = formData;
      let headers: HeadersInit | undefined;
      if (enc === 'application/x-www-form-urlencoded') {
        body = new URLSearchParams();

        body.forEach((value, key) => {
          if (!(value instanceof File)) {
            body.append(key, value);
          }
        });

        headers = {
          'Content-Type': enc,
        };
      }

      // We change the url to data-only mode
      fetch(`${actionUrl()}&${RIGIDITY_DATA}`, {
        method,
        headers,
        body,
        credentials: 'same-origin',
      }).then(async (response) => {
        if (response.headers.has(RIGIDITY_REDIRECT_HEADER)) {
          const value = response.headers.get(RIGIDITY_REDIRECT_HEADER)!;
          router.push(value);
        } else if (response.ok) {
          data.setData(await response.json());
        } else {
          setError(new StatusCode(response.status, new Error(response.statusText)));
        }
      }).catch((response) => {
        setError(response);
      });
    });
  });

  return createComponent(Dynamic, mergeProps({
    component: 'form',
    get action() {
      return actionUrl();
    },
    ref(el: HTMLFormElement) {
      formEl = el;
      if (typeof props.ref === 'function') {
        props.ref(el);
      }
    },
  }, omitProps(props, [
    'action',
  ])));
}
