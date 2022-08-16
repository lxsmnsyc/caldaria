import {
  createEffect,
  createMemo,
  createSignal,
  JSX,
} from 'solid-js';
import {
  RIGIDITY_ACTION,
  RIGIDITY_DATA,
  RIGIDITY_REDIRECT_HEADER,
  StatusCode,
} from 'caldaria-shared';
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
  const data = useDataContext<any, any>();

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
      let url = `${actionUrl()}&${RIGIDITY_DATA}`;
      let body: FormData | URLSearchParams | undefined = formData;
      let headers: HeadersInit | undefined;
      if (enc === 'application/x-www-form-urlencoded') {
        if (method === 'post') {
          const params = new URLSearchParams();

          formData.forEach((value, key) => {
            if (!(value instanceof File)) {
              params.append(key, value);
            }
          });
          body = params;
          headers = {
            'Content-Type': enc,
          };
        } else {
          body = undefined;
          const baseURL = new URL(url, window.location.origin);
          const originalParams = baseURL.searchParams;
          formData.forEach((value, key) => {
            if (!(value instanceof File)) {
              originalParams.append(key, value);
            }
          });
          url = `${baseURL.pathname}?${originalParams.toString()}`;
        }
      }

      // We change the url to data-only mode
      fetch(url, {
        method,
        headers,
        body,
        credentials: 'same-origin',
      }).then(async (response) => {
        if (response.headers.has(RIGIDITY_REDIRECT_HEADER)) {
          const value = response.headers.get(RIGIDITY_REDIRECT_HEADER)!;
          router.push(value);
        } else if (response.ok) {
          data.setAction(await response.json());
        } else {
          setError(new StatusCode(response.status, new Error(response.statusText)));
        }
      }).catch((response) => {
        setError(response);
      });
    });
  });

  return (
    <form
      {...props}
      action={actionUrl()}
      ref={(el) => {
        formEl = el;
        if (typeof props.ref === 'function') {
          props.ref(el);
        }
      }}
    >
      {props.children}
    </form>
  );

  // return createComponent(Dynamic, mergeProps({
  //   component: 'form',
  //   get action() {
  //     return actionUrl();
  //   },
  //   ref(el: HTMLFormElement) {
  //     formEl = el;
  //     if (typeof props.ref === 'function') {
  //       props.ref(el);
  //     }
  //   },
  // }, omitProps(props, [
  //   'action',
  // ])));
}
