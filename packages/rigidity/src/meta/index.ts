import {
  createSignal,
  createContext,
  createComputed,
  onMount,
  onCleanup,
  useContext,
  mergeProps,
  Show,
  JSX,
  Component,
} from 'solid-js';
import {
  isServer,
  Portal,
  Dynamic,
  createComponent,
} from 'solid-js/web';

interface TagDescription {
  tag: string;
  props: Record<string, unknown>;
}

interface MetaContextType {
  addClientTag: (tag: string, name: string) => number;

  shouldRenderTag: (tag: string, index: number) => boolean;

  removeClientTag: (tag: string, index: number) => void;

  addServerTag?: (tagDesc: TagDescription) => void;
}

const MetaContext = createContext<MetaContextType>();

const cascadingTags = ['title', 'meta'];

interface MetaProviderProps {
  tags?: Array<TagDescription>;
  children: JSX.Element;
}

function MetaProvider(props: MetaProviderProps): JSX.Element {
  const indices = new Map<string, number>();
  const [getTags, setTags] = createSignal<{ [k: string]:(string | null)[] }>({});

  onMount(() => {
    const ssrTags = document.head.querySelectorAll('[data-sm=""]');
    // `forEach` on `NodeList` is not supported in Googlebot, so use a workaround
    Array.prototype.forEach.call(ssrTags, (ssrTag: Node) => ssrTag.parentNode!.removeChild(ssrTag));
  });

  const actions: MetaContextType = {
    addClientTag: (tag: string, name: string) => {
      // consider only cascading tags
      if (cascadingTags.indexOf(tag) !== -1) {
        setTags((tags) => {
          const names = tags[tag] || [];
          return { ...tags, [tag]: [...names, name] };
        });
        // track indices synchronously
        const index = indices.has(tag) ? indices.get(tag)! + 1 : 0;
        indices.set(tag, index);
        return index;
      }
      return -1;
    },

    shouldRenderTag: (tag: string, index: number) => {
      if (cascadingTags.indexOf(tag) !== -1) {
        const names = getTags()[tag];
        // check if the tag is the last one of similar
        return names && names.lastIndexOf(names[index]) === index;
      }
      return true;
    },

    removeClientTag: (tag: string, index: number) => {
      setTags((tags) => {
        const names = tags[tag];
        if (names) {
          names[index] = null;
          return { ...tags, [tag]: names };
        }
        return tags;
      });
    },
  };

  if (isServer) {
    actions.addServerTag = (tagDesc: TagDescription) => {
      const { tags = [] } = props;
      // tweak only cascading tags
      if (cascadingTags.indexOf(tagDesc.tag) !== -1) {
        const index = tags.findIndex((prev) => {
          const prevName = prev.props.name || prev.props.property;
          const nextName = tagDesc.props.name || tagDesc.props.property;
          return prev.tag === tagDesc.tag && prevName === nextName;
        });
        if (index !== -1) {
          tags.splice(index, 1);
        }
      }
      tags.push(tagDesc);
    };

    if (Array.isArray(props.tags) === false) {
      throw Error('tags array should be passed to <MetaProvider /> in node');
    }
  }

  return createComponent(MetaContext.Provider, {
    value: actions,
    get children() {
      return props.children;
    },
  });
}

const createMetaTag = (tag: string, props: { [k: string]: any }) => {
  const c = useContext(MetaContext);
  if (!c) throw new Error('<MetaProvider /> should be in the tree');
  const {
    addClientTag, removeClientTag, addServerTag, shouldRenderTag,
  } = c;

  let index = -1;
  createComputed(() => {
    index = addClientTag(tag, props.name || props.property);
    onCleanup(() => removeClientTag(tag, index));
  });

  if (isServer) {
    addServerTag?.({ tag, props });
    return null;
  }
  return (
    createComponent(Show, {
      get when() {
        return shouldRenderTag(tag, index);
      },
      get children() {
        return (
          createComponent(Portal, {
            mount: document.head,
            get children() {
              return (
                createComponent(Dynamic, mergeProps({
                  component: tag,
                }, props))
              );
            },
          })
        );
      },
    })
  );
};

export { MetaProvider };

export function renderTags(tags: Array<TagDescription>): string {
  return tags
    .map((tag) => {
      const keys = Object.keys(tag.props);
      const props = keys.map((k) => (k === 'children' ? '' : ` ${k}="${tag.props[k]}"`)).join('');
      return tag.props.children ? `<${tag.tag} data-sm=""${props}>${tag.props.children}</${tag.tag}>` : `<${tag.tag} data-sm=""${props}/>`;
    }).join('');
}

export const Title: Component<JSX.HTMLAttributes<HTMLTitleElement>> = (props) => createMetaTag('title', props);

export const Style: Component<JSX.StyleHTMLAttributes<HTMLStyleElement>> = (props) => createMetaTag('style', props);

export const Meta: Component<JSX.MetaHTMLAttributes<HTMLMetaElement>> = (props) => createMetaTag('meta', props);

export const Link: Component<JSX.LinkHTMLAttributes<HTMLLinkElement>> = (props) => createMetaTag('link', props);

export const Base: Component<JSX.BaseHTMLAttributes<HTMLBaseElement>> = (props) => createMetaTag('base', props);
