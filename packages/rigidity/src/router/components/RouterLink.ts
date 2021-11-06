import {
  JSX,
} from 'solid-js';
import {
  mergeProps,
  Show,
  createEffect,
  createSignal,
  onCleanup,
} from '../../isomorphic';
import {
  createComponent,
  Dynamic,
} from '../../isomorphic-web';
import { excludeProps } from '../../utils/exclude-props';
import { isModifiedEvent, isLocalURL } from '../utils/routing';
import { useRouter } from './Router';

function Throwable(props: { error: Error }): JSX.Element {
  throw props.error;
}

type BaseAnchorAttributes = JSX.AnchorHTMLAttributes<HTMLAnchorElement>;

export interface RouterLinkProps extends BaseAnchorAttributes {
  href: string;
  scroll?: ScrollBehavior;
  replace?: boolean;
  prefetch?: boolean;
  children?: JSX.Element;
}

export default function RouterLink(
  props: RouterLinkProps,
): JSX.Element {
  const router = useRouter();

  let anchorRef!: HTMLAnchorElement;

  // Override click behavior
  createEffect(() => {
    const shouldScroll = props.scroll;
    const anchorHref = props.href;
    const shouldReplace = props.replace;

    const onClick = (ev: MouseEvent) => {
      if (isModifiedEvent(ev) || !isLocalURL(anchorHref)) {
        return;
      }
      ev.preventDefault();

      // avoid scroll for urls with anchor refs
      let scroll = shouldScroll;
      if (scroll == null && anchorHref.indexOf('#') >= 0) {
        scroll = undefined;
      }

      router[shouldReplace ? 'replace' : 'push'](anchorHref, {
        scroll,
      });
    };

    anchorRef.addEventListener('click', onClick);
    onCleanup(() => {
      anchorRef.removeEventListener('click', onClick);
    });
  });

  const [error, setError] = createSignal<Error>();

  const [visible, setVisible] = createSignal(false);

  createEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === anchorRef && entry.isIntersecting) {
          // Host intersected, set visibility to true
          setVisible(true);

          // Stop observing
          observer.disconnect();
        }
      });
    });

    observer.observe(anchorRef);

    onCleanup(() => {
      observer.unobserve(anchorRef);
      observer.disconnect();
    });
  });

  // Lazy prefetching
  createEffect(() => {
    // TODO intersection observer
    const anchorHref = props.href;
    const isVisible = visible();
    const shouldPrefetch = (props.prefetch ?? true) && isVisible && isLocalURL(anchorHref);
    if (shouldPrefetch) {
      router.prefetch(anchorHref).catch((err) => {
        setError(err);
      });
    }
  });

  // Priotized prefetching on mouse enter
  createEffect(() => {
    const anchorHref = props.href;
    const shouldPrefetch = (props.prefetch ?? true) && isLocalURL(anchorHref);
    const onMouseEnter = () => {
      if (shouldPrefetch) {
        router.prefetch(anchorHref, true).catch((err) => {
          setError(err);
        });
      }
    };

    anchorRef.addEventListener('mouseenter', onMouseEnter);
    onCleanup(() => {
      anchorRef.removeEventListener('mouseenter', onMouseEnter);
    });
  });

  return [
    createComponent(Show, {
      get when(): Error | undefined {
        return error();
      },
      children: (err: Error) => (
        createComponent(Throwable, {
          error: err,
        })
      ),
    }),
    createComponent(Dynamic, mergeProps(
      {
        component: 'a',
        ref: (e: HTMLAnchorElement) => {
          if (typeof props.ref === 'function') {
            props.ref(e);
          }
          anchorRef = e;
        },
      },
      excludeProps(props, [
        'prefetch',
        'scroll',
        'ref',
        'replace',
      ]),
      {
        get children() {
          return props.children;
        },
      },
    )),
  ];
}
