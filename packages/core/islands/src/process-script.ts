function nodeScriptClone(node: HTMLScriptElement) {
  const script = document.createElement('script');
  script.text = node.innerHTML;

  const attrs = node.attributes;
  for (let i = 0, len = attrs.length; i < len; i += 1) {
    const attr = attrs[i];
    script.setAttribute(attr.name, attr.value);
  }
  return script;
}

function nodeScriptIs(node: Node): node is HTMLScriptElement {
  return node instanceof HTMLScriptElement;
}

export default function processScript(node: Node) {
  if (nodeScriptIs(node)) {
    node.parentNode?.replaceChild(nodeScriptClone(node), node);
  } else {
    const children = node.childNodes;
    for (let i = 0, len = children.length; i < len; i += 1) {
      processScript(children[i]);
    }
  }

  return node;
}
