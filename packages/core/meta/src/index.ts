/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  Component,
  createComponent,
  createContext,
  createRenderEffect,
  createUniqueId,
  JSX,
  onCleanup,
  ParentComponent,
  useContext,
} from 'solid-js';
import { isServer, spread } from 'solid-js/web';

export const MetaContext = createContext<MetaContextType>();

interface TagDescription {
  tag: string;
  props: Record<string, unknown>;
  id: string;
  name?: string;
  ref?: Element;
}

export interface MetaContextType {
  addClientTag: (tag: TagDescription) => number;

  removeClientTag: (tag: TagDescription, index: number) => void;

  addServerTag?: (tagDesc: TagDescription) => void;
}

const cascadingTags = ['title', 'meta'];

const getTagType = (tag: TagDescription) => tag.tag + (tag.name ? `.${tag.name}"` : '');

const MetaProvider: ParentComponent<{ tags?: Array<TagDescription> }> = (props) => {
  const cascadedTagInstances = new Map<string, Array<TagDescription | null>>();

  // TODO: use one element for all tags of the same type, just swap out
  // where the props get applied
  function getElement(tag: TagDescription) {
    if (tag.ref) {
      return tag.ref;
    }

    let el = document.querySelector(`[data-sm="${tag.id}"]`);
    if (el) {
      if (el.tagName.toLowerCase() !== tag.tag) {
        if (el.parentNode) {
          // remove the old tag
          el.parentNode.removeChild(el);
        }
        // add the new tag
        el = document.createElement(tag.tag);
      }
      // use the old tag
      el.removeAttribute('data-sm');
    } else {
      // create a new tag
      el = document.createElement(tag.tag);
    }

    return el;
  }

  const actions: MetaContextType = {
    addClientTag: (tag: TagDescription) => {
      const tagType = getTagType(tag);

      if (cascadingTags.indexOf(tag.tag) !== -1) {
        let instances = cascadedTagInstances.get(tagType) ?? [];
        cascadedTagInstances.set(tagType, instances);
        const index = instances.length;

        instances = [...instances, tag];

        // track indices synchronously
        cascadedTagInstances.set(tagType, instances);

        if (!isServer) {
          const element = getElement(tag);
          tag.ref = element;

          spread(element, () => tag.props);

          let lastVisited = null;
          for (let i = index - 1; i >= 0; i--) {
            if (instances[i] != null) {
              lastVisited = instances[i];
              break;
            }
          }

          if (element.parentNode !== document.head) {
            document.head.appendChild(element);
          }
          if (lastVisited && lastVisited.ref) {
            document.head.removeChild(lastVisited.ref);
          }
        }

        return index;
      }

      if (!isServer) {
        const element = getElement(tag);
        tag.ref = element;

        spread(element, () => tag.props);

        if (element.parentNode !== document.head) {
          document.head.appendChild(element);
        }
      }

      return -1;
    },

    removeClientTag: (tag: TagDescription, index: number) => {
      const tagName = getTagType(tag);

      if (tag.ref) {
        const t = cascadedTagInstances.get(tagName);
        if (t) {
          if (tag.ref.parentNode) {
            tag.ref.parentNode.removeChild(tag.ref);
            for (let i = index - 1; i >= 0; i--) {
              const item = t[i];
              if (item != null && item.ref) {
                document.head.appendChild(item.ref);
              }
            }
          }

          t[index] = null;
          cascadedTagInstances.set(tagName, t);
        } else if (tag.ref.parentNode) {
          tag.ref.parentNode.removeChild(tag.ref);
        }
      }
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
};

export function useHead(tagDesc: {
  tag: string;
  props: { [k: string]: any };
  id: string;
  name: any;
}) {
  const { addClientTag, removeClientTag, addServerTag } = useContext(MetaContext)!;

  createRenderEffect(() => {
    if (!isServer) {
      const index = addClientTag(tagDesc);
      onCleanup(() => removeClientTag(tagDesc, index));
    }
  });

  if (isServer) {
    addServerTag!(tagDesc);
  }
}

function MetaTag(tag: string, props: { [k: string]: any }) {
  const id = createUniqueId();
  const c = useContext(MetaContext);
  if (!c) throw new Error('<MetaProvider /> should be in the tree');

  useHead({
    tag,
    props,
    id,
    get name() {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return props.name || props.property;
    },
  });

  return null;
}

export { MetaProvider };

export function renderTags(tags: Array<TagDescription>) {
  return tags
    .map((tag) => {
      const keys = Object.keys(tag.props);
      const props = keys.map((k) => (k === 'children' ? '' : ` ${k}="${tag.props[k]}"`)).join('');
      return tag.props.children
        ? `<${tag.tag} data-sm="${tag.id}"${props}>${
          // Tags might contain multiple text children:
          //   <Title>example - {myCompany}</Title>
          Array.isArray(tag.props.children) ? tag.props.children.join('') : tag.props.children
        }</${tag.tag}>`
        : `<${tag.tag} data-sm="${tag.id}"${props}/>`;
    })
    .join('');
}

export const Title: Component<JSX.HTMLAttributes<HTMLTitleElement>> = (props) => MetaTag('title', props);

export const Style: Component<JSX.StyleHTMLAttributes<HTMLStyleElement>> = (props) => MetaTag('style', props);

export const Meta: Component<JSX.MetaHTMLAttributes<HTMLMetaElement>> = (props) => MetaTag('meta', props);

export const Link: Component<JSX.LinkHTMLAttributes<HTMLLinkElement>> = (props) => MetaTag('link', props);

export const Base: Component<JSX.BaseHTMLAttributes<HTMLBaseElement>> = (props) => MetaTag('base', props);
